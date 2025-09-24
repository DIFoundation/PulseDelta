import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Profile() {
	return (
		<div className="max-w-4xl mx-auto">
			<Card className="glass-card">
				<CardHeader>
					<CardTitle>User Profile</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						User profile and portfolio coming soon...
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
