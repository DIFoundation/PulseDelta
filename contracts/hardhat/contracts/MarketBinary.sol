// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./OutcomeTokenERC20.sol";
import "./OutcomeTokenFactory.sol";
import "./IOracleAdapter.sol";
import "./IFeeRouter.sol";
import "./LPToken.sol";
import "./wDAG.sol";

contract MarketBinary {
    enum State {
        Open,
        Closed,
        Resolved
    }

    IERC20 public immutable collateral;
    string public question;
    string public metadataURI;
    address public creator;
    uint256 public marketId;

    State public state;
    IOracleAdapter public oracle;
    IFeeRouter public feeRouter;

    address public yesToken;
    address public noToken;

    uint256 public feeBps;
    uint256 public liquidity; // AMM liquidity parameter

    uint256 public qYes; // YES token reserves
    uint256 public qNo; // NO token reserves
    uint8 public finalOutcome;

    // Participants tracking for frontend
    mapping(address => bool) public hasTraded;
    uint256 public participantCount;
    mapping(address => uint256) public traderVolume; // wDAG volume per trader

    // LP system
    LPToken public lpToken;
    uint256 public lpFeeBps = 400; // 4% of total fees go to LPs (out of 1% total fee)

    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable resolutionDeadline;

    event Bought(
        address indexed user,
        address token,
        uint256 shares,
        uint256 cost,
        uint256 fee
    );
    event Closed();
    event Finalized(uint8 outcome);
    event Redeemed(address indexed user, uint256 payout);

    error NotOpen();
    error AlreadyClosed();
    error NotResolved();
    error ZeroAmount();
    error NotStarted();
    error TradingEnded();
    error ResolutionTooEarly();

    constructor(
        address _collateral,
        string memory _question,
        string memory _metadataURI,
        address _creator,
        uint256 _marketId,
        address _oracleAdapter,
        address _feeRouter,
        address _tokenFactory,
        bytes32 _marketKey,
        uint256 _feeBps,
        uint256 _liquidity,
        uint256[3] memory _times // [startTime, endTime, resolutionDeadline]
    ) {
        require(_times[0] < _times[1], "Invalid time range");
        require(_times[1] < _times[2], "Resolution too early");
        require(_feeBps <= 100, "Fee too high"); // Max 1% fee

        collateral = IERC20(_collateral);
        question = _question;
        metadataURI = _metadataURI;
        creator = _creator;
        marketId = _marketId;
        oracle = IOracleAdapter(_oracleAdapter);
        feeRouter = IFeeRouter(_feeRouter);
        feeBps = _feeBps;
        liquidity = _liquidity;
        startTime = _times[0];
        endTime = _times[1];
        resolutionDeadline = _times[2];

        yesToken = OutcomeTokenFactory(_tokenFactory).create(
            "YES",
            "YES",
            address(this),
            1,
            _marketKey
        );
        noToken = OutcomeTokenFactory(_tokenFactory).create(
            "NO",
            "NO",
            address(this),
            0,
            _marketKey
        );

        // Initialize AMM with equal liquidity for 50/50 pricing
        qYes = _liquidity;
        qNo = _liquidity;

        // Deploy LP token
        lpToken = new LPToken(
            string(abi.encodePacked("LP-", _question)),
            string(abi.encodePacked("LP-", _marketKey))
        );
        lpToken.setMarket(address(this));
    }

    // Prediction Market: Calculate cost using linear pricing (like betting odds)
    function _calculateCost(
        uint256 shares,
        bool isYes
    ) internal view returns (uint256) {
        uint256 currentSupply = isYes ? qYes : qNo;
        uint256 totalLiquidity = liquidity * 2;

        // Linear pricing: cost = shares * (totalLiquidity / currentSupply)
        // This means buying more shares increases the price
        return (shares * totalLiquidity) / currentSupply;
    }

    function price(bool isYes) public view returns (uint256) {
        if (isYes) {
            // Price of YES = total liquidity / YES reserves (inverse relationship)
            // More YES tokens bought = higher YES price
            return (liquidity * 2 * 1e18) / qYes;
        } else {
            // Price of NO = total liquidity / NO reserves (inverse relationship)
            // More NO tokens bought = higher NO price
            return (liquidity * 2 * 1e18) / qNo;
        }
    }

    function close() external {
        if (state != State.Open) revert AlreadyClosed();
        state = State.Closed;
        emit Closed();
    }

    function buy(bool isYes, uint256 shares) external {
        if (block.timestamp < startTime) revert NotStarted();
        if (block.timestamp >= endTime) revert TradingEnded();
        if (state != State.Open) revert NotOpen();
        if (shares == 0) revert ZeroAmount();

        // Calculate cost using prediction market pricing
        uint256 payment = _calculateCost(shares, isYes);

        uint256 fee = (payment * feeBps) / 10_000;
        collateral.transferFrom(msg.sender, address(this), payment + fee);

        // Split fees: 30% protocol, 30% creator, 40% LP
        uint256 lpFee = (fee * lpFeeBps) / 10_000;
        uint256 remainingFee = fee - lpFee;
        uint256 protocolFee = remainingFee / 2;
        uint256 creatorFee = remainingFee - protocolFee; // Handle odd numbers

        feeRouter.accrue(address(this), protocolFee, creatorFee, lpFee);

        // Add LP fees to LP pool
        if (lpFee > 0) {
            lpToken.addFees(lpFee);
        }

        // Track participants and volume for frontend
        if (!hasTraded[msg.sender]) {
            hasTraded[msg.sender] = true;
            participantCount++;
        }
        traderVolume[msg.sender] += payment + fee;

        // Keep the wDAG tokens in the market pool (don't burn them)
        // This creates the pool that winners will share

        // Update reserves - buying tokens reduces available supply
        if (isYes) {
            qYes -= shares; // Reduce YES supply (increases price)
            qNo += payment; // Add payment to NO reserves
            OutcomeTokenERC20(yesToken).mint(msg.sender, shares);
        } else {
            qNo -= shares; // Reduce NO supply (increases price)
            qYes += payment; // Add payment to YES reserves
            OutcomeTokenERC20(noToken).mint(msg.sender, shares);
        }

        emit Bought(
            msg.sender,
            isYes ? yesToken : noToken,
            shares,
            payment,
            fee
        );
    }

    function finalize(uint8 outcome) external {
        if (block.timestamp < endTime) revert ResolutionTooEarly();
        if (state != State.Closed) revert AlreadyClosed();
        state = State.Resolved;
        finalOutcome = outcome;
        emit Finalized(outcome);
    }

    function redeem() external {
        if (state != State.Resolved) revert NotResolved();

        uint256 payout = 0;

        if (finalOutcome == 1) {
            uint256 yesBal = OutcomeTokenERC20(yesToken).balanceOf(msg.sender);
            if (yesBal > 0) {
                OutcomeTokenERC20(yesToken).burn(msg.sender, yesBal);
                payout += yesBal;
            }
        } else {
            uint256 noBal = OutcomeTokenERC20(noToken).balanceOf(msg.sender);
            if (noBal > 0) {
                OutcomeTokenERC20(noToken).burn(msg.sender, noBal);
                payout += noBal;
            }
        }

        if (payout > 0) {
            // Transfer wDAG from the market pool to the user
            // This distributes the pool among winners
            collateral.transfer(msg.sender, payout);
            emit Redeemed(msg.sender, payout);
        }
    }

    // Frontend getter functions
    function getParticipantCount() external view returns (uint256) {
        return participantCount;
    }

    function getTraderVolume(address user) external view returns (uint256) {
        return traderVolume[user];
    }

    function getTotalVolume() external view returns (uint256) {
        return collateral.balanceOf(address(this));
    }

    function getMarketStats()
        external
        view
        returns (
            uint256 _participantCount,
            uint256 _totalVolume,
            uint256 _yesReserves,
            uint256 _noReserves
        )
    {
        return (
            participantCount,
            collateral.balanceOf(address(this)),
            qYes,
            qNo
        );
    }

    // LP functions
    function addLiquidity() external payable returns (uint256 lpTokens) {
        if (msg.value == 0) revert("Must send DAG");
        if (state != State.Open) revert("Market not open");

        // Convert DAG to wDAG
        wDAG(payable(address(collateral))).deposit{value: msg.value}();

        // Add liquidity to LP pool
        lpTokens = lpToken.addLiquidity(msg.sender, msg.value);

        return lpTokens;
    }

    function removeLiquidity(
        uint256 lpTokens
    ) external returns (uint256 wDAGAmount) {
        if (lpTokens == 0) revert("Zero amount");

        // Remove liquidity from LP pool
        wDAGAmount = lpToken.removeLiquidity(msg.sender, lpTokens);

        // Convert wDAG back to DAG and send to user
        wDAG(payable(address(collateral))).withdraw(wDAGAmount);
        payable(msg.sender).transfer(wDAGAmount);

        return wDAGAmount;
    }

    function getLPStats()
        external
        view
        returns (
            uint256 _totalLiquidity,
            uint256 _totalFees,
            uint256 _valuePerToken,
            uint256 _userShare
        )
    {
        return (
            lpToken.totalLiquidity(),
            lpToken.totalFeesEarned(),
            lpToken.getValuePerToken(),
            lpToken.getUserShareValue(msg.sender)
        );
    }
}
