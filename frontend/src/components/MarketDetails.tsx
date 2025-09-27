"use client";

import type React from "react";

import { Calendar, Tag, AlertCircle, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { MarketFormData } from "@/components/MarketCreationWizard";
import { useTradingFee } from "@/hooks/useFee";

interface MarketDetailsProps {
  formData: MarketFormData;
  updateFormData: (updates: Partial<MarketFormData>) => void;
}

/**
 * Market details form component
 * Collects title, description, end date, and other market metadata
 */
export function MarketDetails({
  formData,
  updateFormData,
}: MarketDetailsProps) {
  const { feeDisplay, isReadOnly } = useTradingFee();

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      updateFormData({ tags: [...formData.tags, tag.trim()] });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    updateFormData({
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      handleTagAdd(input.value);
      input.value = "";
    }
  };

  // Calculate minimum end date (24 hours from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Market Details</h2>
        <p className="text-muted-foreground">
          Provide clear and specific information about your prediction market
        </p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Market Title *
          </Label>
          <Input
            id="title"
            placeholder="Enter a clear, specific question (e.g., 'Will Bitcoin reach $100,000 by end of 2024?')"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="glass bg-input/50 border-border/20"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formData.title.length}/200 characters</span>
            {formData.title.length < 10 && formData.title.length > 0 && (
              <div className="flex items-center text-accent">
                <AlertCircle className="w-3 h-3 mr-1" />
                Title should be at least 10 characters
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="description"
            placeholder="Provide detailed resolution criteria and context. Be specific about how the market will be resolved and what sources will be used."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            className="glass bg-input/50 border-border/20 min-h-[120px]"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formData.description.length}/1000 characters</span>
            {formData.description.length < 50 &&
              formData.description.length > 0 && (
                <div className="flex items-center text-accent">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Description should be at least 50 characters
                </div>
              )}
          </div>
        </div>

        {/* Category and End Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Input
              id="category"
              placeholder="e.g., Crypto, Politics, Sports"
              value={formData.category}
              onChange={(e) => updateFormData({ category: e.target.value })}
              className="glass bg-input/50 border-border/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">
              End Date *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="endDate"
                type="datetime-local"
                min={minDateString}
                value={formData.endDate}
                onChange={(e) => updateFormData({ endDate: e.target.value })}
                className="glass bg-input/50 border-border/20 pl-10"
              />
            </div>
          </div>
        </div>

        {/* Resolution Source */}
        <div className="space-y-2">
          <Label htmlFor="resolutionSource" className="text-sm font-medium">
            Resolution Source
          </Label>
          <Input
            id="resolutionSource"
            placeholder="e.g., CoinGecko API, Official Election Results, ESPN"
            value={formData.resolutionSource}
            onChange={(e) =>
              updateFormData({ resolutionSource: e.target.value })
            }
            className="glass bg-input/50 border-border/20"
          />
          <p className="text-xs text-muted-foreground">
            Specify the authoritative source that will be used to resolve this
            market
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags</Label>
          <div className="space-y-3">
            <Input
              placeholder="Add tags (press Enter or comma to add)"
              onKeyDown={handleTagKeyPress}
              className="glass bg-input/50 border-border/20"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleTagRemove(tag)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <span className="ml-1 text-xs">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Initial Liquidity and Trading Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="initialLiquidity" className="text-sm font-medium">
              Initial Liquidity (BDAG) *
            </Label>
            <Input
              id="initialLiquidity"
              type="number"
              placeholder="10"
              value={formData.initialLiquidity}
              onChange={(e) =>
                updateFormData({ initialLiquidity: e.target.value })
              }
              className="glass bg-input/50 border-border/20"
              min="1"
              step="0.1"
            />
            <p className="text-xs text-muted-foreground">
              Amount of BDAG you&apos;ll provide as initial liquidity
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="fee"
              className="text-sm font-medium flex items-center gap-2"
            >
              Trading Fee (%)
              {isReadOnly && <Lock className="w-3 h-3 text-muted-foreground" />}
            </Label>
            <div className="relative">
              <Input
                id="fee"
                type="text"
                value={feeDisplay}
                readOnly
                disabled
                className="glass bg-input/30 border-border/20 pr-10 cursor-not-allowed opacity-75"
              />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            <p className="text-xs text-muted-foreground">
              Fixed trading fee set by the protocol. This fee is automatically
              applied to all trades.
            </p>
          </div>
        </div>
      </div>

      {/* Template Info */}
      {formData.template && (
        <div className="glass-card p-4 border border-primary/20 bg-primary/5">
          <h4 className="font-semibold text-primary mb-2">
            Template: {formData.template.name}
          </h4>
          <p className="text-sm text-muted-foreground">
            {formData.template.resolutionCriteria}
          </p>
        </div>
      )}
    </div>
  );
}
