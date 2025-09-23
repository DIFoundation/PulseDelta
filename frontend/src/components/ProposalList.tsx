"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Vote, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock proposal data
const mockProposals = [
	{
		id: "1",
		title: "Reduce Trading Fees to 1.5%",
		description:
			"Proposal to reduce the current 2% trading fee to 1.5% to increase market competitiveness and trading volume.",
		status: "active",
		type: "fee-change",
		author: "0x1234...5678",
		created: "2024-01-15",
		endDate: "2024-01-22",
		votesFor: 1247,
		votesAgainst: 389,
		totalVotes: 1636,
		quorum: 2000,
		userVoted: false,
	},
	{
		id: "2",
		title: "Add Weather Prediction Markets",
		description:
			"Enable creation of weather-based prediction markets including temperature, precipitation, and extreme weather events.",
		status: "active",
		type: "feature-addition",
		author: "0x9876...5432",
		created: "2024-01-14",
		endDate: "2024-01-21",
		votesFor: 892,
		votesAgainst: 234,
		totalVotes: 1126,
		quorum: 2000,
		userVoted: true,
	},
	{
		id: "3",
		title: "Implement Market Maker Incentives",
		description:
			"Introduce additional rewards for liquidity providers to improve market depth and reduce slippage.",
		status: "passed",
		type: "incentive-program",
		author: "0x5555...7777",
		created: "2024-01-10",
		endDate: "2024-01-17",
		votesFor: 2156,
		votesAgainst: 445,
		totalVotes: 2601,
		quorum: 2000,
		userVoted: true,
	},
]

/**
 * Proposal list component with voting interface
 * Features proposal filtering, voting actions, and detailed proposal views
 */
export function ProposalList() {
	const [selectedTab, setSelectedTab] = useState("active")

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "active":
				return <AlertCircle className="w-4 h-4 text-primary" />
			case "passed":
				return <CheckCircle className="w-4 h-4 text-secondary" />
			case "failed":
				return <XCircle className="w-4 h-4 text-accent" />
			default:
				return <Clock className="w-4 h-4 text-muted-foreground" />
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "border-primary/20 bg-primary/5"
			case "passed":
				return "border-secondary/20 bg-secondary/5"
			case "failed":
				return "border-accent/20 bg-accent/5"
			default:
				return "border-border/20 bg-muted/5"
		}
	}

	const filteredProposals = mockProposals.filter((proposal) => {
		if (selectedTab === "active") return proposal.status === "active"
		if (selectedTab === "passed") return proposal.status === "passed"
		if (selectedTab === "failed") return proposal.status === "failed"
		return true
	})

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, delay: 0.2 }}
			className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-white/10 rounded-xl shadow-lg p-6">
			<h2 className="text-2xl font-bold mb-6">Proposals</h2>

			<Tabs value={selectedTab} onValueChange={setSelectedTab}>
				<TabsList className="grid w-full grid-cols-4 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10 rounded-xl shadow-lg mb-6">
					<TabsTrigger value="all">All</TabsTrigger>
					<TabsTrigger value="active">Active</TabsTrigger>
					<TabsTrigger value="passed">Passed</TabsTrigger>
					<TabsTrigger value="failed">Failed</TabsTrigger>
				</TabsList>

				<TabsContent value={selectedTab} className="space-y-4">
					{filteredProposals.map((proposal, index) => (
						<motion.div
							key={proposal.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
							className={`p-6 rounded-lg border ${getStatusColor(proposal.status)}`}>
							{/* Proposal Header */}
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1">
									<div className="flex items-center space-x-3 mb-2">
										{getStatusIcon(proposal.status)}
										<h3 className="text-lg font-semibold">{proposal.title}</h3>
										<Badge variant="outline" className="text-xs">
											{proposal.type}
										</Badge>
									</div>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{proposal.description}
									</p>
								</div>
							</div>

							{/* Proposal Meta */}
							<div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
								<div className="flex items-center space-x-1">
									<Users className="w-4 h-4" />
									<span>By {proposal.author}</span>
								</div>
								<div className="flex items-center space-x-1">
									<Clock className="w-4 h-4" />
									<span>
										Ends {new Date(proposal.endDate).toLocaleDateString()}
									</span>
								</div>
							</div>

							{/* Voting Progress */}
							<div className="space-y-3 mb-4">
								<div className="flex justify-between text-sm">
									<span>Voting Progress</span>
									<span className="font-medium">
										{proposal.totalVotes.toLocaleString()} /{" "}
										{proposal.quorum.toLocaleString()} votes
									</span>
								</div>
								<Progress
									value={(proposal.totalVotes / proposal.quorum) * 100}
									className="h-2"
								/>

								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="flex justify-between">
										<span className="text-secondary">For:</span>
										<span className="font-medium">
											{proposal.votesFor.toLocaleString()} (
											{(
												(proposal.votesFor / proposal.totalVotes) *
												100
											).toFixed(1)}
											%)
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-accent">Against:</span>
										<span className="font-medium">
											{proposal.votesAgainst.toLocaleString()} (
											{(
												(proposal.votesAgainst / proposal.totalVotes) *
												100
											).toFixed(1)}
											%)
										</span>
									</div>
								</div>
							</div>

							{/* Voting Actions */}
							{proposal.status === "active" && (
								<div className="flex items-center justify-between pt-4 border-t border-border/20">
									<div className="text-sm text-muted-foreground">
										{proposal.userVoted
											? "You have voted on this proposal"
											: "You haven't voted yet"}
									</div>
									{!proposal.userVoted && (
										<div className="flex space-x-2">
											<Button
												size="sm"
												className="bg-secondary hover:bg-secondary/90">
												<Vote className="w-4 h-4 mr-2" />
												Vote For
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="border-accent text-accent hover:bg-accent/10 bg-transparent">
												<Vote className="w-4 h-4 mr-2" />
												Vote Against
											</Button>
										</div>
									)}
								</div>
							)}
						</motion.div>
					))}
				</TabsContent>
			</Tabs>
		</motion.div>
	)
}
