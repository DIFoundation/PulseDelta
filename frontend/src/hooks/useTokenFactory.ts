import { 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useWatchContractEvent,
} from 'wagmi';
import { Address } from 'viem';
import { CONTRACT_ADDRESSES, ABI } from '@/lib/abiAndAddress';

// ---------------- Types ----------------
export interface CreateTokenParams {
  name: string;
  symbol: string;
  market: Address;
  outcomeId: number; // uint8
  marketKey: string; // bytes32
}

// ---------------- Function Signatures ----------------
export const FUNCTION_SIGNATURES = {
  create: '0xd95e3b5b', // keccak256("create(string,string,address,uint8,bytes32)").slice(0,10)
  getTokens: '0x9e281a98',
  tokenOf: '0x63bd3e71',
};

// ---------------- Events ----------------
export const EVENT_SIGNATURES = {
  TokenCreated: '0x5a3f2f5d1c8b6c1c8c2f9a9b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c', // placeholder
};

// ---------------- Errors ----------------
export const ERROR_SIGNATURES = {
  Exists: '0x3b3b57de',
  ZeroAddress: '0xd92e233d',
};

// ---------------- Getters ----------------
export function useTokenFactoryGetters() {
  const tokenFactory = CONTRACT_ADDRESSES.tokenFactory;
  const abi = ABI.tokenFactory;

  const useGetTokens = (market?: Address) => {
    return useReadContract({
      address: tokenFactory as Address,
      abi,
      functionName: 'getTokens',
      args: market ? [market] : undefined,
      query: { enabled: !!market },
    }) as ReturnType<typeof useReadContract> & { data?: Address[] };
  };

  const useTokenOf = (market?: Address, outcomeId?: number) => {
    return useReadContract({
      address: tokenFactory as Address,
      abi,
      functionName: 'tokenOf',
      args: market !== undefined && outcomeId !== undefined ? [market, outcomeId] : undefined,
      query: { enabled: market !== undefined && outcomeId !== undefined },
    });
  };

  return { useGetTokens, useTokenOf };
}

// ---------------- Setters ----------------
export function useTokenFactorySetters() {
  const tokenFactory = CONTRACT_ADDRESSES.tokenFactory;
  const abi = ABI.tokenFactory;

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const create = (params: CreateTokenParams) => {
    writeContract({
      address: tokenFactory as Address,
      abi,
      functionName: 'create',
      args: [
        params.name,
        params.symbol,
        params.market,
        params.outcomeId,
        params.marketKey,
      ],
    });
  };

  return { hash, error, isPending, isConfirming, isConfirmed, create };
}

// ---------------- Events ----------------
export function useTokenFactoryEvents() {
  const tokenFactory = CONTRACT_ADDRESSES.tokenFactory;
  const abi = ABI.tokenFactory;

  type TokenCreatedLog = {
    args?: { token?: Address; market?: Address; outcomeId?: number };
  };

  const useTokenCreatedEvent = (
    onEvent?: (logs: TokenCreatedLog[]) => void,
    options?: { enabled?: boolean }
  ) => {
    return useWatchContractEvent({
      address: tokenFactory as Address,
      abi,
      eventName: 'TokenCreated',
      onLogs: onEvent
        ? (logs) => onEvent(logs as unknown as TokenCreatedLog[])
        : undefined,
      enabled: options?.enabled !== false,
    });
  };

  const useNewTokens = (
    onNewToken?: (token: Address, market: Address, outcomeId: number) => void
  ) => {
    return useTokenCreatedEvent((logs) => {
      logs.forEach((log: TokenCreatedLog) => {
        if (log.args?.token && log.args?.market && log.args?.outcomeId !== undefined) {
          onNewToken?.(log.args.token as Address, log.args.market as Address, log.args.outcomeId as number);
        }
      });
    });
  };

  return { useTokenCreatedEvent, useNewTokens };
}

// ---------------- Combined ----------------
export function useTokenFactory() {
  const getters = useTokenFactoryGetters();
  const setters = useTokenFactorySetters();
  const events = useTokenFactoryEvents();

  return {
    ...getters,
    ...setters,
    ...events,
    functionSignatures: FUNCTION_SIGNATURES,
    eventSignatures: EVENT_SIGNATURES,
    errorSignatures: ERROR_SIGNATURES,
  };
}


