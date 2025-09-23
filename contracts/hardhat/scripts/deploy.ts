import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

async function main() {
  console.log("🚀 Starting PulseDelta deployment...\n");

  // Get signer (deployer)
  const [deployer] = await ethers.getSigners();

  console.log("📋 Deployment Configuration:");
  console.log("Deployer:", deployer.address);
  console.log("Using single address for all roles");
  console.log("");

  // Deploy wDAG (Wrapped DAG)
  console.log("1️⃣ Deploying wDAG...");
  const wDAG = await ethers.deployContract("wDAG");
  await wDAG.waitForDeployment();
  console.log("✅ wDAG deployed to:", await wDAG.getAddress());

  // Deploy FeeRouter
  console.log("\n2️⃣ Deploying FeeRouter...");
  const feeRouter = await ethers.deployContract("FeeRouter", [
    deployer.address,
  ]);
  await feeRouter.waitForDeployment();
  console.log("✅ FeeRouter deployed to:", await feeRouter.getAddress());

  // Deploy Curation
  console.log("\n3️⃣ Deploying Curation...");
  const curation = await ethers.deployContract("Curation", [deployer.address]);
  await curation.waitForDeployment();
  console.log("✅ Curation deployed to:", await curation.getAddress());

  // Deploy OutcomeTokenFactory
  console.log("\n4️⃣ Deploying OutcomeTokenFactory...");
  const tokenFactory = await ethers.deployContract("OutcomeTokenFactory");
  await tokenFactory.waitForDeployment();
  console.log(
    "✅ OutcomeTokenFactory deployed to:",
    await tokenFactory.getAddress()
  );

  // Deploy Oracle Adapters
  console.log("\n5️⃣ Deploying Oracle Adapters...");

  // Crypto Oracle
  const cryptoOracle = await ethers.deployContract(
    "OptimisticCryptoOracleAdapter",
    [
      await wDAG.getAddress(),
      ethers.parseEther("100"), // reporter bond
      ethers.parseEther("200"), // disputer bond
      3600, // liveness (1 hour)
      deployer.address,
    ]
  );
  await cryptoOracle.waitForDeployment();
  console.log("✅ Crypto Oracle deployed to:", await cryptoOracle.getAddress());

  // Sports Oracle
  const sportsOracle = await ethers.deployContract(
    "SportsOptimisticOracleAdapter",
    [
      await wDAG.getAddress(),
      ethers.parseEther("50"), // reporter bond
      ethers.parseEther("100"), // disputer bond
      1800, // liveness (30 minutes)
      deployer.address,
    ]
  );
  await sportsOracle.waitForDeployment();
  console.log("✅ Sports Oracle deployed to:", await sportsOracle.getAddress());

  // Trends Oracle
  const trendsOracle = await ethers.deployContract(
    "TrendsOptimisticOracleAdapter",
    [
      await wDAG.getAddress(),
      ethers.parseEther("25"), // reporter bond
      ethers.parseEther("50"), // disputer bond
      900, // liveness (15 minutes)
      deployer.address,
    ]
  );
  await trendsOracle.waitForDeployment();
  console.log("✅ Trends Oracle deployed to:", await trendsOracle.getAddress());

  // Deploy Market Factories
  console.log("\n6️⃣ Deploying Market Factories...");

  // Binary Market Factory
  const binaryFactory = await ethers.deployContract("BinaryMarketFactory");
  await binaryFactory.waitForDeployment();
  console.log(
    "✅ Binary Market Factory deployed to:",
    await binaryFactory.getAddress()
  );

  // Multi Market Factory
  const multiFactory = await ethers.deployContract("MultiMarketFactory");
  await multiFactory.waitForDeployment();
  console.log(
    "✅ Multi Market Factory deployed to:",
    await multiFactory.getAddress()
  );

  // Scalar Market Factory
  const scalarFactory = await ethers.deployContract("ScalarMarketFactory");
  await scalarFactory.waitForDeployment();
  console.log(
    "✅ Scalar Market Factory deployed to:",
    await scalarFactory.getAddress()
  );

  // Save deployment addresses
  console.log("\n📋 Contract Addresses:");
  console.log("wDAG:", await wDAG.getAddress());
  console.log("FeeRouter:", await feeRouter.getAddress());
  console.log("Curation:", await curation.getAddress());
  console.log("OutcomeTokenFactory:", await tokenFactory.getAddress());
  console.log("Crypto Oracle:", await cryptoOracle.getAddress());
  console.log("Sports Oracle:", await sportsOracle.getAddress());
  console.log("Trends Oracle:", await trendsOracle.getAddress());
  console.log("Binary Factory:", await binaryFactory.getAddress());
  console.log("Multi Factory:", await multiFactory.getAddress());
  console.log("Scalar Factory:", await scalarFactory.getAddress());

  console.log("\n🔧 Deployment Complete!");
  console.log("✅ All contracts deployed successfully");
  console.log(
    "📝 Run 'npx hardhat run scripts/configure.ts --network primordial' to configure oracles and create sample markets"
  );
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
