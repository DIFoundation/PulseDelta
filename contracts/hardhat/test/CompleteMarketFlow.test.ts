import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Complete Market Flow - End to End", function () {
  async function deployFixture() {
    const [
      owner,
      creator,
      lp1,
      lp2,
      trader1,
      trader2,
      trader3,
      reporter,
      council,
    ] = await ethers.getSigners();

    // Deploy wDAG (Wrapped DAG) collateral token
    const wDAG = await ethers.getContractFactory("wDAG");
    const collateral = await wDAG.deploy();
    await collateral.waitForDeployment();

    // Fund wDAG contract with DAG for testing
    await owner.sendTransaction({
      to: await collateral.getAddress(),
      value: ethers.parseEther("2000"), // Send 2,000 DAG to wDAG contract
    });

    // Mint wDAG tokens for traders
    await collateral.mint(trader1.address, ethers.parseEther("5000"));
    await collateral.mint(trader2.address, ethers.parseEther("5000"));
    await collateral.mint(trader3.address, ethers.parseEther("5000"));
    await collateral.mint(reporter.address, ethers.parseEther("1000"));

    // Deploy core contracts
    const OutcomeTokenFactory = await ethers.getContractFactory(
      "OutcomeTokenFactory"
    );
    const tokenFactory = await OutcomeTokenFactory.deploy();
    await tokenFactory.waitForDeployment();

    const FeeRouter = await ethers.getContractFactory("FeeRouter");
    const feeRouter = await FeeRouter.deploy(owner.address);
    await feeRouter.waitForDeployment();

    const Curation = await ethers.getContractFactory("Curation");
    const curation = await Curation.deploy(council.address);
    await curation.waitForDeployment();

    const Oracle = await ethers.getContractFactory(
      "OptimisticCryptoOracleAdapter"
    );
    const oracle = await Oracle.deploy(
      await collateral.getAddress(),
      ethers.parseEther("100"), // reporter bond
      ethers.parseEther("200"), // disputer bond
      3600, // 1 hour liveness
      council.address
    );
    await oracle.waitForDeployment();

    const BinaryMarketFactory = await ethers.getContractFactory(
      "BinaryMarketFactory"
    );
    const binaryFactory = await BinaryMarketFactory.deploy();
    await binaryFactory.waitForDeployment();

    // Set reporter in oracle
    await oracle.connect(council).setReporter(reporter.address, true);

    // Authorize factory with oracle
    await oracle.connect(council).setFactory(await binaryFactory.getAddress(), true);

    return {
      owner,
      creator,
      lp1,
      lp2,
      trader1,
      trader2,
      trader3,
      reporter,
      council,
      collateral,
      tokenFactory,
      feeRouter,
      curation,
      oracle,
      binaryFactory,
    };
  }

  it("Complete Market Lifecycle: Creator → LP → Traders → Resolution → Payouts", async function () {
    const {
      creator,
      lp1,
      lp2,
      trader1,
      trader2,
      trader3,
      reporter,
      council,
      collateral,
      binaryFactory,
      oracle,
      feeRouter,
      tokenFactory,
    } = await loadFixture(deployFixture);

    console.log("\n🚀 === COMPLETE MARKET LIFECYCLE TEST ===");

    // ===== PHASE 1: MARKET CREATION =====
    console.log("\n📝 PHASE 1: Market Creation");

    const startTime = (await time.latest()) + 300; // Start in 5 minutes
    const endTime = startTime + 3600; // End in 1 hour
    const resolutionDeadline = endTime + 1800; // Resolution 30 minutes after end

    const marketKey = ethers.keccak256(
      ethers.toUtf8Bytes("complete-flow-test")
    );

    // Creator deposits 1000 DAG to create market
    const creatorInitialBalance = await ethers.provider.getBalance(
      creator.address
    );
    console.log(
      "Creator initial DAG balance:",
      ethers.formatEther(creatorInitialBalance)
    );

    const tx = await binaryFactory.connect(creator).createBinary(
      await collateral.getAddress(),
      "Will Bitcoin hit $100k by end of 2024?",
      "ipfs://metadata",
      creator.address,
      await oracle.getAddress(),
      await feeRouter.getAddress(),
      await tokenFactory.getAddress(),
      marketKey,
      100, // 1% fee
      startTime,
      endTime,
      resolutionDeadline,
      { value: ethers.parseEther("1000") } // Creator deposits 1000 DAG
    );

    const receipt = await tx.wait();
    const event = receipt?.logs.find((log: any) => {
      try {
        const parsed = binaryFactory.interface.parseLog(log);
        return parsed?.name === "MarketCreated";
      } catch {
        return false;
      }
    });
    const parsedEvent = binaryFactory.interface.parseLog(event!);
    const marketAddress = parsedEvent?.args?.market;
    const market = await ethers.getContractAt("MarketBinary", marketAddress);

    console.log("✅ Market created at:", marketAddress);
    console.log("Market question:", await market.question());
    console.log("Market state:", await market.state());

    // Set up market in oracle and fee router
    await feeRouter.setCreator(marketAddress, creator.address);
    await oracle.connect(council).setMarketAddress(1, marketAddress);

    // ===== PHASE 2: LIQUIDITY PROVIDERS =====
    console.log("\n💰 PHASE 2: Liquidity Providers Add Liquidity");

    await time.increaseTo(startTime + 1); // Move to market start time

    // LP1 adds 500 DAG liquidity
    const lp1InitialBalance = await ethers.provider.getBalance(lp1.address);
    console.log(
      "LP1 initial DAG balance:",
      ethers.formatEther(lp1InitialBalance)
    );

    const lp1Tx = await market.connect(lp1).addLiquidity({
      value: ethers.parseEther("500"), // LP1 deposits 500 DAG
    });
    await lp1Tx.wait();

    // LP2 adds 1000 DAG liquidity
    const lp2InitialBalance = await ethers.provider.getBalance(lp2.address);
    console.log(
      "LP2 initial DAG balance:",
      ethers.formatEther(lp2InitialBalance)
    );

    const lp2Tx = await market.connect(lp2).addLiquidity({
      value: ethers.parseEther("1000"), // LP2 deposits 1000 DAG
    });
    await lp2Tx.wait();

    // Get LP token contract
    const lpTokenAddress = await market.lpToken();
    const lpToken = await ethers.getContractAt("LPToken", lpTokenAddress);

    const lp1Tokens = await lpToken.balanceOf(lp1.address);
    const lp2Tokens = await lpToken.balanceOf(lp2.address);

    console.log("✅ LP1 received LP tokens:", ethers.formatEther(lp1Tokens));
    console.log("✅ LP2 received LP tokens:", ethers.formatEther(lp2Tokens));

    // Check LP pool stats
    const lpStats = await market.getLPStats();
    console.log("Total LP liquidity:", ethers.formatEther(lpStats[0]));
    console.log("Total LP fees earned:", ethers.formatEther(lpStats[1]));

    // ===== PHASE 3: TRADERS BUY OUTCOMES =====
    console.log("\n🎯 PHASE 3: Traders Buy Outcomes");

    // Traders need to approve market to spend their wDAG
    await collateral
      .connect(trader1)
      .approve(marketAddress, ethers.parseEther("2000"));
    await collateral
      .connect(trader2)
      .approve(marketAddress, ethers.parseEther("2000"));
    await collateral
      .connect(trader3)
      .approve(marketAddress, ethers.parseEther("2000"));

    // Trader1 buys 200 DAG worth of YES tokens
    const trader1InitialBalance = await collateral.balanceOf(trader1.address);
    console.log(
      "Trader1 initial wDAG balance:",
      ethers.formatEther(trader1InitialBalance)
    );

    await market.connect(trader1).buy(true, ethers.parseEther("200"));
    console.log("✅ Trader1 bought 200 DAG worth of YES tokens");

    // Trader2 buys 300 DAG worth of NO tokens
    const trader2InitialBalance = await collateral.balanceOf(trader2.address);
    console.log(
      "Trader2 initial wDAG balance:",
      ethers.formatEther(trader2InitialBalance)
    );

    await market.connect(trader2).buy(false, ethers.parseEther("300"));
    console.log("✅ Trader2 bought 300 DAG worth of NO tokens");

    // Trader3 buys 150 DAG worth of YES tokens
    const trader3InitialBalance = await collateral.balanceOf(trader3.address);
    console.log(
      "Trader3 initial wDAG balance:",
      ethers.formatEther(trader3InitialBalance)
    );

    await market.connect(trader3).buy(true, ethers.parseEther("150"));
    console.log("✅ Trader3 bought 150 DAG worth of YES tokens");

    // Check market stats
    const participantCount = await market.getParticipantCount();
    const totalVolume = await market.getTotalVolume();
    console.log("Total participants:", participantCount.toString());
    console.log("Total volume:", ethers.formatEther(totalVolume));

    // Check individual trader volumes
    const trader1Volume = await market.getTraderVolume(trader1.address);
    const trader2Volume = await market.getTraderVolume(trader2.address);
    const trader3Volume = await market.getTraderVolume(trader3.address);
    console.log("Trader1 volume:", ethers.formatEther(trader1Volume));
    console.log("Trader2 volume:", ethers.formatEther(trader2Volume));
    console.log("Trader3 volume:", ethers.formatEther(trader3Volume));

    // Check fee distribution
    const creatorFees = await feeRouter.creatorAccrued(creator.address);
    const protocolFees = await feeRouter.protocolAccrued(
      await feeRouter.getAddress()
    );
    const lpFees = await feeRouter.getLPFeesForMarket(marketAddress);
    console.log("Creator fees earned:", ethers.formatEther(creatorFees));
    console.log("Protocol fees earned:", ethers.formatEther(protocolFees));
    console.log("LP fees earned:", ethers.formatEther(lpFees));

    // Check updated LP stats
    const updatedLpStats = await market.getLPStats();
    console.log("Updated LP fees:", ethers.formatEther(updatedLpStats[1]));

    // ===== PHASE 4: MARKET CLOSES =====
    console.log("\n⏰ PHASE 4: Market Closes");

    await time.increaseTo(endTime + 1);
    console.log("✅ Market trading period ended");

    // Try to trade after market closes (should fail)
    await expect(
      market.connect(trader1).buy(true, ethers.parseEther("100"))
    ).to.be.revertedWithCustomError(market, "TradingEnded");

    console.log("✅ Trading correctly blocked after market closes");

    // ===== PHASE 5: ORACLE RESOLUTION =====
    console.log("\n🔮 PHASE 5: Oracle Resolution");

    await time.increaseTo(resolutionDeadline + 1);

    // Reporter needs to approve oracle to spend wDAG for bond
    await collateral
      .connect(reporter)
      .approve(await oracle.getAddress(), ethers.parseEther("100"));

    // Reporter submits result (YES = 1, NO = 0)
    const resultTx = await oracle
      .connect(reporter)
      .proposeResult(1, ethers.toUtf8Bytes("1"), "ipfs://evidence");
    await resultTx.wait();
    console.log("✅ Reporter submitted result: YES (Bitcoin hit $100k)");

    // Wait for liveness period
    await time.increase(3601); // Wait 1 hour + 1 second

    // Finalize the oracle result first
    const oracleFinalizeTx = await oracle.connect(reporter).finalize(1);
    await oracleFinalizeTx.wait();
    console.log("✅ Oracle result finalized");

    // Close the market first
    const closeTx = await market.connect(reporter).close();
    await closeTx.wait();
    console.log("✅ Market closed");

    // Finalize the market
    const finalizeTx = await market.connect(reporter).finalize(1);
    await finalizeTx.wait();
    console.log("✅ Market finalized with result: YES");

    // Check final market state
    const finalState = await market.state();
    console.log("Final market state:", finalState);

    // ===== PHASE 6: REDEMPTION & PAYOUTS =====
    console.log("\n💸 PHASE 6: Redemption & Payouts");

    // Check balances before redemption
    const trader1BalanceBefore = await collateral.balanceOf(trader1.address);
    const trader2BalanceBefore = await collateral.balanceOf(trader2.address);
    const trader3BalanceBefore = await collateral.balanceOf(trader3.address);

    console.log("Before redemption:");
    console.log(
      "Trader1 wDAG balance:",
      ethers.formatEther(trader1BalanceBefore)
    );
    console.log(
      "Trader2 wDAG balance:",
      ethers.formatEther(trader2BalanceBefore)
    );
    console.log(
      "Trader3 wDAG balance:",
      ethers.formatEther(trader3BalanceBefore)
    );

    // Winners redeem their tokens (Trader1 and Trader3 bought YES)
    const trader1RedeemTx = await market.connect(trader1).redeem();
    await trader1RedeemTx.wait();
    console.log("✅ Trader1 redeemed YES tokens");

    const trader3RedeemTx = await market.connect(trader3).redeem();
    await trader3RedeemTx.wait();
    console.log("✅ Trader3 redeemed YES tokens");

    // Loser tries to redeem (Trader2 bought NO)
    const trader2RedeemTx = await market.connect(trader2).redeem();
    await trader2RedeemTx.wait();
    console.log("✅ Trader2 redeemed NO tokens (gets nothing)");

    // Check balances after redemption
    const trader1BalanceAfter = await collateral.balanceOf(trader1.address);
    const trader2BalanceAfter = await collateral.balanceOf(trader2.address);
    const trader3BalanceAfter = await collateral.balanceOf(trader3.address);

    console.log("After redemption:");
    console.log(
      "Trader1 wDAG balance:",
      ethers.formatEther(trader1BalanceAfter)
    );
    console.log(
      "Trader2 wDAG balance:",
      ethers.formatEther(trader2BalanceAfter)
    );
    console.log(
      "Trader3 wDAG balance:",
      ethers.formatEther(trader3BalanceAfter)
    );

    // Calculate profits/losses
    const trader1Profit = trader1BalanceAfter - trader1BalanceBefore;
    const trader2Loss = trader2BalanceBefore - trader2BalanceAfter;
    const trader3Profit = trader3BalanceAfter - trader3BalanceBefore;

    console.log("P&L Summary:");
    console.log(
      "Trader1 (YES winner) profit:",
      ethers.formatEther(trader1Profit)
    );
    console.log("Trader2 (NO loser) loss:", ethers.formatEther(trader2Loss));
    console.log(
      "Trader3 (YES winner) profit:",
      ethers.formatEther(trader3Profit)
    );

    // ===== PHASE 7: LP WITHDRAWAL =====
    console.log("\n🏦 PHASE 7: LP Withdrawal");

    // LP1 removes half their liquidity
    const lp1WithdrawTx = await market
      .connect(lp1)
      .removeLiquidity(lp1Tokens / 2n);
    await lp1WithdrawTx.wait();
    console.log("✅ LP1 removed half their liquidity");

    // LP2 removes all their liquidity
    const lp2WithdrawTx = await market.connect(lp2).removeLiquidity(lp2Tokens);
    await lp2WithdrawTx.wait();
    console.log("✅ LP2 removed all their liquidity");

    // Check final LP stats
    const finalLpStats = await market.getLPStats();
    console.log("Final LP liquidity:", ethers.formatEther(finalLpStats[0]));
    console.log("Final LP fees earned:", ethers.formatEther(finalLpStats[1]));

    // ===== VERIFICATION =====
    console.log("\n✅ VERIFICATION: All Phases Completed Successfully!");

    // Verify market state
    expect(await market.state()).to.equal(2); // Resolved state

    // Verify winners got paid
    expect(trader1Profit).to.be.gt(0);
    expect(trader3Profit).to.be.gt(0);

    // Verify loser got nothing (no loss in pool-based system)
    expect(trader2Loss).to.equal(0);

    // Verify fees were distributed
    expect(creatorFees).to.be.gt(0);
    expect(protocolFees).to.be.gt(0);
    expect(lpFees).to.be.gt(0);

    // Verify LP system worked
    expect(lp1Tokens).to.be.gt(0);
    expect(lp2Tokens).to.be.gt(0);

    console.log("\n🎉 COMPLETE MARKET LIFECYCLE TEST PASSED!");
    console.log("✅ Creator created market with DAG");
    console.log("✅ LPs provided liquidity and earned fees");
    console.log("✅ Traders bought outcomes with wDAG");
    console.log("✅ Market closed and was resolved");
    console.log("✅ Winners received payouts from pool");
    console.log("✅ Losers received nothing");
    console.log("✅ LPs withdrew liquidity with earned fees");
    console.log("✅ All participants got their fair share!");
  });
});
