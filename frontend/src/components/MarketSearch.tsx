"use client"

import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, X } from "lucide-react"

interface MarketSearchProps {
	searchQuery: string
	onSearchChange: (q: string) => void
	sortBy: "volume" | "liquidity" | "created" | "ending"
	onSortChange: (s: "volume" | "liquidity" | "created" | "ending") => void
	sortOrder: "asc" | "desc"
	onSortOrderChange: (o: "asc" | "desc") => void
	onResetSearch: () => void
}

export function MarketSearch({
	searchQuery,
	onSearchChange,
	sortBy,
	onSortChange,
	sortOrder,
	onSortOrderChange,
	onResetSearch,
}: MarketSearchProps) {
	return (
		<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
			{/* Search bar with clear button inside */}
			<div className="relative w-full md:w-1/2">
				<Input
					placeholder="Search markets..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pr-10" // add right padding for the clear button
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={onResetSearch}
						className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
						title="Clear search">
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			{/* Sort controls */}
			<div className="flex items-center gap-2">
				<Select value={sortBy} onValueChange={(val) => onSortChange(val as typeof sortBy)}>
					<SelectTrigger className="w-[160px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="volume">Volume</SelectItem>
						<SelectItem value="liquidity">Liquidity</SelectItem>
						<SelectItem value="created">Created</SelectItem>
						<SelectItem value="ending">Ending Soon</SelectItem>
					</SelectContent>
				</Select>

				<Button
					variant="outline"
					size="icon"
					onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
					title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}>
					<ArrowUpDown className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
