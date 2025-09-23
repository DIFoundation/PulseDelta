// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OutcomeTokenERC20 is ERC20 {
    address public immutable market;
    uint8   public immutable outcomeId;
    bytes32 public immutable marketKey;

    error NotMarket();
    error ZeroAddress();

    modifier onlyMarket() {
        if (msg.sender != market) revert NotMarket();
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _market,
        uint8 _outcomeId,
        bytes32 _marketKey
    ) ERC20(_name, _symbol) {
        if (_market == address(0)) revert ZeroAddress();
        market    = _market;
        outcomeId = _outcomeId;
        marketKey = _marketKey;
    }

    function mint(address to, uint256 amount) external onlyMarket {
        if (to == address(0)) revert ZeroAddress();
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyMarket {
        _burn(from, amount);
    }
}