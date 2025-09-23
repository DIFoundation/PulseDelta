"use client"

import { Search, Filter, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

/**
 * Hero section with search and filters
 * Features glassmorphism design and smooth animations
 */
export function HeroSection() {
	return (
		<section className="relative py-20 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12">
					<h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
						Trade the Future
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
						Decentralized prediction markets powered by collective intelligence. Bet on
						outcomes, provide liquidity, and earn rewards.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-white/10 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<Input
								placeholder="Search markets..."
								className="pl-10 backdrop-blur-sm bg-input/50 border-border/20"
							/>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								className="backdrop-blur-sm bg-transparent border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
								<Filter className="w-4 h-4 mr-2" />
								Filters
							</Button>
							<Button className="bg-primary hover:bg-primary/90">
								<TrendingUp className="w-4 h-4 mr-2" />
								Trending
							</Button>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
