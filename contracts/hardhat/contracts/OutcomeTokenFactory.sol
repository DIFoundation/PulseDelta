// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OutcomeTokenERC20.sol";

contract OutcomeTokenFactory {
    event TokenCreated(address token, address market, uint8 outcomeId);

    mapping(address => address[]) public tokensByMarket;
    mapping(address => mapping(uint8 => address)) public tokenOf;

    error Exists();
    error ZeroAddress();

    function create(
        string memory name_,
        string memory symbol_,
        address market_,
        uint8 outcomeId_,
        bytes32 marketKey_
    ) external returns (address token) {
        if (market_ == address(0)) revert ZeroAddress();
        if (tokenOf[market_][outcomeId_] != address(0)) revert Exists();
        token = address(new OutcomeTokenERC20(name_, symbol_, market_, outcomeId_, marketKey_));
        tokenOf[market_][outcomeId_] = token;
        tokensByMarket[market_].push(token);
        emit TokenCreated(token, market_, outcomeId_);
    }

    function getTokens(address market_) external view returns (address[] memory) {
        return tokensByMarket[market_];
    }
}
