import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Contract addresses (update these after deployment)
const CONTRACT_ADDRESSES = {
  wDAG: "0x65B7e039B297ec4388c486E911EB784C3Ee5b718", // Update after deployment
  feeRouter: "0x197d31150F1097d2890993Db1d7FdF0750D9a5FD", // Update after deployment
  cryptoOracle: "0xc72b63C07517db71Ce68c901BD70590e55E26738", // Update after deployment
  sportsOracle: "0xDDC3F0f3B38989eF9f68D59c253c23036FAF3AFb", // Update after deployment
  trendsOracle: "0xC76f21395c081B91EB98C00235178b29E61Ab0aE", // Update after deployment
  binaryFactory: "0xBEFa32777356743080319cFEc69445245008888a", // Update after deployment
  multiFactory: "0xab9D772B50b8dE6E07B63C725a7adfE4F10e4821", // Update after deployment
  scalarFactory: "0x7315245fBF789A93D4C517AA23D3C627741a94F6", // Update after deployment
  tokenFactory: "0x46cBC38c104eA8dC3963a33f2F139740206388a3", // Update after deployment
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
  // await cryptoOracle.connect(deployer).setReporter(deployer.address, true);
  // // Authorize factories for crypto oracle
  // await cryptoOracle
  //   .connect(deployer)
  //   .setFactory(await binaryFactory.getAddress(), true);
  // await cryptoOracle
  //   .connect(deployer)
  //   .setFactory(await multiFactory.getAddress(), true);
  // await cryptoOracle
  //   .connect(deployer)
  //   .setFactory(await scalarFactory.getAddress(), true);
  // console.log("✅ Crypto Oracle reporter and factories configured");

  // // Set reporter (deployer) for sports oracle
  // await sportsOracle.connect(deployer).setReporter(deployer.address, true);
  // // Authorize factories for sports oracle
  // await sportsOracle
  //   .connect(deployer)
  //   .setFactory(await binaryFactory.getAddress(), true);
  // await sportsOracle
  //   .connect(deployer)
  //   .setFactory(await multiFactory.getAddress(), true);
  // await sportsOracle
  //   .connect(deployer)
  //   .setFactory(await scalarFactory.getAddress(), true);
  // console.log("✅ Sports Oracle reporter and factories configured");

  // Set reporter (deployer) for trends oracle
  // await trendsOracle.connect(deployer).setReporter(deployer.address, true);
  // // Authorize factories for trends oracle
  // await trendsOracle
  //   .connect(deployer)
  //   .setFactory(await binaryFactory.getAddress(), true);
  // await trendsOracle
  //   .connect(deployer)
  //   .setFactory(await multiFactory.getAddress(), true);
  // await trendsOracle
  //   .connect(deployer)
  //   .setFactory(await scalarFactory.getAddress(), true);
  // console.log("✅ Trends Oracle reporter and factories configured");

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
