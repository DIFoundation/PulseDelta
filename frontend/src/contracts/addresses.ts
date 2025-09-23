/**
 * Contract addresses for different networks
 * Update these with actual deployed contract addresses
 */

export const contractAddresses = {
	// Ethereum Mainnet
	1: {
		pulseDelta: "0x0000000000000000000000000000000000000000",
	},
	// Ethereum Sepolia Testnet
	11155111: {
		pulseDelta: "0x0000000000000000000000000000000000000000",
	},
	// Polygon Mainnet
	137: {
		pulseDelta: "0x0000000000000000000000000000000000000000",
	},
	// Polygon Mumbai Testnet
	80001: {
		pulseDelta: "0x0000000000000000000000000000000000000000",
	},
	// Base Mainnet
	8453: {
		pulseDelta: "0x0000000000000000000000000000000000000000",
	},
	// Base Sepolia Testnet
	84532: {
		pulseDelta: "0x0000000000000000000000000000000000000000",
	},
} as const

export type SupportedChainId = keyof typeof contractAddresses

/**
 * Get contract address for a specific chain
 */
export function getContractAddress(chainId: SupportedChainId, contract: "pulseDelta"): string {
	const address = contractAddresses[chainId]?.[contract]
	if (!address || address === "0x0000000000000000000000000000000000000000") {
		throw new Error(`Contract ${contract} not deployed on chain ${chainId}`)
	}
	return address
}

/**
 * Check if a chain is supported
 */
export function isSupportedChain(chainId: number): chainId is SupportedChainId {
	return chainId in contractAddresses
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChains(): SupportedChainId[] {
	return Object.keys(contractAddresses).map(Number) as SupportedChainId[]
}
