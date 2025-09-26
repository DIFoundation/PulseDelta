/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const handleTrade = (action: "buy" | "sell") => {
    if (onTrade) {
      onTrade(selectedOutcome, action);
    }
  };

  // Calculate cost based on AMM formula
  const calculateCost = (shares: number, isBuy: boolean) => {
    if (!shares || shares <= 0) return 0;

    const outcome = market.outcomeShares[selectedOutcome];
    const currentPrice = parseFloat(outcome.price);

    // For buying: cost = shares * price
    // For "selling" (buying opposite): cost = shares * (1 - currentPrice)
    if (isBuy) {
      return shares * currentPrice;
    } else {
      // Selling means buying the opposite outcome
      const oppositePrice = 1 - currentPrice;
      return shares * oppositePrice;
    }
  };

  const shares = parseFloat(amount) || 0;
  const cost = calculateCost(shares, activeTab === "buy");
  const fee = cost * 0.01; // 1% fee
  const totalCost = cost + fee;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Trade</CardTitle>
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
                    <span>{cost.toFixed(3)} wDAG</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee (1%):</span>
                    <span>{fee.toFixed(3)} wDAG</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total Cost:</span>
                    <span className="text-primary">
                      {totalCost.toFixed(3)} wDAG
                    </span>
                  </div>
                </div>
              )}
            </div>
            <Button
              className="w-full buy-gradient"
              onClick={() => handleTrade("buy")}
              disabled={!shares || shares <= 0}
            >
              Buy {market.outcomes[selectedOutcome]} Shares
            </Button>
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
                      {shares.toFixed(2)}{" "}
                      {
                        market.outcomes[
                          selectedOutcome === 0
                            ? market.outcomes[1]
                            : market.outcomes[0]
                        ]
                      }
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
                    <span>{cost.toFixed(3)} wDAG</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee (1%):</span>
                    <span>{fee.toFixed(3)} wDAG</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total Cost:</span>
                    <span className="text-primary">
                      {totalCost.toFixed(3)} wDAG
                    </span>
                  </div>
                </div>
              )}
            </div>
            <Button
              className="w-full sell-gradient"
              onClick={() => handleTrade("sell")}
              disabled={!shares || shares <= 0}
            >
              Sell {market.outcomes[selectedOutcome]} Shares
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
