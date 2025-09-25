import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useReadContract } from "wagmi";
import { useFactory } from "./useFactory";
import { MarketMetadataService } from "@/lib/supabase";
import { CONTRACT_ADDRESSES, ABI } from "@/lib/abiAndAddress";
import type { Market, CreateMarketParams, TradeOrder } from "@/types/market";

/**
 * Hook for fetching market list with pagination and filtering
 */
export function useMarketList(
  offset: number = 0,
  limit: number = 20,
  filters?: {
    category?: string;
    status?: string;
    search?: string;
  }
) {
  const factory = useFactory();

  return useQuery({
    queryKey: ["markets", offset, limit, filters],
    queryFn: async () => {
      console.log("🚀 Starting market fetch...");
      const allMarkets: Market[] = [];

      try {
        // Use getAllMarkets like the working script
        console.log("📊 Fetching binary markets...");
        const binaryMarkets = await factory.getAllMarkets("binary");
        console.log("Binary markets from getAllMarkets:", binaryMarkets);

        console.log("📊 Fetching multi markets...");
        const multiMarkets = await factory.getAllMarkets("multi");
        console.log("Multi markets from getAllMarkets:", multiMarkets);

        console.log("📊 Fetching scalar markets...");
        const scalarMarkets = await factory.getAllMarkets("scalar");
        console.log("Scalar markets from getAllMarkets:", scalarMarkets);

        // Process binary markets
        if (binaryMarkets && binaryMarkets.length > 0) {
          console.log(`Processing ${binaryMarkets.length} binary markets...`);
          for (const marketAddress of binaryMarkets) {
            console.log("Processing binary market:", marketAddress);
            if (
              marketAddress &&
              marketAddress !== "0x0000000000000000000000000000000000000000"
            ) {
              try {
                const marketData = await factory.getMarketData(
                  marketAddress,
                  "binary"
                );
                console.log("Binary market data:", marketData);
                if (marketData) {
                  allMarkets.push(marketData);
                }
              } catch (error) {
                console.warn(
                  `Failed to fetch binary market data for ${marketAddress}:`,
                  error
                );
              }
            }
          }
        }

        // Process multi markets
        if (multiMarkets && multiMarkets.length > 0) {
          console.log(`Processing ${multiMarkets.length} multi markets...`);
          for (const marketAddress of multiMarkets) {
            console.log("Processing multi market:", marketAddress);
            if (
              marketAddress &&
              marketAddress !== "0x0000000000000000000000000000000000000000"
            ) {
              try {
                const marketData = await factory.getMarketData(
                  marketAddress,
                  "multi"
                );
                console.log("Multi market data:", marketData);
                if (marketData) {
                  allMarkets.push(marketData);
                }
              } catch (error) {
                console.warn(
                  `Failed to fetch multi market data for ${marketAddress}:`,
                  error
                );
              }
            }
          }
        }

        // Process scalar markets
        if (scalarMarkets && scalarMarkets.length > 0) {
          console.log(`Processing ${scalarMarkets.length} scalar markets...`);
          for (const marketAddress of scalarMarkets) {
            console.log("Processing scalar market:", marketAddress);
            if (
              marketAddress &&
              marketAddress !== "0x0000000000000000000000000000000000000000"
            ) {
              try {
                const marketData = await factory.getMarketData(
                  marketAddress,
                  "scalar"
                );
                console.log("Scalar market data:", marketData);
                if (marketData) {
                  allMarkets.push(marketData);
                }
              } catch (error) {
                console.warn(
                  `Failed to fetch scalar market data for ${marketAddress}:`,
                  error
                );
              }
            }
          }
        }

        console.log("✅ Total markets fetched:", allMarkets.length);
        console.log("All markets:", allMarkets);
      } catch (error) {
        console.error("❌ Failed to fetch markets:", error);
      }

      return allMarkets;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for fetching individual market details
 * Now expects marketId to be in format "type:id" (e.g., "binary:1", "multi:2")
 */
export function useMarket(marketId: string) {
  const factory = useFactory();

  return useQuery({
    queryKey: ["market", marketId],
    queryFn: async () => {
      console.log("useMarket - Starting fetch for:", marketId);

      // Parse marketId to get type and id
      const [marketType, id] = marketId.split(":");
      const marketIdNum = parseInt(id);

      console.log("useMarket - Parsed:", { marketType, id, marketIdNum });

      if (!marketType || !id || isNaN(marketIdNum)) {
        throw new Error("Invalid market ID format. Expected format: 'type:id'");
      }

      if (!["binary", "multi", "scalar"].includes(marketType)) {
        throw new Error(
          "Invalid market type. Must be 'binary', 'multi', or 'scalar'"
        );
      }

      // Get market address
      console.log(
        "useMarket - Getting market address for:",
        marketType,
        marketIdNum
      );
      const marketAddress = await factory.getMarketAddress(
        marketType as "binary" | "multi" | "scalar",
        marketIdNum
      );

      console.log("useMarket - Market address:", marketAddress);

      if (
        !marketAddress ||
        marketAddress === "0x0000000000000000000000000000000000000000"
      ) {
        throw new Error("Market not found");
      }

      // Get on-chain data
      const onChainData = await factory.getMarketData(
        marketAddress,
        marketType as "binary" | "multi" | "scalar"
      );

      if (!onChainData) {
        throw new Error("Failed to fetch market data");
      }

      // Get Supabase metadata
      const metadata = await MarketMetadataService.getByMarketAddress(
        marketAddress
      );
      if (metadata) {
        // Combine on-chain data with Supabase metadata
        return {
          ...onChainData,
          category: metadata.category,
          tags: metadata.tags,
          resolutionSource: metadata.resolution_source,
          template: metadata.template_name,
          marketType: metadata.market_type,
        };
      }

      return onChainData;
    },
    enabled: !!marketId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook for trading (buy/sell outcomes)
 */
export function useTrade(marketId: string) {
  const queryClient = useQueryClient();

  const buyMutation = useMutation({
    mutationFn: async ({
      outcomeIndex,
      amount,
    }: {
      outcomeIndex: number;
      amount: string;
    }) => {
      // Mock transaction - replace with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { hash: `0x${"0".repeat(64)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market", marketId] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async ({
      outcomeIndex,
      amount,
    }: {
      outcomeIndex: number;
      amount: string;
    }) => {
      // Mock transaction - replace with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { hash: `0x${"0".repeat(64)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market", marketId] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });

  return {
    buy: buyMutation.mutateAsync,
    sell: sellMutation.mutateAsync,
    isBuying: buyMutation.isPending,
    isSelling: sellMutation.isPending,
    buyError: buyMutation.error,
    sellError: sellMutation.error,
  };
}

/**
 * Hook for liquidity provision
 */
export function useLiquidity(marketId: string) {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      // Mock transaction - replace with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { hash: `0x${"0".repeat(64)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market", marketId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({ lpTokens }: { lpTokens: string }) => {
      // Mock transaction - replace with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { hash: `0x${"0".repeat(64)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market", marketId] });
    },
  });

  return {
    addLiquidity: addMutation.mutateAsync,
    removeLiquidity: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    addError: addMutation.error,
    removeError: removeMutation.error,
  };
}

/**
 * Hook for creating new markets
 */
export function useCreateMarket() {
  const queryClient = useQueryClient();
  const factory = useFactory();

  return useMutation({
    mutationFn: async (
      params: CreateMarketParams & { initialLiquidity: string }
    ) => {
      // Determine market type based on outcomes
      if (params.outcomes.length === 2) {
        // Binary market
        await factory.createBinaryMarket(params);
      } else if (params.outcomes.length > 2) {
        // Multi-outcome market
        await factory.createMultiMarket(params);
      } else {
        throw new Error("Invalid number of outcomes");
      }

      return { hash: factory.hash };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}

// Mock data generators removed - now using real contract data
