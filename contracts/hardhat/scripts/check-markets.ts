import { ethers } from "hardhat";

async function main() {
  console.log("Checking market contracts...\n");

  // Get the deployed contract addresses from the frontend
  const binaryFactoryAddress = "0x39344f98714558D710C3422AEe38f108f6bA1CFc";
  const multiFactoryAddress = "0x5e9D6779D1863F9610f1Db68f0e2618A1c348D6F";
  const scalarFactoryAddress = "0xC8c64D1005B99357391543b7B464D8E3F059b4f2";

  // Get contract instances
  const binaryFactory = await ethers.getContractAt(
    "BinaryMarketFactory",
    binaryFactoryAddress
  );
  const multiFactory = await ethers.getContractAt(
    "MultiMarketFactory",
    multiFactoryAddress
  );
  const scalarFactory = await ethers.getContractAt(
    "ScalarMarketFactory",
    scalarFactoryAddress
  );

  // Check binary factory
  console.log("=== BINARY FACTORY ===");
  try {
    const binaryCount = await binaryFactory.marketCount();
    console.log(`Market count: ${binaryCount}`);

    for (let i = 1; i <= Number(binaryCount); i++) {
      try {
        const marketAddress = await binaryFactory.marketOf(i);
        console.log(`Market ${i}: ${marketAddress}`);
      } catch (error) {
        console.log(`Market ${i}: ERROR - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`Binary factory error: ${error.message}`);
  }

  console.log("\n=== MULTI FACTORY ===");
  try {
    const multiCount = await multiFactory.marketCount();
    console.log(`Market count: ${multiCount}`);

    for (let i = 1; i <= Number(multiCount); i++) {
      try {
        const marketAddress = await multiFactory.marketOf(i);
        console.log(`Market ${i}: ${marketAddress}`);
      } catch (error) {
        console.log(`Market ${i}: ERROR - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`Multi factory error: ${error.message}`);
  }

  console.log("\n=== SCALAR FACTORY ===");
  try {
    const scalarCount = await scalarFactory.marketCount();
    console.log(`Market count: ${scalarCount}`);

    for (let i = 1; i <= Number(scalarCount); i++) {
      try {
        const marketAddress = await scalarFactory.marketOf(i);
        console.log(`Market ${i}: ${marketAddress}`);
      } catch (error) {
        console.log(`Market ${i}: ERROR - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`Scalar factory error: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
