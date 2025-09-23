import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("DAG to wDAG Conversion", function () {
  async function deployFixture() {
    const [owner, creator] = await ethers.getSigners();

    // Deploy wDAG contract
    const wDAG = await ethers.getContractFactory("wDAG");
    const collateral = await wDAG.deploy();
    await collateral.waitForDeployment();

    // Deploy required contracts
    const OutcomeTokenFactory = await ethers.getContractFactory(
      "OutcomeTokenFactory"
    );
    const tokenFactory = await OutcomeTokenFactory.deploy();
    await tokenFactory.waitForDeployment();

    const FeeRouter = await ethers.getContractFactory("FeeRouter");
    const feeRouter = await FeeRouter.deploy(owner.address);
    await feeRouter.waitForDeployment();

    const Oracle = await ethers.getContractFactory(
      "OptimisticCryptoOracleAdapter"
    );
    const oracle = await Oracle.deploy(
      await collateral.getAddress(),
      ethers.parseEther("100"), // reporter bond
      ethers.parseEther("200"), // disputer bond
      3600, // 1 hour liveness
      owner.address
    );
    await oracle.waitForDeployment();

    // Deploy BinaryMarketFactory
    const BinaryMarketFactory = await ethers.getContractFactory(
      "BinaryMarketFactory"
    );
    const binaryFactory = await BinaryMarketFactory.deploy();
    await binaryFactory.waitForDeployment();

    // Authorize factory with oracle
    await oracle
      .connect(owner)
      .setFactory(await binaryFactory.getAddress(), true);

    return {
      owner,
      creator,
      collateral,
      binaryFactory,
      tokenFactory,
      feeRouter,
      oracle,
    };
  }

  it("Should convert DAG to wDAG when creating market", async function () {
    const {
      creator,
      collateral,
      binaryFactory,
      tokenFactory,
      feeRouter,
      oracle,
    } = await loadFixture(deployFixture);

    // First, fund the wDAG contract by sending DAG to it
    await creator.sendTransaction({
      to: await collateral.getAddress(),
      value: ethers.parseEther("10"), // Send 10 DAG to wDAG contract
    });

    const startTime = (await time.latest()) + 60;
    const endTime = startTime + 3600;
    const resolutionDeadline = endTime + 1800;
    const marketKey = ethers.keccak256(
      ethers.toUtf8Bytes("dag-conversion-test")
    );

    // Check creator's initial wDAG balance
    const initialBalance = await collateral.balanceOf(creator.address);
    console.log(
      "Creator initial wDAG balance:",
      ethers.formatEther(initialBalance)
    );

    // Create market with 1 DAG (converted to wDAG)
    const tx = await binaryFactory.createBinary(
      await collateral.getAddress(),
      "Test DAG conversion market",
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
      { value: ethers.parseEther("1") } // Send 1 DAG
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

    // Check that market was created
    expect(marketAddress).to.not.be.undefined;

    // Check that factory has wDAG (from the conversion)
    const factoryBalance = await collateral.balanceOf(
      await binaryFactory.getAddress()
    );
    console.log("Factory wDAG balance:", ethers.formatEther(factoryBalance));

    // Check that market has wDAG (transferred from factory)
    const marketBalance = await collateral.balanceOf(marketAddress);
    console.log("Market wDAG balance:", ethers.formatEther(marketBalance));

    // Market should have the 1 wDAG that was sent as DAG
    expect(marketBalance).to.equal(ethers.parseEther("1"));
  });
});
