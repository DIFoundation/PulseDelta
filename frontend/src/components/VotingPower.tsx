"use client"

import { motion } from "framer-motion"
import { Zap, Users, TrendingUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

/**
 * Voting power component showing user's governance participation
 * Features delegation options, voting history, and power calculations
 */
export function VotingPower() {
	const userStats = {
		votingPower: 1247,
		delegatedPower: 892,
		totalPower: 2139,
		participationRate: 85,
		proposalsVoted: 23,
		delegators: 12,
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.6, delay: 0.1 }}
			className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-white/10 rounded-xl shadow-lg p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-semibold">Your Voting Power</h3>
				<Badge variant="outline" className="bg-primary/10 text-primary">
					Rank #127
				</Badge>
			</div>

			{/* Power Breakdown */}
			<div className="space-y-4">
				<div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
					<div className="text-3xl font-bold text-primary mb-1">
						{userStats.totalPower.toLocaleString()}
					</div>
					<div className="text-sm text-muted-foreground">Total Voting Power</div>
				</div>

				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="text-center p-3 rounded-lg bg-muted/20">
						<div className="text-lg font-bold">
							{userStats.votingPower.toLocaleString()}
						</div>
						<div className="text-muted-foreground">Your Power</div>
					</div>
					<div className="text-center p-3 rounded-lg bg-muted/20">
						<div className="text-lg font-bold">
							{userStats.delegatedPower.toLocaleString()}
						</div>
						<div className="text-muted-foreground">Delegated</div>
					</div>
				</div>
			</div>

			{/* Participation Stats */}
			<div className="space-y-4">
				<h4 className="font-semibold">Participation</h4>

				<div className="space-y-3">
					<div className="flex justify-between text-sm">
						<span>Participation Rate</span>
						<span className="font-medium">{userStats.participationRate}%</span>
					</div>
					<Progress value={userStats.participationRate} className="h-2" />
				</div>

				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="flex items-center space-x-2">
						<Users className="w-4 h-4 text-secondary" />
						<div>
							<div className="font-medium">{userStats.delegators}</div>
							<div className="text-muted-foreground">Delegators</div>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<TrendingUp className="w-4 h-4 text-accent" />
						<div>
							<div className="font-medium">{userStats.proposalsVoted}</div>
							<div className="text-muted-foreground">Votes Cast</div>
						</div>
					</div>
				</div>
			</div>

			{/* Delegation */}
			<div className="space-y-3">
				<h4 className="font-semibold">Delegation</h4>
				<p className="text-sm text-muted-foreground">
					Delegate your voting power to trusted community members or vote directly on
					proposals.
				</p>
				<div className="space-y-2">
					<Button className="w-full bg-primary hover:bg-primary/90">
						<Zap className="w-4 h-4 mr-2" />
						Delegate Power
					</Button>
					<Button
						variant="outline"
						className="w-full backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
						View Delegations
					</Button>
				</div>
			</div>

			{/* Info Box */}
			<div className="p-4 rounded-lg bg-muted/10 border border-border/20">
				<div className="flex items-start space-x-3">
					<Info className="w-5 h-5 text-primary mt-0.5" />
					<div>
						<h4 className="font-semibold text-primary mb-2">How Voting Power Works</h4>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Your voting power is based on your PULSE token holdings and trading
							activity. You can delegate power to others or vote directly on
							proposals.
						</p>
					</div>
				</div>
			</div>
		</motion.div>
	)
}
