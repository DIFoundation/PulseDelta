/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  BarChart3,
  Users,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketCard } from "@/components/MarketCard";
import { Badge } from "@/components/ui/badge";
import { HeroCarousel } from "@/components/HeroCarousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarketList } from "@/hooks/useMarket";
import { toast } from "@/hooks/use-toast";
import { MarketFilter } from "@/types/market"; // adjust path if needed
import { isMarketCategory } from "@/utils/guard";

export default function Index() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<MarketFilter["sortBy"]>("created");
  const [sortOrder, setSortOrder] = useState<MarketFilter["sortOrder"]>("desc");

  // build filter explicitly as MarketFilter
  const filter: MarketFilter = {
    category:
      selectedCategory === "all"
        ? undefined
        : isMarketCategory(selectedCategory)
        ? selectedCategory
        : undefined,
    search: searchTerm,
    sortBy,
    sortOrder,
  };

  // fetch more than 3 but slice for landing
  const { data: markets, isLoading } = useMarketList(0, 20, filter);

  const handleQuickTrade = (marketId: string, outcomeIndex: number) => {
    toast({
      title: "Quick Trade",
      description: `Opening trade modal for market ${marketId}, outcome ${outcomeIndex}`,
    });
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <>
      {/* Hero Section - Full Width Carousel */}
      <HeroCarousel />

      <div className="container mx-auto px-4 space-y-12">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
          variants={itemVariants}
        >
          <motion.div
            variants={statVariants}
            className="glass-card p-6 text-center"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">
              2.4M BDAG
            </div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </motion.div>

          <motion.div
            variants={statVariants}
            className="glass-card p-6 text-center"
          >
            <div className="w-12 h-12 bg-accent-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-accent-success" />
            </div>
            <div className="text-3xl font-bold text-accent-success mb-2">
              12,450
            </div>
            <div className="text-sm text-muted-foreground">Active Traders</div>
          </motion.div>

          <motion.div
            variants={statVariants}
            className="glass-card p-6 text-center"
          >
            <div className="w-12 h-12 bg-accent-danger/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-accent-danger" />
            </div>
            <div className="text-3xl font-bold text-accent-danger mb-2">
              847
            </div>
            <div className="text-sm text-muted-foreground">Active Markets</div>
          </motion.div>
        </motion.div>

        {/* Market Feed (latest 3 only) */}
        <section>
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Markets</h2>
              <p className="text-muted-foreground">
                Here are the 3 most recent active markets
              </p>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {markets?.slice(0, 3).map((market, index) => (
                <motion.div
                  key={market.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <MarketCard
                    market={market}
                    showQuickTrade={true}
                    onQuickTrade={handleQuickTrade}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* View all button */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="glass-card hover:bg-primary/5"
              onClick={() => router.push("/markets")}
            >
              View All Markets
            </Button>
          </motion.div>
        </section>
      </div>
    </>
  );
}
