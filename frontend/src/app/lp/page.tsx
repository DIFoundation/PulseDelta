import { LpDashboard } from "@/components/lpDashboard"

/**
 * Liquidity provider dashboard page
 * Shows all LP positions, earnings, and management tools
 */
export default function LpPage() {
	return (
		<div className="min-h-screen">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<LpDashboard />
			</main>
		</div>
	)
}
