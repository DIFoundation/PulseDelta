/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useReadContract, useWriteContract, useWatchContractEvent, useChainId } from "wagmi"
import { pulseDeltaAbi } from "@/contracts/pulseDeltaAbi"
import { getContractAddress, isSupportedChain } from "@/contracts/addresses"
import { useCallback } from "react"

/**
 * Hook for interacting with PulseDelta smart contract
 * Provides typed contract interactions with automatic chain detection
 */
export function usePulseDeltaContract() {
	const chainId = useChainId()

	const contractAddress = isSupportedChain(chainId)
		? getContractAddress(chainId, "pulseDelta")
		: undefined

	// ✅ use writeContractAsync instead of writeContract
	const { writeContractAsync, isPending, error } = useWriteContract()

	// Market Management Functions
	const createMarket = useCallback(
		async (params: {
			title: string
			description: string
			category: string
			endTime: bigint
			resolutionSource: string
			outcomes: string[]
		}) => {
			if (!contractAddress) throw new Error("Contract not available on this chain")

			return await writeContractAsync({
				address: contractAddress as `0x${string}`,
				abi: pulseDeltaAbi,
				functionName: "createMarket",
				args: [
					params.title,
					params.description,
					params.category,
					params.endTime,
					params.resolutionSource,
					params.outcomes,
				],
			})
		},
		[contractAddress, writeContractAsync]
	)

	// Trading Functions
	const buyOutcome = useCallback(
		async (marketId: bigint, outcomeIndex: bigint, amount: bigint) => {
			if (!contractAddress) throw new Error("Contract not available on this chain")

			return await writeContractAsync({
				address: contractAddress as `0x${string}`,
				abi: pulseDeltaAbi,
				functionName: "buyOutcome",
				args: [marketId, outcomeIndex, amount],
				value: amount,
			})
		},
		[contractAddress, writeContractAsync]
	)

	const sellOutcome = useCallback(
		async (marketId: bigint, outcomeIndex: bigint, shares: bigint) => {
			if (!contractAddress) throw new Error("Contract not available on this chain")

			return await writeContractAsync({
				address: contractAddress as `0x${string}`,
				abi: pulseDeltaAbi,
				functionName: "sellOutcome",
				args: [marketId, outcomeIndex, shares],
			})
		},
		[contractAddress, writeContractAsync]
	)

	// Liquidity Functions
	const addLiquidity = useCallback(
		async (marketId: bigint, amount: bigint) => {
			if (!contractAddress) throw new Error("Contract not available on this chain")

			return await writeContractAsync({
				address: contractAddress as `0x${string}`,
				abi: pulseDeltaAbi,
				functionName: "addLiquidity",
				args: [marketId, amount],
				value: amount,
			})
		},
		[contractAddress, writeContractAsync]
	)

	const removeLiquidity = useCallback(
		async (marketId: bigint, lpTokens: bigint) => {
			if (!contractAddress) throw new Error("Contract not available on this chain")

			return await writeContractAsync({
				address: contractAddress as `0x${string}`,
				abi: pulseDeltaAbi,
				functionName: "removeLiquidity",
				args: [marketId, lpTokens],
			})
		},
		[contractAddress, writeContractAsync]
	)

	// Resolution Functions
	const resolveMarket = useCallback(
		async (marketId: bigint, winningOutcome: bigint) => {
			if (!contractAddress) throw new Error("Contract not available on this chain")

			return await writeContractAsync({
				address: contractAddress as `0x${string}`,
				abi: pulseDeltaAbi,
				functionName: "resolveMarket",
				args: [marketId, winningOutcome],
			})
		},
		[contractAddress, writeContractAsync]
	)

	return {
		contractAddress,
		createMarket,
		buyOutcome,
		sellOutcome,
		addLiquidity,
		removeLiquidity,
		resolveMarket,
		isPending,
		error,
	}
}
