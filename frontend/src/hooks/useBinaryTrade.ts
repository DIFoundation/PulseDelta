import { useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES, ABI } from '../lib/abiAndAddress';
import { toast } from './use-toast';
import { readContract } from 'viem/actions';
import { client } from '@/configs/index';

export function useBinaryTrade(marketId: string) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const clients = client;


  const checkAllowance = useCallback(async (amount: string): Promise<boolean> => {
    if (!address) return false;
    
    const marketAddress = await getMarketAddress(marketId);
    const shares = parseUnits(amount, 18);
    
    try {
      const allowance = await readContract(clients, {
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

  const buy = useCallback(async (outcomeIndex: number, amount: string) => {
    if (!address) throw new Error('Connect wallet to trade');
    
    const marketAddress = await getMarketAddress(marketId);
    const shares = parseUnits(amount, 18);
    
    await writeContract({
      address: marketAddress,
      abi: ABI.binaryMarket,
      functionName: 'buy',
      args: [outcomeIndex, shares],
    });
    
    toast({
      title: 'Order Submitted',
      description: `Buy order for ${amount} shares placed successfully`,
      type: 'success',
    });
  }, [address, marketId, writeContract]);

  const sell = useCallback(async (outcomeIndex: number, amount: string) => {
    if (!address) throw new Error('Connect wallet to trade');
    
    const marketAddress = await getMarketAddress(marketId);
    const shares = parseUnits(amount, 18);
    
    await writeContract({
      address: marketAddress,
      abi: ABI.binaryMarket,
      functionName: 'sell',
      args: [outcomeIndex, shares],
    });
    
    toast({
      title: 'Order Submitted',
      description: `Sell order for ${amount} shares placed successfully`,
      type: 'success',
    });
  }, [address, marketId, writeContract]);

  return {
    checkAllowance,
    approve,
    buy,
    sell,
  };
}

async function getMarketAddress(marketId: string): Promise<`0x${string}`> {
  // TODO: Implement market address resolution
  // This should fetch the market address from the factory contract
  // For now, returning a placeholder
  return '0x0000000000000000000000000000000000000000' as const;
}
