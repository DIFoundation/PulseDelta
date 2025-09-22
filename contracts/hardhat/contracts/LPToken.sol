// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LPToken
 * @dev ERC20 token representing LP shares in a prediction market
 *
 * This contract allows LPs to:
 * 1. Deposit wDAG and receive LP tokens (representing their share of the pool)
 * 2. Withdraw wDAG + earned fees by burning LP tokens
 * 3. Track their proportional share of the liquidity pool
 */
contract LPToken is ERC20, Ownable {
    uint8 private constant _DECIMALS = 18;

    // The market contract that can mint/burn LP tokens
    address public market;

    // Total wDAG in the LP pool
    uint256 public totalLiquidity;

    // Total fees earned by LPs
    uint256 public totalFeesEarned;

    event LiquidityAdded(
        address indexed user,
        uint256 wDAGAmount,
        uint256 lpTokens
    );
    event LiquidityRemoved(
        address indexed user,
        uint256 lpTokens,
        uint256 wDAGAmount
    );
    event FeesEarned(uint256 amount);

    error NotMarket();
    error ZeroAmount();
    error InsufficientLiquidity();

    modifier onlyMarket() {
        if (msg.sender != market) revert NotMarket();
        _;
    }

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    function setMarket(address _market) external onlyOwner {
        market = _market;
    }

    /**
     * @dev Add liquidity to the pool
     * @param user Address to mint LP tokens to
     * @param wDAGAmount Amount of wDAG being added
     * @return lpTokens Amount of LP tokens minted
     */
    function addLiquidity(
        address user,
        uint256 wDAGAmount
    ) external onlyMarket returns (uint256 lpTokens) {
        if (wDAGAmount == 0) revert ZeroAmount();

        if (totalSupply() == 0) {
            // First LP gets 1:1 ratio
            lpTokens = wDAGAmount;
        } else {
            // Calculate LP tokens based on current pool value
            // LP tokens = (wDAG amount * total LP supply) / total liquidity
            lpTokens = (wDAGAmount * totalSupply()) / totalLiquidity;
        }

        totalLiquidity += wDAGAmount;
        _mint(user, lpTokens);

        emit LiquidityAdded(user, wDAGAmount, lpTokens);
        return lpTokens;
    }

    /**
     * @dev Remove liquidity from the pool
     * @param user Address to burn LP tokens from
     * @param lpTokens Amount of LP tokens to burn
     * @return wDAGAmount Amount of wDAG to return
     */
    function removeLiquidity(
        address user,
        uint256 lpTokens
    ) external onlyMarket returns (uint256 wDAGAmount) {
        if (lpTokens == 0) revert ZeroAmount();
        if (lpTokens > balanceOf(user)) revert InsufficientLiquidity();

        // Calculate wDAG amount based on current pool value + fees
        uint256 totalValue = totalLiquidity + totalFeesEarned;
        wDAGAmount = (lpTokens * totalValue) / totalSupply();

        // Update pool (remove proportional liquidity and fees)
        uint256 liquidityShare = (lpTokens * totalLiquidity) / totalSupply();
        uint256 feesShare = (lpTokens * totalFeesEarned) / totalSupply();

        totalLiquidity -= liquidityShare;
        totalFeesEarned -= feesShare;

        _burn(user, lpTokens);

        emit LiquidityRemoved(user, lpTokens, wDAGAmount);
        return wDAGAmount;
    }

    /**
     * @dev Add fees earned by LPs
     * @param feeAmount Amount of fees to add
     */
    function addFees(uint256 feeAmount) external onlyMarket {
        totalFeesEarned += feeAmount;
        emit FeesEarned(feeAmount);
    }

    /**
     * @dev Get current pool value per LP token
     * @return value Value in wDAG per LP token
     */
    function getValuePerToken() external view returns (uint256 value) {
        if (totalSupply() == 0) return 0;
        return (totalLiquidity + totalFeesEarned) / totalSupply();
    }

    /**
     * @dev Get user's share value
     * @param user User address
     * @return value User's share value in wDAG
     */
    function getUserShareValue(
        address user
    ) external view returns (uint256 value) {
        uint256 userBalance = balanceOf(user);
        if (userBalance == 0 || totalSupply() == 0) return 0;

        uint256 totalValue = totalLiquidity + totalFeesEarned;
        return (userBalance * totalValue) / totalSupply();
    }
}
