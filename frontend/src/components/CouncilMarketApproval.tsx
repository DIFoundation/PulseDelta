"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagsList } from "@/components/ui/tags";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCouncil } from "@/hooks/useCouncil";
import type { Market } from "@/types/market";

/**
 * Council component for reviewing and managing markets by status
 */
export function CouncilMarketApproval() {
  const {
    pendingMarkets,
    approvedMarkets,
    flaggedMarkets,
    isLoadingMarkets,
    approveMarket,
    flagMarket,
    isActionLoading,
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

  // Market card component
  const MarketCard = ({
    market,
    index,
    showActions = true,
  }: {
    market: Market;
    index: number;
    showActions?: boolean;
  }) => (
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
                <Badge
                  className={getCurationStatusColor(market.curationStatus)}
                >
                  {market.curationStatus === "Pending" && (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {market.curationStatus === "Approved" && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {market.curationStatus === "Flagged" && (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
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
              <div>ID: {market.id}</div>
              <div>
                Creator: {market.creator.slice(0, 6)}...
                {market.creator.slice(-4)}
              </div>
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
                <div className="font-semibold capitalize">
                  {market.category}
                </div>
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
            {showActions && (
              <div className="flex items-center gap-3 pt-4 border-t">
                {market.curationStatus === "Pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() =>
                        approveMarket(parseInt(market.id.split(":")[1]))
                      }
                      disabled={isActionLoading(
                        parseInt(market.id.split(":")[1]),
                        "approve"
                      )}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isActionLoading(
                        parseInt(market.id.split(":")[1]),
                        "approve"
                      )
                        ? "Approving..."
                        : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        flagMarket(parseInt(market.id.split(":")[1]))
                      }
                      disabled={isActionLoading(
                        parseInt(market.id.split(":")[1]),
                        "flag"
                      )}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isActionLoading(
                        parseInt(market.id.split(":")[1]),
                        "flag"
                      )
                        ? "Flagging..."
                        : "Flag"}
                    </Button>
                  </>
                )}
                {market.curationStatus === "Approved" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      flagMarket(parseInt(market.id.split(":")[1]))
                    }
                    disabled={isActionLoading(
                      parseInt(market.id.split(":")[1]),
                      "flag"
                    )}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {isActionLoading(parseInt(market.id.split(":")[1]), "flag")
                      ? "Flagging..."
                      : "Flag"}
                  </Button>
                )}
                {market.curationStatus === "Flagged" && (
                  <Button
                    size="sm"
                    onClick={() =>
                      approveMarket(parseInt(market.id.split(":")[1]))
                    }
                    disabled={isActionLoading(
                      parseInt(market.id.split(":")[1]),
                      "approve"
                    )}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isActionLoading(
                      parseInt(market.id.split(":")[1]),
                      "approve"
                    )
                      ? "Approving..."
                      : "Approve"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/market/${market.id}`, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoadingMarkets) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Curation Dashboard</h2>
          <p className="text-muted-foreground">
            Review and manage markets by their curation status
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {pendingMarkets.length} pending
          </Badge>
          <Badge
            variant="outline"
            className="text-sm bg-green-50 text-green-700"
          >
            {approvedMarkets.length} approved
          </Badge>
          <Badge variant="outline" className="text-sm bg-red-50 text-red-700">
            {flaggedMarkets.length} flagged
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingMarkets.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedMarkets.length})
          </TabsTrigger>
          <TabsTrigger value="flagged" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Flagged ({flaggedMarkets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingMarkets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    No pending markets require review at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingMarkets.map((market, index) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  index={index}
                  showActions={true}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {approvedMarkets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Approved Markets
                  </h3>
                  <p className="text-muted-foreground">
                    No markets have been approved yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvedMarkets.map((market, index) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  index={index}
                  showActions={true}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="flagged">
          <div className="space-y-4">
            {flaggedMarkets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Flagged Markets
                  </h3>
                  <p className="text-muted-foreground">
                    No markets have been flagged for review.
                  </p>
                </CardContent>
              </Card>
            ) : (
              flaggedMarkets.map((market, index) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  index={index}
                  showActions={true}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
