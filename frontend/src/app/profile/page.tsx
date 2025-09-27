"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  User,
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Award,
  Activity,
  BarChart3,
  Plus,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatPrice } from "@/lib/utils";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data, isLoading, error } =
    useUserProfile(address);

  const userStats = data;
  const tradingHistory = data;
  const lpPositions = data; 


  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your trading profile and statistics.
            </p>
            <Button className="w-full">Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-6">
              {error.message || "Failed to load your profile data."}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = userStats || {
    totalVolume: "0",
    marketsTraded: 0,
    marketsCreated: 0,
    totalLPValue: "0",
    joinDate: null,
    volumeMilestone: 0,
  };

  const getVolumeMilestone = (volume: number) => {
    if (volume >= 1000000)
      return { level: "Whale", color: "bg-purple-500", threshold: 1000000 };
    if (volume >= 100000)
      return { level: "Shark", color: "bg-blue-500", threshold: 100000 };
    if (volume >= 10000)
      return { level: "Dolphin", color: "bg-green-500", threshold: 10000 };
    if (volume >= 1000)
      return { level: "Fish", color: "bg-yellow-500", threshold: 1000 };
    return { level: "Minnow", color: "bg-gray-500", threshold: 0 };
  };

  const milestone = getVolumeMilestone(parseFloat(stats.totalVolume));

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="text-center space-y-4"
      >
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <Badge
            className={`absolute -bottom-2 -right-2 ${milestone.color} text-white`}
          >
            {milestone.level}
          </Badge>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Trading Profile</h1>
          <p className="text-muted-foreground">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </motion.div>

      {/* Volume Milestone Progress */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Volume Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Current Level: {milestone.level}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(stats.totalVolume)} wDAG
                </span>
              </div>

              <Progress
                value={
                  (parseFloat(stats.totalVolume) / milestone.threshold) * 100
                }
                className="h-3"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{milestone.level}</span>
                <span>
                  {milestone.level === "Whale"
                    ? "∞"
                    : formatPrice(milestone.threshold.toString())}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-xl font-bold">
                  {formatPrice(stats.totalVolume)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Markets Traded</p>
                <p className="text-xl font-bold">{stats.marketsTraded}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Plus className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Markets Created</p>
                <p className="text-xl font-bold">{stats.marketsCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LP Value</p>
                <p className="text-xl font-bold">
                  {formatPrice(stats.totalLPValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trading History */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Trading Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tradingHistory && tradingHistory.length > 0 ? (
              <div className="space-y-4">
                {tradingHistory.slice(0, 5).map((trade, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{trade.marketTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {trade.outcome} • {trade.shares} shares
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(trade.cost)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {tradingHistory.length > 5 && (
                  <Button variant="outline" className="w-full">
                    View All Transactions
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No trading activity yet</p>
                <Button
                  className="mt-4"
                  onClick={() => (window.location.href = "/markets")}
                >
                  Start Trading
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* LP Positions */}
      {lpPositions && lpPositions.length > 0 && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Liquidity Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lpPositions.map((position, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">{position.marketTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {position.lpTokens} LP tokens
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(position.value)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {position.feesEarned} fees earned
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Join Date */}
      {stats.joinDate && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-lg font-semibold">
                    {new Date(stats.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
