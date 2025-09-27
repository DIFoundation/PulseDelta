"use client";

import type React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Target, BarChart3, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MarketFormData } from "@/components/MarketCreationWizard";

interface MarketTypeSelectionProps {
  formData: MarketFormData;
  updateFormData: (updates: Partial<MarketFormData>) => void;
}

const marketTypes = [
  {
    id: "binary",
    name: "Binary Market",
    description: "Simple Yes/No prediction markets",
    icon: Target,
    example: "Will Bitcoin reach $100,000 by end of 2024?",
    outcomes: ["Yes", "No"],
    useCase: "Perfect for clear-cut predictions with two possible outcomes",
  },
  {
    id: "multi",
    name: "Multi-Outcome Market",
    description: "Multiple choice prediction markets",
    icon: BarChart3,
    example: "Which team will win the Super Bowl 2025?",
    outcomes: ["Team A", "Team B", "Team C", "Other"],
    useCase:
      "Great for tournaments, elections, or any scenario with multiple possible winners",
  },
  {
    id: "scalar",
    name: "Scalar Market",
    description: "Long/Short price prediction markets",
    icon: TrendingUp,
    example: "What will be the price of Ethereum on December 31, 2024?",
    outcomes: ["Long", "Short"],
    useCase:
      "Ideal for price predictions, numerical values, or continuous outcomes",
  },
];

/**
 * Market type selection component
 * Allows creators to choose between Binary, Multi-outcome, or Scalar markets
 */
export function MarketTypeSelection({
  formData,
  updateFormData,
}: MarketTypeSelectionProps) {
  const handleTypeSelect = (type: "binary" | "multi" | "scalar") => {
    updateFormData({ marketType: type });

    // Set default outcomes based on market type
    if (type === "binary") {
      updateFormData({ outcomes: ["Yes", "No"] });
    } else if (type === "multi") {
      updateFormData({ outcomes: ["Option A", "Option B", "Option C"] });
    } else if (type === "scalar") {
      updateFormData({ outcomes: ["Long", "Short"] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Market Type</h2>
        <p className="text-muted-foreground">
          Select the structure that best fits your prediction market
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {marketTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = formData.marketType === type.id;

          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? "ring-2 ring-primary bg-primary/5 border-primary/20"
                  : "hover:border-primary/50"
              }`}
              onClick={() =>
                handleTypeSelect(type.id as "binary" | "multi" | "scalar")
              }
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{type.name}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Example:</h4>
                  <p className="text-sm text-muted-foreground italic">
                    &quot;{type.example}&quot;
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Outcomes:</h4>
                  <div className="flex flex-wrap gap-1">
                    {type.outcomes.map((outcome) => (
                      <span
                        key={outcome}
                        className="px-2 py-1 text-xs bg-muted rounded-md"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Best for:</h4>
                  <p className="text-sm text-muted-foreground">
                    {type.useCase}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center text-primary"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Selected</span>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {formData.marketType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border border-primary/20 bg-primary/5"
        >
          <h4 className="font-semibold text-primary mb-2">
            Selected:{" "}
            {marketTypes.find((t) => t.id === formData.marketType)?.name}
          </h4>
          <p className="text-sm text-muted-foreground">
            {marketTypes.find((t) => t.id === formData.marketType)?.useCase}
          </p>
        </motion.div>
      )}
    </div>
  );
}
