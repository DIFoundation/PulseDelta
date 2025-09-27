import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking Market 10 Data...\n");

  // Contract addresses
  const BINARY_FACTORY_ADDRESS = "0x39344f98714558D710C3422AEe38f108f6bA1CFc";
  const WDAG_ADDRESS = "0xA967CE077dD5beEc5aB4019E3714F4f6af5b5c08";

  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(signer.address)),
    "DAG\n"
  );

  // Binary Market Factory ABI
  const binaryFactoryABI = [
    "function marketOf(uint256) view returns (address)",
    "function allMarkets(uint256) view returns (address)",
    "function marketCount() view returns (uint256)",
    "function getMarketInfo(uint256) view returns (address, string, string, address, address, uint256, uint256, uint256, uint8, uint8, uint8, uint8)",
  ];

  // Market Binary ABI
  const marketBinaryABI = [
    "function question() view returns (string)",
    "function metadataURI() view returns (string)",
    "function creator() view returns (address)",
    "function startTime() view returns (uint256)",
    "function endTime() view returns (uint256)",
    "function resolutionDeadline() view returns (uint256)",
    "function state() view returns (uint8)",
    "function finalOutcome() view returns (uint8)",
    "function yesToken() view returns (address)",
    "function noToken() view returns (address)",
    "function price(bool) view returns (uint256)",
    "function getMarketStats() view returns (uint256, uint256, uint256, uint256)",
    "function getParticipantCount() view returns (uint256)",
    "function getTotalVolume() view returns (uint256)",
    "function getTraderVolume(address) view returns (uint256)",
    "function qYes() view returns (uint256)",
    "function qNo() view returns (uint256)",
    "function hasTraded(address) view returns (bool)",
  ];

  // Outcome Token ABI
  const outcomeTokenABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  // wDAG ABI
  const wDAGABI = [
    "function balanceOf(address) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  try {
    // Connect to contracts
    const binaryFactory = new ethers.Contract(
      BINARY_FACTORY_ADDRESS,
      binaryFactoryABI,
      signer
    );
    const wDAG = new ethers.Contract(WDAG_ADDRESS, wDAGABI, signer);

    // Check if market 10 exists
    const marketCount = await binaryFactory.marketCount();
    console.log("📊 Total markets created:", marketCount.toString());

    if (Number(marketCount) < 10) {
      console.log(
        "❌ Market 10 doesn't exist yet. Only",
        marketCount.toString(),
        "markets created."
      );
      return;
    }

    // Get market 10 address
    const marketAddress = await binaryFactory.marketOf(10);
    console.log("📍 Market 10 address:", marketAddress);

    if (marketAddress === ethers.ZeroAddress) {
      console.log("❌ Market 10 address is zero - market doesn't exist");
      return;
    }

    // Connect to market contract
    const market = new ethers.Contract(marketAddress, marketBinaryABI, signer);

    // Get basic market info
    console.log("\n📋 MARKET INFORMATION");
    console.log("===================");

    const [
      question,
      metadataURI,
      creator,
      startTime,
      endTime,
      resolutionDeadline,
      state,
      finalOutcome,
    ] = await Promise.all([
      market.question(),
      market.metadataURI(),
      market.creator(),
      market.startTime(),
      market.endTime(),
      market.resolutionDeadline(),
      market.state(),
      market.finalOutcome(),
    ]);

    console.log("Question:", question);
    console.log("Metadata URI:", metadataURI);
    console.log("Creator:", creator);
    console.log(
      "Start Time:",
      new Date(Number(startTime) * 1000).toLocaleString()
    );
    console.log("End Time:", new Date(Number(endTime) * 1000).toLocaleString());
    console.log(
      "Resolution Deadline:",
      new Date(Number(resolutionDeadline) * 1000).toLocaleString()
    );
    console.log("State:", ["Open", "Closed", "Resolved"][Number(state)]);
    console.log("Final Outcome:", Number(finalOutcome) === 0 ? "NO" : "YES");

    // Get market stats
    console.log("\n📈 MARKET STATISTICS");
    console.log("===================");

    const [participantCount, totalVolume, yesReserves, noReserves] =
      await market.getMarketStats();
    const [yesPrice, noPrice] = await Promise.all([
      market.price(true),
      market.price(false),
    ]);

    console.log("Participant Count:", participantCount.toString());
    console.log("Total Volume:", ethers.formatEther(totalVolume), "wDAG");
    console.log("YES Reserves:", ethers.formatEther(yesReserves), "wDAG");
    console.log("NO Reserves:", ethers.formatEther(noReserves), "wDAG");
    console.log("YES Price:", ethers.formatEther(yesPrice), "wDAG per share");
    console.log("NO Price:", ethers.formatEther(noPrice), "wDAG per share");

    // Get outcome token info
    console.log("\n🪙 OUTCOME TOKENS");
    console.log("=================");

    const [yesTokenAddress, noTokenAddress] = await Promise.all([
      market.yesToken(),
      market.noToken(),
    ]);

    const yesToken = new ethers.Contract(
      yesTokenAddress,
      outcomeTokenABI,
      signer
    );
    const noToken = new ethers.Contract(
      noTokenAddress,
      outcomeTokenABI,
      signer
    );

    const [yesName, yesSymbol, yesTotalSupply, yesDecimals] = await Promise.all(
      [
        yesToken.name(),
        yesToken.symbol(),
        yesToken.totalSupply(),
        yesToken.decimals(),
      ]
    );

    const [noName, noSymbol, noTotalSupply, noDecimals] = await Promise.all([
      noToken.name(),
      noToken.symbol(),
      noToken.totalSupply(),
      noToken.decimals(),
    ]);

    console.log("YES Token:");
    console.log("  Address:", yesTokenAddress);
    console.log("  Name:", yesName);
    console.log("  Symbol:", yesSymbol);
    console.log(
      "  Total Supply:",
      ethers.formatUnits(yesTotalSupply, yesDecimals)
    );
    console.log("  Decimals:", yesDecimals);

    console.log("\nNO Token:");
    console.log("  Address:", noTokenAddress);
    console.log("  Name:", noName);
    console.log("  Symbol:", noSymbol);
    console.log(
      "  Total Supply:",
      ethers.formatUnits(noTotalSupply, noDecimals)
    );
    console.log("  Decimals:", noDecimals);

    // Check wDAG balances
    console.log("\n💰 wDAG BALANCES");
    console.log("================");

    const [marketBalance, wDAGTotalSupply] = await Promise.all([
      wDAG.balanceOf(marketAddress),
      wDAG.totalSupply(),
    ]);

    console.log(
      "Market wDAG Balance:",
      ethers.formatEther(marketBalance),
      "wDAG"
    );
    console.log(
      "Total wDAG Supply:",
      ethers.formatEther(wDAGTotalSupply),
      "wDAG"
    );

    // Check if current signer has traded
    console.log("\n👤 YOUR TRADING STATUS");
    console.log("======================");

    const [hasTraded, traderVolume, yesBalance, noBalance] = await Promise.all([
      market.hasTraded(signer.address),
      market.getTraderVolume(signer.address),
      yesToken.balanceOf(signer.address),
      noToken.balanceOf(signer.address),
    ]);

    console.log("Has Traded:", hasTraded);
    console.log(
      "Your Trading Volume:",
      ethers.formatEther(traderVolume),
      "wDAG"
    );
    console.log(
      "Your YES Token Balance:",
      ethers.formatUnits(yesBalance, yesDecimals)
    );
    console.log(
      "Your NO Token Balance:",
      ethers.formatUnits(noBalance, noDecimals)
    );

    // Calculate potential payout if resolved
    if (Number(state) === 2) {
      // Resolved
      console.log("\n🏆 POTENTIAL PAYOUT");
      console.log("===================");

      const winningOutcome = Number(finalOutcome);
      if (winningOutcome === 1) {
        // YES won
        console.log(
          "YES won! Your YES tokens are worth:",
          ethers.formatUnits(yesBalance, yesDecimals),
          "wDAG"
        );
        console.log("Your NO tokens are worthless");
      } else {
        // NO won
        console.log(
          "NO won! Your NO tokens are worth:",
          ethers.formatUnits(noBalance, noDecimals),
          "wDAG"
        );
        console.log("Your YES tokens are worthless");
      }
    } else {
      console.log("\n⏳ MARKET NOT RESOLVED YET");
      console.log("==========================");
      console.log("All your tokens have potential value until resolution");
    }

    console.log("\n✅ Market 10 data check completed!");
  } catch (error) {
    console.error("❌ Error checking market 10:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
