import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useAccount,
} from "wagmi";
import { Address } from "viem";
import { CONTRACT_ADDRESSES } from "@/lib/abiAndAddress";
import { ABI } from "@/lib/abiAndAddress";

// Types
interface CreatorStats {
  lifetimeFees: bigint;
  claimableFees: bigint;
  totalMarkets: bigint;
}

interface LPStats {
  totalLPFees: bigint;
  totalMarkets: bigint;
}

interface ProtocolStats {
  totalAccrued: bigint;
  claimable: bigint;
}

// Contract function signatures (hashes)
export const FUNCTION_SIGNATURES = {
  // Read functions
  creatorAccrued: "0x7b1e2adb",
  creatorFeesByMarket: "0x8fa1c4a4",
  creatorLifetimeFees: "0x3b4da69f",
  creatorOf: "0x9ec5a894",
  getCreator: "0x9b2cb5d8",
  getCreatorFeesForMarket: "0x1e83409a",
  getCreatorLifetimeFees: "0x8d4dc9cf",
  getCreatorStats: "0x7c0dc9a3",
  getLPFeesForMarket: "0x4b5c4277",
  getLPStats: "0x6c2a32c5",
  getProtocolStats: "0x8a4f8b42",
  getTotalLPFees: "0x9e5d4c27",
  lpAccrued: "0x1f2f2b35",
  owner: "0x8da5cb5b",
  protocolAccrued: "0x4e71d92d",
  totalLPFees: "0x5c975abb",

  // Write functions
  accrue: "0x33ce93fe",
  claimCreator: "0x8a4c3b7e",
  claimProtocol: "0x5e8a7362",
  setCreator: "0x4dd18bf5",
};

// Event signatures (topic hashes)
export const EVENT_SIGNATURES = {
  Accrued:
    "0x4e6f7e7c8e5a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e",
  ClaimedCreator:
    "0x2e6f7e7c8e5a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d",
  ClaimedProtocol:
    "0x1e6f7e7c8e5a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3",
  CreatorSet:
    "0x3e6f7e7c8e5a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2",
  LPFeesAccrued:
    "0x5e6f7e7c8e5a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1",
};

// Error signatures
export const ERROR_SIGNATURES = {
  NotOwner: "0x30cd7471",
  ZeroAddress: "0xd92e233d",
};

export function useFeeRouterGetters() {
  const feeRouter = CONTRACT_ADDRESSES.feeRouter;
  const abi = ABI.feeRouter;
  const userAddress = useAccount().address;

  // Get creator accrued fees
  const useCreatorAccrued = (creator?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "creatorAccrued",
      args: creator ? [creator] : undefined,
      query: {
        enabled: !!creator,
      },
    });
  };

  // Get creator fees for specific market
  const useCreatorFeesByMarket = (creator?: Address, market?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "creatorFeesByMarket",
      args: creator && market ? [creator, market] : undefined,
      query: {
        enabled: !!creator && !!market,
      },
    });
  };

  // Get creator lifetime fees
  const useCreatorLifetimeFees = (creator?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "creatorLifetimeFees",
      args: creator ? [creator] : undefined,
      query: {
        enabled: !!creator,
      },
    });
  };

  // Get creator of a market
  const useCreatorOf = (market?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "creatorOf",
      args: market ? [market] : undefined,
      query: {
        enabled: !!market,
      },
    });
  };

  // Get creator of market (alternative function)
  const useGetCreator = (market?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "getCreator",
      args: market ? [market] : undefined,
      query: {
        enabled: !!market,
      },
    });
  };

  // Get creator fees for specific market (alternative function)
  const useGetCreatorFeesForMarket = (creator?: Address, market?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "getCreatorFeesForMarket",
      args: creator && market ? [creator, market] : undefined,
      query: {
        enabled: !!creator && !!market,
      },
    });
  };

  // Get creator lifetime fees (alternative function)
  const useGetCreatorLifetimeFees = (creator?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "getCreatorLifetimeFees",
      args: creator ? [creator] : undefined,
      query: {
        enabled: !!creator,
      },
    });
  };

  // Get creator stats (comprehensive info)
  const useGetCreatorStats = (creator?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "getCreatorStats",
      args: creator ? [creator] : undefined,
      query: {
        enabled: !!creator,
      },
    }) as ReturnType<typeof useReadContract> & {
      data?: [bigint, bigint, bigint];
    };
  };

  // Get LP fees for market
  const useGetLPFeesForMarket = (market?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "getLPFeesForMarket",
      args: market ? [market] : undefined,
      query: {
        enabled: !!market,
      },
    });
  };

  // Get LP stats
  const useGetLPStats = () => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "getLPStats",
    }) as ReturnType<typeof useReadContract> & {
      data?: [bigint, bigint];
    };
  };

  // Get protocol stats
  const useGetProtocolStats = () => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "getProtocolStats",
    }) as ReturnType<typeof useReadContract> & {
      data?: [bigint, bigint];
    };
  };

  // Get total LP fees
  const useGetTotalLPFees = () => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "getTotalLPFees",
    });
  };

  // Get LP accrued fees
  const useLPAccrued = (market?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "lpAccrued",
      args: market ? [market] : undefined,
      query: {
        enabled: !!market,
      },
    });
  };

  // Get contract owner
  const useOwner = () => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "owner",
    });
  };

  // Get protocol accrued fees
  const useProtocolAccrued = (market?: Address) => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "protocolAccrued",
      args: market ? [market] : undefined,
      query: {
        enabled: !!market,
      },
    });
  };

  // Get total LP fees (alternative function)
  const useTotalLPFees = () => {
    return useReadContract({
      address: feeRouter as Address,
      abi,
      functionName: "totalLPFees",
    });
  };

  // Get current user's creator stats
  const useMyCreatorStats = () => {
    return useGetCreatorStats(userAddress);
  };

  // Get current user's accrued creator fees
  const useMyCreatorAccrued = () => {
    return useCreatorAccrued(userAddress);
  };

  // Check if current user is owner
  const useIsOwner = () => {
    const owner = useOwner();
    return {
      ...owner,
      data: owner.data === userAddress,
    };
  };

  return {
    useCreatorAccrued,
    useCreatorFeesByMarket,
    useCreatorLifetimeFees,
    useCreatorOf,
    useGetCreator,
    useGetCreatorFeesForMarket,
    useGetCreatorLifetimeFees,
    useGetCreatorStats,
    useGetLPFeesForMarket,
    useGetLPStats,
    useGetProtocolStats,
    useGetTotalLPFees,
    useLPAccrued,
    useOwner,
    useProtocolAccrued,
    useTotalLPFees,
    useMyCreatorStats,
    useMyCreatorAccrued,
    useIsOwner,
  };
}

export function useFeeRouterSetters() {
  const feeRouter = CONTRACT_ADDRESSES.feeRouter;
  const abi = ABI.feeRouter;

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Accrue fees for a market
  const accrue = (
    market: Address,
    protocolFee: bigint,
    creatorFee: bigint,
    lpFee: bigint
  ) => {
    writeContract({
      address: feeRouter as Address,
      abi,
      functionName: "accrue",
      args: [market, protocolFee, creatorFee, lpFee],
    });
  };

  // Claim creator fees
  const claimCreator = (market: Address, to: Address) => {
    writeContract({
      address: feeRouter as Address,
      abi,
      functionName: "claimCreator",
      args: [market, to],
    });
  };

  // Claim protocol fees
  const claimProtocol = (to: Address) => {
    writeContract({
      address: feeRouter as Address,
      abi,
      functionName: "claimProtocol",
      args: [to],
    });
  };

  // Set creator for market (owner only)
  const setCreator = (market: Address, creator: Address) => {
    writeContract({
      address: feeRouter as Address,
      abi,
      functionName: "setCreator",
      args: [market, creator],
    });
  };

  return {
    // Transaction state
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,

    // Write functions
    accrue,
    claimCreator,
    claimProtocol,
    setCreator,
  };
}

export function useFeeRouterEvents() {
  const feeRouter = CONTRACT_ADDRESSES.feeRouter;
  const abi = ABI.feeRouter;

  // Watch Accrued events
  const useAccruedEvent = (
    /* eslint-disable-next-line */
    onEvent?: (logs: any[]) => void,
    options?: {
      market?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: feeRouter as Address,
      abi,
      eventName: "Accrued",
      args: options?.market ? { market: options.market } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch ClaimedCreator events
  const useClaimedCreatorEvent = (
    /* eslint-disable-next-line */
    onEvent?: (logs: any[]) => void,
    options?: {
      creator?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: feeRouter as Address,
      abi,
      eventName: "ClaimedCreator",
      args: options?.creator ? { creator: options.creator } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch ClaimedProtocol events
  const useClaimedProtocolEvent = (
    /* eslint-disable-next-line */
    onEvent?: (logs: any[]) => void,
    options?: {
      to?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: feeRouter as Address,
      abi,
      eventName: "ClaimedProtocol",
      args: options?.to ? { to: options.to } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch CreatorSet events
  const useCreatorSetEvent = (
    /* eslint-disable-next-line */
    onEvent?: (logs: any[]) => void,
    options?: {
      market?: Address;
      creator?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: feeRouter as Address,
      abi,
      eventName: "CreatorSet",
      args:
        options?.market || options?.creator
          ? {
              market: options?.market,
              creator: options?.creator,
            }
          : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch LPFeesAccrued events
  const useLPFeesAccruedEvent = (
    /* eslint-disable-next-line */
    onEvent?: (logs: any[]) => void,
    options?: {
      market?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: feeRouter as Address,
      abi,
      eventName: "LPFeesAccrued",
      args: options?.market ? { market: options.market } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch creator-specific events (claims and creator sets)
  const useMyCreatorEvents = (
    userAddress?: Address,
    /* eslint-disable-next-line */
    onEvent?: (logs: any[]) => void
  ) => {
    useClaimedCreatorEvent(onEvent, { creator: userAddress });
    useCreatorSetEvent(onEvent, { creator: userAddress });
  };

  // Watch market-specific events
  const useMarketEvents = (
    market?: Address,
    /* eslint-disable-next-line */
    onEvent?: (logs: any[]) => void
  ) => {
    useAccruedEvent(onEvent, { market });
    useLPFeesAccruedEvent(onEvent, { market });
    useCreatorSetEvent(onEvent, { market });
  };

  return {
    useAccruedEvent,
    useClaimedCreatorEvent,
    useClaimedProtocolEvent,
    useCreatorSetEvent,
    useLPFeesAccruedEvent,
    useMyCreatorEvents,
    useMarketEvents,
  };
}

// Combined hook for complete fee router functionality
export function useFeeRouter() {
  const getters = useFeeRouterGetters();
  const setters = useFeeRouterSetters();
  const events = useFeeRouterEvents();

  return {
    // Getters
    ...getters,

    // Setters
    ...setters,

    // Events
    ...events,

    // Constants
    functionSignatures: FUNCTION_SIGNATURES,
    eventSignatures: EVENT_SIGNATURES,
    errorSignatures: ERROR_SIGNATURES,
  };
}

// Utility functions
export const useFeeRouterUtils = () => {
  const formatFees = (fees: bigint, decimals = 18) => {
    return Number(fees) / Math.pow(10, decimals);
  };

  const parseFeeAmount = (amount: string, decimals = 18) => {
    return BigInt(Math.floor(Number(amount) * Math.pow(10, decimals)));
  };

  const isValidAddress = (address: string): address is Address => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const formatCreatorStats = (
    stats: [bigint, bigint, bigint]
  ): CreatorStats => {
    const [lifetimeFees, claimableFees, totalMarkets] = stats;
    return {
      lifetimeFees,
      claimableFees,
      totalMarkets,
    };
  };

  const formatLPStats = (stats: [bigint, bigint]): LPStats => {
    const [totalLPFees, totalMarkets] = stats;
    return {
      totalLPFees,
      totalMarkets,
    };
  };

  const formatProtocolStats = (stats: [bigint, bigint]): ProtocolStats => {
    const [totalAccrued, claimable] = stats;
    return {
      totalAccrued,
      claimable,
    };
  };

  return {
    formatFees,
    parseFeeAmount,
    isValidAddress,
    formatCreatorStats,
    formatLPStats,
    formatProtocolStats,
  };
};
