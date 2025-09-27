/**
 * PulseDelta Market Types
 * Comprehensive type definitions for the prediction market
 */

export interface Market {
  id: string;
  address: string; // Contract address
  type: "binary" | "multi" | "scalar"; // Market type
  title: string;
  description: string;
  outcomes: string[];
  endTime: number;
  resolved: boolean;
  winningOutcome?: number;
  totalLiquidity: string;
  creator: string;
  category: MarketCategory;
  volume24h: string;
  volume7d: string;
  volumeTotal: string;
  participantCount: number;
  createdAt: number;
  updatedAt: number;
  outcomeShares: OutcomeShares[];
  priceHistory: PricePoint[];
  metadata?: MarketMetadata;
  // Supabase metadata fields
  tags?: string[];
  resolutionSource?: string;
  template?: string;
  marketType?: "binary" | "multi" | "scalar";
  // Market states
  state: MarketState;
  curationStatus: CurationStatus;
}

export type MarketState = "Open" | "Closed" | "Resolved";
export type CurationStatus = "Pending" | "Approved" | "Flagged";

export interface OutcomeShares {
  outcomeIndex: number;
  totalShares: string;
  price: string;
  priceChange24h: number;
  holders: number;
}

export interface PricePoint {
  timestamp: number;
  outcomeIndex: number;
  price: string;
  volume: string;
}

export interface MarketMetadata {
  tags: string[];
  source?: string;
  verificationLevel: "unverified" | "community" | "official";
  resolutionSource?: string;
}

export type MarketCategory = "sports" | "crypto" | "trends";

export type MarketStatus = "open" | "closed" | "resolved" | "disputed";

export interface TradeOrder {
  id: string;
  marketId: string;
  outcomeIndex: number;
  amount: string;
  price: string;
  isBuy: boolean;
  trader: string;
  timestamp: number;
  status: "pending" | "filled" | "cancelled" | "failed";
  txHash?: string;
}

export interface LiquidityPosition {
  id: string;
  marketId: string;
  provider: string;
  lpTokens: string;
  initialValue: string;
  currentValue: string;
  fees24h: string;
  timestamp: number;
}

export interface MarketFilter {
  category?: MarketCategory;
  status?: MarketStatus;
  minLiquidity?: string;
  maxLiquidity?: string;
  search?: string;
  sortBy: "volume" | "liquidity" | "created" | "ending";
  sortOrder: "asc" | "desc";
}

export interface CreateMarketParams {
  title: string;
  description: string;
  outcomes: string[];
  endTime: number;
  category: MarketCategory;
  initialLiquidity: string;
  tags?: string[];
  resolutionSource?: string;
}

export interface TradingPair {
  outcomeIndex: number;
  price: string;
  volume24h: string;
  priceChange24h: number;
  depth: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  };
}

export interface OrderBookEntry {
  price: string;
  size: string;
  total: string;
}
