"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

/**
 * Advanced market filters sidebar
 * Features category filtering, price ranges, and market status filters
 */
export function MarketFilters() {
	const [categoryOpen, setCategoryOpen] = useState(true)
	const [statusOpen, setStatusOpen] = useState(true)
	const [priceRange, setPriceRange] = useState([0, 100])
	const [liquidityRange, setLiquidityRange] = useState([0, 1000000])

	const categories = [
		{ name: "Crypto", count: 342, color: "bg-orange-500" },
		{ name: "Politics", count: 189, color: "bg-blue-500" },
		{ name: "Sports", count: 156, color: "bg-green-500" },
		{ name: "Technology", count: 98, color: "bg-purple-500" },
		{ name: "Economics", count: 87, color: "bg-red-500" },
		{ name: "Entertainment", count: 76, color: "bg-pink-500" },
		{ name: "Science", count: 45, color: "bg-teal-500" },
		{ name: "Weather", count: 32, color: "bg-cyan-500" },
	]

	const statuses = [
		{ name: "Open", count: 1089, checked: true },
		{ name: "Closing Soon", count: 67, checked: false },
		{ name: "Recently Closed", count: 91, checked: false },
	]

	return (
		<div className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-white/10 rounded-xl shadow-lg p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Filters</h3>
				<Button variant="ghost" size="sm" className="text-primary">
					Clear All
				</Button>
			</div>

			{/* Categories */}
			<Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" className="w-full justify-between p-0 h-auto">
						<span className="font-medium">Categories</span>
						{categoryOpen ? (
							<ChevronDown className="w-4 h-4" />
						) : (
							<ChevronRight className="w-4 h-4" />
						)}
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-3 mt-3">
					{categories.map((category) => (
						<div key={category.name} className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Checkbox id={category.name} />
								<div className="flex items-center space-x-2">
									<div className={`w-3 h-3 rounded-full ${category.color}`} />
									<label
										htmlFor={category.name}
										className="text-sm cursor-pointer">
										{category.name}
									</label>
								</div>
							</div>
							<Badge variant="outline" className="text-xs">
								{category.count}
							</Badge>
						</div>
					))}
				</CollapsibleContent>
			</Collapsible>

			{/* Market Status */}
			<Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" className="w-full justify-between p-0 h-auto">
						<span className="font-medium">Status</span>
						{statusOpen ? (
							<ChevronDown className="w-4 h-4" />
						) : (
							<ChevronRight className="w-4 h-4" />
						)}
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-3 mt-3">
					{statuses.map((status) => (
						<div key={status.name} className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Checkbox id={status.name} defaultChecked={status.checked} />
								<label htmlFor={status.name} className="text-sm cursor-pointer">
									{status.name}
								</label>
							</div>
							<Badge variant="outline" className="text-xs">
								{status.count}
							</Badge>
						</div>
					))}
				</CollapsibleContent>
			</Collapsible>

			{/* Price Range */}
			<div className="space-y-3">
				<h4 className="font-medium">Price Range</h4>
				<div className="px-2">
					<Slider
						value={priceRange}
						onValueChange={setPriceRange}
						max={100}
						step={1}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground mt-2">
						<span>${priceRange[0]}</span>
						<span>${priceRange[1]}</span>
					</div>
				</div>
			</div>

			{/* Liquidity Range */}
			<div className="space-y-3">
				<h4 className="font-medium">Minimum Liquidity</h4>
				<div className="px-2">
					<Slider
						value={liquidityRange}
						onValueChange={setLiquidityRange}
						max={1000000}
						step={1000}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground mt-2">
						<span>${liquidityRange[0].toLocaleString()}</span>
						<span>${liquidityRange[1].toLocaleString()}</span>
					</div>
				</div>
			</div>

			{/* Time Filters */}
			<div className="space-y-3">
				<h4 className="font-medium">Time to Resolution</h4>
				<div className="space-y-2">
					{[
						"Next 24 hours",
						"Next week",
						"Next month",
						"Next 3 months",
						"Beyond 3 months",
					].map((timeframe) => (
						<div key={timeframe} className="flex items-center space-x-3">
							<Checkbox id={timeframe} />
							<label htmlFor={timeframe} className="text-sm cursor-pointer">
								{timeframe}
							</label>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
