"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketCard } from "@/components/MarketCard"
import { mockMarkets } from "@/mock/mockMarkets"

/**
 * Market list component with pagination
 * Features responsive grid layout and smooth page transitions
 */
export function MarketList() {
	const [currentPage, setCurrentPage] = useState(1)
	const marketsPerPage = 9
	const totalPages = Math.ceil(mockMarkets.length / marketsPerPage)

	const startIndex = (currentPage - 1) * marketsPerPage
	const endIndex = startIndex + marketsPerPage
	const currentMarkets = mockMarkets.slice(startIndex, endIndex)

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
			<div className="flex items-center justify-between backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-white/10 rounded-xl shadow-lg p-4">
				<div className="text-sm text-muted-foreground">
					Showing {startIndex + 1}-{Math.min(endIndex, mockMarkets.length)} of{" "}
					{mockMarkets.length} markets
				</div>

				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
						<ChevronLeft className="w-4 h-4" />
					</Button>

					{/* Page Numbers */}
					<div className="flex items-center space-x-1">
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							let pageNum: number
							if (totalPages <= 5) {
								pageNum = i + 1
							} else if (currentPage <= 3) {
								pageNum = i + 1
							} else if (currentPage >= totalPages - 2) {
								pageNum = totalPages - 4 + i
							} else {
								pageNum = currentPage - 2 + i
							}

							return (
								<Button
									key={pageNum}
									variant={currentPage === pageNum ? "default" : "outline"}
									size="sm"
									onClick={() => goToPage(pageNum)}
									className={
										currentPage === pageNum
											? "bg-primary"
											: "backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10 rounded-xl shadow-lg"
									}>
									{pageNum}
								</Button>
							)
						})}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	)
}
