import { supabase } from "./client";
import type {
  MarketMetadata,
  CreateMarketMetadataData,
  UpdateMarketMetadataData,
} from "./types";

export class MarketMetadataService {
  // Create new market metadata (before market creation)
  static async create(
    data: CreateMarketMetadataData
  ): Promise<MarketMetadata | null> {
    try {
      const { data: result, error } = await supabase
        .from("pulsedelta")
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error("Error creating market metadata:", error);
        return null;
      }

      return result;
    } catch (error) {
      console.error("Error creating market metadata:", error);
      return null;
    }
  }

  // Update market metadata with contract address and ID (after market creation)
  static async updateWithContractData(
    id: string,
    marketAddress: string,
    marketId: number
  ): Promise<MarketMetadata | null> {
    try {
      const { data: result, error } = await supabase
        .from("pulsedelta")
        .update({
          market_adddress: marketAddress,
          market_id: marketId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating market metadata:", error);
        return null;
      }

      return result;
    } catch (error) {
      console.error("Error updating market metadata:", error);
      return null;
    }
  }

  // Get market metadata by contract address
  static async getByMarketAddress(
    marketAddress: string
  ): Promise<MarketMetadata | null> {
    try {
      const { data: result, error } = await supabase
        .from("pulsedelta")
        .select("*")
        .eq("market_adddress", marketAddress)
        .single();

      if (error) {
        console.error("Error fetching market metadata:", error?.message || error);
        return null;
      }

      return result;
    } catch (error) {
      console.error("Error fetching market metadata:", error);
      return null;
    }
  }

  // Get all market metadata
  static async getAll(): Promise<MarketMetadata[]> {
    try {
      const { data: result, error } = await supabase
        .from("pulsedelta")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all market metadata:", error);
        return [];
      }

      return result || [];
    } catch (error) {
      console.error("Error fetching all market metadata:", error);
      return [];
    }
  }

  // Get market metadata by creator
  static async getByCreator(creatorAddress: string): Promise<MarketMetadata[]> {
    try {
      const { data: result, error } = await supabase
        .from("pulsedelta")
        .select("*")
        .eq("creator_address", creatorAddress)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching market metadata by creator:", error);
        return [];
      }

      return result || [];
    } catch (error) {
      console.error("Error fetching market metadata by creator:", error);
      return [];
    }
  }

  // Search markets by tags or category
  static async search(query: string): Promise<MarketMetadata[]> {
    try {
      const { data: result, error } = await supabase
        .from("pulsedelta")
        .select("*")
        .or(
          `tags.cs.{${query}},category.ilike.%${query}%,template_name.ilike.%${query}%`
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error searching market metadata:", error);
        return [];
      }

      return result || [];
    } catch (error) {
      console.error("Error searching market metadata:", error);
      return [];
    }
  }

  // Update market metadata
  static async update(
    id: string,
    data: UpdateMarketMetadataData
  ): Promise<MarketMetadata | null> {
    try {
      const { data: result, error } = await supabase
        .from("pulsedelta")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating market metadata:", error);
        return null;
      }

      return result;
    } catch (error) {
      console.error("Error updating market metadata:", error);
      return null;
    }
  }

  // Delete market metadata
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("pulsedelta").delete().eq("id", id);

      if (error) {
        console.error("Error deleting market metadata:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting market metadata:", error);
      return false;
    }
  }
}
