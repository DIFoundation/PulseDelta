import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTradingHistory } from "@/hooks/useTradingHistory";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  AlertCircle,
} from "lucide-react";
import type { Market } from "@/types/market";

interface ProfitLossDisplayProps {
  market: Market;
}

export function ProfitLossDisplay({ market }: ProfitLossDisplayProps) {
  const { historyState, fetchTradingHistory } = useTradingHistory();

  useEffect(() => {
    fetchTradingHistory(market);
  }, [market, fetchTradingHistory]);

  if (historyState.isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading trading history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (historyState.error) {
    return (
      <Card className="glass-card border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>Error loading trading history: {historyState.error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!historyState.data || historyState.data.positions.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Minus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No positions found</p>
            <p className="text-xs mt-1">
              Start trading to see your profit/loss
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { positions, totalCostBasis, totalCurrentValue, totalUnrealizedPnL } =
    historyState.data;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Trading Performance
          </CardTitle>
          <Badge variant="default" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Potential Profit
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Individual Positions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Positions
          </h4>
          {positions.map((position) => (
            <div
              key={position.outcomeIndex}
              className="p-3 rounded-lg border bg-muted/50 border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{position.outcome}</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm text-primary">
                    +{position.unrealizedPnL.toFixed(3)} wDAG
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <div>Shares: {position.totalShares.toFixed(3)}</div>
                  <div>
                    Avg Cost:{" "}
                    {position.totalCostBasis > 0
                      ? `${position.avgCostPerShare.toFixed(3)} wDAG`
                      : "Unknown"}
                  </div>
                </div>
                <div>
                  <div>
                    Total Cost:{" "}
                    {position.totalCostBasis > 0
                      ? `${position.totalCostBasis.toFixed(3)} wDAG`
                      : "Unknown"}
                  </div>
                  <div>
                    Current Value: {position.currentValue.toFixed(3)} wDAG
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t pt-4 space-y-2">
          {totalCostBasis > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Investment</span>
                <span className="font-mono">
                  {totalCostBasis.toFixed(3)} wDAG
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Potential Value</span>
                <span className="font-mono">
                  {totalCurrentValue.toFixed(3)} wDAG
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Potential Profit</span>
                <span className="font-mono font-bold text-primary">
                  +{totalUnrealizedPnL.toFixed(3)} wDAG
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Investment</span>
                <span className="font-mono text-muted-foreground">Unknown</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Potential Value</span>
                <span className="font-mono">
                  {totalCurrentValue.toFixed(3)} wDAG
                </span>
              </div>
              <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
                💡 Cost basis unknown - start new trades to track profit/loss
              </div>
            </>
          )}
        </div>

        {/* Market Status Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1 text-xs">
            <li>
              • <strong>Potential Profit</strong> shows what you could win if
              your outcome is correct
            </li>
            <li>
              • If market resolves in your favor, you'll receive the full payout
            </li>
            <li>
              • If market resolves against you, your tokens become worthless
            </li>
            <li>
              • <strong>Potential Value</strong> shows current token value
              (actual payout depends on resolution)
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
