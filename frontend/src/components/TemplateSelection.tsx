"use client"

import { motion } from "framer-motion"
import { TrendingUp, Zap, Trophy, Globe, Coins, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MarketTemplate } from "@/components/MarketCreationWizard"

const marketTemplates: MarketTemplate[] = [
	{
		id: "binary-prediction",
		name: "Binary Prediction",
		description: "Simple yes/no prediction markets for any future event",
		category: "General",
		icon: "TrendingUp",
		outcomes: ["Yes", "No"],
		resolutionCriteria:
			"Market resolves based on objective verification of the predicted event",
		examples: [
			"Will Bitcoin reach $100,000 by end of 2024?",
			"Will it rain tomorrow in New York?",
			"Will the next iPhone have USB-C?",
		],
	},
	{
		id: "election",
		name: "Election Prediction",
		description: "Predict election outcomes and political events",
		category: "Politics",
		icon: "Trophy",
		outcomes: ["Candidate A", "Candidate B", "Other"],
		resolutionCriteria: "Market resolves based on official election results",
		examples: [
			"2024 US Presidential Election Winner",
			"Next UK Prime Minister",
			"California Governor Race 2026",
		],
	},
	{
		id: "sports",
		name: "Sports Betting",
		description: "Predict sports game outcomes and tournament winners",
		category: "Sports",
		icon: "Trophy",
		outcomes: ["Team A Wins", "Team B Wins", "Draw"],
		resolutionCriteria: "Market resolves based on official game/tournament results",
		examples: ["Super Bowl 2025 Winner", "World Cup 2026 Champion", "NBA Finals Game 7 Winner"],
	},
	{
		id: "crypto",
		name: "Crypto Price",
		description: "Predict cryptocurrency price movements and milestones",
		category: "Crypto",
		icon: "Coins",
		outcomes: ["Above Target", "Below Target"],
		resolutionCriteria: "Market resolves based on price data from major exchanges",
		examples: [
			"Will ETH reach $5,000 this year?",
			"Will Solana outperform Bitcoin in 2024?",
			"Will any altcoin reach $1 trillion market cap?",
		],
	},
	{
		id: "stocks",
		name: "Stock Market",
		description: "Predict stock prices and market movements",
		category: "Finance",
		icon: "BarChart3",
		outcomes: ["Above Target", "Below Target"],
		resolutionCriteria: "Market resolves based on official stock exchange data",
		examples: [
			"Will Tesla stock hit $300 this quarter?",
			"Will Apple reach $4 trillion market cap?",
			"Will S&P 500 end the year above 5000?",
		],
	},
	{
		id: "technology",
		name: "Tech Predictions",
		description: "Predict technology trends and product launches",
		category: "Technology",
		icon: "Zap",
		outcomes: ["Yes", "No"],
		resolutionCriteria: "Market resolves based on official announcements and verifiable events",
		examples: [
			"Will Apple release AR glasses in 2024?",
			"Will ChatGPT-5 be released this year?",
			"Will Tesla achieve full self-driving?",
		],
	},
]

const iconMap = {
	TrendingUp,
	Trophy,
	Coins,
	BarChart3,
	Zap,
	Globe,
}

interface TemplateSelectionProps {
	selectedTemplate: MarketTemplate | null
	onTemplateSelect: (template: MarketTemplate) => void
}

/**
 * Template selection component for market creation
 * Provides pre-configured templates for common market types
 */
export function TemplateSelection({ selectedTemplate, onTemplateSelect }: TemplateSelectionProps) {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">Choose a Market Template</h2>
				<p className="text-muted-foreground">
					Select a template to get started quickly, or customize your own market structure
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{marketTemplates.map((template, index) => {
					const Icon = iconMap[template.icon as keyof typeof iconMap] || TrendingUp
					const isSelected = selectedTemplate?.id === template.id

					return (
						<motion.div
							key={template.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.1 }}>
							<Button
								variant="outline"
								className={`w-full h-auto p-6 glass-card text-left transition-all duration-200 ${
									isSelected
										? "border-primary bg-primary/5 shadow-lg"
										: "hover:border-primary/50 hover:bg-primary/5"
								}`}
								onClick={() => onTemplateSelect(template)}>
								<div className="flex items-start space-x-4">
									<div
										className={`w-12 h-12 rounded-lg flex items-center justify-center ${
											isSelected
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										}`}>
										<Icon className="w-6 h-6" />
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center space-x-2 mb-2">
											<h3 className="font-semibold">{template.name}</h3>
											<Badge variant="secondary" className="text-xs">
												{template.category}
											</Badge>
										</div>

										<p className="text-sm text-muted-foreground mb-3 leading-relaxed">
											{template.description}
										</p>

										<div className="space-y-2">
											<div className="text-xs text-muted-foreground">
												<strong>Outcomes:</strong>{" "}
												{template.outcomes.join(", ")}
											</div>

											<div className="text-xs text-muted-foreground">
												<strong>Examples:</strong>
											</div>
											<ul className="text-xs text-muted-foreground space-y-1">
												{template.examples.slice(0, 2).map((example, i) => (
													<li key={i} className="truncate">
														• {example}
													</li>
												))}
											</ul>
										</div>
									</div>
								</div>
							</Button>
						</motion.div>
					)
				})}
			</div>

			{selectedTemplate && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					className="glass-card p-6 border border-primary/20 bg-primary/5">
					<h4 className="font-semibold text-primary mb-2">
						Selected Template: {selectedTemplate.name}
					</h4>
					<p className="text-sm text-muted-foreground mb-3">
						{selectedTemplate.resolutionCriteria}
					</p>

					<div className="text-sm">
						<strong className="text-primary">All Examples:</strong>
						<ul className="mt-2 space-y-1 text-muted-foreground">
							{selectedTemplate.examples.map((example, i) => (
								<li key={i}>• {example}</li>
							))}
						</ul>
					</div>
				</motion.div>
			)}
		</div>
	)
}
