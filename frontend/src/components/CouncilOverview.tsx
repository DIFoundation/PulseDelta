"use client"

import { motion } from "framer-motion"
import { Users, Vote, Clock, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

/**
 * Council overview component showing governance statistics
 * Features voting participation, active proposals, and council metrics
 */
export function CouncilOverview() {
	const stats = [
		{
			label: "Active Proposals",
			value: "12",
			change: "+3",
			icon: Vote,
			color: "text-primary",
		},
		{
			label: "Council Members",
			value: "2,847",
			change: "+127",
			icon: Users,
			color: "text-secondary",
		},
		{
			label: "Voting Power",
			value: "1.2M",
			change: "+5.2%",
			icon: TrendingUp,
			color: "text-accent",
		},
		{
			label: "Avg. Participation",
			value: "68%",
			change: "+2.1%",
			icon: Clock,
			color: "text-primary",
		},
	]

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-white/10 rounded-xl shadow-lg p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold">Governance Overview</h2>
				<Badge variant="outline" className="bg-primary/10 text-primary">
					Season 3
				</Badge>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				{stats.map((stat, index) => {
					const Icon = stat.icon
					return (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
							className="text-center p-4 rounded-lg bg-muted/20 border border-border/20">
							<Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
							<div className="text-2xl font-bold">{stat.value}</div>
							<div className="text-sm text-muted-foreground">{stat.label}</div>
							<div className="text-xs text-secondary mt-1">{stat.change}</div>
						</motion.div>
					)
				})}
			</div>

			{/* Current Voting Cycle */}
			<div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
				<div className="flex items-center justify-between mb-3">
					<h3 className="font-semibold text-primary">Current Voting Cycle</h3>
					<Badge variant="outline" className="text-xs">
						5 days left
					</Badge>
				</div>
				<p className="text-sm text-muted-foreground mb-3">
					Vote on 12 active proposals including fee structure updates, new market
					categories, and platform improvements.
				</p>
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Participation Rate</span>
						<span className="font-medium">68% (1,934 votes)</span>
					</div>
					<Progress value={68} className="h-2" />
				</div>
			</div>
		</motion.div>
	)
}
