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
import { log } from "console";

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

      writeContract({
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

      if (!hash) {
        throw new Error("Transaction failed to initiate");
      }

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

      writeContract({
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

      if (!hash) {
        throw new Error("Transaction failed to initiate");
      }

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

      writeContract({
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

      if (!hash) {
        throw new Error("Transaction failed to initiate");
      }

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
   * Get market count from factory - returns a function that can be called to get count
   */
  const getMarketCount = useCallback(
    async (factoryType: "binary" | "multi" | "scalar") => {
      const factoryAddress = getFactoryAddress(factoryType);
      if (!factoryAddress) return 0;

      try {
        const result = await readContract(config, {
          address: factoryAddress as `0x${string}`,
          abi: getFactoryABI(factoryType),
          functionName: "marketCount",
        });
        return Number(result);
      } catch (error) {
        console.error(`Failed to get market count for ${factoryType}:`, error);
        return 0;
      }
    },
    []
  );

  /**
   * Get all markets from factory
   */
  const getAllMarkets = useCallback(
    async (factoryType: "binary" | "multi" | "scalar") => {
      console.log(`🔍 Getting all ${factoryType} markets...`);
      const factoryAddress = getFactoryAddress(factoryType);
      if (!factoryAddress) {
        console.log(`❌ No factory address for ${factoryType}`);
        return [];
      }

      console.log(`📍 Factory address for ${factoryType}:`, factoryAddress);

      try {
        console.log(`📞 Calling getAllMarkets on ${factoryType} factory...`);
        const result = await readContract(config, {
          address: factoryAddress as `0x${string}`,
          abi: getFactoryABI(factoryType),
          functionName: "getAllMarkets",
        });

        const markets = result as string[];
        console.log(`✅ getAllMarkets returned for ${factoryType}:`, markets);

        // If getAllMarkets returns empty but we have marketCount > 0, manually build the array
        if (!markets || markets.length === 0) {
          console.log(
            `⚠️ getAllMarkets returned empty for ${factoryType}, trying manual approach...`
          );
          const count = await readContract(config, {
            address: factoryAddress as `0x${string}`,
            abi: getFactoryABI(factoryType),
            functionName: "marketCount",
          });

          console.log(`📊 Market count for ${factoryType}:`, count);

          const manualMarkets: string[] = [];
          for (let i = 1; i <= Number(count); i++) {
            try {
              console.log(`🔍 Getting market ${i} for ${factoryType}...`);
              const marketAddress = await readContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: getFactoryABI(factoryType),
                functionName: "marketOf",
                args: [BigInt(i)],
              });
              console.log("market nowwwwwwwwwwwwwwwwwwwwwwwww");
              console.log(`📍 Market ${i} address:`, marketAddress);
              console.log("market hereeeeeeeeeeeeeeeeeeeee");
              if (
                marketAddress &&
                marketAddress !== "0x0000000000000000000000000000000000000000"
              ) {
                manualMarkets.push(marketAddress as string);
              }
            } catch (error) {
              console.warn(
                `⚠️ Failed to get market ${i} for ${factoryType}:`,
                error
              );
            }
          }
          console.log(`✅ Manual markets for ${factoryType}:`, manualMarkets);
          return manualMarkets;
        }

        return markets;
      } catch (error) {
        console.error(
          `❌ Failed to get all markets for ${factoryType}:`,
          error
        );
        return [];
      }
    },
    []
  );

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
        // Try marketId first, then marketId-1 to handle the offset issue
        let result;
        try {
          result = await readContract(config, {
            address: factoryAddress as `0x${string}`,
            abi: getFactoryABI(type),
            functionName: "marketOf",
            args: [BigInt(marketId)],
          });
        } catch {
          // If that fails, try marketId + 1 (in case frontend expects 0-based but contract uses 1-based)
          result = await readContract(config, {
            address: factoryAddress as `0x${string}`,
            abi: getFactoryABI(type),
            functionName: "marketOf",
            args: [BigInt(marketId + 1)],
          });
        }
        return result as string;
      } catch (error) {
        console.error(
          `Failed to get market address for ${type} market ${marketId}:`,
          error
        );
        return null;
      }
    },
    []
  );

  // Get market data by address
  const getMarketData = useCallback(
    async (
      marketAddress: string,
      type: "binary" | "multi" | "scalar",
      globalMarketId?: number
    ) => {
      console.log(`📊 Getting market data for ${type} market:`, marketAddress);
      try {
        // Get the appropriate market ABI
        const marketABI = getMarketABI(type);
        console.log(`📋 Using ABI for ${type}:`, marketABI.length, "functions");

        // Read basic market data
        console.log(`🔍 Reading basic market data...`);
        const [
          question,
          metadataURI,
          creator,
          marketId,
          startTime,
          endTime,
          liquidity,
          state,
        ] = await Promise.all([
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "question",
          }).catch(() => "Unknown Question"),
          readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: marketABI,
            functionName: "metadataURI",
          }).catch(() => ""),
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
        ]);

        console.log(`✅ Basic data read:`, {
          question,
          creator,
          marketId: (marketId as bigint).toString(),
          startTime: (startTime as bigint).toString(),
          endTime: (endTime as bigint).toString(),
          liquidity: (liquidity as bigint).toString(),
          state,
        });

        // Determine outcomes based on market type
        let marketOutcomes: string[] = [];
        if (type === "binary") {
          marketOutcomes = ["Yes", "No"]; // Don't call outcomes() function
        } else if (type === "multi") {
          try {
            const outcomesResult = await readContract(config, {
              address: marketAddress as `0x${string}`,
              abi: marketABI,
              functionName: "outcomes",
            });
            marketOutcomes = Array.isArray(outcomesResult)
              ? outcomesResult
              : [];
          } catch {
            marketOutcomes = ["Unknown"]; // Fallback
          }
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

        // Get curation status from Curation contract
        let curationStatus: "Pending" | "Approved" | "Flagged" = "Pending";
        try {
          // Use globalMarketId if provided, otherwise fall back to individual marketId
          const curationMarketId =
            globalMarketId !== undefined ? globalMarketId : Number(marketId);
          console.log(
            `🔍 Getting curation status for market ID: ${curationMarketId} (global: ${globalMarketId}, individual: ${marketId})`
          );

          const curationResult = await readContract(config, {
            address: CONTRACT_ADDRESSES.curation as `0x${string}`,
            abi: ABI.curation,
            functionName: "statusOf",
            args: [BigInt(curationMarketId)],
          });

          // Convert contract status to our enum
          if (curationResult === 0) curationStatus = "Pending";
          else if (curationResult === 1) curationStatus = "Approved";
          else if (curationResult === 2) curationStatus = "Flagged";

          console.log(
            `✅ Curation status for ${marketAddress}:`,
            curationStatus
          );
        } catch (error) {
          console.warn(
            `⚠️ Failed to get curation status for ${marketAddress}:`,
            error
          );
          // Keep default "Pending" status
        }

        // Convert state number to string
        const stateMap = ["Open", "Closed", "Resolved"] as const;
        const marketState = stateMap[Number(state)] || "Open";

        // Get oracle adapter address to determine category
        let oracleAddress: string;
        try {
          const oracleResult = await readContract(config, {
            address: marketAddress as `0x${string}`,
            abi: MARKET_ABIS[`${type}Market` as keyof typeof MARKET_ABIS],
            functionName: "oracle",
          });
          oracleAddress = oracleResult as string;
          console.log(`🔍 Oracle address for ${marketAddress}:`, oracleAddress);
        } catch (error) {
          console.warn(
            `⚠️ Failed to get oracle address for ${marketAddress}:`,
            error
          );
          oracleAddress = "";
        }

        // Map oracle adapter to category
        let category: "crypto" | "sports" | "trends" = "crypto"; // Default fallback
        if (oracleAddress) {
          if (
            oracleAddress.toLowerCase() ===
            CONTRACT_ADDRESSES.cryptoOracle.toLowerCase()
          ) {
            category = "crypto";
          } else if (
            oracleAddress.toLowerCase() ===
            CONTRACT_ADDRESSES.sportsOracle.toLowerCase()
          ) {
            category = "sports";
          } else if (
            oracleAddress.toLowerCase() ===
            CONTRACT_ADDRESSES.trendsOracle.toLowerCase()
          ) {
            category = "trends";
          }
        }
        console.log(`📊 Category for ${marketAddress}:`, category);

        // Convert to Market type
        const market: Market = {
          id: `${type}:${
            globalMarketId !== undefined
              ? globalMarketId
              : (marketId as bigint).toString()
          }`,
          title: question as string,
          description: metadataURI as string,
          category: category,
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

        console.log(`✅ Market data created for ${type}:`, market);
        return market;
      } catch (error) {
        console.error(
          `❌ Failed to get market data for ${marketAddress}:`,
          error
        );
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

  /**
   * Get all markets from all factories
   */
  const getAllMarketsFromAllFactories = useCallback(async () => {
    console.log(`🔍 Getting all markets from all factories...`);

    const allMarkets: Market[] = [];

    // Get markets from each factory type
    const factoryTypes: ("binary" | "multi" | "scalar")[] = [
      "binary",
      "multi",
      "scalar",
    ];

    for (const factoryType of factoryTypes) {
      try {
        console.log(`📊 Fetching ${factoryType} markets...`);
        const marketAddresses = await getAllMarkets(factoryType);
        console.log(
          `✅ Found ${marketAddresses.length} ${factoryType} markets:`,
          marketAddresses
        );

        // Get detailed data for each market
        for (const marketAddress of marketAddresses) {
          try {
            const marketData = await getMarketData(marketAddress, factoryType);
            if (marketData) {
              allMarkets.push(marketData);
            }
          } catch (error) {
            console.warn(
              `⚠️ Failed to get data for ${factoryType} market ${marketAddress}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error(`❌ Error fetching ${factoryType} markets:`, error);
      }
    }

    console.log(
      `📊 Total markets found across all factories:`,
      allMarkets.length
    );
    return allMarkets;
  }, [getAllMarkets, getMarketData]);

  return {
    // Market creation functions
    createBinaryMarket,
    createMultiMarket,
    createScalarMarket,

    // Read functions
    getMarketCount,
    getAllMarkets,
    getAllMarketsFromAllFactories,
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
