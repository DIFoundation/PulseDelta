/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from "framer-motion"
import Link from "next/link"
import { TrendingUp, TrendingDown, Clock, Droplets, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Market } from "@/types/market"

interface MarketCardProps {
	market: Market
	showQuickTrade?: boolean
	onQuickTrade?: (marketId: string, outcomeIndex: number) => void
}

/**
 * Market card component with glassmorphism design and smooth animations
 * Displays key market information and trading opportunities
 */
export function MarketCard({ market, showQuickTrade = false, onQuickTrade }: MarketCardProps) {
	const timeLeft = Math.max(0, market.endTime - Date.now() / 1000)
	const daysLeft = Math.floor(timeLeft / (24 * 60 * 60))
	const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))

	const leadingOutcome = market.outcomeShares.reduce((prev, current) =>
		parseFloat(current.price) > parseFloat(prev.price) ? current : prev
	)

	const cardVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.3 },
		},
		hover: {
			y: -5,
			transition: { duration: 0.2 },
		},
	}

	const outcomeVariants = {
		hidden: { opacity: 0, x: -10 },
		visible: { opacity: 1, x: 0 },
		hover: { scale: 1.02 },
	}

	const formatPrice = (price: string) => {
		return `$${parseFloat(price).toFixed(3)}`
	}

	const formatVolume = (volume: string) => {
		const vol = parseFloat(volume)
		if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`
		if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`
		return `$${vol.toFixed(0)}`
	}

	const getCategoryColor = (category: string) => {
		const colors = {
			sports: "bg-blue-500/10 text-blue-400 border-blue-500/20",
			crypto: "bg-orange-500/10 text-orange-400 border-orange-500/20",
			politics: "bg-purple-500/10 text-purple-400 border-purple-500/20",
			entertainment: "bg-pink-500/10 text-pink-400 border-pink-500/20",
			technology: "bg-green-500/10 text-green-400 border-green-500/20",
			economics: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
		}
		return colors[category as keyof typeof colors] || colors.sports
	}

	return (
		<motion.div
			variants={cardVariants}
			initial="hidden"
			animate="visible"
			whileHover="hover"
			className="glass-card p-6 cursor-pointer group">
			<Link href={`/market/${market.id}`} className="block">
				{/* Header */}
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<Badge className={getCategoryColor(market.category)}>
								{market.category}
							</Badge>
							{market.resolved && <Badge variant="secondary">Resolved</Badge>}
						</div>
						<h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
							{market.title}
						</h3>
					</div>
					<div className="text-right ml-4">
						<div className="text-2xl font-bold text-primary">
							{formatPrice(leadingOutcome.price)}
						</div>
						<div className="text-sm text-muted-foreground">Leading</div>
					</div>
				</div>

				{/* Outcomes */}
				<div className="space-y-2 mb-4">
					{market.outcomeShares.slice(0, 2).map((outcome, index) => (
						<motion.div
							key={outcome.outcomeIndex}
							variants={outcomeVariants}
							className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">
									{market.outcomes[outcome.outcomeIndex]}
								</span>
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									{outcome.priceChange24h > 0 ? (
										<TrendingUp className="w-3 h-3 text-success" />
									) : (
										<TrendingDown className="w-3 h-3 text-danger" />
									)}
									<span
										className={
											outcome.priceChange24h > 0
												? "text-success"
												: "text-danger"
										}>
										{Math.abs(outcome.priceChange24h).toFixed(1)}%
									</span>
								</div>
							</div>
							<div className="text-right">
								<div className="font-semibold">{formatPrice(outcome.price)}</div>
								<Progress
									value={parseFloat(outcome.price) * 100}
									className="w-16 h-1 mt-1"
								/>
							</div>
						</motion.div>
					))}
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 text-center text-sm">
					<div>
						<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
							<Droplets className="w-3 h-3" />
							<span>Liquidity</span>
						</div>
						<div className="font-semibold">{formatVolume(market.totalLiquidity)}</div>
					</div>
					<div>
						<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
							<BarChart3 className="w-3 h-3" />
							<span>Volume</span>
						</div>
						<div className="font-semibold">{formatVolume(market.volume24h)}</div>
					</div>
					<div>
						<div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
							<Clock className="w-3 h-3" />
							<span>Ends</span>
						</div>
						<div className="font-semibold">
							{daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`}
						</div>
					</div>
				</div>
			</Link>

			{/* Quick Trade Actions */}
			{showQuickTrade && onQuickTrade && !market.resolved && (
				<motion.div
					className="mt-4 pt-4 border-t border-glass-border"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					transition={{ delay: 0.1 }}>
					<div className="grid grid-cols-2 gap-2">
						<Button
							size="sm"
							className="buy-gradient text-white hover:opacity-90"
							onClick={(e) => {
								e.preventDefault()
								onQuickTrade(market.id, 0)
							}}>
							Buy Yes
						</Button>
						<Button
							size="sm"
							className="sell-gradient text-white hover:opacity-90"
							onClick={(e) => {
								e.preventDefault()
								onQuickTrade(market.id, 1)
							}}>
							Buy No
						</Button>
					</div>
				</motion.div>
			)}
		</motion.div>
	)
}
