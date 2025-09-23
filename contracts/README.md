# PulseDelta Prediction Market Platform - Smart Contracts

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Contract Structure](#contract-structure)
4. [Token Flow](#token-flow)
5. [User Flows](#user-flows)
6. [Frontend Integration Guide](#frontend-integration-guide)
7. [Contract Functions Reference](#contract-functions-reference)
8. [Deployment Guide](#deployment-guide)
9. [Testing](#testing)
10. [Security Considerations](#security-considerations)

## Overview

PulseDelta is a decentralized prediction market platform built on DAG blockchain that allows users to create, trade, and resolve prediction markets. The platform supports three types of markets: Binary (Yes/No), Multi-outcome, and Scalar markets.

### Key Features

- **Native DAG Integration**: Users interact with DAG directly, automatic conversion to wDAG
- **Liquidity Provider System**: LPs earn fees by providing liquidity to markets
- **Pool-Based Redemption**: Winners receive payouts from a shared pool
- **Oracle Resolution**: Decentralized result reporting with economic incentives
- **Fee Distribution**: 30% Protocol, 30% Creator, 40% LP fees
- **Frontend-Ready**: Comprehensive getter functions for all market data

## Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Market Types  │    │   Token System  │    │   Oracle System │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ MarketBinary    │    │ wDAG (Wrapped)  │    │ OracleAdapter   │
│ MarketMulti     │    │ LPToken (LP)    │    │ Reporter System │
│ MarketScalar    │    │ OutcomeTokens   │    │ Dispute System  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Factory System │
                    ├─────────────────┤
                    │ BinaryFactory   │
                    │ MultiFactory    │
                    │ ScalarFactory   │
                    └─────────────────┘
```

## Contract Structure

### Core Contracts

#### 1. **wDAG.sol** - Wrapped DAG Token

- **Purpose**: ERC20 wrapper for native DAG
- **Key Functions**:
  - `deposit()` - Convert DAG to wDAG
  - `withdraw()` - Convert wDAG to DAG
  - `mint()` - Mint wDAG tokens
  - `burn()` - Burn wDAG tokens

#### 2. **LPToken.sol** - Liquidity Provider Token

- **Purpose**: ERC20 token representing LP shares in a market
- **Key Functions**:
  - `addLiquidity()` - Add liquidity, mint LP tokens
  - `removeLiquidity()` - Remove liquidity, burn LP tokens
  - `addFees()` - Add earned fees to LP pool
  - `getValuePerToken()` - Calculate current value per LP token

#### 3. **Market Contracts**

- **MarketBinary.sol** - Yes/No prediction markets
- **MarketMulti.sol** - Multi-outcome prediction markets
- **MarketScalar.sol** - Scalar prediction markets

Each market contract includes:

- AMM pricing mechanism
- LP functionality
- Fee distribution
- Pool-based redemption
- Frontend getter functions

#### 4. **Factory Contracts**

- **BinaryMarketFactory.sol** - Deploy binary markets
- **MultiMarketFactory.sol** - Deploy multi markets
- **ScalarMarketFactory.sol** - Deploy scalar markets

#### 5. **Oracle System**

- **OptimisticCryptoOracleAdapter.sol** - Result reporting
- **SportsOptimisticOracleAdapter.sol** - Sports results
- **TrendsOptimisticOracleAdapter.sol** - Trend analysis

#### 6. **Supporting Contracts**

- **FeeRouter.sol** - Fee collection and distribution
- **Curation.sol** - Market curation and approval
- **OutcomeTokenFactory.sol** - Deploy outcome tokens

## Token Flow

### DAG to wDAG Conversion

```
User DAG → Factory Contract → wDAG Contract → Market Contract
```

1. User sends DAG to factory
2. Factory calls `wDAG.deposit{value: DAG}()`
3. wDAG contract mints wDAG tokens
4. Factory transfers wDAG to market

### Trading Flow

```
User DAG → wDAG.deposit() → wDAG.approve() → market.buy() → Outcome Tokens
```

1. User converts DAG to wDAG
2. User approves market to spend wDAG
3. User calls `buy()` with wDAG
4. Market mints outcome tokens to user

### Redemption Flow

```
Outcome Tokens → market.redeem() → Pool Distribution → User receives wDAG
```

1. Winner calls `redeem()`
2. Market calculates share from pool
3. Market transfers wDAG to winner
4. Winner can convert wDAG back to DAG

## User Flows

### 1. Market Creator Flow

```
1. Connect wallet (has DAG)
2. Click "Create Market"
3. Fill form: question, end time, initial liquidity
4. Send DAG to factory (1000 DAG example)
5. Factory creates market with wDAG liquidity
6. Market is live for trading
```

### 2. Liquidity Provider Flow

```
1. View market details
2. Click "Add Liquidity"
3. Enter DAG amount (500 DAG example)
4. Send DAG to market
5. Market converts DAG → wDAG
6. Receive LP tokens representing share
7. Earn fees from trades
8. Can remove liquidity anytime
```

### 3. Trader Flow

```
1. View market, click "Buy YES" or "Buy NO"
2. Enter DAG amount to bet
3. Frontend converts DAG → wDAG
4. Frontend approves market to spend wDAG
5. Frontend calls market.buy()
6. Receive outcome tokens
7. Wait for resolution
8. If winner, call redeem() to claim wDAG
```

### 4. Reporter Flow

```
1. Market closes, "Report Result" button appears
2. Click "Report Result"
3. Enter result and evidence
4. Pay wDAG bond (100 DAG)
5. Submit result to oracle
6. Wait 1 hour for disputes
7. If no dispute, result is finalized
8. Get bond back + reward
```

### 5. Resolution Flow

```
1. Reporter submits result
2. 1 hour liveness period
3. Anyone can dispute with bond
4. If no dispute, result finalized
5. Market closed and resolved
6. Winners can redeem tokens
7. Losers get nothing
```

## Frontend Integration Guide

### Contract Addresses

After deployment, you'll need these contract addresses:

```javascript
const CONTRACTS = {
  wDAG: "0x...", // Wrapped DAG token
  binaryFactory: "0x...", // Binary market factory
  multiFactory: "0x...", // Multi market factory
  scalarFactory: "0x...", // Scalar market factory
  oracle: "0x...", // Oracle adapter
  feeRouter: "0x...", // Fee management
  curation: "0x...", // Market curation
};
```

### Contract ABIs

Import the generated ABIs from `artifacts/` directory:

```javascript
import wDAGABI from "./artifacts/contracts/wDAG.sol/wDAG.json";
import BinaryFactoryABI from "./artifacts/contracts/factories/BinaryMarketFactory.sol/BinaryMarketFactory.json";
import MarketBinaryABI from "./artifacts/contracts/MarketBinary.sol/MarketBinary.json";
// ... other ABIs
```

### Web3 Setup

```javascript
import { ethers } from "ethers";

// Connect to DAG network
const provider = new ethers.JsonRpcProvider("YOUR_DAG_RPC_URL");
const signer = new ethers.Wallet("PRIVATE_KEY", provider);

// Initialize contracts
const wDAG = new ethers.Contract(CONTRACTS.wDAG, wDAGABI.abi, signer);
const binaryFactory = new ethers.Contract(
  CONTRACTS.binaryFactory,
  BinaryFactoryABI.abi,
  signer
);
```

### Market Creation (Creator)

```javascript
async function createMarket(question, endTime, initialLiquidity) {
  const startTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
  const resolutionDeadline = endTime + 1800; // 30 minutes after end
  const marketKey = ethers.keccak256(ethers.toUtf8Bytes(question));

  const tx = await binaryFactory.createBinary(
    CONTRACTS.wDAG,
    question,
    "ipfs://metadata",
    signer.address, // creator
    CONTRACTS.oracle,
    CONTRACTS.feeRouter,
    CONTRACTS.tokenFactory,
    marketKey,
    100, // 1% fee
    startTime,
    endTime,
    resolutionDeadline,
    { value: ethers.parseEther(initialLiquidity) } // Send DAG
  );

  const receipt = await tx.wait();
  // Extract market address from event
  const event = receipt.logs.find((log) => {
    try {
      const parsed = binaryFactory.interface.parseLog(log);
      return parsed?.name === "MarketCreated";
    } catch {
      return false;
    }
  });
  const marketAddress = binaryFactory.interface.parseLog(event).args.market;
  return marketAddress;
}
```

### Add Liquidity (LP)

```javascript
async function addLiquidity(marketAddress, dagAmount) {
  const market = new ethers.Contract(
    marketAddress,
    MarketBinaryABI.abi,
    signer
  );

  const tx = await market.addLiquidity({
    value: ethers.parseEther(dagAmount), // Send DAG
  });

  await tx.wait();

  // Get LP token balance
  const lpTokenAddress = await market.lpToken();
  const lpToken = new ethers.Contract(lpTokenAddress, LPTokenABI.abi, signer);
  const lpBalance = await lpToken.balanceOf(signer.address);

  return lpBalance;
}
```

### Trade (Trader)

```javascript
async function buyOutcome(marketAddress, isYes, dagAmount) {
  const market = new ethers.Contract(
    marketAddress,
    MarketBinaryABI.abi,
    signer
  );

  // Step 1: Convert DAG to wDAG
  const wDAG = new ethers.Contract(CONTRACTS.wDAG, wDAGABI.abi, signer);
  await wDAG.deposit({ value: ethers.parseEther(dagAmount) });

  // Step 2: Approve market to spend wDAG
  await wDAG.approve(marketAddress, ethers.parseEther(dagAmount));

  // Step 3: Buy outcome tokens
  const tx = await market.buy(isYes, ethers.parseEther(dagAmount));
  await tx.wait();

  return tx;
}
```

### Report Result (Reporter)

```javascript
async function reportResult(marketId, result, evidence) {
  const oracle = new ethers.Contract(CONTRACTS.oracle, OracleABI.abi, signer);

  // Approve oracle to spend wDAG for bond
  const wDAG = new ethers.Contract(CONTRACTS.wDAG, wDAGABI.abi, signer);
  await wDAG.approve(CONTRACTS.oracle, ethers.parseEther("100"));

  // Submit result
  const tx = await oracle.proposeResult(
    marketId,
    ethers.toUtf8Bytes(result.toString()),
    evidence
  );

  await tx.wait();
  return tx;
}
```

### Redeem Winnings (Winner)

```javascript
async function redeemWinnings(marketAddress) {
  const market = new ethers.Contract(
    marketAddress,
    MarketBinaryABI.abi,
    signer
  );

  const tx = await market.redeem();
  await tx.wait();

  return tx;
}
```

### Frontend Data Fetching

```javascript
// Get market details
async function getMarketDetails(marketAddress) {
  const market = new ethers.Contract(
    marketAddress,
    MarketBinaryABI.abi,
    provider
  );

  const details = {
    question: await market.question(),
    state: await market.state(),
    startTime: await market.startTime(),
    endTime: await market.endTime(),
    participantCount: await market.getParticipantCount(),
    totalVolume: await market.getTotalVolume(),
    lpStats: await market.getLPStats(),
  };

  return details;
}

// Get user's trader volume
async function getUserVolume(marketAddress, userAddress) {
  const market = new ethers.Contract(
    marketAddress,
    MarketBinaryABI.abi,
    provider
  );
  return await market.getTraderVolume(userAddress);
}

// Get fee statistics
async function getFeeStats() {
  const feeRouter = new ethers.Contract(
    CONTRACTS.feeRouter,
    FeeRouterABI.abi,
    provider
  );

  return {
    totalProtocolFees: await feeRouter.getTotalProtocolFees(),
    totalCreatorFees: await feeRouter.getTotalCreatorFees(),
    totalLPFees: await feeRouter.getTotalLPFees(),
  };
}
```

## Contract Functions Reference

### MarketBinary Functions

#### Core Functions

```solidity
// Create market (called by factory)
constructor(
  address collateral,
  string memory question,
  string memory metadataURI,
  address creator,
  uint256 marketId,
  address oracleAdapter,
  address feeRouter,
  address tokenFactory,
  bytes32 marketKey,
  uint256 feeBps,
  uint256 liquidity,
  uint256[3] memory times
)

// Buy outcome tokens
function buy(bool isYes, uint256 shares) external

// Redeem winnings
function redeem() external

// Close market
function close() external

// Finalize with result
function finalize(uint8 outcome) external
```

#### LP Functions

```solidity
// Add liquidity
function addLiquidity() external payable returns (uint256 lpTokens)

// Remove liquidity
function removeLiquidity(uint256 lpTokens) external returns (uint256 wDAGAmount)

// Get LP statistics
function getLPStats() external view returns (
  uint256 totalLiquidity,
  uint256 totalFees,
  uint256 valuePerToken
)
```

#### Frontend Getters

```solidity
// Get participant count
function getParticipantCount() external view returns (uint256)

// Get trader volume
function getTraderVolume(address user) external view returns (uint256)

// Get total volume
function getTotalVolume() external view returns (uint256)

// Get market statistics
function getMarketStats() external view returns (
  uint256 participantCount,
  uint256 totalVolume,
  uint256 totalLiquidity,
  uint256 totalFees
)
```

### Factory Functions

#### BinaryMarketFactory

```solidity
// Create binary market
function createBinary(
  address collateral,
  string memory question,
  string memory metadataURI,
  address creator,
  address oracleAdapter,
  address feeRouter,
  address tokenFactory,
  bytes32 marketKey,
  uint256 feeBps,
  uint256 startTime,
  uint256 endTime,
  uint256 resolutionDeadline
) external payable returns (address market)

// Get markets by status
function getMarketsByStatus(uint8 status) external view returns (address[] memory)

// Get market count
function getMarketCount() external view returns (uint256)
```

### wDAG Functions

```solidity
// Convert DAG to wDAG
function deposit() external payable

// Convert wDAG to DAG
function withdraw(uint256 amount) external

// Mint wDAG tokens
function mint(address to, uint256 amount) external

// Burn wDAG tokens
function burn(uint256 amount) external
```

### Oracle Functions

```solidity
// Submit result
function proposeResult(
  uint256 marketId,
  bytes calldata payload,
  string calldata evidenceCID
) external payable

// Finalize result
function finalize(uint256 marketId) external

// Set reporter
function setReporter(address reporter, bool enabled) external
```

## Deployment Guide

### Prerequisites

```bash
npm install
npx hardhat compile
```

### Deploy Script

```javascript
// scripts/deploy.js
async function main() {
  // Deploy wDAG
  const wDAG = await ethers.deployContract("wDAG");
  await wDAG.waitForDeployment();
  console.log("wDAG deployed to:", await wDAG.getAddress());

  // Deploy FeeRouter
  const feeRouter = await ethers.deployContract("FeeRouter", [
    deployer.address,
  ]);
  await feeRouter.waitForDeployment();
  console.log("FeeRouter deployed to:", await feeRouter.getAddress());

  // Deploy Oracle
  const oracle = await ethers.deployContract("OptimisticCryptoOracleAdapter", [
    await wDAG.getAddress(),
    ethers.parseEther("100"), // reporter bond
    ethers.parseEther("200"), // disputer bond
    3600, // liveness
    council.address,
  ]);
  await oracle.waitForDeployment();
  console.log("Oracle deployed to:", await oracle.getAddress());

  // Deploy Factories
  const binaryFactory = await ethers.deployContract("BinaryMarketFactory");
  await binaryFactory.waitForDeployment();
  console.log("BinaryFactory deployed to:", await binaryFactory.getAddress());

  // ... deploy other contracts
}

main().catch(console.error);
```

### Deploy Commands

```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network testnet

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

### Post-Deployment Setup

```javascript
// Set up oracle reporter
await oracle.setReporter(reporterAddress, true);

// Set up fee router creator
await feeRouter.setCreator(marketAddress, creatorAddress);

// Set up market in oracle
await oracle.setMarketAddress(marketId, marketAddress);
```

## Testing

### Run All Tests

```bash
npx hardhat test
```

### Run Specific Tests

```bash
# Run complete flow test
npx hardhat test test/CompleteMarketFlow.test.ts

# Run prediction tests
npx hardhat test test/Prediction.test.ts

# Run DAG conversion test
npx hardhat test test/DAGConversion.test.ts
```

### Test Coverage

- ✅ Market creation and timing
- ✅ Trading with time constraints
- ✅ AMM pricing mechanism
- ✅ Oracle resolution
- ✅ Fee distribution
- ✅ LP functionality
- ✅ Pool-based redemption
- ✅ Multi-outcome markets
- ✅ Scalar markets
- ✅ Edge cases
- ✅ Security tests
- ✅ Complete end-to-end flow

## Security Considerations

### Access Control

- Market creators can only close their own markets
- Only authorized reporters can submit results
- Council controls oracle and curation systems

### Economic Security

- Reporter bonds prevent spam
- Disputer bonds ensure quality
- LP system provides liquidity incentives
- Fee distribution aligns incentives

### Smart Contract Security

- Reentrancy protection
- Integer overflow protection
- Access control modifiers
- Custom error handling
- Comprehensive testing

### Oracle Security

- Liveness period for disputes
- Economic incentives for accuracy
- Council oversight
- Evidence requirements

## Gas Optimization

### Contract Size

- Split large contracts into smaller ones
- Use libraries for common functionality
- Remove unused code

### Function Optimization

- Batch operations where possible
- Use events for data that doesn't need to be on-chain
- Optimize storage layout

### Gas-Efficient Patterns

- Use custom errors instead of require strings
- Pack structs efficiently
- Use unchecked arithmetic where safe

## Monitoring and Maintenance

### Events to Monitor

- `MarketCreated` - New markets
- `Traded` - Trading activity
- `Finalized` - Market resolutions
- `Accrued` - Fee distributions
- `LPAdded` - Liquidity additions

### Key Metrics

- Total markets created
- Trading volume
- LP participation
- Fee collection
- Resolution accuracy

### Maintenance Tasks

- Monitor oracle performance
- Update fee structures if needed
- Add new market types
- Improve gas efficiency
- Security audits

## Troubleshooting

### Common Issues

#### "Insufficient Allowance"

- User needs to approve market to spend wDAG
- Call `wDAG.approve(marketAddress, amount)`

#### "TradingEnded"

- Market has passed its end time
- Check `market.endTime()` vs current timestamp

#### "NotOpen"

- Market is not in Open state
- Check `market.state()` - should be 0 (Open)

#### "Insufficient Balance"

- User doesn't have enough wDAG
- Convert DAG to wDAG first with `wDAG.deposit()`

### Debug Commands

```javascript
// Check market state
const state = await market.state();
// 0 = Open, 1 = Closed, 2 = Resolved

// Check user balance
const balance = await wDAG.balanceOf(userAddress);

// Check allowance
const allowance = await wDAG.allowance(userAddress, marketAddress);

// Check market timing
const now = await time.latest();
const endTime = await market.endTime();
const isActive = now < endTime;
```

## Support and Community

### Documentation

- Contract ABIs in `artifacts/`
- Test examples in `test/`
- This README for integration

### Testing

- Comprehensive test suite
- End-to-end flow testing
- Edge case coverage

### Security

- Regular security audits
- Bug bounty program
- Community reporting

---

**This documentation provides everything needed to integrate the PulseDelta prediction market platform with any frontend application. The contracts are production-ready and fully tested.**
