// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./OutcomeTokenERC20.sol";
import "./OutcomeTokenFactory.sol";
import "./IOracleAdapter.sol";
import "./IFeeRouter.sol";
import "./LPToken.sol";
import "./wDAG.sol";

contract MarketScalar {
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

    int256 public lowerBound;
    int256 public upperBound;
    int256 public finalValue;

    address public longToken;
    address public shortToken;

    uint256 public feeBps;
    uint256 public liquidity; // AMM liquidity parameter

    uint256 public qLong; // LONG token reserves
    uint256 public qShort; // SHORT token reserves

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
    event Finalized(int256 finalValue);
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
        int256 _lower,
        int256 _upper,
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
        lowerBound = _lower;
        upperBound = _upper;
        feeBps = _feeBps;
        liquidity = _liquidity;
        startTime = _times[0];
        endTime = _times[1];
        resolutionDeadline = _times[2];

        longToken = OutcomeTokenFactory(_tokenFactory).create(
            "LONG",
            "LONG",
            address(this),
            0,
            _marketKey
        );
        shortToken = OutcomeTokenFactory(_tokenFactory).create(
            "SHORT",
            "SHORT",
            address(this),
            1,
            _marketKey
        );

        // Initialize AMM with equal liquidity for 50/50 pricing
        qLong = _liquidity;
        qShort = _liquidity;

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
        bool isLong
    ) internal view returns (uint256) {
        uint256 currentSupply = isLong ? qLong : qShort;
        uint256 totalLiquidity = liquidity * 2;

        // Linear pricing: cost = shares * (totalLiquidity / currentSupply)
        // This means buying more shares increases the price
        return (shares * totalLiquidity) / currentSupply;
    }

    function price(bool isLong) public view returns (uint256) {
        if (isLong) {
            // Price of LONG = total liquidity / LONG reserves (inverse relationship)
            // More LONG tokens bought = higher LONG price
            return (liquidity * 2 * 1e18) / qLong;
        } else {
            // Price of SHORT = total liquidity / SHORT reserves (inverse relationship)
            // More SHORT tokens bought = higher SHORT price
            return (liquidity * 2 * 1e18) / qShort;
        }
    }

    function close() external {
        if (state != State.Open) revert AlreadyClosed();
        state = State.Closed;
        emit Closed();
    }

    function buy(bool isLong, uint256 shares) external {
        if (block.timestamp < startTime) revert NotStarted();
        if (block.timestamp >= endTime) revert TradingEnded();
        if (state != State.Open) revert NotOpen();
        if (shares == 0) revert ZeroAmount();

        // Calculate cost using AMM formula
        uint256 payment = _calculateCost(shares, isLong);

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

        // Update reserves - buying tokens reduces available supply (increases price)
        if (isLong) {
            qLong -= shares; // Reduce LONG supply (increases price)
            qShort += payment; // Add payment to SHORT reserves
            OutcomeTokenERC20(longToken).mint(msg.sender, shares);
        } else {
            qShort -= shares; // Reduce SHORT supply (increases price)
            qLong += payment; // Add payment to LONG reserves
            OutcomeTokenERC20(shortToken).mint(msg.sender, shares);
        }

        emit Bought(
            msg.sender,
            isLong ? longToken : shortToken,
            shares,
            payment,
            fee
        );
    }

    function finalize(int256 value) external {
        if (block.timestamp < endTime) revert ResolutionTooEarly();
        if (state != State.Closed) revert AlreadyClosed();
        if (value < lowerBound) value = lowerBound;
        if (value > upperBound) value = upperBound;
        finalValue = value;
        state = State.Resolved;
        emit Finalized(value);
    }

    function redeem() external {
        if (state != State.Resolved) revert NotResolved();

        uint256 longBal = OutcomeTokenERC20(longToken).balanceOf(msg.sender);
        uint256 shortBal = OutcomeTokenERC20(shortToken).balanceOf(msg.sender);
        uint256 payout = 0;

        if (longBal > 0) {
            OutcomeTokenERC20(longToken).burn(msg.sender, longBal);
            uint256 num = uint256(finalValue - lowerBound);
            uint256 den = uint256(upperBound - lowerBound);
            uint256 longPayout = (longBal * num) / den;
            collateral.transfer(msg.sender, longPayout);
            payout += longPayout;
        }
        if (shortBal > 0) {
            OutcomeTokenERC20(shortToken).burn(msg.sender, shortBal);
            uint256 num = uint256(upperBound - finalValue);
            uint256 den = uint256(upperBound - lowerBound);
            uint256 shortPayout = (shortBal * num) / den;
            collateral.transfer(msg.sender, shortPayout);
            payout += shortPayout;
        }

        if (payout > 0) {
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

    function getMarketStats() external view returns (
        uint256 _participantCount,
        uint256 _totalVolume,
        uint256 _longReserves,
        uint256 _shortReserves
    ) {
        return (
            participantCount,
            collateral.balanceOf(address(this)),
            qLong,
            qShort
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

    function removeLiquidity(uint256 lpTokens) external returns (uint256 wDAGAmount) {
        if (lpTokens == 0) revert("Zero amount");
        
        // Remove liquidity from LP pool
        wDAGAmount = lpToken.removeLiquidity(msg.sender, lpTokens);
        
        // Transfer wDAG tokens directly to user (they can withdraw DAG themselves)
        collateral.transfer(msg.sender, wDAGAmount);
        
        return wDAGAmount;
    }

    function getLPStats() external view returns (
        uint256 _totalLiquidity,
        uint256 _totalFees,
        uint256 _valuePerToken,
        uint256 _userShare
    ) {
        return (
            lpToken.totalLiquidity(),
            lpToken.totalFeesEarned(),
            lpToken.getValuePerToken(),
            lpToken.getUserShareValue(msg.sender)
        );
    }
}
