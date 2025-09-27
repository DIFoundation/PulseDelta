"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MarketCategory, MarketStatus } from "@/types/market";

interface MarketFiltersProps {
  selectedCategory: MarketCategory | "all";
  onCategoryChange: (c: MarketCategory | "all") => void;
  selectedStatus: MarketStatus | "all";
  onStatusChange: (s: MarketStatus | "all") => void;
  onResetFilters: () => void;
}

export function MarketFilters({
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
}: MarketFiltersProps) {
  return (
    <div className="space-y-4 p-4 border rounded-xl bg-white/70 dark:bg-gray-900/70 shadow">
      <h3 className="text-lg font-semibold">Filters</h3>

      {/* Category filter */}
      <div>
        <label className="text-sm font-medium">Category</label>
        <Select
          value={selectedCategory}
          onValueChange={(val) =>
            onCategoryChange(val === "all" ? "all" : (val as MarketCategory))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="trends">Trends</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status filter */}
      <div>
        <label className="text-sm font-medium">Status</label>
        <Select
          value={selectedStatus}
          onValueChange={(val) =>
            onStatusChange(val === "all" ? "all" : (val as MarketStatus))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      <Button variant="outline" className="w-full" onClick={onResetFilters}>
        Reset Filters
      </Button>
    </div>
  );
}
