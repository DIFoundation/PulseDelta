import { ethers } from "hardhat";

async function main() {
  console.log("Checking curation status for all markets...\n");

  // Contract addresses from frontend lib
  const CURATION_ADDRESS = "0x10A7F89b4372060bca62dd11f406c37E0b4006f2";
  const BINARY_FACTORY_ADDRESS = "0x39344f98714558D710C3422AEe38f108f6bA1CFc";
  const MULTI_FACTORY_ADDRESS = "0x5e9D6779D1863F9610f1Db68f0e2618A1c348D6F";
  const SCALAR_FACTORY_ADDRESS = "0xC8c64D1005B99357391543b7B464D8E3F059b4f2";

  // Get contracts
  const curation = await ethers.getContractAt("Curation", CURATION_ADDRESS);
  const binaryFactory = await ethers.getContractAt(
    "BinaryMarketFactory",
    BINARY_FACTORY_ADDRESS
  );
  const multiFactory = await ethers.getContractAt(
    "MultiMarketFactory",
    MULTI_FACTORY_ADDRESS
  );
  const scalarFactory = await ethers.getContractAt(
    "ScalarMarketFactory",
    SCALAR_FACTORY_ADDRESS
  );

  // Check binary markets
  console.log("=== BINARY MARKETS CURATION STATUS ===");
  const binaryCount = await binaryFactory.marketCount();
  console.log(`Binary market count: ${binaryCount}`);

  for (let i = 0; i < Number(binaryCount); i++) {
    try {
      const marketAddress = await binaryFactory.marketOf(BigInt(i));
      const status = await curation.statusOf(BigInt(i));

      let statusText = "Unknown";
      if (status.toString() === "0") statusText = "Pending";
      else if (status.toString() === "1") statusText = "Approved";
      else if (status.toString() === "2") statusText = "Flagged";

      console.log(
        `Binary Market ${i}: ${marketAddress} - Status: ${statusText} (${status})`
      );
    } catch (error) {
      console.log(`Binary Market ${i}: Error - ${error.message}`);
    }
  }

  // Check multi markets
  console.log("\n=== MULTI MARKETS CURATION STATUS ===");
  const multiCount = await multiFactory.marketCount();
  console.log(`Multi market count: ${multiCount}`);

  for (let i = 0; i < Number(multiCount); i++) {
    try {
      const marketAddress = await multiFactory.marketOf(BigInt(i));
      const status = await curation.statusOf(BigInt(i));

      let statusText = "Unknown";
      if (status.toString() === "0") statusText = "Pending";
      else if (status.toString() === "1") statusText = "Approved";
      else if (status.toString() === "2") statusText = "Flagged";

      console.log(
        `Multi Market ${i}: ${marketAddress} - Status: ${statusText} (${status})`
      );
    } catch (error) {
      console.log(`Multi Market ${i}: Error - ${error.message}`);
    }
  }

  // Check scalar markets
  console.log("\n=== SCALAR MARKETS CURATION STATUS ===");
  const scalarCount = await scalarFactory.marketCount();
  console.log(`Scalar market count: ${scalarCount}`);

  for (let i = 0; i < Number(scalarCount); i++) {
    try {
      const marketAddress = await scalarFactory.marketOf(BigInt(i));
      const status = await curation.statusOf(BigInt(i));

      let statusText = "Unknown";
      if (status.toString() === "0") statusText = "Pending";
      else if (status.toString() === "1") statusText = "Approved";
      else if (status.toString() === "2") statusText = "Flagged";

      console.log(
        `Scalar Market ${i}: ${marketAddress} - Status: ${statusText} (${status})`
      );
    } catch (error) {
      console.log(`Scalar Market ${i}: Error - ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
