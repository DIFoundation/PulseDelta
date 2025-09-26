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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagsList } from "@/components/ui/tags";
import { TradeWidget } from "@/components/TradeWidget";
import { LiquidityPanel } from "@/components/LiquidityPanel";
import { useMarket } from "@/hooks/useMarket";

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

  console.log("MarketDetail - Market data:", market);
  console.log("MarketDetail - Market title:", market?.title);
  console.log("MarketDetail - Market description:", market?.description);
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
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Button>
        </Button>
      </div>
    );
  }

  const timeLeft = Math.max(0, market.endTime - Date.now() / 1000);
  const daysLeft = Math.floor(timeLeft / (24 * 60 * 60));
  const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
  const minutesLeft = Math.floor((timeLeft % (60 * 60)) / 60);

  const leadingOutcome = market.outcomeShares.reduce((prev, current) =>
    parseFloat(current.price) > parseFloat(prev.price) ? current : prev
  );

  const formatPrice = (price: string) => `$${parseFloat(price).toFixed(3)}`;
  const formatVolume = (volume: string) => {
    const vol = parseFloat(volume);
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

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
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => window.history.back()} size="sm" className="glass-card">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </Button>

        <Button variant="outline" size="sm" className="glass-card">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Market Header */}
      <div className="glass-card p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`${getCategoryColor(
                  market.category
                )} text-sm px-3 py-1`}
              >
                {market.category}
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {timeLeft > 0 ? "Active" : "Closed"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold leading-tight max-w-3xl">
              {market.title}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {market.description}
            </p>

            {/* Tags and Additional Info */}
            <div className="space-y-3">
              {market.tags && market.tags.length > 0 && (
                <div>
                  <TagsList
                    tags={market.tags}
                    variant="default"
                    size="md"
                    className="flex-wrap"
                  />
                </div>
              )}

              {market.resolutionSource && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  <span>Resolution Source: {market.resolutionSource}</span>
                </div>
              )}

              {market.template && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Template: {market.template}</span>
                </div>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" className="glass-card">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Source
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-background/50 border-border/50">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> Time Left
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-lg font-bold">
                {daysLeft}d {hoursLeft}h {minutesLeft}m
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" /> Traders
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-lg font-bold">
                {market.outcomeShares.reduce(
                  (sum, outcome) => sum + outcome.holders,
                  0
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-lg font-bold">
                {formatVolume(market.volumeTotal)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Droplets className="w-4 h-4" /> Liquidity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-lg font-bold">
                {formatVolume(market.totalLiquidity)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Outcomes */}
        <div className="grid md:grid-cols-2 gap-6">
          {market.outcomeShares.map((outcome, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all duration-300 ${
                selectedOutcome === index ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedOutcome(index)}
            >
              <CardHeader className="p-4">
                <CardTitle className="flex justify-between items-center">
                  <span>{market.outcomes[outcome.outcomeIndex]}</span>
                  <span className="text-lg font-bold">
                    {formatPrice(outcome.price)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Progress
                  value={parseFloat(outcome.price) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trade" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
        </TabsList>

        <TabsContent value="trade">
          <TradeWidget
            market={market as any}
            selectedOutcome={selectedOutcome}
            formatPrice={formatPrice}
          />
        </TabsContent>

        <TabsContent value="liquidity">
          <LiquidityPanel market={market as any} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
