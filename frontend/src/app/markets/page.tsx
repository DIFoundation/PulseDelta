"use client"

import { useState } from "react"
import { MarketFilters } from "@/components/MarketFilters"
import { MarketSearch } from "@/components/MarketSearch"
import { MarketList } from "@/components/MarketList"
import { MarketCategory, MarketStatus } from "@/types/market"

export default function MarketsPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<MarketCategory | "all">("all")
	const [selectedStatus, setSelectedStatus] = useState<MarketStatus | "all">("all")
	const [sortBy, setSortBy] = useState<"volume" | "liquidity" | "created" | "ending">("created")
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

	const resetFilters = () => {
		setSelectedCategory("all")
		setSelectedStatus("all")
	}

	const resetSearch = () => {
		setSearchTerm("")
		setSortBy("created")
		setSortOrder("desc")
	}

	return (
		<div className="space-y-8">
			{/* Search + sort */}
			<MarketSearch
				searchQuery={searchTerm}
				onSearchChange={setSearchTerm}
				sortBy={sortBy}
				onSortChange={setSortBy}
				sortOrder={sortOrder}
				onSortOrderChange={setSortOrder}
				onResetSearch={resetSearch}
			/>

			<div className="flex flex-col md:flex-row gap-6">
				{/* Filters sidebar */}
				<div className="w-full md:w-64">
					<MarketFilters
						selectedCategory={selectedCategory}
						onCategoryChange={setSelectedCategory}
						selectedStatus={selectedStatus}
						onStatusChange={setSelectedStatus}
						onResetFilters={resetFilters}
					/>
				</div>

				{/* Market list */}
				<div className="flex-1">
					<MarketList
						searchQuery={searchTerm}
						category={selectedCategory}
						status={selectedStatus}
						sortBy={sortBy}
						sortOrder={sortOrder}
					/>
				</div>
			</div>
		</div>
	)
}
