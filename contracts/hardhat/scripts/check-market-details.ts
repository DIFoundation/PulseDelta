import { ethers } from "hardhat";

async function main() {
  console.log("Checking market details...\n");

  const binaryFactoryAddress = "0x39344f98714558D710C3422AEe38f108f6bA1CFc";
  const multiFactoryAddress = "0x5e9D6779D1863F9610f1Db68f0e2618A1c348D6F";
  const scalarFactoryAddress = "0xC8c64D1005B99357391543b7B464D8E3F059b4f2";

  const binaryFactory = await ethers.getContractAt("BinaryMarketFactory", binaryFactoryAddress);
  const multiFactory = await ethers.getContractAt("MultiMarketFactory", multiFactoryAddress);
  const scalarFactory = await ethers.getContractAt("ScalarMarketFactory", scalarFactoryAddress);

  // Test getAllMarkets() first
  console.log("=== TESTING getAllMarkets() ===");
  try {
    const binaryAllMarkets = await binaryFactory.getAllMarkets();
    console.log(`Binary getAllMarkets(): ${binaryAllMarkets.length} markets`);
    console.log(`Markets: ${binaryAllMarkets}`);
  } catch (error) {
    console.log(`Binary getAllMarkets() error: ${error.message}`);
  }

  try {
    const multiAllMarkets = await multiFactory.getAllMarkets();
    console.log(`Multi getAllMarkets(): ${multiAllMarkets.length} markets`);
    console.log(`Markets: ${multiAllMarkets}`);
  } catch (error) {
    console.log(`Multi getAllMarkets() error: ${error.message}`);
  }

  try {
    const scalarAllMarkets = await scalarFactory.getAllMarkets();
    console.log(`Scalar getAllMarkets(): ${scalarAllMarkets.length} markets`);
    console.log(`Markets: ${scalarAllMarkets}`);
  } catch (error) {
    console.log(`Scalar getAllMarkets() error: ${error.message}`);
  }

  // Binary factory markets
  console.log("\n=== BINARY FACTORY MARKETS ===");
  try {
    const binaryCount = await binaryFactory.marketCount();
    console.log(`Market count: ${binaryCount}`);
    
    // Since market IDs start from 0, iterate from 0 to count-1
    for (let i = 0; i < Number(binaryCount); i++) {
      try {
        // Try both marketOf(i+1) and marketOf(i) to find the correct mapping
        let marketAddress;
        try {
          marketAddress = await binaryFactory.marketOf(i + 1);
        } catch {
          marketAddress = await binaryFactory.marketOf(i);
        }
        
        console.log(`\n--- Binary Market ${i} ---`);
        console.log(`Address: ${marketAddress}`);
        
        const market = await ethers.getContractAt("MarketBinary", marketAddress);
        
        const question = await market.question();
        const description = await market.metadataURI();
        const creator = await market.creator();
        const marketId = await market.marketId();
        const startTime = await market.startTime();
        const endTime = await market.endTime();
        const liquidity = await market.liquidity();
        const state = await market.state();
        
        console.log(`Question: ${question}`);
        console.log(`Description: ${description}`);
        console.log(`Creator: ${creator}`);
        console.log(`Market ID: ${marketId}`);
        console.log(`Start Time: ${new Date(Number(startTime) * 1000).toISOString()}`);
        console.log(`End Time: ${new Date(Number(endTime) * 1000).toISOString()}`);
        console.log(`Liquidity: ${ethers.formatEther(liquidity)} DAG`);
        console.log(`State: ${state} (0=Open, 1=Closed, 2=Resolved)`);
        console.log(`Outcomes: Yes, No`); // Binary markets always have Yes/No
        
      } catch (error) {
        console.log(`Market ${i}: ERROR - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`Binary factory error: ${error.message}`);
  }

  // Multi factory markets
  console.log("\n=== MULTI FACTORY MARKETS ===");
  try {
    const multiCount = await multiFactory.marketCount();
    console.log(`Market count: ${multiCount}`);
    
    for (let i = 0; i < Number(multiCount); i++) {
      try {
        let marketAddress;
        try {
          marketAddress = await multiFactory.marketOf(i + 1);
        } catch {
          marketAddress = await multiFactory.marketOf(i);
        }
        
        console.log(`\n--- Multi Market ${i} ---`);
        console.log(`Address: ${marketAddress}`);
        
        const market = await ethers.getContractAt("MarketMulti", marketAddress);
        
        const question = await market.question();
        const creator = await market.creator();
        const marketId = await market.marketId();
        const startTime = await market.startTime();
        const endTime = await market.endTime();
        const liquidity = await market.liquidity();
        const state = await market.state();
        
        // Try different ways to get outcomes
        let outcomes = "Unable to fetch";
        try {
          outcomes = (await market.outcomes()).join(", ");
        } catch {
          try {
            const outcomeCount = await market.outcomeCount();
            outcomes = `${outcomeCount} outcomes`;
          } catch {
            outcomes = "Unknown outcomes";
          }
        }
        
        console.log(`Question: ${question}`);
        console.log(`Creator: ${creator}`);
        console.log(`Market ID: ${marketId}`);
        console.log(`Start Time: ${new Date(Number(startTime) * 1000).toISOString()}`);
        console.log(`End Time: ${new Date(Number(endTime) * 1000).toISOString()}`);
        console.log(`Liquidity: ${ethers.formatEther(liquidity)} DAG`);
        console.log(`State: ${state} (0=Open, 1=Closed, 2=Resolved)`);
        console.log(`Outcomes: ${outcomes}`);
        
      } catch (error) {
        console.log(`Market ${i}: ERROR - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`Multi factory error: ${error.message}`);
  }

  // Scalar factory markets
  console.log("\n=== SCALAR FACTORY MARKETS ===");
  try {
    const scalarCount = await scalarFactory.marketCount();
    console.log(`Market count: ${scalarCount}`);
    
    for (let i = 0; i < Number(scalarCount); i++) {
      try {
        let marketAddress;
        try {
          marketAddress = await scalarFactory.marketOf(i + 1);
        } catch {
          marketAddress = await scalarFactory.marketOf(i);
        }
        
        console.log(`\n--- Scalar Market ${i} ---`);
        console.log(`Address: ${marketAddress}`);
        
        const market = await ethers.getContractAt("MarketScalar", marketAddress);
        
        const question = await market.question();
        const creator = await market.creator();
        const marketId = await market.marketId();
        const startTime = await market.startTime();
        const endTime = await market.endTime();
        const liquidity = await market.liquidity();
        const state = await market.state();
        const lowerBound = await market.lowerBound();
        const upperBound = await market.upperBound();
        
        console.log(`Question: ${question}`);
        console.log(`Creator: ${creator}`);
        console.log(`Market ID: ${marketId}`);
        console.log(`Start Time: ${new Date(Number(startTime) * 1000).toISOString()}`);
        console.log(`End Time: ${new Date(Number(endTime) * 1000).toISOString()}`);
        console.log(`Liquidity: ${ethers.formatEther(liquidity)} DAG`);
        console.log(`State: ${state} (0=Open, 1=Closed, 2=Resolved)`);
        console.log(`Lower Bound: ${ethers.formatEther(lowerBound)}`);
        console.log(`Upper Bound: ${ethers.formatEther(upperBound)}`);
        console.log(`Outcomes: Long, Short`); // Scalar markets have Long/Short
        
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