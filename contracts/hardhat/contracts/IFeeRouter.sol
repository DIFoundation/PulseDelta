// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFeeRouter {
    function accrue(address market, uint256 protocolFee, uint256 creatorFee, uint256 lpFee) external;
    function claimCreator(address market, address to) external returns (uint256);
    function claimProtocol(address to) external returns (uint256);
    function setCreator(address market, address creator) external;
    function getCreator(address market) external view returns (address);
    function getCreatorLifetimeFees(address creator) external view returns (uint256);
    function getCreatorFeesForMarket(address creator, address market) external view returns (uint256);
}
