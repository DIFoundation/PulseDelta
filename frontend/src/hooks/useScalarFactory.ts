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

interface ScalarMarketCreateParams {
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
  lowerBound: bigint; // int256 in ABI; viem uses bigint
  upperBound: bigint; // int256 in ABI; viem uses bigint
}

// Contract function signatures (hashes)
export const FUNCTION_SIGNATURES = {
  // Read functions
  allMarkets: '0x52c0d702',
  getAllMarkets: '0x8c1b6a36',
  getMarketCount: '0x43d726d6',
  getMarketsByStatus: '0x4e69d560',
  idOf: '0x0e7e06c0',
  marketCount: '0x4b6695b6',
  marketOf: '0x2c40d590',

  // Write functions
  createScalar: '0x27f55c68',
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

export function useScalarFactoryGetters() {
  const scalarFactory = CONTRACT_ADDRESSES.scalarFactory;
  const abi = ABI.scalarFactory;

  const useAllMarkets = (index?: bigint) => {
    return useReadContract({
      address: scalarFactory as Address,
      abi,
      functionName: 'allMarkets',
      args: index !== undefined ? [index] : undefined,
      query: {
        enabled: index !== undefined,
      },
    });
  };

  const useGetAllMarkets = () => {
    return useReadContract({
      address: scalarFactory as Address,
      abi,
      functionName: 'getAllMarkets',
    }) as ReturnType<typeof useReadContract> & { 
      data?: Address[] 
    };
  };

  const useGetMarketCount = () => {
    return useReadContract({
      address: scalarFactory as Address,
      abi,
      functionName: 'getMarketCount',
    });
  };

  const useGetMarketsByStatus = (status?: MarketStatus) => {
    return useReadContract({
      address: scalarFactory as Address,
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

  const useIdOf = (market?: Address) => {
    return useReadContract({
      address: scalarFactory as Address,
      abi,
      functionName: 'idOf',
      args: market ? [market] : undefined,
      query: {
        enabled: !!market,
      },
    });
  };

  const useMarketCount = () => {
    return useReadContract({
      address: scalarFactory as Address,
      abi,
      functionName: 'marketCount',
    });
  };

  const useMarketOf = (marketId?: bigint) => {
    return useReadContract({
      address: scalarFactory as Address,
      abi,
      functionName: 'marketOf',
      args: marketId !== undefined ? [marketId] : undefined,
      query: {
        enabled: marketId !== undefined,
      },
    });
  };

  const useActiveMarkets = () => useGetMarketsByStatus(MarketStatus.ACTIVE);
  const useResolvedMarkets = () => useGetMarketsByStatus(MarketStatus.RESOLVED);
  const useExpiredMarkets = () => useGetMarketsByStatus(MarketStatus.EXPIRED);
  const useCancelledMarkets = () => useGetMarketsByStatus(MarketStatus.CANCELLED);

  return {
    useAllMarkets,
    useGetAllMarkets,
    useGetMarketCount,
    useGetMarketsByStatus,
    useIdOf,
    useMarketCount,
    useMarketOf,
    useActiveMarkets,
    useResolvedMarkets,
    useExpiredMarkets,
    useCancelledMarkets,
  };
}

export function useScalarFactorySetters() {
  const scalarFactory = CONTRACT_ADDRESSES.scalarFactory;
  const abi = ABI.scalarFactory;

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createScalar = (params: ScalarMarketCreateParams, value?: bigint) => {
    writeContract({
      address: scalarFactory as Address,
      abi,
      functionName: 'createScalar',
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
        params.lowerBound,
        params.upperBound,
      ],
      value,
    });
  };

  return {
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,

    createScalar,
  };
}

export function useScalarFactoryEvents() {
  const scalarFactory = CONTRACT_ADDRESSES.scalarFactory;
  const abi = ABI.scalarFactory;

  type MarketCreatedLog = {
    args?: { market?: Address; marketId?: bigint };
  };

  const useMarketCreatedEvent = (
    onEvent?: (logs: MarketCreatedLog[]) => void,
    options?: {
      market?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: scalarFactory as Address,
      abi,
      eventName: 'MarketCreated',
      onLogs: onEvent
        ? (logs) => {
            onEvent(logs as unknown as MarketCreatedLog[]);
          }
        : undefined,
      enabled: options?.enabled !== false,
    });
  };

  const useNewMarkets = (
    onNewMarket?: (market: Address, marketId: bigint) => void
  ) => {
    return useMarketCreatedEvent((logs) => {
      logs.forEach((log: MarketCreatedLog) => {
        if (log.args?.market && log.args?.marketId !== undefined) {
          onNewMarket?.(log.args.market as Address, log.args.marketId as bigint);
        }
      });
    });
  };

  return {
    useMarketCreatedEvent,
    useNewMarkets,
  };
}

export function useScalarFactory() {
  const getters = useScalarFactoryGetters();
  const setters = useScalarFactorySetters();
  const events = useScalarFactoryEvents();

  return {
    ...getters,
    ...setters,
    ...events,

    functionSignatures: FUNCTION_SIGNATURES,
    eventSignatures: EVENT_SIGNATURES,
    errorSignatures: ERROR_SIGNATURES,
    MarketStatus,
  };
}

export const useScalarFactoryUtils = () => {
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

  const parseFeeBps = (feePercentage: number): bigint => {
    if (feePercentage < 0 || feePercentage > 100) {
      throw new Error('Fee percentage must be between 0 and 100');
    }
    return BigInt(Math.floor(feePercentage * 100));
  };

  const formatFeeBps = (feeBps: bigint): number => {
    return Number(feeBps) / 100;
  };

  return {
    isValidAddress,
    getStatusString,
    validateTimeRange,
    parseFeeBps,
    formatFeeBps,
  };
};


