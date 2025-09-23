/**
 * PulseDelta Smart Contract ABI
 * Main prediction market contract interface
 */
export const pulseDeltaAbi = [
	// Market Management
	{
		inputs: [
			{ name: "title", type: "string" },
			{ name: "description", type: "string" },
			{ name: "category", type: "string" },
			{ name: "endTime", type: "uint256" },
			{ name: "resolutionSource", type: "string" },
			{ name: "outcomes", type: "string[]" },
		],
		name: "createMarket",
		outputs: [{ name: "marketId", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ name: "marketId", type: "uint256" }],
		name: "getMarket",
		outputs: [
			{
				components: [
					{ name: "id", type: "uint256" },
					{ name: "title", type: "string" },
					{ name: "description", type: "string" },
					{ name: "category", type: "string" },
					{ name: "creator", type: "address" },
					{ name: "endTime", type: "uint256" },
					{ name: "resolved", type: "bool" },
					{ name: "winningOutcome", type: "uint256" },
					{ name: "totalLiquidity", type: "uint256" },
					{ name: "fee", type: "uint256" },
				],
				name: "market",
				type: "tuple",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ name: "offset", type: "uint256" },
			{ name: "limit", type: "uint256" },
		],
		name: "getMarkets",
		outputs: [
			{
				components: [
					{ name: "id", type: "uint256" },
					{ name: "title", type: "string" },
					{ name: "category", type: "string" },
					{ name: "totalLiquidity", type: "uint256" },
					{ name: "endTime", type: "uint256" },
					{ name: "resolved", type: "bool" },
				],
				name: "markets",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},

	// Trading Functions
	{
		inputs: [
			{ name: "marketId", type: "uint256" },
			{ name: "outcomeIndex", type: "uint256" },
			{ name: "amount", type: "uint256" },
		],
		name: "buyOutcome",
		outputs: [{ name: "shares", type: "uint256" }],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{ name: "marketId", type: "uint256" },
			{ name: "outcomeIndex", type: "uint256" },
			{ name: "shares", type: "uint256" },
		],
		name: "sellOutcome",
		outputs: [{ name: "payout", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},

	// Liquidity Functions
	{
		inputs: [
			{ name: "marketId", type: "uint256" },
			{ name: "amount", type: "uint256" },
		],
		name: "addLiquidity",
		outputs: [{ name: "lpTokens", type: "uint256" }],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{ name: "marketId", type: "uint256" },
			{ name: "lpTokens", type: "uint256" },
		],
		name: "removeLiquidity",
		outputs: [{ name: "amount", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},

	// Resolution Functions
	{
		inputs: [
			{ name: "marketId", type: "uint256" },
			{ name: "winningOutcome", type: "uint256" },
		],
		name: "resolveMarket",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},

	// View Functions
	{
		inputs: [
			{ name: "marketId", type: "uint256" },
			{ name: "user", type: "address" },
		],
		name: "getUserShares",
		outputs: [{ name: "shares", type: "uint256[]" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ name: "marketId", type: "uint256" },
			{ name: "user", type: "address" },
		],
		name: "getUserLpTokens",
		outputs: [{ name: "lpTokens", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ name: "marketId", type: "uint256" }],
		name: "getOutcomePrices",
		outputs: [{ name: "prices", type: "uint256[]" }],
		stateMutability: "view",
		type: "function",
	},

	// Events
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: "marketId", type: "uint256" },
			{ indexed: true, name: "creator", type: "address" },
			{ indexed: false, name: "title", type: "string" },
		],
		name: "MarketCreated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: "marketId", type: "uint256" },
			{ indexed: true, name: "user", type: "address" },
			{ indexed: false, name: "outcomeIndex", type: "uint256" },
			{ indexed: false, name: "shares", type: "uint256" },
			{ indexed: false, name: "cost", type: "uint256" },
		],
		name: "SharesPurchased",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: "marketId", type: "uint256" },
			{ indexed: true, name: "user", type: "address" },
			{ indexed: false, name: "outcomeIndex", type: "uint256" },
			{ indexed: false, name: "shares", type: "uint256" },
			{ indexed: false, name: "payout", type: "uint256" },
		],
		name: "SharesSold",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: "marketId", type: "uint256" },
			{ indexed: true, name: "user", type: "address" },
			{ indexed: false, name: "amount", type: "uint256" },
			{ indexed: false, name: "lpTokens", type: "uint256" },
		],
		name: "LiquidityAdded",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: "marketId", type: "uint256" },
			{ indexed: true, name: "user", type: "address" },
			{ indexed: false, name: "lpTokens", type: "uint256" },
			{ indexed: false, name: "amount", type: "uint256" },
		],
		name: "LiquidityRemoved",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: "marketId", type: "uint256" },
			{ indexed: false, name: "winningOutcome", type: "uint256" },
		],
		name: "MarketResolved",
		type: "event",
	},
] as const

export type PulseDeltaAbi = typeof pulseDeltaAbi
