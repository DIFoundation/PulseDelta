import { CouncilOverview } from "@/components/CouncilOverview"
import { ProposalList } from "@/components/ProposalList"
import { VotingPower } from "@/components/VotingPower"
import { CouncilMarketApproval } from "@/components/CouncilMarketApproval"
import { CouncilManagement } from "@/components/CouncilManagement"
import { CouncilAccessGuard } from "@/components/CouncilAccessGuard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Council governance page for platform governance and proposals
 * Features proposal voting, delegation, and governance participation
 */
export default function CouncilPage() {
	return (
		<CouncilAccessGuard>
			<div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold mb-2">PulseDelta Council</h1>
						<p className="text-muted-foreground">
							Manage platform governance, review markets, and shape the future of PulseDelta
						</p>
					</div>

					<Tabs defaultValue="overview" className="space-y-6">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="markets">Market Review</TabsTrigger>
							<TabsTrigger value="management">Council Management</TabsTrigger>
							<TabsTrigger value="proposals">Proposals</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-8">
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
						</TabsContent>

						<TabsContent value="markets">
							<CouncilMarketApproval />
						</TabsContent>

						<TabsContent value="management">
							<CouncilManagement />
						</TabsContent>

						<TabsContent value="proposals">
							<div className="space-y-8">
								<CouncilOverview />
								<ProposalList />
							</div>
						</TabsContent>
					</Tabs>
				</main>
			</div>
		</CouncilAccessGuard>
	)
}
