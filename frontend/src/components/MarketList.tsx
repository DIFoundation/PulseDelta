/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketCard } from "@/components/MarketCard"
import { mockMarkets } from "@/mock/mockMarkets"
import { MarketCategory, MarketStatus, Market } from "@/types/market"

interface MarketListProps {
	searchQuery: string
	category: MarketCategory | "all"
	status: MarketStatus | "all"
	sortBy: "volume" | "liquidity" | "created" | "ending"
	sortOrder: "asc" | "desc"
}

export function MarketList({ searchQuery, category, status, sortBy, sortOrder }: MarketListProps) {
	const [currentPage, setCurrentPage] = useState(1)
	const marketsPerPage = 9

	// 🔎 Filtering + sorting logic
	const filteredMarkets = useMemo(() => {
		let result = [...mockMarkets]

		// Search
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase()
			result = result.filter(
				(m) =>
					m.title.toLowerCase().includes(q) ||
					m.description.toLowerCase().includes(q) ||
					m.metadata?.tags?.some((tag) => tag.toLowerCase().includes(q))
			)
		}

		// Category
		if (category !== "all") {
			result = result.filter((m) => m.category === category)
		}

		// Status
		if (status !== "all") {
			const now = Date.now()
			result = result.filter((m) => {
				if (status === "open") return !m.resolved && m.endTime > now
				if (status === "closed") return !m.resolved && m.endTime <= now
				if (status === "resolved") return m.resolved
				if (status === "disputed") return m.metadata?.verificationLevel === "unverified"
				return true
			})
		}

		// Sorting
		result.sort((a, b) => {
			let valA = 0
			let valB = 0
			switch (sortBy) {
				case "volume":
					valA = parseFloat(a.volume24h)
					valB = parseFloat(b.volume24h)
					break
				case "liquidity":
					valA = parseFloat(a.totalLiquidity)
					valB = parseFloat(b.totalLiquidity)
					break
				case "created":
					valA = a.createdAt
					valB = b.createdAt
					break
				case "ending":
					valA = a.endTime
					valB = b.endTime
					break
			}
			return sortOrder === "asc" ? valA - valB : valB - valA
		})

		return result
	}, [searchQuery, category, status, sortBy, sortOrder])

	// Pagination
	const totalPages = Math.ceil(filteredMarkets.length / marketsPerPage)
	const startIndex = (currentPage - 1) * marketsPerPage
	const endIndex = startIndex + marketsPerPage
	const currentMarkets = filteredMarkets.slice(startIndex, endIndex)

	const goToPage = (page: number) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	return (
		<div className="space-y-6">
			{/* Market Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				{currentMarkets.map((market, index) => (
					<motion.div
						key={market.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: index * 0.05 }}>
						<MarketCard market={market} />
					</motion.div>
				))}
			</div>

			{/* Pagination */}
			{filteredMarkets.length > marketsPerPage && (
				<div className="flex items-center justify-between bg-white/90 dark:bg-gray-900/90 border rounded-xl shadow-lg p-4">
					<div className="text-sm text-muted-foreground">
						Showing {startIndex + 1}-{Math.min(endIndex, filteredMarkets.length)} of{" "}
						{filteredMarkets.length} markets
					</div>

					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => goToPage(currentPage - 1)}
							disabled={currentPage === 1}>
							<ChevronLeft className="w-4 h-4" />
						</Button>

						{/* Page numbers */}
						<div className="flex items-center space-x-1">
							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								let pageNum: number
								if (totalPages <= 5) pageNum = i + 1
								else if (currentPage <= 3) pageNum = i + 1
								else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
								else pageNum = currentPage - 2 + i

								return (
									<Button
										key={pageNum}
										variant={currentPage === pageNum ? "default" : "outline"}
										size="sm"
										onClick={() => goToPage(pageNum)}>
										{pageNum}
									</Button>
								)
							})}
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => goToPage(currentPage + 1)}
							disabled={currentPage === totalPages}>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
