/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Market } from "@/types/market"

interface TradeWidgetProps {
	market: Market
	selectedOutcome: number
	formatPrice: (price: string) => string
}

export function TradeWidget({ market, selectedOutcome }: TradeWidgetProps) {
	const [amount, setAmount] = useState("")

	return (
		<Card className="glass-card">
			<CardHeader>
				<CardTitle>Trade</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="buy">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="buy">Buy</TabsTrigger>
						<TabsTrigger value="sell">Sell</TabsTrigger>
					</TabsList>
					<TabsContent value="buy" className="space-y-4">
						<Input
							placeholder="Amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
						<Button className="w-full buy-gradient">Buy Shares</Button>
					</TabsContent>
					<TabsContent value="sell" className="space-y-4">
						<Input
							placeholder="Amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
						<Button className="w-full sell-gradient">Sell Shares</Button>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}
