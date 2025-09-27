import { ethers } from "hardhat";

async function main() {
  console.log("Checking curation status for specific markets...\n");

  // Contract addresses from frontend lib
  const CURATION_ADDRESS = "0x10A7F89b4372060bca62dd11f406c37E0b4006f2";

  // Get curation contract
  const curation = await ethers.getContractAt("Curation", CURATION_ADDRESS);

  // Check specific market IDs that showed "Approved" in the frontend logs
  const marketIds = [0, 1, 2, 3, 4, 5, 6, 7]; // Binary markets
  const multiIds = [0, 1]; // Multi markets
  const scalarIds = [0, 1]; // Scalar markets

  console.log("=== BINARY MARKETS CURATION STATUS ===");
  for (const marketId of marketIds) {
    try {
      const status = await curation.statusOf(BigInt(marketId));

      let statusText = "Unknown";
      if (status.toString() === "0") statusText = "Pending";
      else if (status.toString() === "1") statusText = "Approved";
      else if (status.toString() === "2") statusText = "Flagged";

      console.log(
        `Binary Market ${marketId}: Status: ${statusText} (${status})`
      );
    } catch (error) {
      console.log(`Binary Market ${marketId}: Error - ${error.message}`);
    }
  }

  console.log("\n=== MULTI MARKETS CURATION STATUS ===");
  for (const marketId of multiIds) {
    try {
      const status = await curation.statusOf(BigInt(marketId));

      let statusText = "Unknown";
      if (status.toString() === "0") statusText = "Pending";
      else if (status.toString() === "1") statusText = "Approved";
      else if (status.toString() === "2") statusText = "Flagged";

      console.log(
        `Multi Market ${marketId}: Status: ${statusText} (${status})`
      );
    } catch (error) {
      console.log(`Multi Market ${marketId}: Error - ${error.message}`);
    }
  }

  console.log("\n=== SCALAR MARKETS CURATION STATUS ===");
  for (const marketId of scalarIds) {
    try {
      const status = await curation.statusOf(BigInt(marketId));

      let statusText = "Unknown";
      if (status.toString() === "0") statusText = "Pending";
      else if (status.toString() === "1") statusText = "Approved";
      else if (status.toString() === "2") statusText = "Flagged";

      console.log(
        `Scalar Market ${marketId}: Status: ${statusText} (${status})`
      );
    } catch (error) {
      console.log(`Scalar Market ${marketId}: Error - ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
