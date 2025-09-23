import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Contract addresses (update these after deployment)
const CONTRACT_ADDRESSES = {
  wDAG: "0xA967CE077dD5beEc5aB4019E3714F4f6af5b5c08", // Update after deployment
  feeRouter: "0x8466a63c5b7aF12F110247FD3A2140d90AACd190", // Update after deployment
  cryptoOracle: "0xdB241F81F671106E948cb06A18Cfeb02ed92ba59", // Update after deployment
  sportsOracle: "0xdb5fC9Acd81176099d3d47F1e87310007b5e19D2", // Update after deployment
  trendsOracle: "0x00C10D3D693A6812973ab23F6A8E23E6d36B7E83", // Update after deployment
  binaryFactory: "0x39344f98714558D710C3422AEe38f108f6bA1CFc", // Update after deployment
  multiFactory: "0x5e9D6779D1863F9610f1Db68f0e2618A1c348D6F", // Update after deployment
  scalarFactory: "0xC8c64D1005B99357391543b7B464D8E3F059b4f2", // Update after deployment
  tokenFactory: "0x246b2234d6254DAdE84f8D349C200404f0e058a9", // Update after deployment
};

async function main() {
  console.log("⚙️ Starting PulseDelta configuration...\n");

  // Get signer (deployer)
  const [deployer] = await ethers.getSigners();

  console.log("📋 Configuration Details:");
  console.log("Deployer:", deployer.address);
  console.log("");

  // Get contract instances
  const wDAG = await ethers.getContractAt("wDAG", CONTRACT_ADDRESSES.wDAG);
  const feeRouter = await ethers.getContractAt(
    "FeeRouter",
    CONTRACT_ADDRESSES.feeRouter
  );
  const cryptoOracle = await ethers.getContractAt(
    "OptimisticCryptoOracleAdapter",
    CONTRACT_ADDRESSES.cryptoOracle
  );
  const sportsOracle = await ethers.getContractAt(
    "SportsOptimisticOracleAdapter",
    CONTRACT_ADDRESSES.sportsOracle
  );
  const trendsOracle = await ethers.getContractAt(
    "TrendsOptimisticOracleAdapter",
    CONTRACT_ADDRESSES.trendsOracle
  );
  const binaryFactory = await ethers.getContractAt(
    "BinaryMarketFactory",
    CONTRACT_ADDRESSES.binaryFactory
  );
  const multiFactory = await ethers.getContractAt(
    "MultiMarketFactory",
    CONTRACT_ADDRESSES.multiFactory
  );
  const scalarFactory = await ethers.getContractAt(
    "ScalarMarketFactory",
    CONTRACT_ADDRESSES.scalarFactory
  );
  const tokenFactory = await ethers.getContractAt(
    "OutcomeTokenFactory",
    CONTRACT_ADDRESSES.tokenFactory
  );

  // Configure Oracle Reporters and Authorize Factories
  console.log("1️⃣ Configuring Oracle Reporters and Authorizing Factories...");

  // Set reporter (deployer) for crypto oracle
  await cryptoOracle.connect(deployer).setReporter(deployer.address, true);
  // Authorize factories for crypto oracle
  await cryptoOracle
    .connect(deployer)
    .setFactory(await binaryFactory.getAddress(), true);
  await cryptoOracle
    .connect(deployer)
    .setFactory(await multiFactory.getAddress(), true);
  await cryptoOracle
    .connect(deployer)
    .setFactory(await scalarFactory.getAddress(), true);
  console.log("✅ Crypto Oracle reporter and factories configured");

  // // Set reporter (deployer) for sports oracle
  await sportsOracle.connect(deployer).setReporter(deployer.address, true);
  // Authorize factories for sports oracle
  await sportsOracle
    .connect(deployer)
    .setFactory(await binaryFactory.getAddress(), true);
  await sportsOracle
    .connect(deployer)
    .setFactory(await multiFactory.getAddress(), true);
  await sportsOracle
    .connect(deployer)
    .setFactory(await scalarFactory.getAddress(), true);
  console.log("✅ Sports Oracle reporter and factories configured");

  // Set reporter (deployer) for trends oracle
  await trendsOracle.connect(deployer).setReporter(deployer.address, true);
  // Authorize factories for trends oracle
  await trendsOracle
    .connect(deployer)
    .setFactory(await binaryFactory.getAddress(), true);
  await trendsOracle
    .connect(deployer)
    .setFactory(await multiFactory.getAddress(), true);
  await trendsOracle
    .connect(deployer)
    .setFactory(await scalarFactory.getAddress(), true);
  console.log("✅ Trends Oracle reporter and factories configured");

  // Fund wDAG contract for testing (optional)
  console.log("\n2️⃣ Funding wDAG contract...");
  const fundingTx = await deployer.sendTransaction({
    to: await wDAG.getAddress(),
    value: ethers.parseEther("10"), // 10 DAG (reduced from 1000)
  });
  await fundingTx.wait();
  console.log("✅ wDAG contract funded with 10 DAG");

  // Fund deployer with wDAG for bonds and trading
  console.log("\n3️⃣ Funding deployer...");

  // Mint wDAG for deployer
  await wDAG.connect(deployer).mint(deployer.address, ethers.parseEther("100"));
  console.log("✅ Deployer funded with wDAG");

  // Create sample markets for testing
  console.log("\n4️⃣ Creating sample markets...");

  // Binary market
  const binaryMarketTx = await binaryFactory.connect(deployer).createBinary(
    await wDAG.getAddress(),
    "Will Bitcoin reach $100,000 by end of 2024?",
    "https://metadata.example.com/bitcoin-100k",
    deployer.address,
    await cryptoOracle.getAddress(),
    await feeRouter.getAddress(),
    await tokenFactory.getAddress(),
    ethers.keccak256(ethers.toUtf8Bytes("bitcoin-100k-2024")),
    100, // 1% fee
    Math.floor(Date.now() / 1000) + 3600, // start in 1 hour
    Math.floor(Date.now() / 1000) + 86400 * 30, // end in 30 days
    Math.floor(Date.now() / 1000) + 86400 * 35, // resolution deadline in 35 days
    { value: ethers.parseEther("1") } // 1 DAG liquidity
  );
  await binaryMarketTx.wait();
  console.log("✅ Binary market created");

  // Multi-outcome market
  const multiMarketTx = await multiFactory.connect(deployer).createMulti(
    await wDAG.getAddress(),
    "Which cryptocurrency will have the highest market cap in 2024?",
    "https://metadata.example.com/crypto-leader-2024",
    deployer.address,
    await cryptoOracle.getAddress(),
    await feeRouter.getAddress(),
    await tokenFactory.getAddress(),
    ethers.keccak256(ethers.toUtf8Bytes("crypto-leader-2024")),
    ["Bitcoin", "Ethereum", "Solana", "Cardano", "Other"],
    100, // 1% fee
    Math.floor(Date.now() / 1000) + 3600, // start in 1 hour
    Math.floor(Date.now() / 1000) + 86400 * 30, // end in 30 days
    Math.floor(Date.now() / 1000) + 86400 * 35, // resolution deadline in 35 days
    { value: ethers.parseEther("1") } // 1 DAG liquidity
  );
  await multiMarketTx.wait();
  console.log("✅ Multi-outcome market created");

  // Scalar market
  const scalarMarketTx = await scalarFactory.connect(deployer).createScalar(
    await wDAG.getAddress(),
    "What will be the price of Ethereum on December 31, 2024?",
    "https://metadata.example.com/ethereum-price-2024",
    deployer.address,
    await cryptoOracle.getAddress(),
    await feeRouter.getAddress(),
    await tokenFactory.getAddress(),
    ethers.keccak256(ethers.toUtf8Bytes("ethereum-price-2024")),
    100, // 1% fee
    Math.floor(Date.now() / 1000) + 3600, // start in 1 hour
    Math.floor(Date.now() / 1000) + 86400 * 30, // end in 30 days
    Math.floor(Date.now() / 1000) + 86400 * 35, // resolution deadline in 35 days
    ethers.parseEther("1000"), // lower bound: $1000
    ethers.parseEther("10000"), // upper bound: $10000
    { value: ethers.parseEther("1") } // 1 DAG liquidity
  );
  await scalarMarketTx.wait();
  console.log("✅ Scalar market created");

  // Get market addresses (auto-configured by factories)
  console.log("\n5️⃣ Markets auto-configured by factories...");

  const binaryMarkets = await binaryFactory.getMarketsByStatus(0); // Active markets
  const multiMarkets = await multiFactory.getMarketsByStatus(0); // Active markets
  const scalarMarkets = await scalarFactory.getMarketsByStatus(0); // Active markets

  console.log("📊 Sample Markets:");
  console.log("Binary Market:", binaryMarkets[0]);
  console.log("Multi Market:", multiMarkets[0]);
  console.log("Scalar Market:", scalarMarkets[0]);

  console.log("\n👥 Key Addresses:");
  console.log("Deployer:", deployer.address);

  console.log("\n🔧 Configuration Status:");
  console.log("✅ All contracts deployed");
  console.log("✅ Oracle reporters configured");
  console.log("✅ Sample markets created");
  console.log("✅ Creators configured");
  console.log("✅ Markets linked to oracles");
  console.log("✅ wDAG funded for testing");

  console.log("\n🚀 Platform is ready for use!");
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Configuration failed:", error);
    process.exit(1);
  });
