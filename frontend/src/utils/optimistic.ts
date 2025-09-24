"use client"

import * as React from "react"

export interface OptimisticState<T> {
	data: T
	pending: boolean
	error?: string
}

export interface OptimisticAction<T> {
	type: "START" | "SUCCESS" | "ERROR" | "ROLLBACK"
	payload?: Partial<T>
	error?: string
}

/**
 * Optimistic reducer for managing optimistic updates
 */
export function optimisticReducer<T>(
	state: OptimisticState<T>,
	action: OptimisticAction<T>
): OptimisticState<T> {
	switch (action.type) {
		case "START":
			return {
				...state,
				data: { ...state.data, ...action.payload },
				pending: true,
				error: undefined,
			}
		case "SUCCESS":
			return {
				...state,
				data: { ...state.data, ...action.payload },
				pending: false,
				error: undefined,
			}
		case "ERROR":
			return {
				...state,
				pending: false,
				error: action.error,
			}
		case "ROLLBACK":
			return {
				...state,
				pending: false,
				error: action.error,
			}
		default:
			return state
	}
}

/**
 * Hook for managing optimistic updates
 */
export function useOptimistic<T>(initialData: T) {
	const [state, dispatch] = React.useReducer(optimisticReducer<T>, {
		data: initialData,
		pending: false,
	})

	const startOptimistic = React.useCallback((optimisticData: Partial<T>) => {
		dispatch({ type: "START", payload: optimisticData })
	}, [])

	const confirmOptimistic = React.useCallback((confirmedData?: Partial<T>) => {
		dispatch({ type: "SUCCESS", payload: confirmedData })
	}, [])

	const rollbackOptimistic = React.useCallback((error: string, originalData: T) => {
		dispatch({ type: "ROLLBACK", error })
		// Reset to original data
		setTimeout(() => {
			dispatch({ type: "SUCCESS", payload: originalData as Partial<T> })
		}, 0)
	}, [])

	return {
		state,
		startOptimistic,
		confirmOptimistic,
		rollbackOptimistic,
	}
}

/**
 * Transaction status types for UI feedback
 */
export type TransactionStatus = "idle" | "pending" | "confirming" | "confirmed" | "failed"

export interface TransactionState {
	status: TransactionStatus
	hash?: string
	error?: string
	gasUsed?: string
}

/**
 * Hook for managing transaction states with optimistic UI
 */
export function useTransaction() {
	const [txState, setTxState] = React.useState<TransactionState>({
		status: "idle",
	})

	const startTransaction = React.useCallback(() => {
		setTxState({ status: "pending" })
	}, [])

	const setTransactionHash = React.useCallback((hash: string) => {
		setTxState((prev) => ({ ...prev, status: "confirming", hash }))
	}, [])

	const confirmTransaction = React.useCallback((gasUsed?: string) => {
		setTxState((prev) => ({
			...prev,
			status: "confirmed",
			gasUsed,
		}))
	}, [])

	const failTransaction = React.useCallback((error: string) => {
		setTxState((prev) => ({
			...prev,
			status: "failed",
			error,
		}))
	}, [])

	const resetTransaction = React.useCallback(() => {
		setTxState({ status: "idle" })
	}, [])

	return {
		txState,
		startTransaction,
		setTransactionHash,
		confirmTransaction,
		failTransaction,
		resetTransaction,
	}
}

// /**
//  * Optimistic UI utilities for PulseDelta
//  * Handles optimistic updates with rollback on failure
//  */

// export interface OptimisticUpdate<T> {
//   id: string;
//   type: 'trade' | 'liquidity' | 'market_creation';
//   data: T;
//   timestamp: number;
//   status: 'pending' | 'confirmed' | 'failed';
// }

// export interface OptimisticTradeUpdate {
//   marketId: string;
//   outcomeIndex: number;
//   amount: string;
//   price: string;
//   isBuy: boolean;
//   userAddress: string;
//   estimatedGas: string;
// }

// export interface OptimisticLiquidityUpdate {
//   marketId: string;
//   amount: string;
//   isAdd: boolean;
//   userAddress: string;
//   estimatedLpTokens?: string;
// }

// /**
//  * Optimistic update manager for handling pending transactions
//  */
// export class OptimisticUpdateManager {
//   private updates: Map<string, OptimisticUpdate<any>> = new Map();
//   private listeners: Set<() => void> = new Set();

//   /**
//    * Add an optimistic update
//    */
//   addUpdate<T>(
//     id: string,
//     type: OptimisticUpdate<T>['type'],
//     data: T
//   ): void {
//     const update: OptimisticUpdate<T> = {
//       id,
//       type,
//       data,
//       timestamp: Date.now(),
//       status: 'pending',
//     };

//     this.updates.set(id, update);
//     this.notifyListeners();
//   }

//   /**
//    * Confirm an optimistic update (transaction succeeded)
//    */
//   confirmUpdate(id: string): void {
//     const update = this.updates.get(id);
//     if (update) {
//       update.status = 'confirmed';
//       this.notifyListeners();

//       // Remove confirmed updates after a delay
//       setTimeout(() => {
//         this.updates.delete(id);
//         this.notifyListeners();
//       }, 5000);
//     }
//   }

//   /**
//    * Fail an optimistic update (transaction failed)
//    */
//   failUpdate(id: string): void {
//     const update = this.updates.get(id);
//     if (update) {
//       update.status = 'failed';
//       this.notifyListeners();

//       // Remove failed updates after a delay
//       setTimeout(() => {
//         this.updates.delete(id);
//         this.notifyListeners();
//       }, 10000);
//     }
//   }

//   /**
//    * Get all pending updates
//    */
//   getPendingUpdates(): OptimisticUpdate<any>[] {
//     return Array.from(this.updates.values()).filter(
//       update => update.status === 'pending'
//     );
//   }

//   /**
//    * Get updates by type
//    */
//   getUpdatesByType<T>(type: OptimisticUpdate<T>['type']): OptimisticUpdate<T>[] {
//     return Array.from(this.updates.values()).filter(
//       update => update.type === type
//     ) as OptimisticUpdate<T>[];
//   }

//   /**
//    * Subscribe to update changes
//    */
//   subscribe(listener: () => void): () => void {
//     this.listeners.add(listener);
//     return () => this.listeners.delete(listener);
//   }

//   private notifyListeners(): void {
//     this.listeners.forEach(listener => listener());
//   }
// }

// // Global instance
// export const optimisticUpdateManager = new OptimisticUpdateManager();

// /**
//  * Hook for using optimistic updates in React components
//  */
// import { useState, useEffect } from 'react';

// export function useOptimisticUpdates<T>(
//   type?: OptimisticUpdate<T>['type']
// ): OptimisticUpdate<T>[] {
//   const [updates, setUpdates] = useState<OptimisticUpdate<T>[]>([]);

//   useEffect(() => {
//     const updateState = () => {
//       const allUpdates = type
//         ? optimisticUpdateManager.getUpdatesByType(type)
//         : Array.from(optimisticUpdateManager['updates'].values());

//       setUpdates(allUpdates as OptimisticUpdate<T>[]);
//     };

//     updateState();
//     const unsubscribe = optimisticUpdateManager.subscribe(updateState);

//     return unsubscribe;
//   }, [type]);

//   return updates;
// }

// /**
//  * Apply optimistic updates to market data
//  */
// export function applyOptimisticUpdates<T>(
//   baseData: T,
//   updates: OptimisticUpdate<any>[],
//   applyFn: (data: T, update: OptimisticUpdate<any>) => T
// ): T {
//   return updates.reduce((data, update) => {
//     if (update.status === 'pending') {
//       return applyFn(data, update);
//     }
//     return data;
//   }, baseData);
// }

// /**
//  * Generate unique ID for optimistic updates
//  */
// export function generateOptimisticId(prefix: string = 'opt'): string {
//   return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// }

// /**
//  * Calculate estimated price impact for trades
//  */
// export function calculatePriceImpact(
//   currentPrice: number,
//   tradeAmount: number,
//   totalLiquidity: number
// ): number {
//   // Simplified AMM price impact calculation
//   // In reality, this would depend on the specific AMM curve used
//   const liquidityRatio = tradeAmount / totalLiquidity;
//   const priceImpact = liquidityRatio * 0.1; // 10% max impact at 100% liquidity

//   return Math.min(priceImpact, 0.1); // Cap at 10%
// }

// /**
//  * Estimate gas costs for different operations
//  */
// export const GAS_ESTIMATES = {
//   TRADE: '150000',
//   ADD_LIQUIDITY: '200000',
//   REMOVE_LIQUIDITY: '180000',
//   CREATE_MARKET: '300000',
//   RESOLVE_MARKET: '100000',
// } as const;

// /**
//  * Apply optimistic trade update to market data
//  */
// export function applyOptimisticTrade(
//   market: any,
//   update: OptimisticUpdate<OptimisticTradeUpdate>
// ): any {
//   const { outcomeIndex, amount, price, isBuy } = update.data;

//   // Clone market data
//   const updatedMarket = { ...market };
//   updatedMarket.outcomeShares = [...market.outcomeShares];

//   // Apply optimistic changes
//   const outcomeShare = { ...updatedMarket.outcomeShares[outcomeIndex] };

//   if (isBuy) {
//     // Increase total shares and adjust price slightly up
//     outcomeShare.totalShares = String(
//       parseFloat(outcomeShare.totalShares) + parseFloat(amount)
//     );
//     outcomeShare.price = String(
//       Math.min(0.99, parseFloat(outcomeShare.price) * 1.01)
//     );
//   } else {
//     // Decrease total shares and adjust price slightly down
//     outcomeShare.totalShares = String(
//       Math.max(0, parseFloat(outcomeShare.totalShares) - parseFloat(amount))
//     );
//     outcomeShare.price = String(
//       Math.max(0.01, parseFloat(outcomeShare.price) * 0.99)
//     );
//   }

//   updatedMarket.outcomeShares[outcomeIndex] = outcomeShare;

//   return updatedMarket;
// }
