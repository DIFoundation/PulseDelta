import { useBalance as useWagmiBalance } from 'wagmi'
import { useAccount } from 'wagmi'

/**
 * Hook to get native BDAG balance
 */
export function useBDAGBalance() {
  const { address } = useAccount()
  
  const { data: balance, isLoading, error } = useWagmiBalance({
    address,
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  })

  return {
    balance: balance?.value || 0n,
    formatted: balance?.formatted || '0',
    symbol: balance?.symbol || 'BDAG',
    decimals: balance?.decimals || 18,
    isLoading,
    error
  }
}
