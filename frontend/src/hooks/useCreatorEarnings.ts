import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { config } from "@/configs";
import { CONTRACT_ADDRESSES } from "@/lib/abiAndAddress";
import { ABI } from "@/lib/abiAndAddress";
import { MARKET_ABIS } from "@/lib/marketABIs";
import { useFactory } from "./useFactory";

interface CreatorMarketEarnings {
  marketId: string;
  marketTitle: string;
  marketAddress: string;
  feesEarned: string;
  isActive: boolean;
}

interface CreatorEarnings {
  lifetimeFees: string;
  claimableFees: string;
  totalMarkets: number;
  marketsWithFees: CreatorMarketEarnings[];
}

export function useCreatorEarnings(userAddress?: `0x${string}`) {
  const factory = useFactory();

  return useQuery({
    queryKey: ["creatorEarnings", userAddress],
    queryFn: async (): Promise<CreatorEarnings> => {
      if (!userAddress || !factory) {
        throw new Error("User address or factory not available");
      }

      console.log("🔍 Fetching creator earnings for:", userAddress);

      // Get all markets to check for creator earnings
      const allMarketsRaw = await factory.getAllMarketsFromAllFactories();
      const allMarkets = allMarketsRaw.filter(
        (market) => market && market.id && market.address
      );

      console.log("📊 Total markets found:", allMarketsRaw.length);
      console.log("📊 Valid markets after filtering:", allMarkets.length);

      let lifetimeFees = 0;
      let claimableFees = 0;
      let totalMarkets = 0;
      const marketsWithFees: CreatorMarketEarnings[] = [];

      // Check each market for creator earnings
      for (const market of allMarkets) {
        try {
          if (!market || !market.address || !market.type) {
            console.warn(`⚠️ Skipping incomplete market data:`, market);
            continue;
          }

          console.log(
            `🔍 Checking creator earnings for market: ${market.id} (${market.title})`
          );

          // Check if user is the creator of this market
          const creator = await readContract(config, {
            address: CONTRACT_ADDRESSES.feeRouter as `0x${string}`,
            abi: ABI.feeRouter,
            functionName: "getCreator",
            args: [market.address as `0x${string}`],
          });

          if ((creator as string).toLowerCase() !== userAddress.toLowerCase()) {
            console.log(`⚠️ User is not creator of market: ${market.id}`);
            continue;
          }

          totalMarkets++;

          // Get creator fees for this specific market
          const creatorFeesForMarket = await readContract(config, {
            address: CONTRACT_ADDRESSES.feeRouter as `0x${string}`,
            abi: ABI.feeRouter,
            functionName: "getCreatorFeesForMarket",
            args: [userAddress, market.address as `0x${string}`],
          });

          const feesEarned = Number(creatorFeesForMarket) / 1e18;

          if (feesEarned > 0) {
            // Check if market is still active (not resolved)
            const marketABIKey =
              `${market.type}Market` as keyof typeof MARKET_ABIS;
            const marketState = await readContract(config, {
              address: market.address as `0x${string}`,
              abi: MARKET_ABIS[marketABIKey],
              functionName: "state",
            });

            const isActive = marketState === 0; // 0 = Active, 1 = Resolved

            const marketEarnings: CreatorMarketEarnings = {
              marketId: market.id,
              marketTitle: market.title,
              marketAddress: market.address,
              feesEarned: feesEarned.toFixed(6),
              isActive,
            };

            marketsWithFees.push(marketEarnings);
            lifetimeFees += feesEarned;

            console.log(`✅ Found creator earnings for market: ${market.id}`, {
              feesEarned: marketEarnings.feesEarned,
              isActive,
            });
          }
        } catch (error) {
          console.warn(
            `⚠️ Error checking creator earnings for market ${
              market?.id || "unknown"
            }:`,
            error
          );
        }
      }

      // Get total claimable fees from FeeRouter
      try {
        const claimableFeesBigInt = await readContract(config, {
          address: CONTRACT_ADDRESSES.feeRouter as `0x${string}`,
          abi: ABI.feeRouter,
          functionName: "creatorAccrued",
          args: [userAddress],
        });

        claimableFees = Number(claimableFeesBigInt) / 1e18;
      } catch (error) {
        console.warn("⚠️ Error fetching claimable fees:", error);
      }

      const result: CreatorEarnings = {
        lifetimeFees: lifetimeFees.toFixed(6),
        claimableFees: claimableFees.toFixed(6),
        totalMarkets,
        marketsWithFees,
      };

      console.log("✅ Creator earnings data:", result);
      console.log("📊 Final counts:", {
        totalMarkets,
        marketsWithFees: marketsWithFees.length,
        lifetimeFees,
        claimableFees,
      });

      return result;
    },
    enabled: !!userAddress && !!factory,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
