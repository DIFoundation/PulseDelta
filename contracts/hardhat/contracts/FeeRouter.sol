// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IFeeRouter.sol";

contract FeeRouter is IFeeRouter {
    address public owner;

    mapping(address => address) public creatorOf;
    mapping(address => uint256) public protocolAccrued;
    mapping(address => uint256) public creatorAccrued;
    mapping(address => mapping(address => uint256)) public creatorFeesByMarket;
    mapping(address => uint256) public creatorLifetimeFees;

    // LP fee tracking
    mapping(address => uint256) public lpAccrued; // market => LP fees
    uint256 public totalLPFees;

    event Accrued(
        address indexed market,
        uint256 protocolFee,
        uint256 creatorFee,
        uint256 lpFee
    );
    event LPFeesAccrued(address indexed market, uint256 amount);
    event CreatorSet(address indexed market, address indexed creator);
    event ClaimedCreator(address indexed creator, uint256 amount);
    event ClaimedProtocol(address indexed to, uint256 amount);

    error NotOwner();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _owner) {
        if (_owner == address(0)) revert ZeroAddress();
        owner = _owner;
    }

    function setCreator(address market, address creator) external {
        if (market == address(0) || creator == address(0)) revert ZeroAddress();
        creatorOf[market] = creator;
        emit CreatorSet(market, creator);
    }

    function accrue(
        address market,
        uint256 protocolFee,
        uint256 creatorFee,
        uint256 lpFee
    ) external {
        address c = creatorOf[market];
        protocolAccrued[address(this)] += protocolFee;
        creatorAccrued[c] += creatorFee;
        creatorLifetimeFees[c] += creatorFee;
        creatorFeesByMarket[c][market] += creatorFee;

        // Track LP fees
        if (lpFee > 0) {
            lpAccrued[market] += lpFee;
            totalLPFees += lpFee;
            emit LPFeesAccrued(market, lpFee);
        }

        emit Accrued(market, protocolFee, creatorFee, lpFee);
    }

    function claimCreator(
        address market,
        address to
    ) external returns (uint256) {
        address c = creatorOf[market];
        require(msg.sender == c, "not creator");
        uint256 amt = creatorAccrued[c];
        creatorAccrued[c] = 0;
        (bool ok, ) = to.call{value: 0}("");
        emit ClaimedCreator(c, amt);
        return amt;
    }

    function claimProtocol(address to) external onlyOwner returns (uint256) {
        uint256 amt = protocolAccrued[address(this)];
        protocolAccrued[address(this)] = 0;
        (bool ok, ) = to.call{value: 0}("");
        emit ClaimedProtocol(to, amt);
        return amt;
    }

    function getCreator(address market) external view returns (address) {
        return creatorOf[market];
    }

    function getCreatorLifetimeFees(
        address creator
    ) external view returns (uint256) {
        return creatorLifetimeFees[creator];
    }

    function getCreatorFeesForMarket(
        address creator,
        address market
    ) external view returns (uint256) {
        return creatorFeesByMarket[creator][market];
    }

    function getCreatorStats(
        address creator
    )
        external
        view
        returns (
            uint256 _lifetimeFees,
            uint256 _claimableFees,
            uint256 _totalMarkets
        )
    {
        uint256 totalMarkets = 0;
        // Note: This would require iterating through all markets to count
        // For now, return what we can efficiently
        return (
            creatorLifetimeFees[creator],
            creatorAccrued[creator],
            totalMarkets // Would need indexer or different approach
        );
    }

    function getProtocolStats()
        external
        view
        returns (uint256 _totalAccrued, uint256 _claimable)
    {
        return (protocolAccrued[address(this)], protocolAccrued[address(this)]);
    }

    // LP fee getters
    function getLPFeesForMarket(
        address market
    ) external view returns (uint256) {
        return lpAccrued[market];
    }

    function getTotalLPFees() external view returns (uint256) {
        return totalLPFees;
    }

    function getLPStats()
        external
        view
        returns (uint256 _totalLPFees, uint256 _totalMarkets)
    {
        return (
            totalLPFees,
            0 // Would need to track this separately
        );
    }
}
