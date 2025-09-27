import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { Address } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/abiAndAddress';
import { ABI } from '@/lib/abiAndAddress';

// Types
enum MarketStatus {
  ACTIVE = 0,
  RESOLVED = 1,
  EXPIRED = 2,
  CANCELLED = 3
}

interface MarketCreateParams {
  collateral: Address;
  question: string;
  metadataURI: string;
  creator: Address;
  oracleAdapter: Address;
  feeRouter: Address;
  tokenFactory: Address;
  marketKey: string;
  feeBps: bigint;
  startTime: bigint;
  endTime: bigint;
  resolutionDeadline: bigint;
}

// Contract function signatures (hashes)
export const FUNCTION_SIGNATURES = {
  // Read functions
  allMarkets: '0x52c0d702',
  getAllMarkets: '0x8c1b6a36',
  getMarketCount: '0x43d726d6',
  getMarketsByStatus: '0x4e69d560',
  getMarketsByStatusPaged: '0x7b1039b8',
  idOf: '0x0e7e06c0',
  marketCount: '0x4b6695b6',
  marketOf: '0x2c40d590',
  
  // Write functions
  createBinary: '0x9b3d47b4',
};

// Event signatures (topic hashes)
export const EVENT_SIGNATURES = {
  MarketCreated: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
};

// Error signatures
export const ERROR_SIGNATURES = {
  InvalidTimeRange: '0x7138356f',
  ZeroAddress: '0xd92e233d',
};

export function useBinaryFactoryGetters() {
  const binaryFactory = CONTRACT_ADDRESSES.binaryFactory;
  const abi = ABI.binaryFactory;

  // Get market by index
  const useAllMarkets = (index?: bigint) => {
    return useReadContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'allMarkets',
      args: index !== undefined ? [index] : undefined,
      query: {
        enabled: index !== undefined,
      },
    });
  };

  // Get all markets
  const useGetAllMarkets = () => {
    return useReadContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'getAllMarkets',
    }) as ReturnType<typeof useReadContract> & { 
      data?: Address[] 
    };
  };

  // Get total market count
  const useGetMarketCount = () => {
    return useReadContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'getMarketCount',
    });
  };

  // Get markets by status
  const useGetMarketsByStatus = (status?: MarketStatus) => {
    return useReadContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'getMarketsByStatus',
      args: status !== undefined ? [status] : undefined,
      query: {
        enabled: status !== undefined,
      },
    }) as ReturnType<typeof useReadContract> & { 
      data?: Address[] 
    };
  };

  // Get markets by status with pagination
  const useGetMarketsByStatusPaged = (
    status?: MarketStatus,
    offset?: bigint,
    limit?: bigint
  ) => {
    return useReadContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'getMarketsByStatusPaged',
      args: status !== undefined && offset !== undefined && limit !== undefined 
        ? [status, offset, limit] 
        : undefined,
      query: {
        enabled: status !== undefined && offset !== undefined && limit !== undefined,
      },
    }) as ReturnType<typeof useReadContract> & { 
      data?: Address[] 
    };
  };

  // Get market ID from address
  const useIdOf = (market?: Address) => {
    return useReadContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'idOf',
      args: market ? [market] : undefined,
      query: {
        enabled: !!market,
      },
    });
  };

  // Get market count (alternative)
  const useMarketCount = () => {
    return useReadContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'marketCount',
    });
  };

  // Get market address from ID
  const useMarketOf = (marketId?: bigint) => {
    return useReadContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'marketOf',
      args: marketId !== undefined ? [marketId] : undefined,
      query: {
        enabled: marketId !== undefined,
      },
    });
  };

  // Get active markets
  const useActiveMarkets = () => {
    return useGetMarketsByStatus(MarketStatus.ACTIVE);
  };

  // Get resolved markets
  const useResolvedMarkets = () => {
    return useGetMarketsByStatus(MarketStatus.RESOLVED);
  };

  // Get expired markets
  const useExpiredMarkets = () => {
    return useGetMarketsByStatus(MarketStatus.EXPIRED);
  };

  // Get cancelled markets
  const useCancelledMarkets = () => {
    return useGetMarketsByStatus(MarketStatus.CANCELLED);
  };

  // Get paginated markets for better performance
  const usePaginatedMarkets = (
    status: MarketStatus = MarketStatus.ACTIVE,
    page: number = 0,
    pageSize: number = 10
  ) => {
    const offset = BigInt(page * pageSize);
    const limit = BigInt(pageSize);
    return useGetMarketsByStatusPaged(status, offset, limit);
  };

  // Get recent markets (last 10)
  const useRecentMarkets = () => {
    const marketCount = useGetMarketCount();
    const totalMarkets = marketCount.data as bigint | undefined;
    
    return useReadContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'getMarketsByStatusPaged',
      args: totalMarkets && totalMarkets >= 10n 
        ? [MarketStatus.ACTIVE, totalMarkets - 10n, 10n]
        : totalMarkets
        ? [MarketStatus.ACTIVE, 0n, totalMarkets]
        : undefined,
      query: {
        enabled: !!totalMarkets,
      },
    }) as ReturnType<typeof useReadContract> & { 
      data?: Address[] 
    };
  };

  return {
    useAllMarkets,
    useGetAllMarkets,
    useGetMarketCount,
    useGetMarketsByStatus,
    useGetMarketsByStatusPaged,
    useIdOf,
    useMarketCount,
    useMarketOf,
    useActiveMarkets,
    useResolvedMarkets,
    useExpiredMarkets,
    useCancelledMarkets,
    usePaginatedMarkets,
    useRecentMarkets,
  };
}

export function useBinaryFactorySetters() {
  const binaryFactory = CONTRACT_ADDRESSES.binaryFactory;
  const abi = ABI.binaryFactory;

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Create binary market
  const createBinary = (params: MarketCreateParams, value?: bigint) => {
    writeContract({
      address: binaryFactory as Address,
      abi,
      functionName: 'createBinary',
      args: [
        params.collateral,
        params.question,
        params.metadataURI,
        params.creator,
        params.oracleAdapter,
        params.feeRouter,
        params.tokenFactory,
        params.marketKey,
        params.feeBps,
        params.startTime,
        params.endTime,
        params.resolutionDeadline,
      ],
      value,
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
    createBinary,
  };
}

export function useBinaryFactoryEvents() {
  const binaryFactory = CONTRACT_ADDRESSES.binaryFactory;
  const abi = ABI.binaryFactory;

  // Watch MarketCreated events
  const useMarketCreatedEvent = (
    /* eslint-disable-next-line */
    onEvent?: (logs: any[]) => void,
    options?: {
      market?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: binaryFactory as Address,
      abi,
      eventName: 'MarketCreated',
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch for new markets
  const useNewMarkets = (
    onNewMarket?: (market: Address, marketId: bigint) => void
  ) => {
    return useMarketCreatedEvent((logs) => {
      /* eslint-disable-next-line */
      logs.forEach((log: any) => {
        if (log.args?.market && log.args?.marketId) {
          onNewMarket?.(log.args.market, log.args.marketId);
        }
      });
    });
  };

  return {
    useMarketCreatedEvent,
    useNewMarkets,
  };
}

// Combined hook for complete binary factory functionality
export function useBinaryFactory() {
  const getters = useBinaryFactoryGetters();
  const setters = useBinaryFactorySetters();
  const events = useBinaryFactoryEvents();

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
    MarketStatus,
  };
}

// Utility functions
export const useBinaryFactoryUtils = () => {
  const isValidAddress = (address: string): address is Address => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const getStatusString = (status: MarketStatus) => {
    switch (status) {
      case MarketStatus.ACTIVE:
        return 'Active';
      case MarketStatus.RESOLVED:
        return 'Resolved';
      case MarketStatus.EXPIRED:
        return 'Expired';
      case MarketStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const validateTimeRange = (startTime: bigint, endTime: bigint, resolutionDeadline: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    
    if (startTime >= endTime) {
      return { valid: false, error: 'Start time must be before end time' };
    }
    
    if (endTime >= resolutionDeadline) {
      return { valid: false, error: 'End time must be before resolution deadline' };
    }
    
    if (startTime <= now) {
      return { valid: false, error: 'Start time must be in the future' };
    }
    
    return { valid: true, error: null };
  };

  const formatMarketParams = (params: Partial<MarketCreateParams>): MarketCreateParams | null => {
    if (!params.collateral || !params.question || !params.creator || !params.oracleAdapter || 
        !params.feeRouter || !params.tokenFactory || !params.startTime || 
        !params.endTime || !params.resolutionDeadline) {
      return null;
    }

    return {
      collateral: params.collateral,
      question: params.question,
      metadataURI: params.metadataURI || '',
      creator: params.creator,
      oracleAdapter: params.oracleAdapter,
      feeRouter: params.feeRouter,
      tokenFactory: params.tokenFactory,
      marketKey: params.marketKey || '0x0000000000000000000000000000000000000000000000000000000000000000',
      feeBps: params.feeBps || 0n,
      startTime: params.startTime,
      endTime: params.endTime,
      resolutionDeadline: params.resolutionDeadline,
    };
  };

  const generateMarketKey = (question: string, creator: Address, timestamp: bigint): string => {
    // Simple market key generation (in practice, you might want a more sophisticated approach)
    const data = `${question}-${creator}-${timestamp.toString()}`;
    // This is a simplified version - in practice you'd use proper hashing
    return '0x' + Array.from(data)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 64)
      .padEnd(64, '0');
  };

  const parseFeeBps = (feePercentage: number): bigint => {
    // Convert percentage to basis points (1% = 100 bps)
    if (feePercentage < 0 || feePercentage > 100) {
      throw new Error('Fee percentage must be between 0 and 100');
    }
    return BigInt(Math.floor(feePercentage * 100));
  };

  const formatFeeBps = (feeBps: bigint): number => {
    // Convert basis points to percentage
    return Number(feeBps) / 100;
  };

  const isMarketExpired = (endTime: bigint): boolean => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    return now > endTime;
  };

  const isMarketActive = (startTime: bigint, endTime: bigint): boolean => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    return now >= startTime && now <= endTime;
  };

  const getTimeRemaining = (endTime: bigint): number => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    return Math.max(0, Number(endTime - now));
  };

  return {
    isValidAddress,
    getStatusString,
    validateTimeRange,
    formatMarketParams,
    generateMarketKey,
    parseFeeBps,
    formatFeeBps,
    isMarketExpired,
    isMarketActive,
    getTimeRemaining,
  };
};