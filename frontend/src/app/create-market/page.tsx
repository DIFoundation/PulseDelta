import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateMarket() {
	return (
		<div className="max-w-4xl mx-auto">
			<Card className="glass-card">
				<CardHeader>
					<CardTitle>Create New Market</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Market creation wizard coming soon...</p>
				</CardContent>
			</Card>
		</div>
	)
}
