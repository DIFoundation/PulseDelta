"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  Award,
  Clock,
} from "lucide-react";
import { useFeeRouter } from "@/hooks/useFeeRouter";
import { useCreatorEarnings } from "@/hooks/useCreatorEarnings";
import { useLPEarnings } from "@/hooks/useLPEarnings";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-toastify";

export function FeeEarningsDisplay() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"creator" | "lp">("creator");
  const [isClaiming, setIsClaiming] = useState(false);

  // Fee router hooks
  const { isPending: isClaimPending } = useFeeRouter();

  // Get real earnings data
  const { data: creatorEarnings, isLoading: creatorEarningsLoading } =
    useCreatorEarnings(address);
  const { data: lpEarnings, isLoading: lpEarningsLoading } =
    useLPEarnings(address);

  // Handle fee claiming
  const handleClaimFees = async () => {
    if (
      !address ||
      !creatorEarnings ||
      parseFloat(creatorEarnings.claimableFees) <= 0
    ) {
      toast.error("No fees to claim");
      return;
    }

    try {
      setIsClaiming(true);

      // For now, we need a market address to claim
      // In a real implementation, you'd need to specify which market's fees to claim
      // or modify the contract to allow claiming all fees at once
      toast.info("Fee claiming functionality coming soon");
    } catch (error) {
      console.error("Error claiming fees:", error);
      toast.error("Failed to claim fees");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view your fee earnings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Fee Earnings</h2>
        <p className="text-muted-foreground">
          Track your earnings from market creation and liquidity provision
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Lifetime Creator Fees
                </p>
                <p className="text-xl font-bold">
                  {creatorEarningsLoading
                    ? "..."
                    : formatPrice(creatorEarnings?.lifetimeFees || "0")}{" "}
                  wDAG
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Claimable Fees</p>
                <p className="text-xl font-bold">
                  {creatorEarningsLoading
                    ? "..."
                    : formatPrice(creatorEarnings?.claimableFees || "0")}{" "}
                  wDAG
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total LP Fees</p>
                <p className="text-xl font-bold">
                  {lpEarningsLoading
                    ? "..."
                    : formatPrice(lpEarnings?.totalLPFees || "0")}{" "}
                  wDAG
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "creator" | "lp")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="creator">Creator Earnings</TabsTrigger>
              <TabsTrigger value="lp">LP Earnings</TabsTrigger>
            </TabsList>

            <TabsContent value="creator" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Creator Fee Earnings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Earn 30% of trading fees from markets you create
                  </p>
                </div>
                {creatorEarnings &&
                  parseFloat(creatorEarnings.claimableFees) > 0 && (
                    <Button
                      onClick={handleClaimFees}
                      disabled={isClaiming || isClaimPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isClaiming || isClaimPending
                        ? "Claiming..."
                        : "Claim Fees"}
                    </Button>
                  )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">
                        Lifetime Earnings
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {creatorEarningsLoading
                        ? "..."
                        : formatPrice(
                            creatorEarnings?.lifetimeFees || "0"
                          )}{" "}
                      wDAG
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        Available to Claim
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {creatorEarningsLoading
                        ? "..."
                        : formatPrice(
                            creatorEarnings?.claimableFees || "0"
                          )}{" "}
                      wDAG
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Markets Created</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {creatorEarningsLoading
                      ? "..."
                      : creatorEarnings?.totalMarkets || "0"}
                  </p>
                </div>

                {/* Markets with fees */}
                <div className="space-y-2">
                  <h4 className="font-medium">Markets Earning Fees</h4>
                  {creatorEarningsLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Loading...
                    </div>
                  ) : creatorEarnings?.marketsWithFees &&
                    creatorEarnings.marketsWithFees.length > 0 ? (
                    <div className="space-y-2">
                      {creatorEarnings.marketsWithFees.map((market, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {market.marketTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {market.isActive ? "Active" : "Resolved"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {formatPrice(market.feesEarned)} wDAG
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No markets earning fees yet
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lp" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">LP Fee Earnings</h3>
                <p className="text-sm text-muted-foreground">
                  Earn 40% of trading fees from markets where you provide
                  liquidity
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">
                      Total LP Fees Earned
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {lpEarningsLoading
                      ? "..."
                      : formatPrice(lpEarnings?.totalLPFees || "0")}{" "}
                    wDAG
                  </p>
                </div>

                {/* LP positions */}
                <div className="space-y-2">
                  <h4 className="font-medium">Active LP Positions</h4>
                  {lpEarningsLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Loading...
                    </div>
                  ) : lpEarnings?.activePositions &&
                    lpEarnings.activePositions.length > 0 ? (
                    <div className="space-y-2">
                      {lpEarnings.activePositions.map((position, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {position.marketTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {position.lpTokens} LP tokens
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {formatPrice(position.feesEarned)} wDAG
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Value: {formatPrice(position.value)} wDAG
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No active LP positions
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>How Fee Earnings Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">30%</span>
                </div>
                <h4 className="font-medium">Creator Fees</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                When you create a market, you earn 30% of all trading fees
                generated from that market.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">40%</span>
                </div>
                <h4 className="font-medium">LP Fees</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                When you provide liquidity to a market, you earn 40% of trading
                fees proportional to your LP share.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
