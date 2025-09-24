import { CouncilOverview } from "@/components/CouncilOverview"
import { ProposalList } from "@/components/ProposalList"
import { VotingPower } from "@/components/VotingPower"

/**
 * Council governance page for platform governance and proposals
 * Features proposal voting, delegation, and governance participation
 */
export default function CouncilPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">PulseDelta Council</h1>
					<p className="text-muted-foreground">
						Participate in platform governance, vote on proposals, and shape the future
						of PulseDelta
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						<CouncilOverview />
						<ProposalList />
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						<VotingPower />
					</div>
				</div>
			</main>
		</div>
	)
}
