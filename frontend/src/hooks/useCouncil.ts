import {
  useReadContract,
  useWriteContract,
  useAccount,
  useWalletClient,
} from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/configs";
import { ABI, CONTRACT_ADDRESSES } from "@/lib/abiAndAddress";
import { useFactory } from "./useFactory";
import { toast } from "react-toastify";
import { useState } from "react";
import type { Market, CurationStatus } from "@/types/market";

/**
 * Hook for council functionality and market curation
 */
export function useCouncil() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();
  const factory = useFactory();

  // Individual loading states for each market action
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // Check if connected wallet is a council member
  const { data: isCouncilMember } = useReadContract({
    address: CONTRACT_ADDRESSES.curation as `0x${string}`,
    abi: ABI.curation,
    functionName: "isCouncilMember",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get all markets organized by curation status
  const { data: allMarkets, isLoading: isLoadingMarkets } = useQuery({
    queryKey: ["council", "allMarkets"],
    queryFn: async () => {
      const pendingMarkets: Market[] = [];
      const approvedMarkets: Market[] = [];
      const flaggedMarkets: Market[] = [];

      // Get all market types
      const binaryCount = await factory.getMarketCount("binary");
      const multiCount = await factory.getMarketCount("multi");
      const scalarCount = await factory.getMarketCount("scalar");

      const binaryCountNum = Number(binaryCount || 0);
      const multiCountNum = Number(multiCount || 0);
      const scalarCountNum = Number(scalarCount || 0);

      // Process binary markets (1-indexed to match contract)
      for (let i = 1; i <= binaryCountNum; i++) {
        const marketAddress = await factory.getMarketAddress("binary", i);
        if (marketAddress) {
          const curationStatus = await getCurationStatus(i);
          const marketData = await factory.getMarketData(
            marketAddress,
            "binary",
            i // Pass global market ID
          );
          if (marketData) {
            const market = {
              ...marketData,
              id: `binary:${i}`,
              curationStatus,
              state: marketData.state as "Open" | "Closed" | "Resolved",
            };

            if (curationStatus === "Pending") pendingMarkets.push(market);
            else if (curationStatus === "Approved")
              approvedMarkets.push(market);
            else if (curationStatus === "Flagged") flaggedMarkets.push(market);
          }
        }
      }

      // Process multi markets (1-indexed to match contract)
      for (let i = 1; i <= multiCountNum; i++) {
        const marketAddress = await factory.getMarketAddress("multi", i);
        if (marketAddress) {
          const curationStatus = await getCurationStatus(binaryCountNum + i);
          const marketData = await factory.getMarketData(
            marketAddress,
            "multi",
            i // Pass global market ID
          );
          if (marketData) {
            const market = {
              ...marketData,
              id: `multi:${i}`,
              curationStatus,
              state: marketData.state as "Open" | "Closed" | "Resolved",
            };

            if (curationStatus === "Pending") pendingMarkets.push(market);
            else if (curationStatus === "Approved")
              approvedMarkets.push(market);
            else if (curationStatus === "Flagged") flaggedMarkets.push(market);
          }
        }
      }

      // Process scalar markets (1-indexed to match contract)
      for (let i = 1; i <= scalarCountNum; i++) {
        const marketAddress = await factory.getMarketAddress("scalar", i);
        if (marketAddress) {
          const curationStatus = await getCurationStatus(
            binaryCountNum + multiCountNum + i
          );
          const marketData = await factory.getMarketData(
            marketAddress,
            "scalar",
            i // Pass global market ID
          );
          if (marketData) {
            const market = {
              ...marketData,
              id: `scalar:${i}`,
              curationStatus,
              state: marketData.state as "Open" | "Closed" | "Resolved",
            };

            if (curationStatus === "Pending") pendingMarkets.push(market);
            else if (curationStatus === "Approved")
              approvedMarkets.push(market);
            else if (curationStatus === "Flagged") flaggedMarkets.push(market);
          }
        }
      }

      return {
        pending: pendingMarkets,
        approved: approvedMarkets,
        flagged: flaggedMarkets,
      };
    },
    enabled: !!isCouncilMember,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Get curation status for a specific market
  const getCurationStatus = async (
    marketId: number
  ): Promise<CurationStatus> => {
    try {
      const status = await readContract(config, {
        address: CONTRACT_ADDRESSES.curation as `0x${string}`,
        abi: ABI.curation,
        functionName: "statusOf",
        args: [BigInt(marketId)],
      });

      const statusNum = Number(status);
      return statusNum === 0
        ? "Pending"
        : statusNum === 1
        ? "Approved"
        : "Flagged";
    } catch (error) {
      console.error("Failed to read curation status:", error);
      return "Pending"; // Default to pending if read fails
    }
  };

  // Approve market function
  const approveMarket = async (marketId: number) => {
    if (!walletClient) {
      toast.error("Wallet not connected");
      return;
    }

    const key = `approve-${marketId}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));

    try {
      toast.info("Approving market...");

      // Write the transaction using wallet client
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.curation as `0x${string}`,
        abi: ABI.curation,
        functionName: "approveMarket",
        args: [marketId],
      });

      // Wait for transaction to be confirmed
      await waitForTransactionReceipt(config, { hash });

      // Only show success toast after transaction is confirmed
      toast.success("Market approved successfully!");

      // Refresh data immediately
      await queryClient.refetchQueries({
        queryKey: ["council", "allMarkets"],
      });
      await queryClient.refetchQueries({ queryKey: ["markets"] });

      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve market"
      );
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Flag market function
  const flagMarket = async (marketId: number) => {
    if (!walletClient) {
      toast.error("Wallet not connected");
      return;
    }

    const key = `flag-${marketId}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));

    try {
      toast.info("Flagging market...");

      // Write the transaction using wallet client
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.curation as `0x${string}`,
        abi: ABI.curation,
        functionName: "flagMarket",
        args: [marketId],
      });

      // Wait for transaction to be confirmed
      await waitForTransactionReceipt(config, { hash });

      // Only show success toast after transaction is confirmed
      toast.success("Market flagged successfully!");

      // Refresh data immediately
      await queryClient.refetchQueries({
        queryKey: ["council", "allMarkets"],
      });
      await queryClient.refetchQueries({ queryKey: ["markets"] });

      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to flag market"
      );
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Set council member function
  const setCouncilMember = async (address: string, enabled: boolean) => {
    if (!walletClient) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      // Write the transaction using wallet client
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.curation as `0x${string}`,
        abi: ABI.curation,
        functionName: "setCouncilMember",
        args: [address as `0x${string}`, enabled],
      });

      // Wait for transaction to be confirmed
      await waitForTransactionReceipt(config, { hash });

      queryClient.invalidateQueries({ queryKey: ["council"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to set council member"
      );
    }
  };

  // Helper function to check if a specific action is loading
  const isActionLoading = (marketId: number, action: "approve" | "flag") => {
    const key = `${action}-${marketId}`;
    return loadingStates[key] || false;
  };

  return {
    isCouncilMember: !!isCouncilMember,
    pendingMarkets: allMarkets?.pending || [],
    approvedMarkets: allMarkets?.approved || [],
    flaggedMarkets: allMarkets?.flagged || [],
    isLoadingMarkets,
    approveMarket,
    flagMarket,
    setCouncilMember,
    isActionLoading,
    isApproving: false, // Deprecated, use isActionLoading instead
    isFlagging: false, // Deprecated, use isActionLoading instead
    isSettingCouncil: false,
  };
}
