"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagsList } from "@/components/ui/tags";
import { useCouncil } from "@/hooks/useCouncil";
import type { Market } from "@/types/market";

/**
 * Council component for reviewing and approving pending markets
 */
export function CouncilMarketApproval() {
  const {
    pendingMarkets,
    isLoadingPending,
    approveMarket,
    flagMarket,
    isApproving,
    isFlagging,
  } = useCouncil();

  const getCurationStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Flagged":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "Open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "Closed":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "Resolved":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (isLoadingPending) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pendingMarkets.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground">
            No pending markets require review at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pending Market Review</h2>
          <p className="text-muted-foreground">
            Review and approve markets before they go live
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {pendingMarkets.length} pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {pendingMarkets.map((market, index) => (
          <motion.div
            key={market.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getCurationStatusColor(market.curationStatus)}>
                        <Clock className="h-3 w-3 mr-1" />
                        {market.curationStatus}
                      </Badge>
                      <Badge className={getStateColor(market.state)}>
                        {market.state}
                      </Badge>
                      <Badge variant="outline">
                        {market.marketType || "Unknown"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {market.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {market.description || "No description provided"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>ID: #{market.id}</div>
                    <div>Creator: {market.creator.slice(0, 6)}...{market.creator.slice(-4)}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Market Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Liquidity</div>
                      <div className="font-semibold">
                        {parseFloat(market.totalLiquidity).toFixed(2)} BDAG
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">End Time</div>
                      <div className="font-semibold">
                        {new Date(market.endTime * 1000).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Outcomes</div>
                      <div className="font-semibold">{market.outcomes.length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Category</div>
                      <div className="font-semibold capitalize">{market.category}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  {market.tags && market.tags.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Tags</div>
                      <TagsList
                        tags={market.tags}
                        variant="secondary"
                        size="sm"
                        maxTags={5}
                      />
                    </div>
                  )}

                  {/* Outcomes Preview */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Outcomes</div>
                    <div className="flex flex-wrap gap-2">
                      {market.outcomes.slice(0, 4).map((outcome, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {outcome}
                        </Badge>
                      ))}
                      {market.outcomes.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{market.outcomes.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => approveMarket(parseInt(market.id))}
                      disabled={isApproving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isApproving ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => flagMarket(parseInt(market.id))}
                      disabled={isFlagging}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isFlagging ? "Flagging..." : "Flag"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/market/${market.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
