"use client";

import { useCallback } from "react";
import { useFactory } from "@/hooks/useFactory";
import { useTransaction } from "@/utils/optimistic";
import { useToast } from "@/components/toast";
import { MarketMetadataService } from "@/lib/supabase";
import { useAccount } from "wagmi";
import type { MarketFormData } from "@/components/MarketCreationWizard";

/**
 * Hook for creating new prediction markets
 * Handles form validation, contract interaction, and user feedback
 */
export function useCreateMarket() {
  const { address } = useAccount();
  const {
    createBinaryMarket,
    createMultiMarket,
    createScalarMarket,
    isPending,
  } = useFactory();

  const {
    txState,
    startTransaction,
    setTransactionHash,
    confirmTransaction,
    failTransaction,
    resetTransaction,
  } = useTransaction();
  const { addToast } = useToast();

  const createMarket = useCallback(
    async (formData: MarketFormData) => {
      if (!formData.template) {
        throw new Error("Template is required");
      }

      if (!formData.marketType) {
        throw new Error("Market type is required");
      }

      try {
        startTransaction();

        // First, store frontend-only data in Supabase
        const metadataData = {
          category: formData.template.category.toLowerCase(),
          market_type: formData.marketType,
          tags: formData.tags,
          resolution_source: formData.resolutionSource,
          template_name: formData.template.name,
          creator_address: address || "",
        };

        const metadata = await MarketMetadataService.create(metadataData);
        if (!metadata) {
          throw new Error("Failed to create market metadata");
        }

        addToast({
          title: "Creating Market",
          description: "Submitting your market to the blockchain...",
          type: "info",
          duration: 5000,
        });

        // Convert form data to contract parameters
        const endTime = Math.floor(new Date(formData.endDate).getTime() / 1000);
        const startTime = Math.floor(Date.now() / 1000) + 3600; // Start in 1 hour
        const resolutionDeadline = endTime + 7 * 24 * 3600; // 7 days after end time

        // Prepare common parameters
        const commonParams = {
          title: formData.title,
          description: formData.description,
          creator: "", // Will be set by the wallet
          oracleAdapter: "", // Will be set by getOracleAddress
          feeRouter: "", // Will be set by the factory
          tokenFactory: "", // Will be set by the factory
          marketKey: "", // Will be generated
          feeBps: 100, // 1% fee
          startTime,
          endTime,
          resolutionDeadline,
          initialLiquidity: formData.initialLiquidity,
        };

        // Call appropriate factory function based on market type
        let marketResult: {
          hash: string;
          marketAddress: string;
          marketId: number;
        };

        if (formData.marketType === "binary") {
          marketResult = await createBinaryMarket({
            ...commonParams,
            category: formData.template.category.toLowerCase() as
              | "sports"
              | "crypto"
              | "trends",
            outcomes: ["Yes", "No"],
          });
        } else if (formData.marketType === "multi") {
          marketResult = await createMultiMarket({
            ...commonParams,
            category: formData.template.category.toLowerCase() as
              | "sports"
              | "crypto"
              | "trends",
            outcomes: formData.outcomes,
          });
        } else if (formData.marketType === "scalar") {
          marketResult = await createScalarMarket({
            ...commonParams,
            category: formData.template.category.toLowerCase() as
              | "sports"
              | "crypto"
              | "trends",
            outcomes: ["Long", "Short"],
            minValue: formData.minValue || "0",
            maxValue: formData.maxValue || "1000000",
          });
        } else {
          throw new Error("Invalid market type");
        }

        setTransactionHash(marketResult.hash);

        addToast({
          title: "Market Submitted",
          description: "Your market is being processed on the blockchain",
          type: "info",
          duration: 5000,
          action: {
            label: "View Transaction",
            onClick: () =>
              window.open(
                `https://etherscan.io/tx/${marketResult.hash}`,
                "_blank"
              ),
          },
        });

        // Update Supabase with real contract data
        console.log("Updating Supabase with contract data:", {
          metadataId: metadata.id,
          marketAddress: marketResult.marketAddress,
          marketId: marketResult.marketId,
        });

        const updateResult = await MarketMetadataService.updateWithContractData(
          metadata.id,
          marketResult.marketAddress,
          marketResult.marketId
        );

        console.log("Supabase update result:", updateResult);

        // Create the proper market ID format
        const marketId = `${formData.marketType}:${marketResult.marketId}`;

        // Simulate confirmation (in real app, this would be handled by wagmi)
        setTimeout(async () => {
          confirmTransaction("0.0045 ETH");

          addToast({
            title: "Market Created Successfully!",
            description:
              "Your prediction market is now live and ready for trading",
            type: "success",
            duration: 8000,
            action: {
              label: "View Market",
              onClick: () => {
                // Navigate to market page with correct format
                window.location.href = `/market/${marketId}`;
              },
            },
          });

          // Redirect user to the marketplace after successful creation
          // This ensures users land on the markets listing page immediately
          window.location.href = "/markets";
        }, 3000);
      } catch (error) {
        failTransaction(
          error instanceof Error ? error.message : "Failed to create market"
        );

        addToast({
          title: "Market Creation Failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          type: "error",
          duration: 5000,
        });

        throw error;
      }
    },
    [
      address,
      createBinaryMarket,
      createMultiMarket,
      createScalarMarket,
      addToast,
      startTransaction,
      setTransactionHash,
      confirmTransaction,
      failTransaction,
    ]
  );

  return {
    createMarket,
    isCreating:
      isPending ||
      txState.status === "pending" ||
      txState.status === "confirming",
    txState,
    resetTransaction,
  };
}
