// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracleAdapter {
    enum Status {
        None,
        Proposed,
        Disputed,
        Finalized,
        Invalid
    }

    event Proposed(uint256 indexed marketId, bytes payload, string evidenceCID);
    event Disputed(uint256 indexed marketId, string evidenceCID);
    event Finalized(uint256 indexed marketId, bytes value, Status status);

    function proposeResult(
        uint256 marketId,
        bytes calldata payload,
        string calldata evidenceCID
    ) external payable;

    function dispute(
        uint256 marketId,
        string calldata evidenceCID
    ) external payable;

    function finalize(uint256 marketId) external;

    function getResult(
        uint256 marketId
    ) external view returns (Status, bytes memory value);

    function setMarketAddress(uint256 marketId, address market) external;
}
