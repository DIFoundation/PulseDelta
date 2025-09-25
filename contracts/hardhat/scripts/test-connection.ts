import { createPublicClient, http, defineChain } from "viem";

// Define the Primordial chain
const primordial = defineChain({
  id: 0x1a1a1a1a,
  name: "Primordial",
  network: "primordial",
  nativeCurrency: {
    decimals: 18,
    name: "DAG",
    symbol: "DAG",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-quicknode-holesky.morphl2.io"],
    },
    public: {
      http: ["https://rpc-quicknode-holesky.morphl2.io"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.morphl2.io" },
  },
});

async function main() {
  console.log("🔍 Testing network connection...\n");

  // Create public client
  const publicClient = createPublicClient({
    chain: primordial,
    transport: http(),
  });

  try {
    // Test basic network connection
    console.log("📡 Testing network connection...");
    const blockNumber = await publicClient.getBlockNumber();
    console.log(`✅ Current block number: ${blockNumber}`);

    // Test getting a block
    console.log("📦 Getting latest block...");
    const block = await publicClient.getBlock({ blockNumber });
    console.log(`✅ Block hash: ${block.hash}`);

    // Test contract existence
    console.log("🏭 Testing contract existence...");
    const binaryFactoryAddress = "0x39344f98714558D710C3422AEe38f108f6bA1CFc";

    const code = await publicClient.getCode({
      address: binaryFactoryAddress as `0x${string}`,
    });

    if (code && code !== "0x") {
      console.log(`✅ Contract exists at ${binaryFactoryAddress}`);
      console.log(`📄 Contract code length: ${code.length} characters`);
    } else {
      console.log(`❌ No contract found at ${binaryFactoryAddress}`);
    }

    // Test a simple contract call
    console.log("📞 Testing simple contract call...");
    try {
      const result = await publicClient.readContract({
        address: binaryFactoryAddress as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: "marketCount",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "marketCount",
      });
      console.log(`✅ marketCount result: ${result}`);
    } catch (error) {
      console.log(`❌ marketCount call failed: ${error.message}`);
    }
  } catch (error) {
    console.error("❌ Connection test failed:", error);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
