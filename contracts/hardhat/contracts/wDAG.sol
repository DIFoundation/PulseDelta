// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title wDAG (Wrapped DAG)
 * @dev ERC20 wrapper for BlockDAG's native DAG token
 *
 * This contract allows users to:
 * 1. Deposit native DAG tokens and receive wDAG (1:1 ratio)
 * 2. Burn wDAG tokens to receive native DAG tokens
 * 3. Use wDAG as collateral in prediction markets
 */
contract wDAG is ERC20, Ownable {
    uint8 private constant _DECIMALS = 18;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor() ERC20("Wrapped DAG", "wDAG") Ownable(msg.sender) {}

    /**
     * @dev Receive function to accept native DAG deposits
     */
    receive() external payable {
        // Do nothing - just accept the DAG
        // Users must call deposit() to mint wDAG
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /**
     * @dev Deposit native DAG tokens and mint wDAG
     * This function should be called when users send native DAG to this contract
     */
    function deposit() external payable {
        require(msg.value > 0, "wDAG: Deposit amount must be greater than 0");
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Burn wDAG tokens and receive native DAG tokens
     * @param amount Amount of wDAG to burn
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "wDAG: Withdrawal amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "wDAG: Insufficient balance");

        _burn(msg.sender, amount);

        // Transfer native DAG tokens back to user
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "wDAG: Transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Mint wDAG tokens (only owner - for testing or special cases)
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Mapping of authorized minters (market contracts)
    mapping(address => bool) public authorizedMinters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    /**
     * @dev Add authorized minter (market contracts)
     * @param minter Address to authorize
     */
    function addMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove authorized minter
     * @param minter Address to remove
     */
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint wDAG tokens (for market contracts when users redeem winning tokens)
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     */
    function mintForRedemption(address to, uint256 amount) external {
        require(
            authorizedMinters[msg.sender],
            "wDAG: Only authorized minters can mint for redemption"
        );
        _mint(to, amount);
    }

    /**
     * @dev Burn wDAG tokens (for market contracts when users buy outcome tokens)
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        require(
            authorizedMinters[msg.sender],
            "wDAG: Only authorized minters can burn"
        );
        _burn(msg.sender, amount);
    }

    /**
     * @dev Get the total native DAG balance held by this contract
     * @return The contract's native DAG balance
     */
    function getNativeBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Emergency function to recover native DAG tokens (only owner)
     * @param to Address to send tokens to
     * @param amount Amount to recover
     */
    function emergencyWithdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "wDAG: Invalid address");
        require(
            amount <= address(this).balance,
            "wDAG: Insufficient contract balance"
        );

        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "wDAG: Transfer failed");
    }
}
