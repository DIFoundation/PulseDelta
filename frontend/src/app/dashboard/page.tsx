import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Clock, Gift, Trophy, Target } from "lucide-react"
import Layout from "@/components/Layout"

const portfolioStats = {
	totalValue: 2450.67,
	totalStaked: 1800.0,
	totalWon: 3240.5,
	totalLost: 589.83,
	roi: 35.8,
	accuracy: 72,
	activePredictions: 5,
}

const activePredictions = [
	{
		id: "1",
		question: "Will Bitcoin reach $100,000 by end of 2024?",
		outcome: "YES",
		stake: 500,
		potentialPayout: 735.29,
		odds: 68,
		status: "active",
		deadline: "Dec 31, 2024",
	},
	{
		id: "2",
		question: "Will Tesla stock close above $300 this quarter?",
		outcome: "NO",
		stake: 300,
		potentialPayout: 625.0,
		odds: 48,
		status: "active",
		deadline: "Sep 30, 2024",
	},
]

const claimableRewards = [
	{
		id: "3",
		question: "Did Apple announce Vision Pro 2 at WWDC 2024?",
		outcome: "NO",
		stake: 200,
		payout: 380.95,
		profit: 180.95,
		status: "won",
		resolvedAt: "Jun 15, 2024",
	},
	{
		id: "4",
		question: "Will Ethereum hit $4,000 in Q2 2024?",
		outcome: "YES",
		stake: 400,
		payout: 724.14,
		profit: 324.14,
		status: "won",
		resolvedAt: "Jun 30, 2024",
	},
]

const predictionHistory = [
	...claimableRewards,
	{
		id: "5",
		question: "Will ChatGPT-5 be released in Q1 2024?",
		outcome: "YES",
		stake: 150,
		payout: 0,
		profit: -150,
		status: "lost",
		resolvedAt: "Mar 31, 2024",
	},
	{
		id: "6",
		question: "Will Meta stock close above $400 in Q1 2024?",
		outcome: "YES",
		stake: 250,
		payout: 462.5,
		profit: 212.5,
		status: "won",
		resolvedAt: "Mar 29, 2024",
	},
]

export default function Dashboard() {
	const totalClaimable = claimableRewards.reduce((sum, reward) => sum + reward.payout, 0)

	return (
		<Layout>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl lg:text-4xl font-bold mb-4">My Dashboard</h1>
					<p className="text-xl text-muted-foreground">
						Track your predictions, rewards, and portfolio performance
					</p>
				</div>

				{/* Portfolio Overview */}
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
					<Card className="bg-gradient-card shadow-card border-border">
						<CardContent className="p-4 text-center">
							<TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
							<div className="text-lg font-bold">${portfolioStats.totalValue}</div>
							<div className="text-xs text-muted-foreground">Portfolio Value</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-card shadow-card border-border">
						<CardContent className="p-4 text-center">
							<Target className="w-6 h-6 mx-auto mb-2 text-warning" />
							<div className="text-lg font-bold">${portfolioStats.totalStaked}</div>
							<div className="text-xs text-muted-foreground">Total Staked</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-card shadow-card border-border">
						<CardContent className="p-4 text-center">
							<Trophy className="w-6 h-6 mx-auto mb-2 text-success" />
							<div className="text-lg font-bold">${portfolioStats.totalWon}</div>
							<div className="text-xs text-muted-foreground">Total Won</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-card shadow-card border-border">
						<CardContent className="p-4 text-center">
							<TrendingDown className="w-6 h-6 mx-auto mb-2 text-destructive" />
							<div className="text-lg font-bold">${portfolioStats.totalLost}</div>
							<div className="text-xs text-muted-foreground">Total Lost</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-card shadow-card border-border">
						<CardContent className="p-4 text-center">
							<TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
							<div className="text-lg font-bold">{portfolioStats.roi}%</div>
							<div className="text-xs text-muted-foreground">ROI</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-card shadow-card border-border">
						<CardContent className="p-4 text-center">
							<Target className="w-6 h-6 mx-auto mb-2 text-accent" />
							<div className="text-lg font-bold">{portfolioStats.accuracy}%</div>
							<div className="text-xs text-muted-foreground">Accuracy</div>
						</CardContent>
					</Card>
				</div>

				{/* Claimable Rewards */}
				{claimableRewards.length > 0 && (
					<Card className="bg-gradient-success shadow-card border-success/20 mb-8 glow-success">
						<CardHeader>
							<CardTitle className="flex items-center">
								<Gift className="w-6 h-6 mr-2" />
								Claimable Rewards
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<div>
									<div className="text-2xl font-bold text-success-foreground">
										${totalClaimable.toFixed(2)} BDAG
									</div>
									<div className="text-success-foreground/80">
										From {claimableRewards.length} winning predictions
									</div>
								</div>
								<Button
									variant="secondary"
									size="lg"
									className="bg-white/20 text-success-foreground hover:bg-white/30">
									Claim All Rewards
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Predictions Tabs */}
				<Tabs defaultValue="active" className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-6 bg-card">
						<TabsTrigger value="active">
							Active ({activePredictions.length})
						</TabsTrigger>
						<TabsTrigger value="claimable">
							Claimable ({claimableRewards.length})
						</TabsTrigger>
						<TabsTrigger value="history">
							History ({predictionHistory.length})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="active" className="space-y-4">
						{activePredictions.map((prediction) => (
							<Card
								key={prediction.id}
								className="bg-gradient-card shadow-card border-border">
								<CardContent className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<h3 className="font-semibold mb-2">
												{prediction.question}
											</h3>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center">
													<Clock className="w-4 h-4 mr-1" />
													{prediction.deadline}
												</div>
											</div>
										</div>
										<Badge
											variant={
												prediction.outcome === "YES"
													? "default"
													: "destructive"
											}>
											{prediction.outcome}
										</Badge>
									</div>

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
										<div>
											<div className="text-muted-foreground">Staked</div>
											<div className="font-medium">${prediction.stake}</div>
										</div>
										<div>
											<div className="text-muted-foreground">
												Potential Payout
											</div>
											<div className="font-medium">
												${prediction.potentialPayout}
											</div>
										</div>
										<div>
											<div className="text-muted-foreground">
												Current Odds
											</div>
											<div className="font-medium">{prediction.odds}%</div>
										</div>
										<div>
											<div className="text-muted-foreground">
												Potential Profit
											</div>
											<div className="font-medium text-success">
												+$
												{(
													prediction.potentialPayout - prediction.stake
												).toFixed(2)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</TabsContent>

					<TabsContent value="claimable" className="space-y-4">
						{claimableRewards.map((reward) => (
							<Card
								key={reward.id}
								className="bg-gradient-card shadow-card border-border">
								<CardContent className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<h3 className="font-semibold mb-2">
												{reward.question}
											</h3>
											<div className="text-sm text-muted-foreground">
												Resolved on {reward.resolvedAt}
											</div>
										</div>
										<div className="text-right space-y-1">
											<Badge variant="default" className="bg-success">
												Won
											</Badge>
											<Button size="sm" variant="success">
												Claim ${reward.payout}
											</Button>
										</div>
									</div>

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
										<div>
											<div className="text-muted-foreground">Prediction</div>
											<div className="font-medium">{reward.outcome}</div>
										</div>
										<div>
											<div className="text-muted-foreground">Staked</div>
											<div className="font-medium">${reward.stake}</div>
										</div>
										<div>
											<div className="text-muted-foreground">Payout</div>
											<div className="font-medium">${reward.payout}</div>
										</div>
										<div>
											<div className="text-muted-foreground">Profit</div>
											<div className="font-medium text-success">
												+${reward.profit}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</TabsContent>

					<TabsContent value="history" className="space-y-4">
						{predictionHistory.map((entry) => (
							<Card
								key={entry.id}
								className="bg-gradient-card shadow-card border-border">
								<CardContent className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<h3 className="font-semibold mb-2">{entry.question}</h3>
											<div className="text-sm text-muted-foreground">
												Resolved on {entry.resolvedAt}
											</div>
										</div>
										<Badge
											variant={
												entry.status === "won" ? "default" : "destructive"
											}>
											{entry.status === "won" ? "Won" : "Lost"}
										</Badge>
									</div>

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
										<div>
											<div className="text-muted-foreground">Prediction</div>
											<div className="font-medium">{entry.outcome}</div>
										</div>
										<div>
											<div className="text-muted-foreground">Staked</div>
											<div className="font-medium">${entry.stake}</div>
										</div>
										<div>
											<div className="text-muted-foreground">Payout</div>
											<div className="font-medium">
												${entry.payout || "0"}
											</div>
										</div>
										<div>
											<div className="text-muted-foreground">Profit/Loss</div>
											<div
												className={`font-medium ${
													entry.profit > 0
														? "text-success"
														: "text-destructive"
												}`}>
												{entry.profit > 0 ? "+" : ""}${entry.profit}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</TabsContent>
				</Tabs>
			</div>
		</Layout>
	)
}
