/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TemplateSelection } from "@/components/TemplateSelection";
import { MarketTypeSelection } from "@/components/MarketTypeSelection";
import { MarketDetails } from "@/components/MarketDetails";
import { OutcomeConfiguration } from "@/components/OutcomeConfiguration";
import { MarketPreview } from "@/components/MarketPreview";
import { useCreateMarket } from "@/hooks/use-create-market";
import { useTradingFee } from "@/hooks/useFee";

export interface MarketTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  outcomes: string[];
  resolutionCriteria: string;
  examples: string[];
}

export interface MarketFormData {
  template: MarketTemplate | null;
  marketType: "binary" | "multi" | "scalar" | null;
  title: string;
  description: string;
  category: string;
  outcomes: string[];
  endDate: string;
  resolutionSource: string;
  tags: string[];
  fee: number;
  initialLiquidity: string;
  // For scalar markets
  minValue?: string;
  maxValue?: string;
}

const steps = [
  { id: 1, name: "Template", description: "Choose oracle type" },
  { id: 2, name: "Market Type", description: "Select market structure" },
  { id: 3, name: "Details", description: "Add market information" },
  { id: 4, name: "Outcomes", description: "Configure outcomes" },
  { id: 5, name: "Preview", description: "Review and submit" },
];

/**
 * Multi-step market creation wizard with templates and validation
 * Guides users through creating prediction markets with proper validation
 */
export function MarketCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const { feePercentage } = useTradingFee();

  const [formData, setFormData] = useState<MarketFormData>({
    template: null,
    marketType: null,
    title: "",
    description: "",
    category: "",
    outcomes: ["Yes", "No"],
    endDate: "",
    resolutionSource: "",
    tags: [],
    fee: feePercentage,
    initialLiquidity: "10",
  });

  const { createMarket, isCreating, txState } = useCreateMarket();

  const updateFormData = (updates: Partial<MarketFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.template !== null;
      case 2:
        return formData.marketType !== null;
      case 3:
        return (
          formData.title.length > 10 &&
          formData.description.length > 50 &&
          formData.endDate &&
          formData.initialLiquidity &&
          parseFloat(formData.initialLiquidity) > 0
        );
      case 4:
        return (
          formData.outcomes.length >= 2 &&
          formData.outcomes.every((o) => o.trim().length > 0)
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    try {
      await createMarket(formData);
      // Success handled by the hook
    } catch (error) {
      console.error("Failed to create market:", error);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create Prediction Market
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Launch your own prediction market with our guided wizard. Choose
            from templates or create custom markets.
          </p>
        </div>

        {/* Progress */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                Step {currentStep} of {steps.length}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>

          <Progress value={progress} className="mb-4" />

          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step.id < currentStep
                      ? "bg-secondary text-secondary-foreground"
                      : step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className="text-sm font-medium">{step.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-12 h-px bg-border mx-4 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Step Content */}
      <div className="glass-card p-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="template"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TemplateSelection
                selectedTemplate={formData.template}
                onTemplateSelect={(template) => updateFormData({ template })}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="market-type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MarketTypeSelection
                formData={formData}
                updateFormData={updateFormData}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MarketDetails
                formData={formData}
                updateFormData={updateFormData}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="outcomes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OutcomeConfiguration
                outcomes={formData.outcomes.map((o, i) => ({
                  id: `outcome-${i}`,
                  name: o,
                }))}
                onChange={(updatedOutcomes) =>
                  updateFormData({
                    outcomes: updatedOutcomes.map((o) => o.name),
                  })
                }
              />
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MarketPreview
                market={{
                  title: formData.title,
                  description: formData.description,
                  category: formData.category,
                  outcomes: formData.outcomes.map((o, i) => ({
                    id: String(i),
                    name: o,
                  })),
                  endDate: formData.endDate,
                  creatorFee: formData.fee,
                  resolutionSource: formData.resolutionSource,
                  // optional:
                  initialLiquidity: 1000, // or derive if needed
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="glass-card bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center space-x-3">
          {!canProceed() && (
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 mr-1" />
              Complete required fields to continue
            </div>
          )}

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-primary hover:bg-primary/90"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isCreating}
              className="bg-secondary hover:bg-secondary/90"
            >
              {isCreating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Market...</span>
                </div>
              ) : (
                "Create Market"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
