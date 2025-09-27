import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrading } from "@/hooks/useTrading";
import { Loader2, AlertCircle, CheckCircle, Wallet } from "lucide-react";
import type { Market } from "@/types/market";

interface TradeWidgetProps {
  market: Market;
  selectedOutcome: number;
  formatPrice: (price: string) => string;
  onTrade?: (outcomeIndex: number, action: "buy" | "sell") => void;
}

export function TradeWidget({
  market,
  selectedOutcome,
  formatPrice,
  onTrade,
}: TradeWidgetProps) {
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [calculatedCost, setCalculatedCost] = useState({ cost: 0, fee: 0 });

  const {
    executeTrade,
    calculateCost,
    tradingState,
    resetTradingState,
    bDAGBalance,
  } = useTrading();

  // Reset form when trade is successful
  useEffect(() => {
    if (tradingState.txHash && !tradingState.isTrading) {
      setAmount("");
    }
  }, [tradingState.txHash, tradingState.isTrading]);

  // Calculate cost when amount changes
  useEffect(() => {
    const updateCost = async () => {
      const shares = parseFloat(amount) || 0;
      if (shares > 0) {
        try {
          const { cost, fee } = await calculateCost(
            market,
            selectedOutcome,
            shares
          );
          setCalculatedCost({ cost, fee });
        } catch (error) {
          console.error("Error calculating cost:", error);
          setCalculatedCost({ cost: 0, fee: 0 });
        }
      } else {
        setCalculatedCost({ cost: 0, fee: 0 });
      }
    };

    updateCost();
  }, [amount, market, selectedOutcome, calculateCost]);

  const handleTrade = async (action: "buy" | "sell") => {
    if (onTrade) {
      onTrade(selectedOutcome, action);
    }

    const shares = parseFloat(amount) || 0;
    if (shares <= 0) {
      // Toast will be handled by useTrading hook
      return;
    }

    try {
      await executeTrade({
        market,
        outcomeIndex: selectedOutcome,
        shares: amount,
        isBuy: action === "buy",
      });
    } catch (error) {
      // Error handling is done in the useTrading hook
      console.error("Trade error:", error);
    }
  };

  const shares = parseFloat(amount) || 0;
  const { cost, fee } = calculatedCost;
  const totalCost = cost + fee;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trade</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span>{bDAGBalance.toFixed(3)} BDAG</span>
          </div>
        </div>
        {tradingState.error && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span>{tradingState.error}</span>
          </div>
        )}
        {tradingState.txHash && (
          <div className="flex items-center gap-2 text-sm text-green-500 bg-green-50 p-2 rounded">
            <CheckCircle className="h-4 w-4" />
            <span>
              Transaction submitted: {tradingState.txHash.slice(0, 10)}...
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="space-y-4">
            <div>
              <Input
                placeholder="Number of shares"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                step="0.1"
              />
              {shares > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Cost Breakdown
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shares:</span>
                    <span>
                      {shares.toFixed(2)} {market.outcomes[selectedOutcome]}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price per share:</span>
                    <span>
                      {formatPrice(market.outcomeShares[selectedOutcome].price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{cost.toFixed(3)} BDAG</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee (1%):</span>
                    <span>{fee.toFixed(3)} BDAG</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total Cost:</span>
                    <span className="text-primary">
                      {totalCost.toFixed(3)} BDAG
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    Your BDAG will be converted to wDAG for trading
                  </div>
                </div>
              )}
            </div>
            <Button
              className="w-full buy-gradient"
              onClick={() => handleTrade("buy")}
              disabled={
                !shares ||
                shares <= 0 ||
                tradingState.isTrading ||
                totalCost > bDAGBalance
              }
            >
              {tradingState.isTrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tradingState.txHash ? "Confirming..." : "Processing..."}
                </>
              ) : (
                `Buy ${market.outcomes[selectedOutcome]} Shares`
              )}
            </Button>
            {totalCost > bDAGBalance && shares > 0 && (
              <p className="text-sm text-red-500 text-center">
                Insufficient BDAG balance
              </p>
            )}
          </TabsContent>
          <TabsContent value="sell" className="space-y-4">
            <div>
              <Input
                placeholder="Number of shares"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                step="0.1"
              />
              {shares > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Cost Breakdown
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Selling:</span>
                    <span>
                      {shares.toFixed(2)} {market.outcomes[selectedOutcome]}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Buying instead:</span>
                    <span>
                      {shares.toFixed(2)} {market.outcomes[selectedOutcome]}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Opposite price:</span>
                    <span>
                      {formatPrice(
                        (
                          1 -
                          parseFloat(
                            market.outcomeShares[selectedOutcome].price
                          )
                        ).toString()
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{cost.toFixed(3)} BDAG</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee (1%):</span>
                    <span>{fee.toFixed(3)} BDAG</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total Cost:</span>
                    <span className="text-primary">
                      {totalCost.toFixed(3)} BDAG
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    Your BDAG will be converted to wDAG for trading
                  </div>
                </div>
              )}
            </div>
            <Button
              className="w-full sell-gradient"
              onClick={() => handleTrade("sell")}
              disabled={
                !shares ||
                shares <= 0 ||
                tradingState.isTrading ||
                totalCost > bDAGBalance
              }
            >
              {tradingState.isTrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tradingState.txHash ? "Confirming..." : "Processing..."}
                </>
              ) : (
                `Sell ${market.outcomes[selectedOutcome]} Shares`
              )}
            </Button>
            {totalCost > bDAGBalance && shares > 0 && (
              <p className="text-sm text-red-500 text-center">
                Insufficient BDAG balance
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
