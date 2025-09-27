import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking Wallet Status for Trading...\n");

  // Contract addresses
  const MARKET_ADDRESS = "0x5Fc412724Ffa5838827378AD107b880cE1e71BC5";
  const WDAG_ADDRESS = "0xA967CE077dD5beEc5aB4019E3714F4f6af5b5c08";

  // Get the signer (this will be the currently connected wallet)
  const [signer] = await ethers.getSigners();
  console.log("Checking wallet:", signer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "DAG\n");

  // wDAG ABI
  const wDAGABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address, address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)"
  ];

  // Market Binary ABI
  const marketABI = [
    "function price(bool) view returns (uint256)",
    "function state() view returns (uint8)",
    "function startTime() view returns (uint256)",
    "function endTime() view returns (uint256)",
    "function hasTraded(address) view returns (bool)",
    "function getTraderVolume(address) view returns (uint256)"
  ];

  try {
    // Connect to contracts
    const wDAG = new ethers.Contract(WDAG_ADDRESS, wDAGABI, signer);
    const market = new ethers.Contract(MARKET_ADDRESS, marketABI, signer);

    // Check wallet's wDAG balance
    console.log("💰 WALLET wDAG STATUS");
    console.log("====================");
    
    const [wDAGBalance, wDAGDecimals] = await Promise.all([
      wDAG.balanceOf(signer.address),
      wDAG.decimals()
    ]);

    console.log("wDAG Balance:", ethers.formatUnits(wDAGBalance, wDAGDecimals), "wDAG");
    console.log("wDAG Balance (wei):", wDAGBalance.toString());

    // Check allowance for market contract
    console.log("\n🔐 APPROVAL STATUS");
    console.log("==================");
    
    const allowance = await wDAG.allowance(signer.address, MARKET_ADDRESS);
    console.log("Market Allowance:", ethers.formatUnits(allowance, wDAGDecimals), "wDAG");
    console.log("Market Allowance (wei):", allowance.toString());

    // Check market status
    console.log("\n📊 MARKET STATUS");
    console.log("================");
    
    const [state, startTime, endTime, hasTraded, traderVolume] = await Promise.all([
      market.state(),
      market.startTime(),
      market.endTime(),
      market.hasTraded(signer.address),
      market.getTraderVolume(signer.address)
    ]);

    console.log("Market State:", ["Open", "Closed", "Resolved"][Number(state)]);
    console.log("Start Time:", new Date(Number(startTime) * 1000).toLocaleString());
    console.log("End Time:", new Date(Number(endTime) * 1000).toLocaleString());
    console.log("Current Time:", new Date().toLocaleString());
    console.log("Has Traded:", hasTraded);
    console.log("Trader Volume:", ethers.formatEther(traderVolume), "wDAG");

    // Check if market is currently tradeable
    const now = Math.floor(Date.now() / 1000);
    const isTradeable = Number(state) === 0 && now >= Number(startTime) && now < Number(endTime);
    console.log("Is Tradeable:", isTradeable);

    // Check current prices
    console.log("\n💲 CURRENT PRICES");
    console.log("=================");
    
    const [yesPrice, noPrice] = await Promise.all([
      market.price(true),
      market.price(false)
    ]);

    console.log("YES Price:", ethers.formatEther(yesPrice), "wDAG per share");
    console.log("NO Price:", ethers.formatEther(noPrice), "wDAG per share");

    // Calculate cost for 1 share
    const oneShare = ethers.parseEther("1");
    const yesCost = ethers.formatEther(yesPrice);
    const noCost = ethers.formatEther(noPrice);

    console.log("\n💡 TRADING REQUIREMENTS");
    console.log("=======================");
    console.log("To buy 1 YES share, you need:", yesCost, "wDAG");
    console.log("To buy 1 NO share, you need:", noCost, "wDAG");
    console.log("Plus 1% fee on top of the cost");

    // Check if wallet has enough wDAG
    const requiredForYes = BigInt(Math.ceil(parseFloat(yesCost) * 1.01 * 1e18));
    const requiredForNo = BigInt(Math.ceil(parseFloat(noCost) * 1.01 * 1e18));

    console.log("\n✅ WALLET READINESS");
    console.log("===================");
    console.log("Has enough wDAG for 1 YES share:", wDAGBalance >= requiredForYes);
    console.log("Has enough wDAG for 1 NO share:", wDAGBalance >= requiredForNo);
    console.log("Has market approval:", allowance >= requiredForYes || allowance >= requiredForNo);

    if (wDAGBalance === 0n) {
      console.log("\n❌ ISSUE: Wallet has 0 wDAG tokens");
      console.log("Solution: Convert BDAG to wDAG by calling wDAG.deposit()");
    }

    if (allowance === 0n) {
      console.log("\n❌ ISSUE: No approval for market to spend wDAG");
      console.log("Solution: Call wDAG.approve(marketAddress, amount)");
    }

    if (!isTradeable) {
      console.log("\n❌ ISSUE: Market is not currently tradeable");
      if (Number(state) !== 0) {
        console.log("Market state is not Open");
      }
      if (now < Number(startTime)) {
        console.log("Market hasn't started yet");
      }
      if (now >= Number(endTime)) {
        console.log("Market has ended");
      }
    }

    console.log("\n✅ Wallet status check completed!");

  } catch (error) {
    console.error("❌ Error checking wallet status:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
