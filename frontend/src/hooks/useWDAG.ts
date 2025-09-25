import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useAccount } from 'wagmi';
import { Address } from 'viem';
// import { getContractAddresses, ChainId, wDAGAbi } from '@/lib/addressAndAbi';

import { CONTRACT_ADDRESSES } from '@/lib/abiAndAddress';
import { ABI } from '@/lib/abiAndAddress';

// Types
interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

// interface AllowanceInfo {
//   owner: Address;
//   spender: Address;
//   amount: bigint;
// }

// interface MinterInfo {
//   minter: Address;
//   isAuthorized: boolean;
// }

// Contract function signatures (hashes)
export const FUNCTION_SIGNATURES = {
  // Read functions
  allowance: '0xdd62ed3e',
  authorizedMinters: '0x75e1b7c5',
  balanceOf: '0x70a08231',
  decimals: '0x313ce567',
  getNativeBalance: '0x4d2301cc',
  name: '0x06fdde03',
  owner: '0x8da5cb5b',
  symbol: '0x95d89b41',
  totalSupply: '0x18160ddd',
  
  // Write functions
  addMinter: '0x983b2d56',
  approve: '0x095ea7b3',
  burn: '0x42966c68',
  deposit: '0xd0e30db0',
  emergencyWithdraw: '0xdb2e21bc',
  mint: '0x40c10f19',
  mintForRedemption: '0x2b2d4de6',
  removeMinter: '0x3092afd5',
  renounceOwnership: '0x715018a6',
  transfer: '0xa9059cbb',
  transferFrom: '0x23b872dd',
  transferOwnership: '0xf2fde38b',
  withdraw: '0x2e1a7d4d',
};

// Event signatures (topic hashes)
export const EVENT_SIGNATURES = {
  Approval: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
  Deposit: '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
  MinterAdded: '0x6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f6',
  MinterRemoved: '0xe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb66692',
  OwnershipTransferred: '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
  Transfer: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  Withdrawal: '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
};

// Error signatures
export const ERROR_SIGNATURES = {
  ERC20InsufficientAllowance: '0x13be252b',
  ERC20InsufficientBalance: '0xe450d38c',
  ERC20InvalidApprover: '0xe602df05',
  ERC20InvalidReceiver: '0xec442f05',
  ERC20InvalidSender: '0x96c6fd1e',
  ERC20InvalidSpender: '0x94280d62',
  OwnableInvalidOwner: '0x1e4fbdf7',
  OwnableUnauthorizedAccount: '0x118cdaa7',
};

export function useWDAGGetters() {
    const wDAG = CONTRACT_ADDRESSES.wDAG;
    const abi = ABI.wDAG;
    const userAddress = useAccount().address;

    

  // Get allowance between owner and spender
  const useAllowance = (owner?: Address, spender?: Address) => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'allowance',
      args: owner && spender ? [owner, spender] : undefined,
      query: {
        enabled: !!owner && !!spender,
      },
    });
  };

  // Check if address is authorized minter
  const useAuthorizedMinters = (minter?: Address) => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'authorizedMinters',
      args: minter ? [minter] : undefined,
      query: {
        enabled: !!minter,
      },
    });
  };

  // Get balance of address
  const useBalanceOf = (account?: Address) => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'balanceOf',
      args: account ? [account] : undefined,
      query: {
        enabled: !!account,
      },
    });
  };

  // Get user's balance (current connected account)
  const useMyBalance = () => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'balanceOf',
      args: userAddress ? [userAddress] : undefined,
      query: {
        enabled: !!userAddress,
      },
    });
  };

  // Get token decimals
  const useDecimals = () => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'decimals',
    });
  };

  // Get native balance held by contract
  const useGetNativeBalance = () => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'getNativeBalance',
    });
  };

  // Get token name
  const useName = () => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'name',
    });
  };

  // Get contract owner
  const useOwner = () => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'owner',
    });
  };

  // Get token symbol
  const useSymbol = () => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'symbol',
    });
  };

  // Get total supply
  const useTotalSupply = () => {
    return useReadContract({
      address: wDAG as Address,
      abi,
      functionName: 'totalSupply',
    });
  };

  // Get complete token info
  const useTokenInfo = () => {
    const name = useName();
    const symbol = useSymbol();
    const decimals = useDecimals();
    const totalSupply = useTotalSupply();

    return {
      data: name.data && symbol.data && decimals.data && totalSupply.data ? {
        name: name.data as string,
        symbol: symbol.data as string,
        decimals: decimals.data as number,
        totalSupply: totalSupply.data as bigint,
      } as TokenInfo : undefined,
      isLoading: name.isLoading || symbol.isLoading || decimals.isLoading || totalSupply.isLoading,
      error: name.error || symbol.error || decimals.error || totalSupply.error,
    };
  };

  // Check if current user is owner
  const useIsOwner = () => {
    const owner = useOwner();
    return {
      ...owner,
      data: owner.data === userAddress,
    };
  };

  // Check if current user is authorized minter
  const useIsMyAuthorizedMinter = () => {
    return useAuthorizedMinters(userAddress);
  };

  return {
    useAllowance,
    useAuthorizedMinters,
    useBalanceOf,
    useMyBalance,
    useDecimals,
    useGetNativeBalance,
    useName,
    useOwner,
    useSymbol,
    useTotalSupply,
    useTokenInfo,
    useIsOwner,
    useIsMyAuthorizedMinter,
  };
}

export function useWDAGSetters() {
    const wDAG = CONTRACT_ADDRESSES.wDAG;
    const abi = ABI.wDAG;
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Add authorized minter (owner only)
  const addMinter = (minter: Address) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'addMinter',
      args: [minter],
    });
  };

  // Approve spender to spend tokens
  const approve = (spender: Address, value: bigint) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'approve',
      args: [spender, value],
    });
  };

  // Burn tokens from caller's balance
  const burn = (amount: bigint) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'burn',
      args: [amount],
    });
  };

  // Deposit native tokens to receive wrapped tokens
  const deposit = (value: bigint) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'deposit',
      value,
    });
  };

  // Emergency withdraw native tokens (owner only)
  const emergencyWithdraw = (to: Address, amount: bigint) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'emergencyWithdraw',
      args: [to, amount],
    });
  };

  // Mint tokens (authorized minters only)
  const mint = (to: Address, amount: bigint) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'mint',
      args: [to, amount],
    });
  };

  // Mint tokens for redemption (authorized minters only)
  const mintForRedemption = (to: Address, amount: bigint) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'mintForRedemption',
      args: [to, amount],
    });
  };

  // Remove authorized minter (owner only)
  const removeMinter = (minter: Address) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'removeMinter',
      args: [minter],
    });
  };

  // Renounce ownership (owner only)
  const renounceOwnership = () => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'renounceOwnership',
    });
  };

  // Transfer tokens
  const transfer = (to: Address, value: bigint) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'transfer',
      args: [to, value],
    });
  };

  // Transfer tokens from approved account
  const transferFrom = (from: Address, to: Address, value: bigint) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'transferFrom',
      args: [from, to, value],
    });
  };

  // Transfer ownership (owner only)
  const transferOwnership = (newOwner: Address) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'transferOwnership',
      args: [newOwner],
    });
  };

  // Withdraw wrapped tokens to receive native tokens
  const withdraw = (amount: bigint) => {
    writeContract({
      address: wDAG as Address,
      abi,
      functionName: 'withdraw',
      args: [amount],
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
    addMinter,
    approve,
    burn,
    deposit,
    emergencyWithdraw,
    mint,
    mintForRedemption,
    removeMinter,
    renounceOwnership,
    transfer,
    transferFrom,
    transferOwnership,
    withdraw,
  };
}

export function useWDAGEvents() {
    const wDAG = CONTRACT_ADDRESSES.wDAG;
    const abi = ABI.wDAG;

    // Watch Approval events
  const useApprovalEvent = (
    onEvent?: (logs: any[]) => void,
    options?: {
      owner?: Address;
      spender?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: wDAG as Address,
      abi,
      eventName: 'Approval',
      args: options?.owner || options?.spender ? {
        owner: options?.owner,
        spender: options?.spender,
      } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch Deposit events
  const useDepositEvent = (
    onEvent?: (logs: any[]) => void,
    options?: {
      user?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: wDAG as Address,
      abi,
      eventName: 'Deposit',
      args: options?.user ? { user: options.user } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch MinterAdded events
  const useMinterAddedEvent = (
    onEvent?: (logs: any[]) => void,
    options?: {
      minter?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: wDAG as Address,
      abi,
      eventName: 'MinterAdded',
      args: options?.minter ? { minter: options.minter } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch MinterRemoved events
  const useMinterRemovedEvent = (
    onEvent?: (logs: any[]) => void,
    options?: {
      minter?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: wDAG as Address,
      abi,
      eventName: 'MinterRemoved',
      args: options?.minter ? { minter: options.minter } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch OwnershipTransferred events
  const useOwnershipTransferredEvent = (
    onEvent?: (logs: any[]) => void,
    options?: {
      previousOwner?: Address;
      newOwner?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: wDAG as Address,
      abi,
      eventName: 'OwnershipTransferred',
      args: options?.previousOwner || options?.newOwner ? {
        previousOwner: options?.previousOwner,
        newOwner: options?.newOwner,
      } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch Transfer events
  const useTransferEvent = (
    onEvent?: (logs: any[]) => void,
    options?: {
      from?: Address;
      to?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: wDAG as Address,
      abi,
      eventName: 'Transfer',
      args: options?.from || options?.to ? {
        from: options?.from,
        to: options?.to,
      } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch Withdrawal events
  const useWithdrawalEvent = (
    onEvent?: (logs: any[]) => void,
    options?: {
      user?: Address;
      enabled?: boolean;
    }
  ) => {
    return useWatchContractEvent({
      address: wDAG as Address,
      abi,
      eventName: 'Withdrawal',
      args: options?.user ? { user: options.user } : undefined,
      onLogs: onEvent,
      enabled: options?.enabled !== false,
    });
  };

  // Watch user-specific events (transfers, deposits, withdrawals)
  const useMyEvents = (
    userAddress?: Address,
    onEvent?: (logs: any[]) => void
  ) => {
    useTransferEvent(onEvent, { from: userAddress });
    useTransferEvent(onEvent, { to: userAddress });
    useDepositEvent(onEvent, { user: userAddress });
    useWithdrawalEvent(onEvent, { user: userAddress });
  };

  return {
    useApprovalEvent,
    useDepositEvent,
    useMinterAddedEvent,
    useMinterRemovedEvent,
    useOwnershipTransferredEvent,
    useTransferEvent,
    useWithdrawalEvent,
    useMyEvents,
  };
}

// Combined hook for complete wDAG functionality
export function useWDAG() {
  const getters = useWDAGGetters();
  const setters = useWDAGSetters();
  const events = useWDAGEvents();

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
export const useWDAGUtils = () => {
  const formatBalance = (balance: bigint, decimals = 18) => {
    return Number(balance) / Math.pow(10, decimals);
  };

  const parseAmount = (amount: string, decimals = 18) => {
    return BigInt(Math.floor(Number(amount) * Math.pow(10, decimals)));
  };

  const isValidAddress = (address: string): address is Address => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const formatTokenAmount = (amount: bigint, decimals = 18, precision = 4) => {
    const formatted = formatBalance(amount, decimals);
    return Number(formatted.toFixed(precision));
  };

  return {
    formatBalance,
    parseAmount,
    isValidAddress,
    formatTokenAmount,
  };
};