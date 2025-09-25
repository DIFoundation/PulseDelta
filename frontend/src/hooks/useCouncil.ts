import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { config } from "@/configs";
import { ABI, CONTRACT_ADDRESSES } from "@/lib/abiAndAddress";
import { useFactory } from "./useFactory";
import type { Market, CurationStatus } from "@/types/market";

/**
 * Hook for council functionality and market curation
 */
export function useCouncil() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const queryClient = useQueryClient();
  const factory = useFactory();

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

  // Get all pending markets for council review
  const { data: pendingMarkets, isLoading: isLoadingPending } = useQuery({
    queryKey: ["council", "pendingMarkets"],
    queryFn: async () => {
      const markets: Market[] = [];

      // Get all market types
      const binaryCount = await factory.getMarketCount("binary");
      const multiCount = await factory.getMarketCount("multi");
      const scalarCount = await factory.getMarketCount("scalar");

      const binaryCountNum = Number(binaryCount || 0);
      const multiCountNum = Number(multiCount || 0);
      const scalarCountNum = Number(scalarCount || 0);

      // Check all markets for pending status
      for (let i = 0; i < binaryCountNum; i++) {
        const marketAddress = await factory.getMarketAddress("binary", i);
        if (marketAddress) {
          const curationStatus = await getCurationStatus(i);
          if (curationStatus === "Pending") {
            const marketData = await factory.getMarketData(
              marketAddress,
              "binary"
            );
            if (marketData) {
              markets.push({
                ...marketData,
                id: i.toString(),
                curationStatus: "Pending",
                state: marketData.state as "Open" | "Closed" | "Resolved",
              });
            }
          }
        }
      }

      for (let i = 0; i < multiCountNum; i++) {
        const marketAddress = await factory.getMarketAddress("multi", i);
        if (marketAddress) {
          const curationStatus = await getCurationStatus(binaryCountNum + i);
          if (curationStatus === "Pending") {
            const marketData = await factory.getMarketData(
              marketAddress,
              "multi"
            );
            if (marketData) {
              markets.push({
                ...marketData,
                id: (binaryCountNum + i).toString(),
                curationStatus: "Pending",
                state: marketData.state as "Open" | "Closed" | "Resolved",
              });
            }
          }
        }
      }

      for (let i = 0; i < scalarCountNum; i++) {
        const marketAddress = await factory.getMarketAddress("scalar", i);
        if (marketAddress) {
          const curationStatus = await getCurationStatus(
            binaryCountNum + multiCountNum + i
          );
          if (curationStatus === "Pending") {
            const marketData = await factory.getMarketData(
              marketAddress,
              "scalar"
            );
            if (marketData) {
              markets.push({
                ...marketData,
                id: (binaryCountNum + multiCountNum + i).toString(),
                curationStatus: "Pending",
                state: marketData.state as "Open" | "Closed" | "Resolved",
              });
            }
          }
        }
      }

      return markets;
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
        args: [marketId],
      });

      // Convert status number to string
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

  // Approve market mutation
  const approveMarketMutation = useMutation({
    mutationFn: async (marketId: number) => {
      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.curation as `0x${string}`,
        abi: ABI.curation,
        functionName: "approveMarket",
        args: [marketId],
      });

      return { hash };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["council", "pendingMarkets"],
      });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });

  // Flag market mutation
  const flagMarketMutation = useMutation({
    mutationFn: async (marketId: number) => {
      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.curation as `0x${string}`,
        abi: ABI.curation,
        functionName: "flagMarket",
        args: [marketId],
      });

      return { hash };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["council", "pendingMarkets"],
      });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });

  // Set council member mutation
  const setCouncilMemberMutation = useMutation({
    mutationFn: async ({
      address,
      enabled,
    }: {
      address: string;
      enabled: boolean;
    }) => {
      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.curation as `0x${string}`,
        abi: ABI.curation,
        functionName: "setCouncilMember",
        args: [address as `0x${string}`, enabled],
      });

      return { hash };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["council"] });
    },
  });

  return {
    isCouncilMember: !!isCouncilMember,
    pendingMarkets: pendingMarkets || [],
    isLoadingPending,
    approveMarket: approveMarketMutation.mutate,
    flagMarket: flagMarketMutation.mutate,
    setCouncilMember: setCouncilMemberMutation.mutate,
    isApproving: approveMarketMutation.isPending,
    isFlagging: flagMarketMutation.isPending,
    isSettingCouncil: setCouncilMemberMutation.isPending,
  };
}
