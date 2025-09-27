import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing Buy Transaction...\n");

  // Contract addresses
  const MARKET_ADDRESS = "0x5Fc412724Ffa5838827378AD107b880cE1e71BC5";
  const WDAG_ADDRESS = "0xA967CE077dD5beEc5aB4019E3714F4f6af5b5c08";

  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log("Using wallet:", signer.address);

  // Contract ABIs
  const wDAGABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address, address) view returns (uint256)",
    "function approve(address, uint256) returns (bool)",
    "function transferFrom(address, address, uint256) returns (bool)",
  ];

  const marketABI = [
    "function buy(bool, uint256) external",
    "function price(bool) view returns (uint256)",
    "function state() view returns (uint8)",
    "function startTime() view returns (uint256)",
    "function endTime() view returns (uint256)",
    "function qYes() view returns (uint256)",
    "function qNo() view returns (uint256)",
    "function liquidity() view returns (uint256)",
  ];

  try {
    const wDAG = new ethers.Contract(WDAG_ADDRESS, wDAGABI, signer);
    const market = new ethers.Contract(MARKET_ADDRESS, marketABI, signer);

    // Check current state
    console.log("📊 PRE-TRANSACTION STATE");
    console.log("========================");

    const [wDAGBalance, allowance, state, startTime, endTime] =
      await Promise.all([
        wDAG.balanceOf(signer.address),
        wDAG.allowance(signer.address, MARKET_ADDRESS),
        market.state(),
        market.startTime(),
        market.endTime(),
      ]);

    console.log("wDAG Balance:", ethers.formatEther(wDAGBalance), "wDAG");
    console.log("Allowance:", ethers.formatEther(allowance), "wDAG");
    console.log("Market State:", ["Open", "Closed", "Resolved"][Number(state)]);
    console.log("Current Time:", new Date().toLocaleString());
    console.log(
      "Start Time:",
      new Date(Number(startTime) * 1000).toLocaleString()
    );
    console.log("End Time:", new Date(Number(endTime) * 1000).toLocaleString());

    // Test the exact transaction that failed
    console.log("\n🧪 TESTING EXACT FAILED TRANSACTION");
    console.log("===================================");

    const shares = ethers.parseEther("5"); // 5 shares
    const isYes = true; // YES shares

    console.log("Shares:", ethers.formatEther(shares));
    console.log("Is YES:", isYes);

    // Try to calculate cost manually using the same formula as the contract
    try {
      const [qYes, qNo, liquidity] = await Promise.all([
        market.qYes(),
        market.qNo(),
        market.liquidity(),
      ]);

      console.log("qYes:", ethers.formatEther(qYes));
      console.log("qNo:", ethers.formatEther(qNo));
      console.log("liquidity:", ethers.formatEther(liquidity));

      // Calculate cost using the same formula as _calculateCost
      const currentSupply = isYes ? qYes : qNo;
      const totalLiquidity = liquidity * 2n;
      const cost = (shares * totalLiquidity) / currentSupply;

      console.log("Calculated Cost:", ethers.formatEther(cost), "wDAG");

      const fee = (cost * 100n) / 10000n; // 1% fee
      const totalCost = cost + fee;
      console.log("Fee (1%):", ethers.formatEther(fee), "wDAG");
      console.log("Total Cost:", ethers.formatEther(totalCost), "wDAG");

      // Check if we have enough balance and allowance
      console.log("\n✅ BALANCE CHECKS");
      console.log("=================");
      console.log("Has enough wDAG:", wDAGBalance >= totalCost);
      console.log("Has enough allowance:", allowance >= totalCost);

      if (wDAGBalance < totalCost) {
        console.log("❌ Insufficient wDAG balance");
        return;
      }

      if (allowance < totalCost) {
        console.log("❌ Insufficient allowance");
        console.log("Approving market to spend wDAG...");

        const approveTx = await wDAG.approve(MARKET_ADDRESS, totalCost);
        await approveTx.wait();
        console.log("Approval transaction confirmed");
      }

      // Now try the buy transaction
      console.log("\n🚀 EXECUTING BUY TRANSACTION");
      console.log("============================");

      const buyTx = await market.buy(isYes, shares);
      console.log("Buy transaction submitted:", buyTx.hash);

      const receipt = await buyTx.wait();
      console.log("Buy transaction confirmed!");
      console.log("Gas used:", receipt.gasUsed.toString());

      // Check final state
      console.log("\n📊 POST-TRANSACTION STATE");
      console.log("=========================");

      const [finalBalance, finalAllowance] = await Promise.all([
        wDAG.balanceOf(signer.address),
        wDAG.allowance(signer.address, MARKET_ADDRESS),
      ]);

      console.log(
        "Final wDAG Balance:",
        ethers.formatEther(finalBalance),
        "wDAG"
      );
      console.log(
        "Final Allowance:",
        ethers.formatEther(finalAllowance),
        "wDAG"
      );
      console.log(
        "wDAG Spent:",
        ethers.formatEther(wDAGBalance - finalBalance),
        "wDAG"
      );
    } catch (error) {
      console.error("❌ Error during transaction:", error);

      // Try to get more specific error information
      if (error instanceof Error) {
        console.log("Error message:", error.message);

        // Check if it's a revert with reason
        if (error.message.includes("execution reverted")) {
          console.log("Transaction reverted - checking possible causes:");
          console.log("1. Market not open");
          console.log("2. Trading period ended");
          console.log("3. Insufficient balance");
          console.log("4. Insufficient allowance");
          console.log("5. Invalid parameters");
        }
      }
    }
  } catch (error) {
    console.error("❌ Script error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
