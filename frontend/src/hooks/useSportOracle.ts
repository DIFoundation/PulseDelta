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
enum Status {
  UNKNOWN = 0,
  PROPOSED = 1,
  DISPUTED = 2,
  FINALIZED = 3,
  INVALID = 4,
}

enum Outcome {
  UNDECIDED = 0,
  HOME_WIN = 1,
  AWAY_WIN = 2,
  DRAW = 3,
  CANCELLED = 4,
}

interface SportsProposal {
  status: Status;
  reporter: Address;
  disputer: Address;
  proposedOutcome: Outcome;
  evidenceCID: string;
  timestamp: bigint;
  reporterBondPaid: bigint;
  disputerBondPaid: bigint;
  finalOutcome: Outcome;
}

interface SportsResult {
  status: Status;
  value: string;
}

// Contract function signatures (hashes)
export const FUNCTION_SIGNATURES = {
  // Read functions
  authorizedFactories: "0x7e4e1c3d",
  collateral: "0xd8dfeb45",
  council: "0x2c2d72b4",
  disputerBond: "0x5b16ebb7",
  getResult: "0xde292789",
  isReporter: "0x47d5ce23",
  liveness: "0x8b3f7c91",
  marketAddress: "0x2c40d590",
  proposals: "0x9a3b2556",
  reporterBond: "0x8fa1c4e4",

  // Write functions
  arbitrate: "0x3c8f2d7b",
  dispute: "0x2a6c9b4d",
  finalize: "0x4bb278f3",
  invalidate: "0xbf1fe420",
  proposeResult: "0x5e8d5c7a",
  setFactory: "0x5b16ebb7",
  setMarketAddress: "0x1c4e6d8f",
  setReporter: "0x9a1b2c3d",
};

// Event signatures (topic hashes)
export const EVENT_SIGNATURES = {
  Disputed:
    "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
  FactoryAuthorized:
    "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
  Finalized:
    "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
  Proposed:
    "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
  ReporterSet:
    "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
};

// Error signatures
export const ERROR_SIGNATURES = {
  BadState: "0x65c87992",
  Exists: "0x2b2c1b6b",
  Liveness: "0x8b14e234",
  NotAuthorized: "0x4ca88867",
  NotCouncil: "0x1e4fbdf7",
  NotWhitelisted: "0x5b5c9d8e",
  TooEarly: "0x6f5e8e24",
};

export function useSportsOracleGetters() {
  const sportsOracle = CONTRACT_ADDRESSES.sportsOracle;
  const abi = ABI.sportsOracle;
  const userAddress = useAccount().address;

  // Check if factory is authorized
  const useAuthorizedFactories = (factory?: Address) => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "authorizedFactories",
      args: factory ? [factory] : undefined,
      query: {
        enabled: !!factory,
      },
    });
  };

  // Get collateral token address
  const useCollateral = () => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "collateral",
    });
  };

  // Get council address
  const useCouncil = () => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "council",
    });
  };

  // Get disputer bond amount
  const useDisputerBond = () => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "disputerBond",
    });
  };

  // Get result for market
  const useGetResult = (marketId?: bigint) => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "getResult",
      args: marketId !== undefined ? [marketId] : undefined,
      query: {
        enabled: marketId !== undefined,
      },
    }) as ReturnType<typeof useReadContract> & {
      data?: [number, string];
    };
  };

  // Check if address is reporter
  const useIsReporter = (reporter?: Address) => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "isReporter",
      args: reporter ? [reporter] : undefined,
      query: {
        enabled: !!reporter,
      },
    });
  };

  // Get liveness period
  const useLiveness = () => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "liveness",
    });
  };

  // Get market address by ID
  const useMarketAddress = (marketId?: bigint) => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "marketAddress",
      args: marketId !== undefined ? [marketId] : undefined,
      query: {
        enabled: marketId !== undefined,
      },
    });
  };

  // Get full proposal data
  const useProposals = (marketId?: bigint) => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "proposals",
      args: marketId !== undefined ? [marketId] : undefined,
      query: {
        enabled: marketId !== undefined,
      },
    }) as ReturnType<typeof useReadContract> & {
      data?: [
        number,
        Address,
        Address,
        number,
        string,
        bigint,
        bigint,
        bigint,
        number
      ];
    };
  };

  // Get reporter bond amount
  const useReporterBond = () => {
    return useReadContract({
      address: sportsOracle as Address,
      abi,
      functionName: "reporterBond",
    });
  };

  // Check if current user is reporter
  const useIsMyReporter = () => {
    return useIsReporter(userAddress);
  };

  // Check if current user is council
  const useIsMyCouncil = () => {
    const council = useCouncil();
    return {
      ...council,
      data: council.data === userAddress,
    };
  };

  // Get oracle configuration
  const useOracleConfig = () => {
    const collateral = useCollateral();
    const reporterBond = useReporterBond();
    const disputerBond = useDisputerBond();
    const liveness = useLiveness();
    const council = useCouncil();

    return {
      data:
        collateral.data &&
        reporterBond.data &&
        disputerBond.data &&
        liveness.data &&
        council.data
          ? {
              collateral: collateral.data as Address,
              reporterBond: reporterBond.data as bigint,
              disputerBond: disputerBond.data as bigint,
              liveness: liveness.data as bigint,
              council: council.data as Address,
            }
          : undefined,
      isLoading:
        collateral.isLoading ||
        reporterBond.isLoading ||
        disputerBond.isLoading ||
        liveness.isLoading ||
        council.isLoading,
      error:
        collateral.error ||
        reporterBond.error ||
        disputerBond.error ||
        liveness.error ||
        council.error,
    };
  };

  return {
    useAuthorizedFactories,
    useCollateral,
    useCouncil,
    useDisputerBond,
    useGetResult,
    useIsReporter,
    useLiveness,
    useMarketAddress,
    useProposals,
    useReporterBond,
    useIsMyReporter,
    useIsMyCouncil,
    useOracleConfig,
  };
}

export function useSportsOracleSetters() {
  const sportsOracle = CONTRACT_ADDRESSES.sportsOracle;
  const abi = ABI.sportsOracle;

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Arbitrate a dispute (council only)
  const arbitrate = (
    marketId: bigint,
    outcome: Outcome,
    reporterWins: boolean
  ) => {
    writeContract({
      address: sportsOracle as Address,
      abi,
      functionName: "arbitrate",
      args: [marketId, outcome, reporterWins],
    });
  };

  // Dispute a proposal
  const dispute = (marketId: bigint, evidenceCID: string, value?: bigint) => {
    writeContract({
      address: sportsOracle as Address,
      abi,
      functionName: "dispute",
      args: [marketId, evidenceCID],
      value,
    });
  };

  // Finalize a proposal
  const finalize = (marketId: bigint) => {
    writeContract({
      address: sportsOracle as Address,
      abi,
      functionName: "finalize",
      args: [marketId],
    });
  };

  // Invalidate a proposal (council only)
  const invalidate = (marketId: bigint) => {
    writeContract({
      address: sportsOracle as Address,
      abi,
      functionName: "invalidate",
      args: [marketId],
    });
  };

  // Propose a result
  const proposeResult = (
    marketId: bigint,
    payload: string,
    evidenceCID: string,
    value?: bigint
  ) => {
    writeContract({
      address: sportsOracle as Address,
      abi,
      functionName: "proposeResult",
      args: [marketId, payload, evidenceCID],
      value,
    });
  };

  // Set factory authorization (council only)
  const setFactory = (factory: Address, enabled: boolean) => {
    writeContract({
      address: sportsOracle as Address,
      abi,
      functionName: "setFactory",
      args: [factory, enabled],
    });
  };

  // Set market address (authorized factory only)
  const setMarketAddress = (marketId: bigint, market: Address) => {
    writeContract({
      address: sportsOracle as Address,
      abi,
      functionName: "setMarketAddress",
      args: [marketId, market],
    });
  };

  // Set reporter status (council only)
  const setReporter = (reporter: Address, enabled: boolean) => {
    writeContract({
      address: sportsOracle as Address,
      abi,
      functionName: "setReporter",
      args: [reporter, enabled],
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
    arbitrate,
    dispute,
    finalize,
    invalidate,
    proposeResult,
    setFactory,
    setMarketAddress,
    setReporter,
  };
}

export function useSportsOracleEvents() {
  const sportsOracle = CONTRACT_ADDRESSES.sportsOracle;
  const abi = ABI.sportsOracle;

  // Watch Disputed events
  const useDisputedEvent = (
    onEvent?: (logs: unknown[]) => void,
    options?: {
      marketId?: bigint;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: sportsOracle as Address,
      abi,
      eventName: "Disputed",
      args: options?.marketId ? { marketId: options.marketId } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch FactoryAuthorized events
  const useFactoryAuthorizedEvent = (
    onEvent?: (logs: unknown[]) => void,
    options?: {
      factory?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: sportsOracle as Address,
      abi,
      eventName: "FactoryAuthorized",
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch Finalized events
  const useFinalizedEvent = (
    onEvent?: (logs: unknown[]) => void,
    options?: {
      marketId?: bigint;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: sportsOracle as Address,
      abi,
      eventName: "Finalized",
      args: options?.marketId ? { marketId: options.marketId } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch Proposed events
  const useProposedEvent = (
    onEvent?: (logs: unknown[]) => void,
    options?: {
      marketId?: bigint;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: sportsOracle as Address,
      abi,
      eventName: "Proposed",
      args: options?.marketId ? { marketId: options.marketId } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch ReporterSet events
  const useReporterSetEvent = (
    onEvent?: (logs: unknown[]) => void,
    options?: {
      reporter?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: sportsOracle as Address,
      abi,
      eventName: "ReporterSet",
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch market-specific events
  const useMarketEvents = (
    marketId?: bigint,
    onEvent?: (logs: unknown[]) => void
  ) => {
    useProposedEvent(onEvent, { marketId });
    useDisputedEvent(onEvent, { marketId });
    useFinalizedEvent(onEvent, { marketId });
  };

  // Watch reporter-specific events
  const useReporterEvents = (
    reporter?: Address,
    onEvent?: (logs: unknown[]) => void
  ) => {
    useReporterSetEvent(onEvent, { reporter });
  };

  return {
    useDisputedEvent,
    useFactoryAuthorizedEvent,
    useFinalizedEvent,
    useProposedEvent,
    useReporterSetEvent,
    useMarketEvents,
    useReporterEvents,
  };
}

// Combined hook for complete sports oracle functionality
export function useSportsOracle() {
  const getters = useSportsOracleGetters();
  const setters = useSportsOracleSetters();
  const events = useSportsOracleEvents();

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
    Status,
    Outcome,
  };
}

// Utility functions
export const useSportsOracleUtils = () => {
  const formatBond = (bond: bigint, decimals = 18) => {
    return Number(bond) / Math.pow(10, decimals);
  };

  const parseBondAmount = (amount: string, decimals = 18) => {
    return BigInt(Math.floor(Number(amount) * Math.pow(10, decimals)));
  };

  const isValidAddress = (address: string): address is Address => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const formatSportsProposal = (
    proposal: [
      number,
      Address,
      Address,
      number,
      string,
      bigint,
      bigint,
      bigint,
      number
    ]
  ): SportsProposal => {
    const [
      status,
      reporter,
      disputer,
      proposedOutcome,
      evidenceCID,
      timestamp,
      reporterBondPaid,
      disputerBondPaid,
      finalOutcome,
    ] = proposal;
    return {
      status,
      reporter,
      disputer,
      proposedOutcome,
      evidenceCID,
      timestamp,
      reporterBondPaid,
      disputerBondPaid,
      finalOutcome,
    };
  };

  const formatSportsResult = (result: [number, string]): SportsResult => {
    const [status, value] = result;
    return { status, value };
  };

  const getStatusString = (status: Status) => {
    switch (status) {
      case Status.UNKNOWN:
        return "Unknown";
      case Status.PROPOSED:
        return "Proposed";
      case Status.DISPUTED:
        return "Disputed";
      case Status.FINALIZED:
        return "Finalized";
      case Status.INVALID:
        return "Invalid";
      default:
        return "Unknown";
    }
  };

  const getOutcomeString = (outcome: Outcome) => {
    switch (outcome) {
      case Outcome.UNDECIDED:
        return "Undecided";
      case Outcome.HOME_WIN:
        return "Home Win";
      case Outcome.AWAY_WIN:
        return "Away Win";
      case Outcome.DRAW:
        return "Draw";
      case Outcome.CANCELLED:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const canFinalize = (proposal: SportsProposal, liveness: bigint) => {
    if (proposal.status !== Status.PROPOSED) return false;
    const now = BigInt(Math.floor(Date.now() / 1000));
    return now >= proposal.timestamp + liveness;
  };

  const canDispute = (proposal: SportsProposal, liveness: bigint) => {
    if (proposal.status !== Status.PROPOSED) return false;
    const now = BigInt(Math.floor(Date.now() / 1000));
    return now < proposal.timestamp + liveness;
  };

  const encodeOutcome = (outcome: Outcome): string => {
    // Convert outcome enum to bytes for payload
    return "0x" + outcome.toString(16).padStart(2, "0");
  };

  const decodeOutcome = (payload: string): Outcome => {
    // Decode bytes payload back to outcome enum
    const outcomeValue = parseInt(payload.slice(2), 16);
    return outcomeValue as Outcome;
  };

  const validateOutcome = (outcome: number): outcome is Outcome => {
    return Object.values(Outcome).includes(outcome);
  };

  return {
    formatBond,
    parseBondAmount,
    isValidAddress,
    formatSportsProposal,
    formatSportsResult,
    getStatusString,
    getOutcomeString,
    canFinalize,
    canDispute,
    encodeOutcome,
    decodeOutcome,
    validateOutcome,
  };
};
