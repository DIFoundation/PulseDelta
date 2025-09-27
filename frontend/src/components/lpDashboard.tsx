"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import {
  Droplets,
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useLPEarnings } from "@/hooks/useLPEarnings";
import { formatPrice } from "@/lib/utils";

interface LpPosition {
  marketId: string;
  marketTitle: string;
  lpShares: number;
  value: number;
  fees24h: number;
  feesTotal: number;
  apy: number;
  dateAdded: string;
  status: "active" | "withdrawn";
}

// Mock LP positions data
const mockPositions: LpPosition[] = [
  {
    marketId: "1",
    marketTitle: "Will Bitcoin reach $100,000 by end of 2024?",
    lpShares: 45.67,
    value: 1234.56,
    fees24h: 12.34,
    feesTotal: 156.78,
    apy: 14.2,
    dateAdded: "2024-01-15T10:00:00Z",
    status: "active",
  },
  {
    marketId: "2",
    marketTitle: "Next US Presidential Election Winner",
    lpShares: 23.45,
    value: 890.12,
    fees24h: 8.91,
    feesTotal: 89.45,
    apy: 11.8,
    dateAdded: "2024-01-20T14:30:00Z",
    status: "active",
  },
  {
    marketId: "3",
    marketTitle: "Will Tesla stock hit $300 this quarter?",
    lpShares: 0,
    value: 0,
    fees24h: 0,
    feesTotal: 45.67,
    apy: 0,
    dateAdded: "2024-01-10T09:15:00Z",
    status: "withdrawn",
  },
];

/**
 * Comprehensive LP dashboard showing positions, earnings, and analytics
 */
export function LpDashboard() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  // Get real LP earnings data
  const { data: lpEarnings, isLoading: lpEarningsLoading } =
    useLPEarnings(address);

  // Use real data if available, otherwise fall back to mock data
  const activePositions = lpEarnings?.activePositions || [];
  const historicalPositions = mockPositions.filter(
    (p) => p.status === "withdrawn"
  );

  const totalValue = lpEarnings
    ? parseFloat(lpEarnings.totalValue)
    : activePositions.reduce((sum, p) => sum + Number(p.value), 0);
  const totalFeesEarned = lpEarnings
    ? parseFloat(lpEarnings.totalFeesEarned)
    : mockPositions.reduce((sum, p) => sum + p.feesTotal, 0);
  const totalLPFees = lpEarnings ? parseFloat(lpEarnings.totalLPFees) : 0;
  const avgApy = 12.5; // Mock APY for now

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Liquidity Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your liquidity positions and track earnings
            </p>
          </div>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Find Markets
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {lpEarningsLoading ? "..." : formatPrice(totalValue.toString())}{" "}
              wDAG
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {lpEarningsLoading ? "..." : formatPrice(totalLPFees.toString())}{" "}
              wDAG
            </div>
            <div className="text-sm text-muted-foreground">Total LP Fees</div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Droplets className="w-6 h-6 text-accent" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {lpEarningsLoading
                ? "..."
                : formatPrice(totalFeesEarned.toString())}{" "}
              wDAG
            </div>
            <div className="text-sm text-muted-foreground">
              Total Fees Earned
            </div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold mb-1">{avgApy.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Average APY</div>
          </div>
        </div>
      </motion.div>

      {/* Positions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6"
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "active" | "history")}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Positions</h2>
            <TabsList className="glass-card">
              <TabsTrigger value="active">
                Active ({activePositions.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                History ({historicalPositions.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="space-y-4">
            {lpEarningsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading LP positions...</p>
              </div>
            ) : activePositions.length === 0 ? (
              <div className="text-center py-12">
                <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No Active Positions
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start providing liquidity to earn fees from trades
                </p>
                <Link href="/">
                  <Button>Explore Markets</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activePositions.map((position, index) => (
                  <motion.div
                    key={position.marketId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass-card p-6 border border-border/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {position.marketTitle}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>LP Position</span>
                          <Badge
                            variant="outline"
                            className="text-xs border-secondary text-secondary"
                          >
                            Active
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/market/${position.marketId}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="glass-card"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          LP Tokens
                        </div>
                        <div className="font-semibold">{position.lpTokens}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Value
                        </div>
                        <div className="font-semibold">
                          {formatPrice(position.value)} wDAG
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Fees Earned
                        </div>
                        <div className="font-semibold text-secondary">
                          {formatPrice(position.feesEarned)} wDAG
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Value per Token
                        </div>
                        <div className="font-semibold text-secondary">
                          {formatPrice(position.valuePerToken)} wDAG
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {historicalPositions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No Historical Positions
                </h3>
                <p className="text-muted-foreground">
                  Your withdrawn positions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historicalPositions.map((position, index) => (
                  <motion.div
                    key={`${position.marketId}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass-card p-6 border border-border/20 opacity-75"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {position.marketTitle}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Added {formatDate(position.dateAdded)}</span>
                          <Badge variant="outline" className="text-xs">
                            Withdrawn
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/market/${position.marketId}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="glass-card"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          LP Shares
                        </div>
                        <div className="font-semibold">0.00</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Value
                        </div>
                        <div className="font-semibold">0.00 BDAG</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          24h Fees
                        </div>
                        <div className="font-semibold">0.00 BDAG</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Total Fees Earned
                        </div>
                        <div className="font-semibold text-secondary">
                          ${position.feesTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
