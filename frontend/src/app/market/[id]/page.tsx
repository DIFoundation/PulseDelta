/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import { redirect, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Share,
  Clock,
  Users,
  TrendingUp,
  Droplets,
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagsList } from "@/components/ui/tags";
import { TradeWidget } from "@/components/TradeWidget";
import { LiquidityPanel } from "@/components/LiquidityPanel";
import { useMarket } from "@/hooks/useMarket";
import { formatPrice } from "@/lib/utils";
import type { Market } from "@/types/market";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MarketDetail() {
  const params = useParams();
  const encodedId = params?.id as string;
  const id = decodeURIComponent(encodedId); // Decode URL-encoded characters

  console.log("MarketDetail - Encoded ID from params:", encodedId);
  console.log("MarketDetail - Decoded ID:", id);

  const { data: market, isLoading, error } = useMarket(id);
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const handleTrade = (outcomeIndex: number, action: "buy" | "sell") => {
    setSelectedOutcome(outcomeIndex);
    console.log(`${action} ${market?.outcomes[outcomeIndex]} shares`);
    // TODO: Implement actual trading logic
  };

  console.log("MarketDetail - Market data:", market);
  console.log("MarketDetail - Market ID:", market?.id);
  console.log("MarketDetail - Market title:", market?.title);
  console.log("MarketDetail - Market description:", market?.description);
  console.log("MarketDetail - Market curation status:", market?.curationStatus);
  console.log("MarketDetail - Loading:", isLoading);
  console.log("MarketDetail - Error:", error);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Market Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The market you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </Button>
      </div>
    );
  }

  const timeLeft = Math.max(0, market.endTime - Date.now() / 1000);
  const daysLeft = Math.floor(timeLeft / (24 * 60 * 60));
  const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
  const minutesLeft = Math.floor((timeLeft % (60 * 60)) / 60);

  // Calculate months and days for better display
  const monthsLeft = Math.floor(daysLeft / 30);
  const remainingDays = daysLeft % 30;

  // Format end date
  const endDate = new Date(market.endTime * 1000);
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const endDay = endDate.getDate();
  const endYear = endDate.getFullYear();

  const leadingOutcome = market.outcomeShares.reduce((prev, current) =>
    parseFloat(current.price) > parseFloat(prev.price) ? current : prev
  );

  const formatVolume = (volume: string) => {
    const vol = parseFloat(volume);
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M wDAG`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K wDAG`;
    return `${vol.toFixed(0)} wDAG`;
  };

  // Format date to show month and time
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${month} ${day} ${time}`;
  };

  // Mock chart data for price movement
  const generateChartData = () => {
    const data = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 23; i >= 0; i--) {
      const timestamp = now - i * oneDay;
      const baseYesPrice = 0.5;
      const baseNoPrice = 0.5;

      // Simulate price movement with some randomness
      const yesVariation = (Math.random() - 0.5) * 0.2;
      const noVariation = (Math.random() - 0.5) * 0.2;

      data.push({
        time: formatDate(timestamp),
        yes: Math.max(0.1, Math.min(0.9, baseYesPrice + yesVariation)),
        no: Math.max(0.1, Math.min(0.9, baseNoPrice + noVariation)),
        volume: Math.floor(Math.random() * 10000) + 1000,
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const getCategoryColor = (category: string) => {
    const colors = {
      sports: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      crypto: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      politics: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      entertainment: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      technology: "bg-green-500/10 text-green-400 border-green-500/20",
      economics: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };
    return colors[category as keyof typeof colors] || colors.sports;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            size="sm"
            className="glass-card"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${getCategoryColor(
                market.category
              )} text-xs px-2 py-1`}
            >
              {market.category}
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {timeLeft > 0 ? "Active" : "Closed"}
            </Badge>
          </div>

          <Button variant="outline" size="sm" className="glass-card">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content - Bridging Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Market Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Title */}
            <div className="glass-card p-6">
              <h1 className="text-2xl font-bold mb-3">{market.title}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {market.description}
              </p>

              {/* Tags */}
              {market.tags && market.tags.length > 0 && (
                <div className="mt-4">
                  <TagsList
                    tags={market.tags}
                    variant="secondary"
                    size="sm"
                    className="flex-wrap"
                  />
                </div>
              )}
            </div>

            {/* Price Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Price Movement</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>YES</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>NO</span>
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted))"
                    />
                    <XAxis
                      dataKey="time"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => value.split(" ")[0]} // Show only month day
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        `${(value * 100).toFixed(1)}%`,
                        name.toUpperCase(),
                      ]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="yes"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      name="YES"
                    />
                    <Line
                      type="monotone"
                      dataKey="no"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="NO"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ends</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-lg font-bold">
                      {endMonth} {endDay}
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      {endYear}
                    </span>
                  </div>
                  {timeLeft > 0 && (
                    <div className="mt-3 text-sm font-medium text-muted-foreground">
                      {monthsLeft > 0 && `${monthsLeft}m `}
                      {remainingDays > 0 && `${remainingDays}d `}
                      {hoursLeft}h left
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Traders
                    </span>
                  </div>
                  <p className="text-lg font-bold">
                    {market.outcomeShares.reduce(
                      (sum, outcome) => sum + outcome.holders,
                      0
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Volume
                    </span>
                  </div>
                  <p className="text-lg font-bold">
                    {formatVolume(market.volumeTotal)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Liquidity
                    </span>
                  </div>
                  <p className="text-lg font-bold">
                    {formatVolume(market.totalLiquidity)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Outcomes */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Outcomes</h3>
              <div className="space-y-3">
                {market.outcomeShares.map((outcome, index) => {
                  const isNo =
                    market.outcomes[outcome.outcomeIndex].toLowerCase() ===
                    "no";
                  const isYes =
                    market.outcomes[outcome.outcomeIndex].toLowerCase() ===
                    "yes";

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedOutcome === index
                          ? isNo
                            ? "border-red-500 bg-red-500/5"
                            : "border-primary bg-primary/5"
                          : "border-border/50 hover:border-border"
                      }`}
                      onClick={() => setSelectedOutcome(index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-medium ${
                            isNo
                              ? "text-red-500"
                              : isYes
                              ? "text-green-500"
                              : ""
                          }`}
                        >
                          {market.outcomes[outcome.outcomeIndex]}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {formatPrice(outcome.price)}
                          </span>
                          {outcome.priceChange24h > 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <Progress
                        value={parseFloat(outcome.price) * 100}
                        className={`h-2 ${
                          isNo
                            ? "[&>div]:bg-red-500"
                            : isYes
                            ? "[&>div]:bg-green-500"
                            : ""
                        }`}
                      />
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className={`flex-1 ${
                            isNo
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "buy-gradient"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrade(index, "buy");
                          }}
                        >
                          Buy {market.outcomes[outcome.outcomeIndex]}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`flex-1 ${
                            isNo
                              ? "border-red-500 text-red-500 hover:bg-red-500/10"
                              : "sell-gradient"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrade(index, "sell");
                          }}
                        >
                          Sell {market.outcomes[outcome.outcomeIndex]}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Trading Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TradeWidget
                market={market as Market}
                selectedOutcome={selectedOutcome}
                formatPrice={formatPrice}
                onTrade={handleTrade}
              />

              <div className="mt-6">
                <LiquidityPanel market={market as Market} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
