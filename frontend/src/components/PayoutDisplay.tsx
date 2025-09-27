import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePayouts } from "@/hooks/usePayouts";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { config } from "@/configs";
import { MARKET_ABIS } from "@/lib/marketABIs";
import { Loader2, Trophy, Coins, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import type { Market } from "@/types/market";

interface PayoutDisplayProps {
  market: Market;
}

export function PayoutDisplay({ market }: PayoutDisplayProps) {
  const { payoutState, fetchPayoutInfo } = usePayouts();
  const { writeContractAsync, isPending } = useWriteContract();
  const { data: hash, isSuccess, error } = useWaitForTransactionReceipt({
    hash: payoutState.data?.txHash as `0x${string}`,
  });

  // Fetch payout info when component mounts or market changes
  useEffect(() => {
    fetchPayoutInfo(market);
  }, [market, fetchPayoutInfo]);

  // Handle successful claim
  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Winnings claimed successfully!", {
        onClick: () =>
          window.open(`https://explorer.celo.org/tx/${hash}`, "_blank"),
      });
      // Refresh payout info
      fetchPayoutInfo(market);
    }
  }, [isSuccess, hash, fetchPayoutInfo, market]);

  // Handle claim error
  useEffect(() => {
    if (error) {
      toast.error(`Failed to claim winnings: ${error.message}`);
    }
  }, [error]);

  const handleClaimWinnings = async () => {
    if (!market.address || !payoutState.data?.canClaim) return;

    try {
      toast.info("Claiming winnings...");

      const txHash = await writeContractAsync({
        address: market.address as `0x${string}`,
        abi: MARKET_ABIS[`${market.type}Market` as keyof typeof MARKET_ABIS],
        functionName: "redeem",
      });

      console.log("Claim transaction submitted:", txHash);
    } catch (error) {
      console.error("Error claiming winnings:", error);
      toast.error("Failed to claim winnings");
    }
  };

  if (payoutState.isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading payout info...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payoutState.error) {
    return (
      <Card className="glass-card border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>Error loading payout info: {payoutState.error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payoutState.data) return null;

  const { outcomeBalances, totalPotentialPayout, canClaim, marketResolved, winningOutcome } = payoutState.data;

  // Don't show anything if user has no positions
  if (outcomeBalances.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No positions in this market</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Positions
          </CardTitle>
          {marketResolved && (
            <Badge variant={canClaim ? "default" : "secondary"}>
              {canClaim ? "Can Claim" : "Resolved"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Outcome Token Balances */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Holdings</h4>
          {outcomeBalances.map((balance) => {
            const isWinning = marketResolved && balance.outcomeIndex === winningOutcome;
            const isLosing = marketResolved && balance.outcomeIndex !== winningOutcome;
            
            return (
              <div
                key={balance.outcomeIndex}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isWinning
                    ? "bg-green-50 border-green-200 text-green-800"
                    : isLosing
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{balance.outcome}</span>
                  {isWinning && <Trophy className="h-4 w-4" />}
                  {isLosing && <AlertCircle className="h-4 w-4" />}
                </div>
                <span className="font-mono">
                  {balance.balance.toFixed(3)} tokens
                </span>
              </div>
            );
          })}
        </div>

        {/* Potential Payout */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {marketResolved ? "Payout Available" : "Potential Payout"}
            </span>
            <span className="text-lg font-bold">
              {totalPotentialPayout.toFixed(3)} wDAG
            </span>
          </div>
          {marketResolved && winningOutcome !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {canClaim
                ? "You can claim your winnings now!"
                : "Only winning outcome tokens have value"}
            </p>
          )}
        </div>

        {/* Claim Button */}
        {canClaim && (
          <Button
            onClick={handleClaimWinnings}
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Claim {totalPotentialPayout.toFixed(3)} wDAG
              </>
            )}
          </Button>
        )}

        {!marketResolved && (
          <div className="text-xs text-muted-foreground text-center">
            Market must be resolved before you can claim winnings
          </div>
        )}
      </CardContent>
    </Card>
  );
}
