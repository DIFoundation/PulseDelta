import { useQuery } from "@tanstack/react-query";
// import { useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { config } from "@/configs";
// import { CONTRACT_ADDRESSES } from "@/lib/abiAndAddress";
import { MARKET_ABIS } from "@/lib/marketABIs";
import { useFactory } from "./useFactory";

interface UserStats {
  totalVolume: string;
  marketsTraded: number;
  marketsCreated: number;
  totalLPValue: string;
  joinDate: number | null;
  volumeMilestone: number;
}

interface TradingHistoryItem {
  marketTitle: string;
  outcome: string;
  shares: string;
  cost: string;
  timestamp: number;
  txHash: string;
}

interface LPPosition {
  marketTitle: string;
  lpTokens: string;
  value: string;
  feesEarned: string;
}

export function useUserProfile(userAddress?: `0x${string}`) {
  const factory = useFactory();

  return useQuery({
    queryKey: ["userProfile", userAddress],
    queryFn: async (): Promise<{
      userStats: UserStats;
      tradingHistory: TradingHistoryItem[];
      lpPositions: LPPosition[];
    }> => {
      if (!userAddress || !factory) {
        throw new Error("User address or factory not available");
      }

      console.log("🔍 Fetching user profile for:", userAddress);
      console.log("🔍 User address (lowercase):", userAddress.toLowerCase());

      // Get all markets to analyze user activity
      const allMarketsRaw = await factory.getAllMarketsFromAllFactories();
      const allMarkets = allMarketsRaw.filter(
        (market) => market && market.id && market.creator
      );
      console.log("📊 Total markets found:", allMarketsRaw.length);
      console.log("📊 Valid markets after filtering:", allMarkets.length);
      console.log(
        "📋 Markets data:",
        allMarkets.map((m) => ({
          id: m.id,
          title: m.title,
          creator: m.creator,
          creatorLower: m.creator.toLowerCase(),
          type: m.type,
        }))
      );

      let totalVolume = 0;
      let marketsTraded = 0;
      let marketsCreated = 0;
      let totalLPValue = 0;
      let joinDate: number | null = null;
      const tradingHistory: TradingHistoryItem[] = [];
      const lpPositions: LPPosition[] = [];

      // Analyze each market for user activity
      for (const market of allMarkets) {
        try {
          // Skip if market data is incomplete
          if (!market || !market.address || !market.type) {
            console.warn(`⚠️ Skipping incomplete market data:`, market);
            continue;
          }

          console.log(`🔍 Analyzing market: ${market.id} (${market.title})`);

          // Check if user has traded in this market
          const hasTraded = await readContract(config, {
            address: market.address as `0x${string}`,
            abi: MARKET_ABIS[
              `${market.type}Market` as keyof typeof MARKET_ABIS
            ],
            functionName: "hasTraded",
            args: [userAddress],
          });

          if (hasTraded) {
            marketsTraded++;

            // Get trader volume for this market
            const traderVolume = await readContract(config, {
              address: market.address as `0x${string}`,
              abi: MARKET_ABIS[
                `${market.type}Market` as keyof typeof MARKET_ABIS
              ],
              functionName: "traderVolume",
              args: [userAddress],
            });

            const volume = parseFloat(traderVolume.toString()) / 1e18; // Convert from wei
            totalVolume += volume;

            // Add to trading history (mock data for now - in real implementation,
            // you'd parse blockchain events)
            tradingHistory.push({
              marketTitle: market.title,
              outcome: "YES", // This would come from actual trade events
              shares: "1.0", // This would come from actual trade events
              cost: volume.toString(),
              timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random date within last 30 days
              txHash: "0x" + Math.random().toString(16).substr(2, 64),
            });

            // Track earliest trading date
            if (!joinDate || market.createdAt < joinDate) {
              joinDate = market.createdAt;
            }
          }

          // Check if user created this market
          if (
            market.creator &&
            market.creator.toLowerCase() === userAddress.toLowerCase()
          ) {
            marketsCreated++;
            console.log(
              `✅ Found created market: ${market.title} (${market.id})`
            );
          } else {
            console.log(
              `❌ Not a match for market: ${market.title} (${market.id})`
            );
            console.log(`   Creator: ${market.creator}, User: ${userAddress}`);
          }

          // Check LP positions (mock data for now)
          // In real implementation, you'd check LPToken balances
          if (Math.random() > 0.7) {
            // 30% chance of having LP position
            lpPositions.push({
              marketTitle: market.title,
              lpTokens: (Math.random() * 1000).toFixed(2),
              value: (Math.random() * 500).toFixed(2),
              feesEarned: (Math.random() * 10).toFixed(2),
            });
            totalLPValue += parseFloat(
              lpPositions[lpPositions.length - 1].value
            );
          }
        } catch (error) {
          console.warn(
            `⚠️ Error analyzing market ${market?.id || "unknown"}:`,
            error
          );
          console.warn(`Market data:`, market);
        }
      }

      // Sort trading history by timestamp (newest first)
      tradingHistory.sort((a, b) => b.timestamp - a.timestamp);

      const userStats: UserStats = {
        totalVolume: totalVolume.toFixed(2),
        marketsTraded,
        marketsCreated,
        totalLPValue: totalLPValue.toFixed(2),
        joinDate,
        volumeMilestone: totalVolume,
      };

      console.log("✅ User profile data:", userStats);
      console.log("📊 Final counts:", {
        marketsTraded,
        marketsCreated,
        totalMarkets: allMarkets.length,
      });
      console.log(
        "📋 Processed markets:",
        allMarkets.map((m) => ({
          id: m.id,
          title: m.title,
          creator: m.creator,
          type: m.type,
        }))
      );

      return {
        userStats,
        tradingHistory,
        lpPositions,
      };
    },
    enabled: !!userAddress && !!factory,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
