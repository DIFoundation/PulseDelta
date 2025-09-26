/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Market } from "@/types/market"
import { useMarketTrade } from "@/hooks/useMarketTrade"
import { useToast } from "@/components/toast"
import { Skeleton } from "./ui/skeleton"

interface TradeWidgetProps {
  market: Market
  selectedOutcome: number
}

export function TradeWidget({ market, selectedOutcome }: TradeWidgetProps) {
  const [amount, setAmount] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isTrading, setIsTrading] = useState(false)
  const { addToast } = useToast()

  // Determine market type and initialize appropriate trade hook
  const trade = useMarketTrade(market.id, selectedOutcome)
  
  // Check if market is scalar (needs separate handling)
  const isScalar = useMemo(
    () => market.marketType === "scalar" || 
          (market.outcomes.length === 2 && 
           market.outcomes.includes("Long") && 
           market.outcomes.includes("Short")),
    [market]
  )

  // Check allowance when amount changes
  const [isApproved, setIsApproved] = useState(false)
  useEffect(() => {
    let cancelled = false
    const checkAllowance = async () => {
      if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
        const approved = await trade.checkAllowance(amount)
        if (!cancelled) {
          setIsApproved(approved)
        }
      } else {
        setIsApproved(false)
      }
    }
    checkAllowance()
    return () => { cancelled = true }
  }, [amount, trade])

  const handleApprove = async () => {
    if (!amount || Number(amount) <= 0) {
      addToast({
        title: "Invalid amount",
        description: "Please enter a valid amount to approve",
        type: "error",
        duration: 3000,
      })
      return
    }

    try {
      setIsApproving(true)
      addToast({
        title: "Approving tokens",
        description: `Approving ${amount} tokens for trading...`,
        type: "info",
      })
      
      await trade.approve(amount)
      setIsApproved(true)
      
      addToast({
        title: "Approval confirmed",
        description: "You can now place your trade",
        type: "success",
      })
    } catch (error) {
      console.error("Approval failed:", error)
      addToast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Failed to approve tokens",
        type: "error",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleTrade = async (action: 'buy' | 'sell') => {
    if (!amount || Number(amount) <= 0) {
      addToast({
        title: "Invalid amount",
        description: "Please enter a valid amount to trade",
        type: "error",
      })
      return
    }

    if (isScalar && !isApproved && action === 'buy') {
      addToast({
        title: "Approval required",
        description: "Please approve the token amount before buying",
        type: "error",
      })
      return
    }

    try {
      setIsTrading(true)
      const actionName = action === 'buy' ? 'Buying' : 'Selling'
      
      addToast({
        title: `${actionName} shares`,
        description: `Processing your ${action} order...`,
        type: "info",
      })

      if (action === 'buy') {
        if (isScalar) {
          await trade.buy({ isLong: selectedOutcome === 0, amount })
        } else {
          await trade.buy(amount)
        }
      } else {
        await trade.sell(amount)
      }

      addToast({
        title: "Trade executed",
        description: `Successfully ${action === 'buy' ? 'bought' : 'sold'} ${amount} shares`,
        type: "success",
      })
      
      // Reset form
      setAmount("")
    } catch (error) {
      console.error("Trade failed:", error)
      addToast({
        title: "Trade failed",
        description: error instanceof Error ? error.message : "Failed to execute trade",
        type: "error",
      })
    } finally {
      setIsTrading(false)
    }
  }

  const renderActionButton = (action: 'buy' | 'sell') => {
    const isBuy = action === 'buy'
    const isDisabled = isTrading || isApproving || !amount || Number(amount) <= 0 || 
                      (isBuy && isScalar && !isApproved)
    
    const buttonText = isBuy 
      ? isScalar && !isApproved ? "Approve & Buy" : "Buy Shares" 
      : "Sell Shares"

    return (
      <Button
        className={`w-full ${isBuy ? 'buy-gradient' : 'sell-gradient'}`}
        onClick={() => isBuy && isScalar && !isApproved ? handleApprove() : handleTrade(action)}
        disabled={isDisabled}
        isLoading={isTrading || (isApproving && isBuy)}
      >
        {buttonText}
      </Button>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger 
              value="sell" 
              disabled={isScalar} // Disable sell tab for scalar markets
              title={isScalar ? "Scalar markets don't support selling before resolution" : ""}
            >
              Sell
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                min="0"
                step="0.000000000000000001"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isTrading || isApproving}
              />
            </div>
            {renderActionButton('buy')}
          </TabsContent>
          
          {!isScalar && (
            <TabsContent value="sell" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  min="0"
                  step="0.000000000000000001"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isTrading}
                />
              </div>
              {renderActionButton('sell')}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
