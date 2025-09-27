"use client";

import { useCallback } from "react";
import { useOptimistic, useTransaction } from "@/utils/optimistic";
import { useToast } from "@/components/toast";

export interface TradeParams {
  marketId: string;
  outcomeIndex: number;
  amount: number;
  type: "buy" | "sell";
}

export interface TradeResult {
  txHash: string;
  shares: number;
  cost: number;
  fee: number;
}

/**
 * Hook for executing trades with optimistic UI
 * Handles buy/sell operations with transaction feedback
 */
export function useTrade(marketId: string, outcomeIndex: number) {
  const { addToast } = useToast();
  const {
    txState,
    startTransaction,
    setTransactionHash,
    confirmTransaction,
    failTransaction,
    resetTransaction,
  } = useTransaction();

  // Optimistic state for market data
  const {
    state: marketState,
    startOptimistic,
    confirmOptimistic,
    rollbackOptimistic,
  } = useOptimistic({
    balance: 1234.56, // Mock wallet balance
    shares: [0, 0], // User's shares in each outcome
    marketLiquidity: 125000,
    outcomePrice: 0.65,
  });

  const executeTrade = useCallback(
    async (params: TradeParams) => {
      const { amount, type } = params;
      const fee = amount * 0.02; // 2% fee
      const estimatedShares =
        type === "buy" ? amount / marketState.data.outcomePrice : amount;
      const cost =
        type === "buy"
          ? amount + fee
          : amount * marketState.data.outcomePrice - fee;

      try {
        // Start optimistic update
        const optimisticUpdate = {
          balance: marketState.data.balance - (type === "buy" ? cost : -cost),
          shares: marketState.data.shares.map((s, i) =>
            i === outcomeIndex
              ? s + (type === "buy" ? estimatedShares : -estimatedShares)
              : s
          ),
          marketLiquidity:
            marketState.data.marketLiquidity +
            (type === "buy" ? amount : -amount),
        };

        startOptimistic(optimisticUpdate);
        startTransaction();

        addToast({
          title: "Trade Submitted",
          description: `${
            type === "buy" ? "Buying" : "Selling"
          } ${estimatedShares.toFixed(2)} shares`,
          type: "info",
          duration: 3000,
        });

        // Simulate blockchain transaction
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock transaction hash
        const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        setTransactionHash(txHash);

        addToast({
          title: "Transaction Pending",
          description: "Waiting for blockchain confirmation...",
          type: "info",
          duration: 5000,
          action: {
            label: "View on Explorer",
            onClick: () =>
              window.open(`https://etherscan.io/tx/${txHash}`, "_blank"),
          },
        });

        // Simulate confirmation delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Confirm transaction
        confirmTransaction("0.0023 ETH"); // Mock gas used
        confirmOptimistic();

        addToast({
          title: "Trade Successful!",
          description: `${
            type === "buy" ? "Bought" : "Sold"
          } ${estimatedShares.toFixed(2)} shares`,
          type: "success",
          duration: 5000,
        });

        return {
          txHash,
          shares: estimatedShares,
          cost,
          fee,
        } as TradeResult;
      } catch (error) {
        // Rollback optimistic update
        rollbackOptimistic(
          error instanceof Error ? error.message : "Trade failed",
          {
            balance: 1234.56,
            shares: [0, 0],
            marketLiquidity: 125000,
            outcomePrice: 0.65,
          }
        );

        failTransaction(
          error instanceof Error ? error.message : "Trade failed"
        );

        addToast({
          title: "Trade Failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          type: "error",
          duration: 5000,
        });

				throw error
			}
		},
		[
			// marketId,
			outcomeIndex,
			marketState,
			addToast,
			startOptimistic,
			confirmOptimistic,
			rollbackOptimistic,
			startTransaction,
			setTransactionHash,
			confirmTransaction,
			failTransaction,
		]
	)

  const resetTrade = useCallback(() => {
    resetTransaction();
  }, [resetTransaction]);

  return {
    executeTrade,
    txState,
    marketState: marketState.data,
    isLoading: marketState.pending,
    resetTrade,
  };
}
