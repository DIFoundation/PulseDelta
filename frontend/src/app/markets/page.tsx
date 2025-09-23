import { MarketSearch } from "@/components/MarketSearch"
import { MarketFilters } from "@/components/MarketFilters"
import { MarketList } from "@/components/MarketList"

export default function MarketsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
					<p className="text-muted-foreground">
						Discover and trade on thousands of prediction markets across all categories
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Filters Sidebar */}
					<div className="lg:col-span-1">
						<MarketFilters />
					</div>

					{/* Main Content */}
					<div className="lg:col-span-3 space-y-6">
						<MarketSearch />
						<MarketList />
					</div>
				</div>
			</main>
		</div>
	)
}
