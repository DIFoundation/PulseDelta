"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, TrendingUp, Clock, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

/**
 * Advanced market search component with sorting and quick filters
 * Features real-time search, sorting options, and category filters
 */
export function MarketSearch() {
	const [searchQuery, setSearchQuery] = useState("")
	const [sortBy, setSortBy] = useState("volume")
	const [showFilters, setShowFilters] = useState(false)

	const sortOptions = [
		{ value: "volume", label: "Volume", icon: DollarSign },
		{ value: "liquidity", label: "Liquidity", icon: TrendingUp },
		{ value: "newest", label: "Newest", icon: Clock },
		{ value: "ending", label: "Ending Soon", icon: Clock },
	]

	const quickFilters = [
		{ label: "Hot", count: 24 },
		{ label: "New", count: 12 },
		{ label: "Ending Soon", count: 8 },
		{ label: "High Volume", count: 15 },
	]

	return (
		<div className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-white/10 rounded-xl shadow-lg p-6 space-y-4">
			{/* Search Bar */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<Input
						placeholder="Search markets by title, category, or creator..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 backdrop-blur-sm bg-input/50 border-border/20"
					/>
				</div>

				<div className="flex gap-2">
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-40 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{sortOptions.map((option) => {
								const Icon = option.icon
								return (
									<SelectItem key={option.value} value={option.value}>
										<div className="flex items-center space-x-2">
											<Icon className="w-4 h-4" />
											<span>{option.label}</span>
										</div>
									</SelectItem>
								)
							})}
						</SelectContent>
					</Select>

					<Button
						variant="outline"
						onClick={() => setShowFilters(!showFilters)}
						className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
						<SlidersHorizontal className="w-4 h-4 mr-2" />
						Filters
					</Button>
				</div>
			</div>

			{/* Quick Filters */}
			<div className="flex flex-wrap gap-2">
				{quickFilters.map((filter) => (
					<Badge
						key={filter.label}
						variant="outline"
						className="cursor-pointer hover:bg-primary/10 transition-colors">
						{filter.label} ({filter.count})
					</Badge>
				))}
			</div>

			{/* Results Summary */}
			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<span>Showing 1,247 markets</span>
				<span>Updated 2 minutes ago</span>
			</div>
		</div>
	)
}
