import { MarketCreationWizard } from "@/components/MarketCreationWizard"

/**
 * Market creation page with template-based wizard
 * Features guided market creation with validation and preview
 */
export default function CreatePage() {
	return (
		<div className="min-h-screen">
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<MarketCreationWizard />
			</main>
		</div>
	)
}
