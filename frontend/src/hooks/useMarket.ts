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

  // Get market counts for all factory types
  const binaryCount = factory.getMarketCount("binary");
  const multiCount = factory.getMarketCount("multi");
  const scalarCount = factory.getMarketCount("scalar");

  return useQuery({
    queryKey: ["markets", offset, limit, filters],
    queryFn: async () => {
      // Get all markets from all factory types
      const allMarkets: Market[] = [];
      
      // Fetch binary markets
      if (binaryCount.data && Number(binaryCount.data) > 0) {
        for (let i = 0; i < Number(binaryCount.data); i++) {
          try {
            const marketAddress = await factory.getMarketAddress("binary", i);
            if (marketAddress) {
              const marketData = await factory.getMarketData(marketAddress, "binary");
              if (marketData) {
                allMarkets.push(marketData);
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch binary market ${i}:`, error);
          }
        }
      }

      // Fetch multi markets
      if (multiCount.data && Number(multiCount.data) > 0) {
        for (let i = 0; i < Number(multiCount.data); i++) {
          try {
            const marketAddress = await factory.getMarketAddress("multi", i);
            if (marketAddress) {
              const marketData = await factory.getMarketData(marketAddress, "multi");
              if (marketData) {
                allMarkets.push(marketData);
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch multi market ${i}:`, error);
          }
        }
      }

      // Fetch scalar markets
      if (scalarCount.data && Number(scalarCount.data) > 0) {
        for (let i = 0; i < Number(scalarCount.data); i++) {
          try {
            const marketAddress = await factory.getMarketAddress("scalar", i);
            if (marketAddress) {
              const marketData = await factory.getMarketData(marketAddress, "scalar");
              if (marketData) {
                allMarkets.push(marketData);
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch scalar market ${i}:`, error);
          }
        }
      }

      return allMarkets;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled:
      binaryCount.data !== undefined &&
      multiCount.data !== undefined &&
      scalarCount.data !== undefined,
  });
}

/**
 * Hook for fetching individual market details
 */
export function useMarket(marketId: string) {
  const factory = useFactory();

  return useQuery({
    queryKey: ["market", marketId],
    queryFn: async () => {
      // Try to find market in each factory type
      const marketIdNum = parseInt(marketId);
      
      // Check binary markets first
      const binaryCount = await factory.getMarketCount("binary");
      const binaryCountNum = Number(binaryCount || 0);
      if (binaryCount && marketIdNum < binaryCountNum) {
        const marketAddress = await factory.getMarketAddress("binary", marketIdNum);
        if (marketAddress) {
          const onChainData = await factory.getMarketData(marketAddress, "binary");
          if (onChainData) {
            // Get Supabase metadata
            const metadata = await MarketMetadataService.getByMarketAddress(marketAddress);
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
          }
        }
      }

      // Check multi markets
      const multiCount = await factory.getMarketCount("multi");
      const multiCountNum = Number(multiCount || 0);
      if (multiCount && marketIdNum < binaryCountNum + multiCountNum) {
        const marketAddress = await factory.getMarketAddress("multi", marketIdNum - binaryCountNum);
        if (marketAddress) {
          const onChainData = await factory.getMarketData(marketAddress, "multi");
          if (onChainData) {
            // Get Supabase metadata
            const metadata = await MarketMetadataService.getByMarketAddress(marketAddress);
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
          }
        }
      }

      // Check scalar markets
      const scalarCount = await factory.getMarketCount("scalar");
      const scalarCountNum = Number(scalarCount || 0);
      if (scalarCount && marketIdNum < binaryCountNum + multiCountNum + scalarCountNum) {
        const marketAddress = await factory.getMarketAddress("scalar", marketIdNum - binaryCountNum - multiCountNum);
        if (marketAddress) {
          const onChainData = await factory.getMarketData(marketAddress, "scalar");
          if (onChainData) {
            // Get Supabase metadata
            const metadata = await MarketMetadataService.getByMarketAddress(marketAddress);
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
          }
        }
      }

      throw new Error("Market not found");
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
