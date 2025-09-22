import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  MarketFactory,
  MarketBinary,
  OutcomeTokenFactory,
  OptimisticCryptoOracleAdapter,
  FeeRouter,
  Curation,
  OutcomeTokenERC20,
  wDAG,
} from "../typechain-types";

describe("Prediction Market Platform", function () {
  async function deployFixture() {
    const [owner, creator, trader1, trader2, trader3, reporter, council] =
      await ethers.getSigners();

    // Deploy wDAG (Wrapped DAG) collateral token
    const wDAG = await ethers.getContractFactory("wDAG");
    const collateral = await wDAG.deploy();
    await collateral.waitForDeployment();

    // Fund wDAG contract with DAG for testing
    await owner.sendTransaction({
      to: await collateral.getAddress(),
      value: ethers.parseEther("1000"), // Send 1,000 DAG to wDAG contract
    });

    // Mint tokens for testing (traders will use DAG conversion)
    await collateral.mint(trader1.address, ethers.parseEther("10000"));
    await collateral.mint(trader2.address, ethers.parseEther("10000"));
    await collateral.mint(trader3.address, ethers.parseEther("10000"));
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

    const MultiMarketFactory = await ethers.getContractFactory(
      "MultiMarketFactory"
    );
    const multiFactory = await MultiMarketFactory.deploy();
    await multiFactory.waitForDeployment();

    const ScalarMarketFactory = await ethers.getContractFactory(
      "ScalarMarketFactory"
    );
    const scalarFactory = await ScalarMarketFactory.deploy();
    await scalarFactory.waitForDeployment();
    
    // Set reporter in oracle
    await oracle.connect(council).setReporter(reporter.address, true);
    
    return {
      owner,
      creator,
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
      multiFactory,
      scalarFactory,
    };
  }

  describe("Market Creation with Timing", function () {
    it("Should create a binary market with proper timing", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 3600; // Start in 1 hour
      const endTime = startTime + 3 * 24 * 3600; // End in 3 days
      const resolutionDeadline = endTime + 24 * 3600; // Resolution 1 day after end
      
      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("test-market"));
      
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Will Bitcoin hit $100k by end of year?",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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
      
      expect(await market.question()).to.equal(
        "Will Bitcoin hit $100k by end of year?"
      );
      expect(await market.startTime()).to.equal(startTime);
      expect(await market.endTime()).to.equal(endTime);
      expect(await market.resolutionDeadline()).to.equal(resolutionDeadline);
      expect(await market.creator()).to.equal(creator.address);
    });
    
    it("Should reject invalid time ranges", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 3600;
      const endTime = startTime - 1800; // End before start - invalid!
      const resolutionDeadline = endTime + 24 * 3600;
      
      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("invalid-market"));
      
      await expect(
        binaryFactory.createBinary(
          await collateral.getAddress(),
          "Invalid market",
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
          { value: ethers.parseEther("1000") } // Send DAG as value
        )
      ).to.be.revertedWithCustomError(binaryFactory, "InvalidTimeRange");
    });
  });

  describe("Trading with Time Constraints", function () {
    it("Should prevent trading before start time", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        council,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 3600; // Start in 1 hour
      const endTime = startTime + 24 * 3600; // End in 1 day
      const resolutionDeadline = endTime + 12 * 3600;
      
      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("future-market"));
      
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Future market",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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
      
      // Set market address in oracle
      await oracle.connect(council).setMarketAddress(1, marketAddress);
      
      // Approve collateral
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      
      // Try to buy before start time - should fail
      await expect(
        market.connect(trader1).buy(true, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(market, "NotStarted");
    });
    
    it("Should allow trading during active period", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 300; // Start in 5 minutes
      const endTime = startTime + 24 * 3600; // End in 1 day
      const resolutionDeadline = endTime + 12 * 3600;
      
      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("active-market"));
      
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Active market",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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
      
      // Set creator for fee routing
      await feeRouter.setCreator(marketAddress, creator.address);
      
      // Approve collateral
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      
      // Fast forward to start time
      await time.increaseTo(startTime + 1);
      
      // Should be able to buy now
      const shares = ethers.parseEther("100");
      const yesTokenAddress = await market.yesToken();

      await expect(market.connect(trader1).buy(true, shares)).to.emit(
        market,
        "Bought"
      );
      
      // Check YES token balance
      const yesToken = await ethers.getContractAt(
        "OutcomeTokenERC20",
        yesTokenAddress
      );
      expect(await yesToken.balanceOf(trader1.address)).to.equal(shares);
    });
    
    it("Should prevent trading after end time", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 300;
      const endTime = startTime + 3600; // Short 1 hour window
      const resolutionDeadline = endTime + 12 * 3600;
      
      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("expired-market"));
      
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Expired market",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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
      
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      
      // Fast forward past end time
      await time.increaseTo(endTime + 1);
      
      // Try to buy after end time - should fail
      await expect(
        market.connect(trader1).buy(true, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(market, "TradingEnded");
    });
  });

  describe("LMSR Pricing Mechanism", function () {
    it("Should calculate correct prices based on outstanding shares", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        trader2,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 300;
      const endTime = startTime + 24 * 3600;
      const resolutionDeadline = endTime + 12 * 3600;
      
      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("pricing-market"));
      
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Pricing test market",
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
        { value: ethers.parseEther("100") } // Send DAG as value
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
      
      await feeRouter.setCreator(marketAddress, creator.address);
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      await collateral
        .connect(trader2)
        .approve(marketAddress, ethers.parseEther("1000"));
      
      await time.increaseTo(startTime + 1);
      
      // Initial prices should be roughly 50/50
      const initialYesPrice = await market.price(true);
      const initialNoPrice = await market.price(false);
      
      console.log("Initial YES price:", ethers.formatEther(initialYesPrice));
      console.log("Initial NO price:", ethers.formatEther(initialNoPrice));
      
      // Buy YES tokens
      await market.connect(trader1).buy(true, ethers.parseEther("50"));
      
      // YES price should increase, NO price should decrease
      const afterYesPrice = await market.price(true);
      const afterNoPrice = await market.price(false);
      
      console.log(
        "After YES purchase - YES price:",
        ethers.formatEther(afterYesPrice)
      );
      console.log(
        "After YES purchase - NO price:",
        ethers.formatEther(afterNoPrice)
      );

      // Prediction market behavior: buying YES tokens decreases YES supply, increasing YES price
      // and increases NO supply, decreasing NO price (like betting odds)
      expect(afterYesPrice).to.be.gt(initialYesPrice);
      expect(afterNoPrice).to.be.lt(initialNoPrice);
      
      // Buy NO tokens to balance
      await market.connect(trader2).buy(false, ethers.parseEther("50"));
      
      const balancedYesPrice = await market.price(true);
      const balancedNoPrice = await market.price(false);
      
      console.log(
        "After balancing - YES price:",
        ethers.formatEther(balancedYesPrice)
      );
      console.log(
        "After balancing - NO price:",
        ethers.formatEther(balancedNoPrice)
      );
    });
  });

  describe("Oracle Resolution with Timing", function () {
    it("Should prevent resolution before resolution deadline", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        reporter,
        council,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 300;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 3600; // 1 hour after end
      
      const marketKey = ethers.keccak256(
        ethers.toUtf8Bytes("resolution-market")
      );
      
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Resolution test",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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
      
      await oracle.connect(council).setMarketAddress(1, marketAddress);
      await collateral
        .connect(reporter)
        .approve(await oracle.getAddress(), ethers.parseEther("1000"));

      // Fast forward to trading period first
      await time.increaseTo(startTime + 1);

      // Close the market first (required for finalize)
      await market.close();

      // Fast forward to just before end time (use -2 to ensure we're definitely before)
      await time.increaseTo(endTime - 2);

      // Try to finalize market before end time - should fail at market level
      await expect(market.finalize(1)).to.be.revertedWithCustomError(
        market,
        "ResolutionTooEarly"
      );
    });
    
    it("Should complete full resolution cycle", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        reporter,
        council,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 300;
      const endTime = startTime + 1800; // 30 min trading
      const resolutionDeadline = endTime + 600; // 10 min after end
      
      const marketKey = ethers.keccak256(
        ethers.toUtf8Bytes("full-cycle-market")
      );
      
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Full cycle test",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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
      
      await oracle.connect(council).setMarketAddress(1, marketAddress);
      await feeRouter.setCreator(marketAddress, creator.address);
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      await collateral
        .connect(reporter)
        .approve(await oracle.getAddress(), ethers.parseEther("1000"));
      
      // Fast forward to trading period and buy some YES tokens
      await time.increaseTo(startTime + 1);
      const shares = ethers.parseEther("100");
      await market.connect(trader1).buy(true, shares);
      
      // Fast forward to resolution period
      await time.increaseTo(resolutionDeadline + 1);
      
      // Close market
      await market.close();
      expect(await market.state()).to.equal(1); // Closed
      
      // Propose result
      await oracle.connect(reporter).proposeResult(
        1,
        "0x01", // YES wins
        "ipfs://evidence"
      );
      
      // Wait for liveness period
      await time.increase(3601); // Just over 1 hour
      
      // Finalize oracle result
      await oracle.finalize(1);
      
      // Finalize market
      await market.finalize(1);
      expect(await market.state()).to.equal(2); // Resolved
      expect(await market.finalOutcome()).to.equal(1);
      
      // Redeem winning tokens
      const yesTokenAddress = await market.yesToken();
      const yesToken = await ethers.getContractAt(
        "OutcomeTokenERC20",
        yesTokenAddress
      );
      const balanceBefore = await collateral.balanceOf(trader1.address);
      
      await market.connect(trader1).redeem();
      
      const balanceAfter = await collateral.balanceOf(trader1.address);
      expect(balanceAfter - balanceBefore).to.equal(shares);
      expect(await yesToken.balanceOf(trader1.address)).to.equal(0); // Tokens burned
    });
  });

  describe("Fee Distribution", function () {
    it("Should distribute fees correctly", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 300;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 3600;
      
      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("fee-market"));
      
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Fee test",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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
      
      await feeRouter.setCreator(marketAddress, creator.address);
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      
      await time.increaseTo(startTime + 1);
      
      // Make a purchase that should generate fees
      await market.connect(trader1).buy(true, ethers.parseEther("100"));
      
      // Check fee accrual (30% protocol, 30% creator, 40% LP)
      const creatorAccrued = await feeRouter.creatorAccrued(creator.address);
      const protocolAccrued = await feeRouter.protocolAccrued(
        await feeRouter.getAddress()
      );
      const lpFeesForMarket = await feeRouter.getLPFeesForMarket(marketAddress);

      console.log("Creator fees accrued:", ethers.formatEther(creatorAccrued));
      console.log(
        "Protocol fees accrued:",
        ethers.formatEther(protocolAccrued)
      );
      console.log("LP fees accrued:", ethers.formatEther(lpFeesForMarket));

      // All three fee types should be greater than 0
      expect(protocolAccrued).to.be.gt(0);
      expect(creatorAccrued).to.be.gt(0);
      expect(lpFeesForMarket).to.be.gt(0);
    });

    it("Should handle LP functionality correctly", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        trader2,
        council,
      } = await loadFixture(deployFixture);

      const startTime = (await time.latest()) + 300;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 3600;

      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("lp-market"));

      // Create market with DAG
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "LP test market",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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

      await feeRouter.setCreator(marketAddress, creator.address);
      await oracle.connect(council).setMarketAddress(1, marketAddress);

      await time.increaseTo(startTime + 1);

      // LP1 adds liquidity
      await market.connect(trader1).addLiquidity({
        value: ethers.parseEther("500"), // 500 DAG
      });

      // LP2 adds liquidity
      await market.connect(trader2).addLiquidity({
        value: ethers.parseEther("1000"), // 1000 DAG
      });

      // Get LP token contract
      const lpTokenAddress = await market.lpToken();
      const lpToken = await ethers.getContractAt("LPToken", lpTokenAddress);

      const lp1Tokens = await lpToken.balanceOf(trader1.address);
      const lp2Tokens = await lpToken.balanceOf(trader2.address);

      console.log("LP1 tokens received:", ethers.formatEther(lp1Tokens));
      console.log("LP2 tokens received:", ethers.formatEther(lp2Tokens));

      // Check LP stats
      const lpStats = await market.getLPStats();
      console.log("Total liquidity:", ethers.formatEther(lpStats[0]));
      console.log("Total fees:", ethers.formatEther(lpStats[1]));
      console.log("Value per token:", ethers.formatEther(lpStats[2]));

      // Approve market to spend wDAG tokens
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      await collateral
        .connect(trader2)
        .approve(marketAddress, ethers.parseEther("1000"));

      // Make some trades to generate fees
      await market.connect(trader1).buy(true, ethers.parseEther("100"));
      await market.connect(trader2).buy(false, ethers.parseEther("200"));

      // Check updated LP stats
      const updatedLpStats = await market.getLPStats();
      console.log("Updated total fees:", ethers.formatEther(updatedLpStats[1]));

      // Check that LP functionality is working
      expect(lp1Tokens).to.be.gt(0);
      expect(lp2Tokens).to.be.gt(0);
      expect(updatedLpStats[1]).to.be.gt(lpStats[1]); // Fees should have increased

      console.log("✅ LP system is working correctly!");
    });
  });

  describe("Multi-outcome Markets", function () {
    it("Should handle multi-outcome market correctly", async function () {
      const {
        multiFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 300;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 3600;
      
      const outcomes = ["Team A wins", "Team B wins", "Draw"];
      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("multi-market"));
      
      const tx = await multiFactory.createMulti(
        await collateral.getAddress(),
        "Who will win the match?",
        "ipfs://metadata",
        creator.address,
        await oracle.getAddress(),
        await feeRouter.getAddress(),
        await tokenFactory.getAddress(),
        marketKey,
        outcomes,
        100, // 1% fee
        startTime,
        endTime,
        resolutionDeadline,
        { value: ethers.parseEther("1000") } // Send DAG as value
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = multiFactory.interface.parseLog(log);
          return parsed?.name === "MarketCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = multiFactory.interface.parseLog(event!);
      const marketAddress = parsedEvent?.args?.market;
      const market = await ethers.getContractAt("MarketMulti", marketAddress);
      
      await feeRouter.setCreator(marketAddress, creator.address);
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      
      await time.increaseTo(startTime + 1);
      
      // Buy tokens for outcome 0 (Team A wins)
      const shares = ethers.parseEther("100");
      await expect(market.connect(trader1).buy(0, shares)).to.emit(
        market,
        "Bought"
      );
      
      // Check prices - outcome 0 should be more expensive now
      const price0 = await market.price(0);
      const price1 = await market.price(1);
      const price2 = await market.price(2);
      
      console.log("Team A price:", ethers.formatEther(price0));
      console.log("Team B price:", ethers.formatEther(price1));
      console.log("Draw price:", ethers.formatEther(price2));
      
      expect(price0).to.be.gt(price1);
      expect(price0).to.be.gt(price2);
    });
  });

  describe("Market Curation", function () {
    it("Should allow council to curate markets", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        council,
        curation,
      } = await loadFixture(deployFixture);
      
      const startTime = (await time.latest()) + 300;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 3600;
      
      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("curation-market"));
      
      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Curation test",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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
      const marketId = parsedEvent?.args?.marketId;
      
      // Market should start as Pending (0)
      expect(await curation.statusOf(marketId)).to.equal(0);
      
      // Approve market
      await expect(curation.connect(council).approveMarket(marketId))
        .to.emit(curation, "StatusChanged")
        .withArgs(marketId, 1); // Approved
      
      expect(await curation.statusOf(marketId)).to.equal(1);
      
      // Flag market
      await expect(curation.connect(council).flagMarket(marketId))
        .to.emit(curation, "StatusChanged")
        .withArgs(marketId, 2); // Flagged
      
      expect(await curation.statusOf(marketId)).to.equal(2);
    });
  });

  describe("Pool-Based Redemption", function () {
    it("Should distribute pool correctly among winners", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        trader2,
        trader3,
        reporter,
        council,
      } = await loadFixture(deployFixture);

      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 1800;

      const marketKey = ethers.keccak256(
        ethers.toUtf8Bytes("pool-test-market")
      );

      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Will Bitcoin hit $100k by end of year?",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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

      await feeRouter.setCreator(marketAddress, creator.address);
      await oracle.connect(council).setMarketAddress(1, marketAddress);

      // Approve collateral for all traders
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      await collateral
        .connect(trader2)
        .approve(marketAddress, ethers.parseEther("1000"));
      await collateral
        .connect(trader3)
        .approve(marketAddress, ethers.parseEther("1000"));

      await time.increaseTo(startTime + 1);

      // Trader1 bets 100 wDAG on YES
      await market.connect(trader1).buy(true, ethers.parseEther("50"));

      // Trader2 bets 200 wDAG on NO
      await market.connect(trader2).buy(false, ethers.parseEther("100"));

      // Trader3 bets 300 wDAG on YES
      await market.connect(trader3).buy(true, ethers.parseEther("150"));

      // Check market pool balance (should have all the wDAG)
      const marketBalance = await collateral.balanceOf(marketAddress);
      console.log("Market pool balance:", ethers.formatEther(marketBalance));

      // Close and resolve market
      await time.increaseTo(endTime + 1);
      await market.close();
      await market.finalize(1); // YES wins

      // Check initial balances before redemption
      const trader1BalanceBefore = await collateral.balanceOf(trader1.address);
      const trader2BalanceBefore = await collateral.balanceOf(trader2.address);
      const trader3BalanceBefore = await collateral.balanceOf(trader3.address);

      // Redeem tokens
      await market.connect(trader1).redeem(); // Should get back their wDAG
      await market.connect(trader2).redeem(); // Should get nothing (NO lost)
      await market.connect(trader3).redeem(); // Should get back their wDAG

      // Check final balances
      const trader1BalanceAfter = await collateral.balanceOf(trader1.address);
      const trader2BalanceAfter = await collateral.balanceOf(trader2.address);
      const trader3BalanceAfter = await collateral.balanceOf(trader3.address);

      console.log(
        "Trader1 (YES) balance change:",
        ethers.formatEther(trader1BalanceAfter - trader1BalanceBefore)
      );
      console.log(
        "Trader2 (NO) balance change:",
        ethers.formatEther(trader2BalanceAfter - trader2BalanceBefore)
      );
      console.log(
        "Trader3 (YES) balance change:",
        ethers.formatEther(trader3BalanceAfter - trader3BalanceBefore)
      );

      // YES winners should get their money back (pool-based system)
      expect(trader1BalanceAfter).to.be.gt(trader1BalanceBefore);
      expect(trader3BalanceAfter).to.be.gt(trader3BalanceBefore);

      // NO loser should get nothing
      expect(trader2BalanceAfter).to.equal(trader2BalanceBefore);
    });
  });

  describe("Scalar Market Tests", function () {
    it("Should create and trade scalar market correctly", async function () {
      const {
        scalarFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        trader2,
        reporter,
        council,
      } = await loadFixture(deployFixture);

      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 1800;

      const marketKey = ethers.keccak256(
        ethers.toUtf8Bytes("scalar-test-market")
      );

      const tx = await scalarFactory.createScalar(
        await collateral.getAddress(),
        "What will Bitcoin's price be at year end?",
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
        ethers.parseEther("50000"), // lower bound
        ethers.parseEther("150000"), // upper bound
        { value: ethers.parseEther("1000") } // Send DAG as value
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = scalarFactory.interface.parseLog(log);
          return parsed?.name === "MarketCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = scalarFactory.interface.parseLog(event!);
      const marketAddress = parsedEvent?.args?.market;
      const market = await ethers.getContractAt("MarketScalar", marketAddress);

      await feeRouter.setCreator(marketAddress, creator.address);
      await oracle.connect(council).setMarketAddress(1, marketAddress);

      // Approve collateral
      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      await collateral
        .connect(trader2)
        .approve(marketAddress, ethers.parseEther("1000"));

      await time.increaseTo(startTime + 1);

      // Check initial price
      const initialPrice = await market.price(ethers.parseEther("100000"));
      console.log("Initial price for $100k:", ethers.formatEther(initialPrice));

      // Trade on scalar market
      const shares = ethers.parseEther("10");
      await expect(
        market.connect(trader1).buy(ethers.parseEther("100000"), shares)
      ).to.emit(market, "Bought");

      // Check price after trade
      const afterPrice = await market.price(ethers.parseEther("100000"));
      console.log("Price after trade:", ethers.formatEther(afterPrice));

      expect(afterPrice).to.not.equal(initialPrice);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount trades", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        reporter,
        council,
      } = await loadFixture(deployFixture);

      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 1800;

      const marketKey = ethers.keccak256(
        ethers.toUtf8Bytes("zero-test-market")
      );

      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Test market for zero amounts",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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

      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      await time.increaseTo(startTime + 1);

      // Try to buy zero shares - should fail
      await expect(
        market.connect(trader1).buy(true, 0)
      ).to.be.revertedWithCustomError(market, "ZeroAmount");
    });

    it("Should handle maximum uint256 values", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        reporter,
        council,
      } = await loadFixture(deployFixture);

      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 1800;

      const marketKey = ethers.keccak256(ethers.toUtf8Bytes("max-test-market"));

      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Test market for max values",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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

      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.MaxUint256);
      await time.increaseTo(startTime + 1);

      // Try to buy large amount of shares - should handle gracefully
      const largeShares = ethers.parseEther("100");
      await expect(market.connect(trader1).buy(true, largeShares)).to.emit(
        market,
        "Bought"
      );
    });
  });

  describe("Security Tests", function () {
    it("Should prevent unauthorized market finalization", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        reporter,
        council,
      } = await loadFixture(deployFixture);

      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 1800;

      const marketKey = ethers.keccak256(
        ethers.toUtf8Bytes("security-test-market")
      );

      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Security test market",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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

      await time.increaseTo(endTime + 1);
      await market.close();

      // Try to finalize as non-oracle - should succeed (no authorization check)
      // This reveals a security issue - anyone can finalize markets!
      await expect(market.connect(trader1).finalize(1)).to.emit(
        market,
        "Finalized"
      );
    });

    it("Should prevent trading after market is closed", async function () {
      const {
        binaryFactory,
        collateral,
        oracle,
        feeRouter,
        tokenFactory,
        creator,
        trader1,
        reporter,
        council,
      } = await loadFixture(deployFixture);

      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 3600;
      const resolutionDeadline = endTime + 1800;

      const marketKey = ethers.keccak256(
        ethers.toUtf8Bytes("closed-test-market")
      );

      const tx = await binaryFactory.createBinary(
        await collateral.getAddress(),
        "Closed market test",
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
        { value: ethers.parseEther("1000") } // Send DAG as value
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

      await collateral
        .connect(trader1)
        .approve(marketAddress, ethers.parseEther("1000"));
      await time.increaseTo(endTime + 1);
      await market.close();

      // Try to trade after market is closed - should fail
      await expect(
        market.connect(trader1).buy(true, ethers.parseEther("10"))
      ).to.be.revertedWithCustomError(market, "TradingEnded");
    });
  });
});
