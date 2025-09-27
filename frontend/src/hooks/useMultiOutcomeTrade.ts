import { useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES, ABI } from '../lib/abiAndAddress';
import { useToast } from './use-toast';
import { config } from '../configs/index';
import { readContract } from 'viem/actions';

export function useMultiOutcomeTrade(marketId: string, outcomeIndex: number) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const { toast } = useToast();

  const checkAllowance = useCallback(async (amount: string): Promise<boolean> => {
    if (!address) return false;
    
    const marketAddress = await getMarketAddress(marketId);
    const shares = parseUnits(amount, 18);
    
    try {
      const allowance = await readContract(config, {
        address: CONTRACT_ADDRESSES.wDAG as `0x${string}`,
        abi: ABI.wDAG,
        functionName: 'allowance',
        args: [address, marketAddress],
      }) as bigint;
      
      return allowance >= shares;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  }, [address, marketId]);

  const approve = useCallback(async (amount: string) => {
    if (!address) throw new Error('Connect wallet to approve');
    
    const marketAddress = await getMarketAddress(marketId);
    const shares = parseUnits(amount, 18);
    
    await writeContract({
      address: CONTRACT_ADDRESSES.wDAG as `0x${string}`,
      abi: ABI.wDAG,
      functionName: 'approve',
      args: [marketAddress, shares],
    });
  }, [address, marketId, writeContract]);

  const buy = useCallback(async (amount: string) => {
    if (!address) throw new Error('Connect wallet to trade');
    
    const marketAddress = await getMarketAddress(marketId);
    const shares = parseUnits(amount, 18);
    
    await writeContract({
      address: marketAddress,
      abi: ABI.multiOutcomeMarket,
      functionName: 'buy',
      args: [outcomeIndex, shares],
    });
    
    toast({
      title: 'Order Submitted',
      description: `Bought ${amount} shares of outcome ${outcomeIndex + 1}`,
      type: 'success',
    });
  }, [address, marketId, outcomeIndex, writeContract, toast]);

  const sell = useCallback(async (amount: string) => {
    if (!address) throw new Error('Connect wallet to trade');
    
    const marketAddress = await getMarketAddress(marketId);
    const shares = parseUnits(amount, 18);
    
    await writeContract({
      address: marketAddress,
      abi: ABI.multiOutcomeMarket,
      functionName: 'sell',
      args: [outcomeIndex, shares],
    });
    
    toast({
      title: 'Order Submitted',
      description: `Sold ${amount} shares of outcome ${outcomeIndex + 1}`,
      type: 'success',
    });
  }, [address, marketId, outcomeIndex, writeContract, toast]);

  return {
    checkAllowance,
    approve,
    buy,
    sell,
  };
}

// async function getMarketAddress(marketId: string): Promise<`0x${string}`> {
//   // TODO: Implement market address resolution from factory
//   return '0x0000000000000000000000000000000000000000' as const;
// }
