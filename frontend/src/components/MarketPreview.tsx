/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { motion } from "framer-motion"
import { Calendar, DollarSign, Users, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface MarketPreviewData {
	title: string
	description: string
	category: string
	outcomes: Array<{
		id: string
		name: string
		description?: string
	}>
	endDate: string
	initialLiquidity?: number
	creatorFee?: number
	resolutionSource?: string
}

interface MarketPreviewProps {
	market: MarketPreviewData
	className?: string
}

/**
 * Market preview component for displaying market details before creation
 * Shows formatted market information with glassmorphism styling
 */
export function MarketPreview({ market, className }: MarketPreviewProps) {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			notation: "compact",
			maximumFractionDigits: 1,
		}).format(amount)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	}

	const getDaysUntilEnd = (dateString: string) => {
		const endDate = new Date(dateString)
		const now = new Date()
		const diffTime = endDate.getTime() - now.getTime()
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
		return diffDays
	}

	const daysUntilEnd = getDaysUntilEnd(market.endDate)

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={cn("space-y-6", className)}>
			{/* Main Market Card */}
			<Card className="glass-card">
				<CardHeader>
					<div className="flex items-start justify-between">
						<Badge variant="secondary" className="bg-primary/10 text-primary">
							{market.category}
						</Badge>
						<Badge
							variant="outline"
							className={cn(
								"text-xs",
								daysUntilEnd > 7 && "border-secondary text-secondary",
								daysUntilEnd <= 7 &&
									daysUntilEnd > 1 &&
									"border-accent text-accent",
								daysUntilEnd <= 1 && "border-destructive text-destructive"
							)}>
							{daysUntilEnd > 0 ? `${daysUntilEnd} days left` : "Ended"}
						</Badge>
					</div>
					<CardTitle className="text-xl font-bold text-balance">{market.title}</CardTitle>
					{market.description && (
						<p className="text-muted-foreground text-pretty">{market.description}</p>
					)}
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Outcomes */}
					<div className="space-y-3">
						<h4 className="font-semibold flex items-center">
							<TrendingUp className="w-4 h-4 mr-2" />
							Possible Outcomes
						</h4>
						<div className="space-y-2">
							{market.outcomes.map((outcome, index) => (
								<div
									key={outcome.id}
									className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
									<div>
										<span className="font-medium">{outcome.name}</span>
										{outcome.description && (
											<p className="text-sm text-muted-foreground mt-1">
												{outcome.description}
											</p>
										)}
									</div>
									<div className="text-right">
										<div className="text-sm text-muted-foreground">
											Initial odds
										</div>
										<div className="font-bold">
											{(100 / market.outcomes.length).toFixed(0)}%
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Market Details */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-3">
							<div className="flex items-center text-sm">
								<Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
								<span className="text-muted-foreground">Ends:</span>
								<span className="ml-2 font-medium">
									{formatDate(market.endDate)}
								</span>
							</div>

							{market.initialLiquidity && (
								<div className="flex items-center text-sm">
									<DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
									<span className="text-muted-foreground">
										Initial Liquidity:
									</span>
									<span className="ml-2 font-medium">
										{formatCurrency(market.initialLiquidity)}
									</span>
								</div>
							)}

							{market.creatorFee && (
								<div className="flex items-center text-sm">
									<Users className="w-4 h-4 mr-2 text-muted-foreground" />
									<span className="text-muted-foreground">Creator Fee:</span>
									<span className="ml-2 font-medium">{market.creatorFee}%</span>
								</div>
							)}
						</div>

						<div className="space-y-3">
							<div className="flex items-center text-sm">
								<Clock className="w-4 h-4 mr-2 text-muted-foreground" />
								<span className="text-muted-foreground">Duration:</span>
								<span className="ml-2 font-medium">
									{Math.abs(daysUntilEnd)} days
								</span>
							</div>

							{market.resolutionSource && (
								<div className="text-sm">
									<span className="text-muted-foreground">
										Resolution Source:
									</span>
									<p className="mt-1 font-medium">{market.resolutionSource}</p>
								</div>
							)}
						</div>
					</div>

					{/* Progress indicator */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Market Setup Progress</span>
							<span className="font-medium">Ready to Create</span>
						</div>
						<Progress value={100} className="h-2" />
					</div>
				</CardContent>
			</Card>

			{/* Action Buttons */}
			{/* <div className="flex gap-3">
				<Button variant="outline" className="flex-1 glass-card bg-transparent">
					Edit Market
				</Button>
				<Button className="flex-1 bg-primary hover:bg-primary/90">Create Market</Button>
			</div> */}
		</motion.div>
	)
}
