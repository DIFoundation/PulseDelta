// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IOracleAdapter.sol";

interface IMarket {
    function resolutionDeadline() external view returns (uint256);
}

contract TrendsOptimisticOracleAdapter is IOracleAdapter {
    IERC20 public immutable collateral;
    uint256 public immutable reporterBond;
    uint256 public immutable disputerBond;
    uint256 public immutable liveness;
    address public immutable council;

    struct P {
        Status status;
        address reporter;
        address disputer;
        uint8 proposedOutcome;
        string evidenceCID;
        uint256 timestamp;
        uint256 reporterBondPaid;
        uint256 disputerBondPaid;
        uint8 finalOutcome;
    }

    mapping(uint256 => P) public proposals;
    mapping(address => bool) public isReporter;
    mapping(uint256 => address) public marketAddress;
    mapping(address => bool) public authorizedFactories;

    event ReporterSet(address reporter, bool enabled);
    event FactoryAuthorized(address factory, bool enabled);

    error NotCouncil();
    error NotWhitelisted();
    error NotAuthorized();
    error Exists();
    error BadState();
    error Liveness();
    error TooEarly();

    modifier onlyCouncil() {
        if (msg.sender != council) revert NotCouncil();
        _;
    }

    constructor(
        address _collateral,
        uint256 _reporterBond,
        uint256 _disputerBond,
        uint256 _liveness,
        address _council
    ) {
        collateral = IERC20(_collateral);
        reporterBond = _reporterBond;
        disputerBond = _disputerBond;
        liveness = _liveness;
        council = _council;
    }

    function setReporter(address r, bool en) external onlyCouncil {
        isReporter[r] = en;
        emit ReporterSet(r, en);
    }

    function setFactory(address factory, bool enabled) external onlyCouncil {
        authorizedFactories[factory] = enabled;
        emit FactoryAuthorized(factory, enabled);
    }

    function proposeResult(
        uint256 marketId,
        bytes calldata payload,
        string calldata evidenceCID
    ) external payable {
        if (!isReporter[msg.sender]) revert NotWhitelisted();
        P storage p = proposals[marketId];
        if (p.status != Status.None) revert Exists();

        address market = marketAddress[marketId];
        if (
            market != address(0) &&
            block.timestamp < IMarket(market).resolutionDeadline()
        ) revert TooEarly();

        uint8 outcome = uint8(bytes1(payload));
        if (!collateral.transferFrom(msg.sender, address(this), reporterBond))
            revert();

        p.status = Status.Proposed;
        p.reporter = msg.sender;
        p.proposedOutcome = outcome;
        p.evidenceCID = evidenceCID;
        p.timestamp = block.timestamp;
        p.reporterBondPaid = reporterBond;

        emit Proposed(marketId, payload, evidenceCID);
    }

    function dispute(
        uint256 marketId,
        string calldata evidenceCID
    ) external payable {
        P storage p = proposals[marketId];
        if (p.status != Status.Proposed) revert BadState();
        if (!collateral.transferFrom(msg.sender, address(this), disputerBond))
            revert();

        p.status = Status.Disputed;
        p.disputer = msg.sender;
        p.disputerBondPaid = disputerBond;

        emit Disputed(marketId, evidenceCID);
    }

    function finalize(uint256 marketId) external {
        P storage p = proposals[marketId];
        if (p.status == Status.Proposed) {
            if (block.timestamp < p.timestamp + liveness) revert Liveness();
            p.status = Status.Finalized;
            p.finalOutcome = p.proposedOutcome;
            if (p.reporterBondPaid > 0)
                collateral.transfer(p.reporter, p.reporterBondPaid);
            emit Finalized(
                marketId,
                abi.encodePacked(p.finalOutcome),
                Status.Finalized
            );
        } else {
            revert BadState();
        }
    }

    function arbitrate(
        uint256 marketId,
        uint8 outcome,
        bool reporterWins
    ) external onlyCouncil {
        P storage p = proposals[marketId];
        if (p.status != Status.Disputed) revert BadState();

        p.status = Status.Finalized;
        p.finalOutcome = outcome;

        if (reporterWins) {
            collateral.transfer(
                p.reporter,
                p.reporterBondPaid + p.disputerBondPaid
            );
        } else {
            collateral.transfer(
                p.disputer,
                p.reporterBondPaid + p.disputerBondPaid
            );
        }

        emit Finalized(marketId, abi.encodePacked(outcome), Status.Finalized);
    }

    function invalidate(uint256 marketId) external onlyCouncil {
        P storage p = proposals[marketId];
        if (p.status != Status.Proposed && p.status != Status.Disputed)
            revert BadState();

        p.status = Status.Invalid;
        emit Finalized(marketId, "", Status.Invalid);
    }

    function getResult(
        uint256 marketId
    ) external view returns (Status, bytes memory value) {
        P storage p = proposals[marketId];
        return (
            p.status,
            p.status == Status.Finalized
                ? abi.encodePacked(p.finalOutcome)
                : bytes("")
        );
    }

    function setMarketAddress(uint256 marketId, address market) external {
        if (!authorizedFactories[msg.sender] && msg.sender != council) revert NotAuthorized();
        marketAddress[marketId] = market;
    }
}
