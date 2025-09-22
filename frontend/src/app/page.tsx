"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import {
	Search,
	Filter,
	TrendingUp,
	Zap,
	Target,
	ArrowRight,
	BarChart3,
	Users,
	Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MarketCard } from "@/components/MarketCard"
import { Badge } from "@/components/ui/badge"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useMarketList } from "@/hooks/useMarket"
import { toast } from "@/hooks/use-toast"

/**
 * Main landing page with hero section and market feed
 * Includes search, filtering, and quick trading functionality
 */
export default function Index() {
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<string>("all")
	const [sortBy, setSortBy] = useState<string>("volume")

	const { data: markets, isLoading } = useMarketList(0, 20, {
		category: selectedCategory === "all" ? undefined : selectedCategory,
		search: searchTerm,
	})

	const handleQuickTrade = (marketId: string, outcomeIndex: number) => {
		toast({
			title: "Quick Trade",
			description: `Opening trade modal for market ${marketId}, outcome ${outcomeIndex}`,
		})
		// TODO: Implement quick trade modal
	}

	const categories = [
		{ value: "all", label: "All Markets" },
		{ value: "crypto", label: "Crypto" },
		{ value: "sports", label: "Sports" },
		{ value: "politics", label: "Politics" },
		{ value: "entertainment", label: "Entertainment" },
		{ value: "technology", label: "Technology" },
	]

	const sortOptions = [
		{ value: "volume", label: "Volume" },
		{ value: "liquidity", label: "Liquidity" },
		{ value: "created", label: "Recently Created" },
		{ value: "ending", label: "Ending Soon" },
	]

	const heroVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, staggerChildren: 0.1 },
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	}

	const statVariants = {
		hidden: { opacity: 0, scale: 0.9 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.4 },
		},
	}

	return (
		<div className="space-y-12">
			{/* Hero Section */}
			<motion.section
				className="text-center py-16"
				variants={heroVariants}
				initial="hidden"
				animate="visible">
				<motion.div variants={itemVariants}>
					<Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
						<Zap className="w-3 h-3 mr-1" />
						Web3 Prediction Markets
					</Badge>
				</motion.div>

				<motion.h1
					className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent-success bg-clip-text text-transparent"
					variants={itemVariants}>
					Predict the Future
				</motion.h1>

				<motion.p
					className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
					variants={itemVariants}>
					Trade on outcomes of real-world events with transparent, decentralized markets
					powered by blockchain technology.
				</motion.p>

				<motion.div
					className="flex flex-col sm:flex-row gap-4 justify-center items-center"
					variants={itemVariants}>
					<Button size="lg" className="primary-gradient text-primary-foreground px-8">
						<Target className="mr-2 h-5 w-5" />
						Explore Markets
					</Button>
					<Button size="lg" variant="outline" className="glass-card">
						<TrendingUp className="mr-2 h-5 w-5" />
						Create Market
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</motion.div>

				{/* Stats */}
				<motion.div
					className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
					variants={itemVariants}>
					<motion.div variants={statVariants} className="glass-card p-6 text-center">
						<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
							<BarChart3 className="w-6 h-6 text-primary" />
						</div>
						<div className="text-3xl font-bold text-primary mb-2">$2.4M</div>
						<div className="text-sm text-muted-foreground">Total Volume</div>
					</motion.div>

					<motion.div variants={statVariants} className="glass-card p-6 text-center">
						<div className="w-12 h-12 bg-accent-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
							<Users className="w-6 h-6 text-accent-success" />
						</div>
						<div className="text-3xl font-bold text-accent-success mb-2">12,450</div>
						<div className="text-sm text-muted-foreground">Active Traders</div>
					</motion.div>

					<motion.div variants={statVariants} className="glass-card p-6 text-center">
						<div className="w-12 h-12 bg-accent-danger/10 rounded-lg flex items-center justify-center mx-auto mb-4">
							<Globe className="w-6 h-6 text-accent-danger" />
						</div>
						<div className="text-3xl font-bold text-accent-danger mb-2">847</div>
						<div className="text-sm text-muted-foreground">Active Markets</div>
					</motion.div>
				</motion.div>
			</motion.section>

			{/* Market Feed */}
			<section>
				<motion.div
					className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}>
					<div>
						<h2 className="text-3xl font-bold mb-2">Active Markets</h2>
						<p className="text-muted-foreground">
							Trade on the most popular prediction markets
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<Input
								placeholder="Search markets..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 w-full sm:w-64 glass-card"
							/>
						</div>

						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className="w-full sm:w-40 glass-card">
								<Filter className="w-4 h-4 mr-2" />
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="glass-card border-glass-border">
								{categories.map((category) => (
									<SelectItem key={category.value} value={category.value}>
										{category.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-full sm:w-32 glass-card">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="glass-card border-glass-border">
								{sortOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</motion.div>

				{/* Markets Grid */}
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="glass-card p-6 animate-pulse">
								<div className="h-4 bg-muted rounded mb-4"></div>
								<div className="h-8 bg-muted rounded mb-4"></div>
								<div className="space-y-2">
									<div className="h-3 bg-muted rounded"></div>
									<div className="h-3 bg-muted rounded w-2/3"></div>
								</div>
							</div>
						))}
					</div>
				) : (
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}>
						{markets?.map((market, index) => (
							<motion.div
								key={market.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 * index }}>
								<MarketCard
									market={market}
									showQuickTrade={true}
									onQuickTrade={handleQuickTrade}
								/>
							</motion.div>
						))}
					</motion.div>
				)}

				{/* Load More */}
				<motion.div
					className="text-center mt-12"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}>
					<Button variant="outline" size="lg" className="glass-card hover:bg-primary/5">
						Load More Markets
					</Button>
				</motion.div>
			</section>
		</div>
	)
}
