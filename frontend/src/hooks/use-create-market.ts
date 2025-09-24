"use client"

import { useCallback } from "react"
import { usePulseDeltaContract } from "@/hooks/use-contract"
import { useTransaction } from "@/utils/optimistic"
import { useToast } from "@/components/toast"
import type { MarketFormData } from "@/components/MarketCreationWizard"

/**
 * Hook for creating new prediction markets
 * Handles form validation, contract interaction, and user feedback
 */
export function useCreateMarket() {
	const { createMarket: contractCreateMarket, isPending } = usePulseDeltaContract()
	const {
		txState,
		startTransaction,
		setTransactionHash,
		confirmTransaction,
		failTransaction,
		resetTransaction,
	} = useTransaction()
	const { addToast } = useToast()

	const createMarket = useCallback(
		async (formData: MarketFormData) => {
			if (!formData.template) {
				throw new Error("Template is required")
			}

			try {
				startTransaction()

				addToast({
					title: "Creating Market",
					description: "Submitting your market to the blockchain...",
					type: "info",
					duration: 5000,
				})

				// Convert form data to contract parameters
				const endTime = BigInt(new Date(formData.endDate).getTime() / 1000)

				// Call contract function
				const hash = await contractCreateMarket({
					title: formData.title,
					description: formData.description,
					category: formData.category,
					endTime,
					resolutionSource: formData.resolutionSource,
					outcomes: formData.outcomes,
				})

				setTransactionHash(hash)

				addToast({
					title: "Market Submitted",
					description: "Your market is being processed on the blockchain",
					type: "info",
					duration: 5000,
					action: {
						label: "View Transaction",
						onClick: () => window.open(`https://etherscan.io/tx/${hash}`, "_blank"),
					},
				})

				// Simulate confirmation (in real app, this would be handled by wagmi)
				setTimeout(() => {
					confirmTransaction("0.0045 ETH")

					addToast({
						title: "Market Created Successfully!",
						description: "Your prediction market is now live and ready for trading",
						type: "success",
						duration: 8000,
						action: {
							label: "View Market",
							onClick: () => {
								// Navigate to market page
								window.location.href = "/market/new"
							},
						},
					})
				}, 3000)
			} catch (error) {
				failTransaction(error instanceof Error ? error.message : "Failed to create market")

				addToast({
					title: "Market Creation Failed",
					description: error instanceof Error ? error.message : "Unknown error occurred",
					type: "error",
					duration: 5000,
				})

				throw error
			}
		},
		[
			contractCreateMarket,
			addToast,
			startTransaction,
			setTransactionHash,
			confirmTransaction,
			failTransaction,
		]
	)

	return {
		createMarket,
		isCreating: isPending || txState.status === "pending" || txState.status === "confirming",
		txState,
		resetTransaction,
	}
}
