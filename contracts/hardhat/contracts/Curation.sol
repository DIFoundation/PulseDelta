// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Curation {
    enum Status { Pending, Approved, Flagged }

    address public immutable council;
    mapping(uint256 => Status) public statusOf;
    mapping(address => bool) public isCouncilMember;

    event CouncilMemberSet(address member, bool enabled);
    event StatusChanged(uint256 indexed marketId, Status status);

    error NotCouncil();
    error NotMember();

    modifier onlyCouncil() {
        if (msg.sender != council && !isCouncilMember[msg.sender]) revert NotCouncil();
        _;
    }

    constructor(address _council) {
        isCouncilMember[_council] = true;
        council = _council;
    }

    function setCouncilMember(address m, bool enabled) external onlyCouncil {
        isCouncilMember[m] = enabled;
        emit CouncilMemberSet(m, enabled);
    }

    function approveMarket(uint256 marketId) external onlyCouncil {
        statusOf[marketId] = Status.Approved;
        emit StatusChanged(marketId, Status.Approved);
    }

    function flagMarket(uint256 marketId) external onlyCouncil {
        statusOf[marketId] = Status.Flagged;
        emit StatusChanged(marketId, Status.Flagged);
    }

    function resetMarket(uint256 marketId) external onlyCouncil {
        statusOf[marketId] = Status.Pending;
        emit StatusChanged(marketId, Status.Pending);
    }
}
