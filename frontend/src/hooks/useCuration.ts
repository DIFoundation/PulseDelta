import { 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useWatchContractEvent,
} from 'wagmi';
import { Address } from 'viem';
import { CONTRACT_ADDRESSES, ABI } from '@/lib/abiAndAddress';

// ---------------- Types ----------------
export enum CurationStatus {
  // Mirrors enum Curation.Status in the contract
  // Ensure these match the contract values
  Pending = 0,
  Approved = 1,
  Flagged = 2,
  Reset = 3,
}

// ---------------- Function Signatures ----------------
export const FUNCTION_SIGNATURES = {
  approveMarket: '0x3a4b66f2',
  council: '0x99a88ec4',
  flagMarket: '0x0a9fb1c9',
  isCouncilMember: '0x6e9f0a89',
  resetMarket: '0x0dc8ee2d',
  setCouncilMember: '0x5c7139b1',
  statusOf: '0x30f8ecfe',
};

// ---------------- Events ----------------
export const EVENT_SIGNATURES = {
  CouncilMemberSet: '0x0', // placeholder topic, replace if you compute exact topic
  StatusChanged: '0x0',
};

// ---------------- Errors ----------------
export const ERROR_SIGNATURES = {
  NotCouncil: '0x0',
  NotMember: '0x0',
};

// ---------------- Getters ----------------
export function useCurationGetters() {
  const curation = CONTRACT_ADDRESSES.curation;
  const abi = ABI.curation;

  const useCouncil = () => {
    return useReadContract({
      address: curation as Address,
      abi,
      functionName: 'council',
    });
  };

  const useIsCouncilMember = (member?: Address) => {
    return useReadContract({
      address: curation as Address,
      abi,
      functionName: 'isCouncilMember',
      args: member ? [member] : undefined,
      query: { enabled: !!member },
    });
  };

  const useStatusOf = (marketId?: bigint) => {
    return useReadContract({
      address: curation as Address,
      abi,
      functionName: 'statusOf',
      args: marketId !== undefined ? [marketId] : undefined,
      query: { enabled: marketId !== undefined },
    });
  };

  return { useCouncil, useIsCouncilMember, useStatusOf };
}

// ---------------- Setters ----------------
export function useCurationSetters() {
  const curation = CONTRACT_ADDRESSES.curation;
  const abi = ABI.curation;

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const approveMarket = (marketId: bigint) => {
    writeContract({ address: curation as Address, abi, functionName: 'approveMarket', args: [marketId] });
  };
  const flagMarket = (marketId: bigint) => {
    writeContract({ address: curation as Address, abi, functionName: 'flagMarket', args: [marketId] });
  };
  const resetMarket = (marketId: bigint) => {
    writeContract({ address: curation as Address, abi, functionName: 'resetMarket', args: [marketId] });
  };
  const setCouncilMember = (member: Address, enabled: boolean) => {
    writeContract({ address: curation as Address, abi, functionName: 'setCouncilMember', args: [member, enabled] });
  };

  return { hash, error, isPending, isConfirming, isConfirmed, approveMarket, flagMarket, resetMarket, setCouncilMember };
}

// ---------------- Events ----------------
export function useCurationEvents() {
  const curation = CONTRACT_ADDRESSES.curation;
  const abi = ABI.curation;

  type CouncilMemberSetLog = { args?: { member?: Address; enabled?: boolean } };
  type StatusChangedLog = { args?: { marketId?: bigint; status?: number } };

  const useCouncilMemberSetEvent = (
    onEvent?: (logs: CouncilMemberSetLog[]) => void,
    options?: { enabled?: boolean }
  ) => {
    return useWatchContractEvent({
      address: curation as Address,
      abi,
      eventName: 'CouncilMemberSet',
      onLogs: onEvent ? (logs) => onEvent(logs as unknown as CouncilMemberSetLog[]) : undefined,
      enabled: options?.enabled !== false,
    });
  };

  const useStatusChangedEvent = (
    onEvent?: (logs: StatusChangedLog[]) => void,
    options?: { enabled?: boolean }
  ) => {
    return useWatchContractEvent({
      address: curation as Address,
      abi,
      eventName: 'StatusChanged',
      onLogs: onEvent ? (logs) => onEvent(logs as unknown as StatusChangedLog[]) : undefined,
      enabled: options?.enabled !== false,
    });
  };

  return { useCouncilMemberSetEvent, useStatusChangedEvent };
}

// ---------------- Combined ----------------
export function useCuration() {
  const getters = useCurationGetters();
  const setters = useCurationSetters();
  const events = useCurationEvents();

  return {
    ...getters,
    ...setters,
    ...events,
    functionSignatures: FUNCTION_SIGNATURES,
    eventSignatures: EVENT_SIGNATURES,
    errorSignatures: ERROR_SIGNATURES,
    CurationStatus,
  };
}


