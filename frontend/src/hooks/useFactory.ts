import React from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useReadContracts,
  useAccount,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useCallback } from "react";
import { readContract } from "@wagmi/core";
import { config } from "@/configs";
import { parseEther, keccak256, stringToBytes, decodeEventLog } from "viem";
import { toast } from "react-toastify";
import { CONTRACT_ADDRESSES, ABI } from "@/lib/abiAndAddress";
import { MARKET_ABIS } from "@/lib/marketABIs";
import type {
  CreateMarketParams,
  MarketCategory,
  Market,
} from "@/types/market";

/**
 * Get the appropriate oracle address based on market category
 */
const getOracleAddress = (category: MarketCategory): `0x${string}` => {
  switch (category) {
    case "sports":
      return CONTRACT_ADDRESSES.sportsOracle as `0x${string}`;
    case "crypto":
      return CONTRACT_ADDRESSES.cryptoOracle as `0x${string}`;
    case "trends":
      return CONTRACT_ADDRESSES.trendsOracle as `0x${string}`;
    case "other":
    default:
      return CONTRACT_ADDRESSES.cryptoOracle as `0x${string}`;
  }
};

/**
 * Hook for factory contract interactions
 */
export function useFactory() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Show success toast when transaction is confirmed
  React.useEffect(() => {
    if (isSuccess && hash) {
      // Dismiss loading toast
      toast.dismiss("creating-market");

      toast.success("Transaction confirmed! Market created successfully.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [isSuccess, hash]);

  // Show error toast when transaction fails
  React.useEffect(() => {
    if (error) {
      // Dismiss loading toast
      toast.dismiss("creating-market");

      toast.error(`Transaction failed: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  /**
   * Create a binary market
   */
  const createBinaryMarket = async (
    params: CreateMarketParams & { initialLiquidity: string }
  ) => {
    try {
      const oracleAddress = getOracleAddress(params.category);

      // Generate market key from title
      const marketKey = keccak256(stringToBytes(params.title + Date.now()));

      // Show loading toast
      toast.info("Creating binary market...", {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        toastId: "creating-market",
      });

      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.binaryFactory as `0x${string}`,
        abi: ABI.binaryFactory,
        functionName: "createBinary",
        args: [
          CONTRACT_ADDRESSES.wDAG, // collateral
          params.title, // question
          params.description, // metadataURI
          address || "0x0000000000000000000000000000000000000000", // creator
          oracleAddress, // oracleAdapter
          CONTRACT_ADDRESSES.feeRouter, // feeRouter
          CONTRACT_ADDRESSES.tokenFactory, // tokenFactory
          marketKey, // marketKey
          100, // feeBps (1%)
          Math.floor(Date.now() / 1000) + 3600, // startTime (1 hour from now)
          params.endTime, // endTime
          params.endTime + 7 * 24 * 3600, // resolutionDeadline (7 days after end)
        ],
        value: parseEther(params.initialLiquidity),
      });

      // Wait for transaction to be mined and get the market address
      const receipt = await waitForTransactionReceipt(config, { hash });

      // Get the market address from the event logs
      const marketCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const decoded = decodeEventLog({
            abi: ABI.binaryFactory,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "MarketCreated";
        } catch {
          return false;
        }
      });

      if (marketCreatedEvent) {
        const decoded = decodeEventLog({
          abi: ABI.binaryFactory,
          data: marketCreatedEvent.data,
          topics: marketCreatedEvent.topics,
        });

        const marketAddress = (decoded.args as any).market;
        const marketId = (decoded.args as any).marketId;

        return {
          hash,
          marketAddress,
          marketId: Number(marketId),
        };
      }

      throw new Error("Failed to get market address from transaction");
    } catch (err) {
      console.error("Failed to create binary market:", err);
      toast.dismiss("creating-market");
      throw err;
    }
  };

  /**
   * Create a multi-outcome market
   */
  const createMultiMarket = async (
    params: CreateMarketParams & { initialLiquidity: string }
  ) => {
    try {
      const oracleAddress = getOracleAddress(params.category);

      // Show loading toast
      toast.info("Creating multi-outcome market...", {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        toastId: "creating-market",
      });

      // Generate market key from title
      const marketKey = keccak256(stringToBytes(params.title + Date.now()));

      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.multiFactory as `0x${string}`,
        abi: ABI.multiFactory,
        functionName: "createMulti",
        args: [
          CONTRACT_ADDRESSES.wDAG, // collateral
          params.title, // question
          params.description, // metadataURI
          address || "0x0000000000000000000000000000000000000000", // creator
          oracleAddress, // oracleAdapter
          CONTRACT_ADDRESSES.feeRouter, // feeRouter
          CONTRACT_ADDRESSES.tokenFactory, // tokenFactory
          marketKey, // marketKey
          params.outcomes, // outcomes array
          100, // feeBps (1%)
          Math.floor(Date.now() / 1000) + 3600, // startTime (1 hour from now)
          params.endTime, // endTime
          params.endTime + 7 * 24 * 3600, // resolutionDeadline (7 days after end)
        ],
        value: parseEther(params.initialLiquidity),
      });

      // Wait for transaction to be mined and get the market address
      const receipt = await waitForTransactionReceipt(config, { hash });

      // Get the market address from the event logs
      const marketCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const decoded = decodeEventLog({
            abi: ABI.multiFactory,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "MarketCreated";
        } catch {
          return false;
        }
      });

      if (marketCreatedEvent) {
        const decoded = decodeEventLog({
          abi: ABI.multiFactory,
          data: marketCreatedEvent.data,
          topics: marketCreatedEvent.topics,
        });

        const marketAddress = (decoded.args as any).market;
        const marketId = (decoded.args as any).marketId;

        return {
          hash,
          marketAddress,
          marketId: Number(marketId),
        };
      }

      throw new Error("Failed to get market address from transaction");
    } catch (err) {
      console.error("Failed to create multi market:", err);
      toast.dismiss("creating-market");
      throw err;
    }
  };

  /**
   * Create a scalar market
   */
  const createScalarMarket = async (
    params: CreateMarketParams & {
      initialLiquidity: string;
      minValue: string;
      maxValue: string;
    }
  ) => {
    try {
      const oracleAddress = getOracleAddress(params.category);

      // Show loading toast
      toast.info("Creating scalar market...", {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        toastId: "creating-market",
      });

      // Generate market key from title
      const marketKey = keccak256(stringToBytes(params.title + Date.now()));

      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.scalarFactory as `0x${string}`,
        abi: ABI.scalarFactory,
        functionName: "createScalar",
        args: [
          CONTRACT_ADDRESSES.wDAG, // collateral
          params.title, // question
          params.description, // metadataURI
          address || "0x0000000000000000000000000000000000000000", // creator
          oracleAddress, // oracleAdapter
          CONTRACT_ADDRESSES.feeRouter, // feeRouter
          CONTRACT_ADDRESSES.tokenFactory, // tokenFactory
          marketKey, // marketKey
          100, // feeBps (1%)
          Math.floor(Date.now() / 1000) + 3600, // startTime (1 hour from now)
          params.endTime, // endTime
          params.endTime + 7 * 24 * 3600, // resolutionDeadline (7 days after end)
          parseEther(params.minValue), // lowerBound
          parseEther(params.maxValue), // upperBound
        ],
        value: parseEther(params.initialLiquidity),
      });

      // Wait for transaction to be mined and get the market address
      const receipt = await waitForTransactionReceipt(config, { hash });

      // Get the market address from the event logs
      const marketCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const decoded = decodeEventLog({
            abi: ABI.scalarFactory,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "MarketCreated";
        } catch {
          return false;
        }
      });

      if (marketCreatedEvent) {
        const decoded = decodeEventLog({
          abi: ABI.scalarFactory,
          data: marketCreatedEvent.data,
          topics: marketCreatedEvent.topics,
        });

        const marketAddress = (decoded.args as any).market;
        const marketId = (decoded.args as any).marketId;

        return {
          hash,
          marketAddress,
          marketId: Number(marketId),
        };
      }

      throw new Error("Failed to get market address from transaction");
    } catch (err) {
      console.error("Failed to create scalar market:", err);
      toast.dismiss("creating-market");
      throw err;
    }
  };

  /**
   * Get market count from factory
   */
  const getMarketCount = (factoryType: "binary" | "multi" | "scalar") => {
    const factoryAddress =
      factoryType === "binary"
        ? CONTRACT_ADDRESSES.binaryFactory
        : factoryType === "multi"
        ? CONTRACT_ADDRESSES.multiFactory
        : CONTRACT_ADDRESSES.scalarFactory;

    const factoryAbi =
      factoryType === "binary"
        ? ABI.binaryFactory
        : factoryType === "multi"
        ? ABI.multiFactory
        : ABI.scalarFactory;

    return useReadContract({
      address: factoryAddress as `0x${string}`,
      abi: factoryAbi,
      functionName: "marketCount",
    });
  };

  /**
   * Get markets by status
   */
  const getMarketsByStatus = (
    factoryType: "binary" | "multi" | "scalar",
    status: number
  ) => {
    const factoryAddress =
      factoryType === "binary"
        ? CONTRACT_ADDRESSES.binaryFactory
        : factoryType === "multi"
        ? CONTRACT_ADDRESSES.multiFactory
        : CONTRACT_ADDRESSES.scalarFactory;

    const factoryAbi =
      factoryType === "binary"
        ? ABI.binaryFactory
        : factoryType === "multi"
        ? ABI.multiFactory
        : ABI.scalarFactory;

    return useReadContract({
      address: factoryAddress as `0x${string}`,
      abi: factoryAbi,
      functionName: "getMarketsByStatus",
      args: [BigInt(status)],
    });
  };

  // Get market address by ID
  const getMarketAddress = useCallback(
    async (type: "binary" | "multi" | "scalar", marketId: number) => {
      const factoryAddress = getFactoryAddress(type);
      if (!factoryAddress) return null;

      try {
        const result = await readContract(config, {
          address: factoryAddress as `0x${string}`,
          abi: getFactoryABI(type),
          functionName: "marketOf",
          args: [BigInt(marketId)],
        });
        return result as string;
      } catch (error) {
        console.error(
          `Failed to get market address for ${type} market ${marketId}:`,
          error
        );
        return null;
      }
    },
    [readContract]
  );

  // Get market data by address
  const getMarketData = useCallback(
    async (marketAddress: string, type: "binary" | "multi" | "scalar") => {
      try {
        // Get the appropriate market ABI
        const marketABI = getMarketABI(type);

        // Read basic market data
        const [
          question,
          creator,
          marketId,
          startTime,
          endTime,
          liquidity,
          state,
          outcomes,
        ] = await Promise.all([
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "question",
          }).catch(() => "Unknown Question"),
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "creator",
          }).catch(() => "0x0000000000000000000000000000000000000000"),
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "marketId",
          }).catch(() => BigInt(0)),
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "startTime",
          }).catch(() => BigInt(0)),
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "endTime",
          }).catch(() => BigInt(0)),
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "liquidity",
          }).catch(() => BigInt(0)),
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "state",
          }).catch(() => 0),
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "outcomes",
          }).catch(() => []),
        ]);

        // Determine outcomes based on market type
        let marketOutcomes: string[] = [];
        if (type === "binary") {
          marketOutcomes = ["Yes", "No"];
        } else if (type === "multi") {
          marketOutcomes = Array.isArray(outcomes)
            ? (outcomes as string[])
            : [];
        } else if (type === "scalar") {
          marketOutcomes = ["Long", "Short"];
        }

        // Create mock outcome shares for now
        const outcomeShares = marketOutcomes.map((_, index) => ({
          outcomeIndex: index,
          price: (1 / marketOutcomes.length).toFixed(3),
          totalShares: "0",
          holders: 0,
          priceChange24h: 0,
        }));

        // Get curation status (default to Pending for new markets)
        const curationStatus = "Pending" as const; // Would need to read from Curation contract

        // Convert state number to string
        const stateMap = ["Open", "Closed", "Resolved"] as const;
        const marketState = stateMap[Number(state)] || "Open";

        // Convert to Market type
        const market: Market = {
          id: (marketId as bigint).toString(),
          title: question as string,
          description: "", // Would need to read from metadataURI
          category: "crypto", // Default category - would need to determine from oracle
          outcomes: marketOutcomes,
          outcomeShares,
          creator: creator as string,
          createdAt: Number(startTime) * 1000,
          endTime: Number(endTime),
          resolved: Number(state) === 2, // State 2 = Resolved
          totalLiquidity: (Number(liquidity) / 1e18).toString(), // Convert from wei
          volume24h: "0", // Would need to track volume
          volumeTotal: "0",
          volume7d: "0", // Would need to track volume
          updatedAt: Number(startTime) * 1000, // Use start time as updated time
          priceHistory: [], // Would need to track price history
          metadata: {
            tags: [],
            verificationLevel: "unverified",
            resolutionSource: "",
          },
          // Market states
          state: marketState,
          curationStatus: curationStatus,
        };

        return market;
      } catch (error) {
        console.error(`Failed to get market data for ${marketAddress}:`, error);
        return null;
      }
    },
    [readContract]
  );

  // Helper functions
  const getFactoryAddress = (type: "binary" | "multi" | "scalar") => {
    switch (type) {
      case "binary":
        return CONTRACT_ADDRESSES.binaryFactory;
      case "multi":
        return CONTRACT_ADDRESSES.multiFactory;
      case "scalar":
        return CONTRACT_ADDRESSES.scalarFactory;
      default:
        return null;
    }
  };

  const getFactoryABI = (type: "binary" | "multi" | "scalar") => {
    switch (type) {
      case "binary":
        return ABI.binaryFactory;
      case "multi":
        return ABI.multiFactory;
      case "scalar":
        return ABI.scalarFactory;
      default:
        return [];
    }
  };

  const getMarketABI = (type: "binary" | "multi" | "scalar") => {
    switch (type) {
      case "binary":
        return MARKET_ABIS.binaryMarket;
      case "multi":
        return MARKET_ABIS.multiMarket;
      case "scalar":
        return MARKET_ABIS.scalarMarket;
      default:
        return [];
    }
  };

  return {
    // Market creation functions
    createBinaryMarket,
    createMultiMarket,
    createScalarMarket,

    // Read functions
    getMarketCount,
    getMarketsByStatus,
    getMarketAddress,
    getMarketData,

    // Transaction state
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
