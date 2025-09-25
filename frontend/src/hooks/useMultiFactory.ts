import { 
    useReadContract, 
    useWriteContract, 
    useWaitForTransactionReceipt, 
    useWatchContractEvent, 
  } from 'wagmi';
  import { Address } from 'viem';
  import { CONTRACT_ADDRESSES } from '@/lib/abiAndAddress';
  import { ABI } from '@/lib/abiAndAddress';
  
  // Types
  export enum MarketStatus {
    ACTIVE = 0,
    RESOLVED = 1,
    EXPIRED = 2,
    CANCELLED = 3,
  }
  
  export interface MultiMarketCreateParams {
    collateral: Address;
    question: string;
    metadataURI: string;
    creator: Address;
    oracleAdapter: Address;
    feeRouter: Address;
    tokenFactory: Address;
    marketKey: string; // bytes32
    outcomes: string[];
    feeBps: bigint;
    startTime: bigint;
    endTime: bigint;
    resolutionDeadline: bigint;
  }
  
  // Function signatures
  export const FUNCTION_SIGNATURES = {
    allMarkets: '0x52c0d702',
    createMulti: '0xabcdef01', // placeholder, should compute exact sighash
    getAllMarkets: '0x8c1b6a36',
    getMarketCount: '0x43d726d6',
    getMarketsByStatus: '0x4e69d560',
    idOf: '0x0e7e06c0',
    marketCount: '0x4b6695b6',
    marketOf: '0x2c40d590',
  };
  
  // Event signatures
  export const EVENT_SIGNATURES = {
    MarketCreated: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', // recompute exact topic
  };
  
  // Error signatures
  export const ERROR_SIGNATURES = {
    InvalidTimeRange: '0x7138356f',
    ZeroAddress: '0xd92e233d',
  };
  
  // ---------------- Getters ----------------
  export function useMultiFactoryGetters() {
    const multiFactory = CONTRACT_ADDRESSES.multiFactory;
    const abi = ABI.multiFactory;
  
    const useAllMarkets = (index?: bigint) => {
      return useReadContract({
        address: multiFactory as Address,
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
        address: multiFactory as Address,
        abi,
        functionName: 'getAllMarkets',
      }) as ReturnType<typeof useReadContract> & { data?: Address[] };
    };
  
    const useGetMarketCount = () => {
      return useReadContract({
        address: multiFactory as Address,
        abi,
        functionName: 'getMarketCount',
      });
    };
  
    const useGetMarketsByStatus = (status?: MarketStatus) => {
      return useReadContract({
        address: multiFactory as Address,
        abi,
        functionName: 'getMarketsByStatus',
        args: status !== undefined ? [status] : undefined,
        query: { enabled: status !== undefined },
      }) as ReturnType<typeof useReadContract> & { data?: Address[] };
    };
  
    const useIdOf = (market?: Address) => {
      return useReadContract({
        address: multiFactory as Address,
        abi,
        functionName: 'idOf',
        args: market ? [market] : undefined,
        query: { enabled: !!market },
      });
    };
  
    const useMarketCount = () => {
      return useReadContract({
        address: multiFactory as Address,
        abi,
        functionName: 'marketCount',
      });
    };
  
    const useMarketOf = (marketId?: bigint) => {
      return useReadContract({
        address: multiFactory as Address,
        abi,
        functionName: 'marketOf',
        args: marketId !== undefined ? [marketId] : undefined,
        query: { enabled: marketId !== undefined },
      });
    };
  
    return {
      useAllMarkets,
      useGetAllMarkets,
      useGetMarketCount,
      useGetMarketsByStatus,
      useIdOf,
      useMarketCount,
      useMarketOf,
    };
  }
  
  // ---------------- Setters ----------------
  export function useMultiFactorySetters() {
    const multiFactory = CONTRACT_ADDRESSES.multiFactory;
    const abi = ABI.multiFactory;
  
    const { writeContract, data: hash, error, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
      useWaitForTransactionReceipt({ hash });
  
    const createMulti = (params: MultiMarketCreateParams, value?: bigint) => {
      writeContract({
        address: multiFactory as Address,
        abi,
        functionName: 'createMulti',
        args: [
          params.collateral,
          params.question,
          params.metadataURI,
          params.creator,
          params.oracleAdapter,
          params.feeRouter,
          params.tokenFactory,
          params.marketKey,
          params.outcomes,
          params.feeBps,
          params.startTime,
          params.endTime,
          params.resolutionDeadline,
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
      createMulti,
    };
  }
  
  // ---------------- Events ----------------
  export function useMultiFactoryEvents() {
    const multiFactory = CONTRACT_ADDRESSES.multiFactory;
    const abi = ABI.multiFactory;
  
    const useMarketCreatedEvent = (
      onEvent?: (logs: any[]) => void,
      options?: { enabled?: boolean }
    ) => {
      return useWatchContractEvent({
        address: multiFactory as Address,
        abi,
        eventName: 'MarketCreated',
        onLogs: onEvent,
        enabled: options?.enabled !== false,
      });
    };
  
    const useNewMarkets = (
      onNewMarket?: (market: Address, marketId: bigint) => void
    ) => {
      return useMarketCreatedEvent((logs) => {
        logs.forEach((log: any) => {
          if (log.args?.market && log.args?.marketId) {
            onNewMarket?.(log.args.market, log.args.marketId);
          }
        });
      });
    };
  
    return { useMarketCreatedEvent, useNewMarkets };
  }
  
  // ---------------- Combined Hook ----------------
  export function useMultiFactory() {
    const getters = useMultiFactoryGetters();
    const setters = useMultiFactorySetters();
    const events = useMultiFactoryEvents();
  
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
  
  // ---------------- Utils ----------------
  export const useMultiFactoryUtils = () => {
    const isValidAddress = (address: string): address is Address => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    };
  
    const getStatusString = (status: MarketStatus) => {
      switch (status) {
        case MarketStatus.ACTIVE: return 'Active';
        case MarketStatus.RESOLVED: return 'Resolved';
        case MarketStatus.EXPIRED: return 'Expired';
        case MarketStatus.CANCELLED: return 'Cancelled';
        default: return 'Unknown';
      }
    };
  
    const validateTimeRange = (
      startTime: bigint, endTime: bigint, resolutionDeadline: bigint
    ) => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (startTime >= endTime) return { valid: false, error: 'Start must be before end' };
      if (endTime >= resolutionDeadline) return { valid: false, error: 'End must be before resolution deadline' };
      if (startTime <= now) return { valid: false, error: 'Start must be in future' };
      return { valid: true, error: null };
    };
  
    return { isValidAddress, getStatusString, validateTimeRange };
  };
  