import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { config } from "@/configs";
import { CONTRACT_ADDRESSES } from "@/lib/abiAndAddress";
import { ABI } from "@/lib/abiAndAddress";
import { MARKET_ABIS } from "@/lib/marketABIs";
import { useFactory } from "./useFactory";

interface LPPosition {
  marketId: string;
  marketTitle: string;
  marketAddress: string;
  lpTokenAddress: string;
  lpTokens: string;
  value: string;
  feesEarned: string;
  totalFeesEarned: string;
  valuePerToken: string;
}

interface LPEarnings {
  totalLPFees: string;
  activePositions: LPPosition[];
  totalValue: string;
  totalFeesEarned: string;
}

export function useLPEarnings(userAddress?: `0x${string}`) {
  const factory = useFactory();

  return useQuery({
    queryKey: ["lpEarnings", userAddress],
    queryFn: async (): Promise<LPEarnings> => {
      if (!userAddress || !factory) {
        throw new Error("User address or factory not available");
      }

      console.log("🔍 Fetching LP earnings for:", userAddress);

      // Get all markets to check for LP positions
      const allMarketsRaw = await factory.getAllMarketsFromAllFactories();
      const allMarkets = allMarketsRaw.filter(
        (market) => market && market.id && market.address
      );

      console.log("📊 Total markets found:", allMarketsRaw.length);
      console.log("📊 Valid markets after filtering:", allMarkets.length);

      let totalLPFees = 0;
      let totalValue = 0;
      let totalFeesEarned = 0;
      const activePositions: LPPosition[] = [];

      // Check each market for LP positions
      for (const market of allMarkets) {
        try {
          if (!market || !market.address || !market.type) {
            console.warn(`⚠️ Skipping incomplete market data:`, market);
            continue;
          }

          console.log(
            `🔍 Checking LP position in market: ${market.id} (${market.title})`
          );

          // Get LP token address for this market
          const marketABIKey =
            `${market.type}Market` as keyof typeof MARKET_ABIS;
          const lpTokenAddress = await readContract(config, {
            address: market.address as `0x${string}`,
            abi: MARKET_ABIS[marketABIKey],
            functionName: "lpToken",
          });

          if (
            !lpTokenAddress ||
            lpTokenAddress === "0x0000000000000000000000000000000000000000"
          ) {
            console.log(`⚠️ No LP token found for market: ${market.id}`);
            continue;
          }

          // Check user's LP token balance
          const lpBalance = await readContract(config, {
            address: lpTokenAddress as `0x${string}`,
            abi: ABI.lpToken,
            functionName: "balanceOf",
            args: [userAddress],
          });

          if (lpBalance === 0n) {
            console.log(`⚠️ No LP tokens for user in market: ${market.id}`);
            continue;
          }

          // Get LP token details
          const [
            totalSupply,
            totalLiquidity,
            lpTotalFeesEarned,
            valuePerToken,
          ] = await Promise.all([
            readContract(config, {
              address: lpTokenAddress as `0x${string}`,
              abi: ABI.lpToken,
              functionName: "totalSupply",
            }),
            readContract(config, {
              address: lpTokenAddress as `0x${string}`,
              abi: ABI.lpToken,
              functionName: "totalLiquidity",
            }),
            readContract(config, {
              address: lpTokenAddress as `0x${string}`,
              abi: ABI.lpToken,
              functionName: "totalFeesEarned",
            }),
            readContract(config, {
              address: lpTokenAddress as `0x${string}`,
              abi: ABI.lpToken,
              functionName: "getValuePerToken",
            }),
          ]);

          // Calculate user's share
          const userShare = Number(lpBalance) / Number(totalSupply);
          const userValue =
            (Number(totalLiquidity) + Number(lpTotalFeesEarned)) * userShare;
          const userFeesEarned = Number(lpTotalFeesEarned) * userShare;

          // Get LP fees for this market from FeeRouter
          const lpFeesForMarket = await readContract(config, {
            address: CONTRACT_ADDRESSES.feeRouter as `0x${string}`,
            abi: ABI.feeRouter,
            functionName: "getLPFeesForMarket",
            args: [market.address as `0x${string}`],
          });

          const position: LPPosition = {
            marketId: market.id,
            marketTitle: market.title,
            marketAddress: market.address,
            lpTokenAddress: lpTokenAddress as string,
            lpTokens: (Number(lpBalance) / 1e18).toFixed(6),
            value: (userValue / 1e18).toFixed(6),
            feesEarned: (userFeesEarned / 1e18).toFixed(6),
            totalFeesEarned: (Number(lpFeesForMarket) / 1e18).toFixed(6),
            valuePerToken: (Number(valuePerToken) / 1e18).toFixed(6),
          };

          activePositions.push(position);
          totalValue += userValue / 1e18;
          totalFeesEarned += userFeesEarned / 1e18;
          totalLPFees += Number(lpFeesForMarket) / 1e18;

          console.log(`✅ Found LP position in market: ${market.id}`, {
            lpTokens: position.lpTokens,
            value: position.value,
            feesEarned: position.feesEarned,
          });
        } catch (error) {
          console.warn(
            `⚠️ Error checking LP position in market ${
              market?.id || "unknown"
            }:`,
            error
          );
        }
      }

      const result: LPEarnings = {
        totalLPFees: totalLPFees.toFixed(6),
        activePositions,
        totalValue: totalValue.toFixed(6),
        totalFeesEarned: totalFeesEarned.toFixed(6),
      };

      console.log("✅ LP earnings data:", result);
      console.log("📊 Final counts:", {
        activePositions: activePositions.length,
        totalValue,
        totalFeesEarned,
      });

      return result;
    },
    enabled: !!userAddress && !!factory,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
