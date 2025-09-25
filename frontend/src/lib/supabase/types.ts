export interface MarketMetadata {
  id: string;
  market_address: string | null;
  market_id: number | null;
  category: string;
  market_type: "binary" | "multi" | "scalar";
  tags: string[];
  resolution_source: string;
  template_name: string;
  creator_address: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMarketMetadataData {
  category: string;
  market_type: "binary" | "multi" | "scalar";
  tags: string[];
  resolution_source: string;
  template_name: string;
  creator_address: string;
}

export interface UpdateMarketMetadataData {
  market_address?: string;
  market_id?: number;
  tags?: string[];
  resolution_source?: string;
  template_name?: string;
}
