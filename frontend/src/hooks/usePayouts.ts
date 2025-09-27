import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { config } from "@/configs";
import { MARKET_ABIS } from "@/lib/marketABIs";
import { CONTRACT_ADDRESSES } from "@/lib/abiAndAddress";
import { toast } from "react-toastify";
import type { Market } from "@/types/market";

interface OutcomeTokenBalance {
  outcomeIndex: number;
  outcome: string;
  balance: number;
  tokenAddress: string;
}

interface PayoutInfo {
  outcomeBalances: OutcomeTokenBalance[];
  totalPotentialPayout: number;
  canClaim: boolean;
  marketResolved: boolean;
  winningOutcome?: number;
}

export function usePayouts() {
  const { address } = useAccount();
  const [payoutState, setPayoutState] = useState<{
    isLoading: boolean;
    error: string | null;
    data: PayoutInfo | null;
  }>({
    isLoading: false,
    error: null,
    data: null,
  });

  // Get user's outcome token balances for a market
  const getOutcomeBalances = useCallback(
    async (market: Market): Promise<OutcomeTokenBalance[]> => {
      if (!address || !market.address) return [];

      try {
        const balances: OutcomeTokenBalance[] = [];

        if (market.type === "binary") {
          // For binary markets, check YES and NO token balances
          const [yesTokenAddress, noTokenAddress] = await Promise.all([
            readContract(config, {
              address: market.address as `0x${string}`,
              abi: MARKET_ABIS.binaryMarket,
              functionName: "yesToken",
            }),
            readContract(config, {
              address: market.address as `0x${string}`,
              abi: MARKET_ABIS.binaryMarket,
              functionName: "noToken",
            }),
          ]);

          const [yesBalance, noBalance] = await Promise.all([
            readContract(config, {
              address: yesTokenAddress as `0x${string}`,
              abi: [
                {
                  inputs: [{ name: "account", type: "address" }],
                  name: "balanceOf",
                  outputs: [{ name: "", type: "uint256" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "balanceOf",
              args: [address],
            }),
            readContract(config, {
              address: noTokenAddress as `0x${string}`,
              abi: [
                {
                  inputs: [{ name: "account", type: "address" }],
                  name: "balanceOf",
                  outputs: [{ name: "", type: "uint256" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "balanceOf",
              args: [address],
            }),
          ]);

          balances.push(
            {
              outcomeIndex: 0,
              outcome: "Yes",
              balance: Number(yesBalance) / 1e18,
              tokenAddress: yesTokenAddress as string,
            },
            {
              outcomeIndex: 1,
              outcome: "No",
              balance: Number(noBalance) / 1e18,
              tokenAddress: noTokenAddress as string,
            }
          );
        } else if (market.type === "multi") {
          // For multi markets, check all outcome token balances
          const outcomeTokens = await readContract(config, {
            address: market.address as `0x${string}`,
            abi: MARKET_ABIS.multiMarket,
            functionName: "outcomeTokens",
          });

          const tokenBalances = await Promise.all(
            (outcomeTokens as string[]).map((tokenAddress) =>
              readContract(config, {
                address: tokenAddress as `0x${string}`,
                abi: [
                  {
                    inputs: [{ name: "account", type: "address" }],
                    name: "balanceOf",
                    outputs: [{ name: "", type: "uint256" }],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "balanceOf",
                args: [address],
              })
            )
          );

          (outcomeTokens as string[]).forEach((tokenAddress, index) => {
            balances.push({
              outcomeIndex: index,
              outcome: market.outcomes[index] || `Outcome ${index}`,
              balance: Number(tokenBalances[index]) / 1e18,
              tokenAddress,
            });
          });
        } else if (market.type === "scalar") {
          // For scalar markets, check LONG and SHORT token balances
          const [longTokenAddress, shortTokenAddress] = await Promise.all([
            readContract(config, {
              address: market.address as `0x${string}`,
              abi: MARKET_ABIS.scalarMarket,
              functionName: "longToken",
            }),
            readContract(config, {
              address: market.address as `0x${string}`,
              abi: MARKET_ABIS.scalarMarket,
              functionName: "shortToken",
            }),
          ]);

          const [longBalance, shortBalance] = await Promise.all([
            readContract(config, {
              address: longTokenAddress as `0x${string}`,
              abi: [
                {
                  inputs: [{ name: "account", type: "address" }],
                  name: "balanceOf",
                  outputs: [{ name: "", type: "uint256" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "balanceOf",
              args: [address],
            }),
            readContract(config, {
              address: shortTokenAddress as `0x${string}`,
              abi: [
                {
                  inputs: [{ name: "account", type: "address" }],
                  name: "balanceOf",
                  outputs: [{ name: "", type: "uint256" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "balanceOf",
              args: [address],
            }),
          ]);

          balances.push(
            {
              outcomeIndex: 0,
              outcome: "Long",
              balance: Number(longBalance) / 1e18,
              tokenAddress: longTokenAddress as string,
            },
            {
              outcomeIndex: 1,
              outcome: "Short",
              balance: Number(shortBalance) / 1e18,
              tokenAddress: shortTokenAddress as string,
            }
          );
        }

        return balances.filter((balance) => balance.balance > 0);
      } catch (error) {
        console.error("Error fetching outcome balances:", error);
        return [];
      }
    },
    [address]
  );

  // Get market resolution status
  const getMarketStatus = useCallback(
    async (market: Market): Promise<{
      resolved: boolean;
      winningOutcome?: number;
      canClaim: boolean;
    }> => {
      if (!market.address) {
        return { resolved: false, canClaim: false };
      }

      try {
        const [state, finalOutcome] = await Promise.all([
          readContract(config, {
            address: market.address as `0x${string}`,
            abi: MARKET_ABIS[`${market.type}Market` as keyof typeof MARKET_ABIS],
            functionName: "state",
          }),
          readContract(config, {
            address: market.address as `0x${string}`,
            abi: MARKET_ABIS[`${market.type}Market` as keyof typeof MARKET_ABIS],
            functionName: "finalOutcome",
          }).catch(() => 0), // Some markets might not have finalOutcome
        ]);

        const isResolved = Number(state) === 2; // State 2 = Resolved
        const winningOutcome = isResolved ? Number(finalOutcome) : undefined;

        return {
          resolved: isResolved,
          winningOutcome,
          canClaim: isResolved,
        };
      } catch (error) {
        console.error("Error fetching market status:", error);
        return { resolved: false, canClaim: false };
      }
    },
    []
  );

  // Calculate potential payout
  const calculatePotentialPayout = useCallback(
    (balances: OutcomeTokenBalance[], winningOutcome?: number): number => {
      if (winningOutcome === undefined) {
        // If not resolved, return total of all balances (1:1 payout)
        return balances.reduce((sum, balance) => sum + balance.balance, 0);
      }

      // If resolved, only winning outcome tokens have value
      return balances
        .filter((balance) => balance.outcomeIndex === winningOutcome)
        .reduce((sum, balance) => sum + balance.balance, 0);
    },
    []
  );

  // Fetch payout info for a market
  const fetchPayoutInfo = useCallback(
    async (market: Market): Promise<void> => {
      if (!address) return;

      setPayoutState({ isLoading: true, error: null, data: null });

      try {
        const [balances, status] = await Promise.all([
          getOutcomeBalances(market),
          getMarketStatus(market),
        ]);

        const totalPotentialPayout = calculatePotentialPayout(
          balances,
          status.winningOutcome
        );

        setPayoutState({
          isLoading: false,
          error: null,
          data: {
            outcomeBalances: balances,
            totalPotentialPayout,
            canClaim: status.canClaim && totalPotentialPayout > 0,
            marketResolved: status.resolved,
            winningOutcome: status.winningOutcome,
          },
        });
      } catch (error) {
        console.error("Error fetching payout info:", error);
        setPayoutState({
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
          data: null,
        });
      }
    },
    [address, getOutcomeBalances, getMarketStatus, calculatePotentialPayout]
  );

  return {
    payoutState,
    fetchPayoutInfo,
    getOutcomeBalances,
    getMarketStatus,
  };
}
