import { ethers } from "hardhat";

async function main() {
  console.log("📋 Getting deployed contract addresses...\n");

  // Get signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("");

  // Get contract instances by name (assuming they're deployed)
  try {
    const wDAG = await ethers.getContract("wDAG");
    const feeRouter = await ethers.getContract("FeeRouter");
    const cryptoOracle = await ethers.getContract(
      "OptimisticCryptoOracleAdapter"
    );
    const sportsOracle = await ethers.getContract(
      "SportsOptimisticOracleAdapter"
    );
    const trendsOracle = await ethers.getContract(
      "TrendsOptimisticOracleAdapter"
    );
    const binaryFactory = await ethers.getContract("BinaryMarketFactory");
    const multiFactory = await ethers.getContract("MultiMarketFactory");
    const scalarFactory = await ethers.getContract("ScalarMarketFactory");
    const tokenFactory = await ethers.getContract("OutcomeTokenFactory");

    console.log("📋 Contract Addresses:");
    console.log("wDAG:", await wDAG.getAddress());
    console.log("FeeRouter:", await feeRouter.getAddress());
    console.log("Curation:", "Not available via getContract");
    console.log("OutcomeTokenFactory:", await tokenFactory.getAddress());
    console.log("Crypto Oracle:", await cryptoOracle.getAddress());
    console.log("Sports Oracle:", await sportsOracle.getAddress());
    console.log("Trends Oracle:", await trendsOracle.getAddress());
    console.log("Binary Factory:", await binaryFactory.getAddress());
    console.log("Multi Factory:", await multiFactory.getAddress());
    console.log("Scalar Factory:", await scalarFactory.getAddress());

    console.log(
      "\n📝 Copy these addresses to configure.ts CONTRACT_ADDRESSES object"
    );
    console.log("=".repeat(80));
  } catch (error) {
    console.error("❌ Error getting contract addresses:", error);
    console.log(
      "Make sure contracts are deployed first with: npx hardhat run scripts/deploy.ts --network primordial"
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
