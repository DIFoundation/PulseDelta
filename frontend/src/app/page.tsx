/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Shield, Zap, ChevronRight } from "lucide-react"
import Link from "next/link"
import Layout from "@/components/Layout"
import MarketCard from "@/components/MarketCard"
import heroImage from "@/assets/hero-prediction.jpg"
import Image from "next/image"

const featuredMarkets = [
	{
		id: "1",
		question: "Will Bitcoin reach $100,000 by end of 2024?",
		deadline: "Dec 31, 2024",
		yesOdds: 68,
		noOdds: 32,
		totalPool: 45600,
		participants: 1247,
		category: "Crypto",
		status: "open" as const,
	},
	{
		id: "2",
		question: "Will OpenAI release GPT-5 in 2024?",
		deadline: "Dec 31, 2024",
		yesOdds: 34,
		noOdds: 66,
		totalPool: 23400,
		participants: 892,
		category: "AI",
		status: "open" as const,
	},
	{
		id: "3",
		question: "Will Tesla stock close above $300 this quarter?",
		deadline: "Sep 30, 2024",
		yesOdds: 52,
		noOdds: 48,
		totalPool: 18200,
		participants: 634,
		category: "Stocks",
		status: "open" as const,
	},
]

const steps = [
	{
		number: "1",
		title: "Pick Markets",
		description: "Browse prediction markets on topics you know about",
		icon: TrendingUp,
	},
	{
		number: "2",
		title: "Make Predictions",
		description: "Stake tokens on YES or NO outcomes you believe in",
		icon: Zap,
	},
	{
		number: "3",
		title: "Claim Rewards",
		description: "Earn rewards when your predictions come true",
		icon: Shield,
	},
]

const benefits = [
	{
		title: "Fully Decentralized",
		description:
			"No single authority controls outcomes. Markets resolve through blockchain consensus.",
		icon: Shield,
	},
	{
		title: "Transparent & Fair",
		description: "All predictions and payouts are recorded on-chain for complete transparency.",
		icon: TrendingUp,
	},
	{
		title: "Instant Rewards",
		description: "Smart contracts automatically distribute rewards when markets resolve.",
		icon: Zap,
	},
]

export default function Landing() {
	return (
		<Layout>
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
				<div className="container mx-auto px-4 py-20 lg:py-32 relative">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-8">
							<div className="space-y-4">
								<h1 className="text-4xl lg:text-6xl font-bold leading-tight">
									Predict the Future{" "}
									<span className="text-gradient-primary">Earn Rewards</span>
								</h1>
								<p className="text-xl text-muted-foreground max-w-lg">
									The first decentralized prediction platform built on BlockDAG.
									Stake on outcomes you believe in and earn when you&apos;re
									right.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-4 gap-x-6 w-full">
								<Link href="/markets" className="flex-1">
									<Button size="xl" variant="hero" className="w-full">
										Explore Markets
										<ChevronRight className="w-5 h-5 ml-2" />
									</Button>
								</Link>
								<div className="flex-1">
									<Button size="xl" variant="outline" className="w-full">
										Connect Wallet
									</Button>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="flex flex-wrap gap-8 pt-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-gradient-primary">
										$2.4M
									</div>
									<div className="text-sm text-muted-foreground">
										Total Volume
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-gradient-primary">
										12,450
									</div>
									<div className="text-sm text-muted-foreground">Predictions</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-gradient-primary">
										89%
									</div>
									<div className="text-sm text-muted-foreground">
										Accuracy Rate
									</div>
								</div>
							</div>
						</div>

						<div className="relative">
							<div className="relative z-10">
								<Image
									src={heroImage}
									alt="Prediction platform visualization"
									className="w-full h-auto rounded-2xl shadow-card glow-primary"
								/>
							</div>
							<div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-3xl"></div>
						</div>
					</div>
				</div>
			</section>

			{/* How it Works */}
			<section className="py-20 bg-card/20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							How PredictChain Works
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Three simple steps to start predicting and earning on our decentralized
							platform
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{steps.map((step, index) => (
							<div key={step.number} className="text-center group">
								<div className="relative mb-6">
									<div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-bounce glow-primary">
										<step.icon className="w-8 h-8 text-primary-foreground" />
									</div>
									<div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm font-bold text-accent-foreground">
										{step.number}
									</div>
								</div>
								<h3 className="text-xl font-semibold mb-3">{step.title}</h3>
								<p className="text-muted-foreground">{step.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Featured Markets */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">Featured Markets</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Explore the hottest prediction markets with real rewards
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						{featuredMarkets.map((market) => (
							<MarketCard key={market.id} {...market} />
						))}
					</div>

					<div className="text-center">
						<Link href="/markets">
							<Button size="lg" variant="outline">
								View All Markets
								<ChevronRight className="w-5 h-5 ml-2" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-20 bg-card/20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							Why Choose PredictChain?
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Built on BlockDAG for maximum security, transparency, and fairness
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{benefits.map((benefit) => (
							<Card
								key={benefit.title}
								className="bg-gradient-card shadow-card hover-lift border-border">
								<CardContent className="p-8 text-center">
									<div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 glow-primary">
										<benefit.icon className="w-8 h-8 text-primary-foreground" />
									</div>
									<h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
									<p className="text-muted-foreground">{benefit.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>
		</Layout>
	)
}
