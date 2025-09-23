// mockMarkets.ts

import type { Market } from "@/types/market"

export const mockMarkets: Market[] = [
	{
		id: "1",
		title: "Will ETH price exceed $3,000 by end of September?",
		description:
			"A prediction market on whether Ethereum (ETH) will surpass the $3,000 mark by the end of September.",
		outcomes: ["Yes", "No"],
		endTime: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days from now
		resolved: false,
		totalLiquidity: "50000",
		creator: "0x1234567890abcdef1234567890abcdef12345678",
		category: "crypto",
		volume24h: "15000",
		volume7d: "50000",
		volumeTotal: "200000",
		createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
		updatedAt: Date.now(),
		outcomeShares: [
			{
				outcomeIndex: 0,
				totalShares: "12000",
				price: "0.55",
				priceChange24h: 5.2,
				holders: 200,
			},
			{
				outcomeIndex: 1,
				totalShares: "8000",
				price: "0.45",
				priceChange24h: -3.1,
				holders: 150,
			},
		],
		priceHistory: [
			{
				timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
				outcomeIndex: 0,
				price: "0.48",
				volume: "5000",
			},
			{
				timestamp: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
				outcomeIndex: 0,
				price: "0.52",
				volume: "7000",
			},
			{
				timestamp: Date.now(),
				outcomeIndex: 0,
				price: "0.55",
				volume: "15000",
			},
		],
		metadata: {
			tags: ["Ethereum", "Price", "Crypto"],
			source: "CoinGecko",
			verificationLevel: "community",
			resolutionSource: "Chainlink Oracle",
		},
	},
]
