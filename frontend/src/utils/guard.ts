import { MarketCategory } from "@/types/market"

/**
 * Type guard to check if a string is a valid MarketCategory
 */
export function isMarketCategory(value: string): value is MarketCategory {
	return [
		"sports",
		"crypto",
		"politics",
		"entertainment",
		"technology",
		"economics",
		"other",
	].includes(value)
}
