"use client"

import { useCallback, useMemo } from "react"
import { useFactory } from "@/hooks/useFactory"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { MARKET_ABIS } from "@/lib/marketABIs"
import { config } from "@/configs"
import { parseUnits } from "viem"
import { readContract } from "@wagmi/core"
import { useToast } from "@/components/toast"
import { ABI, CONTRACT_ADDRESSES } from "@/lib/abiAndAddress"

export function useScalarTrade(marketId: string) {
  const { address } = useAccount()
  const { getMarketAddress } = useFactory()
  const { addToast } = useToast()

  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const parsed = useMemo(() => {
    const [type, idStr] = (marketId || "").split(":")
    return { type, id: Number(idStr) }
  }, [marketId])

  const resolveMarketAddress = useCallback(async (): Promise<`0x${string}`> => {
    const marketAddress = await getMarketAddress("scalar", parsed.id)
    if (!marketAddress) throw new Error("Market address not found")
    return marketAddress as `0x${string}`
  }, [getMarketAddress, parsed.id])

  const checkAllowance = useCallback(
    async (amount: string): Promise<boolean> => {
      if (!address) return false
      if (!amount || Number(amount) <= 0) return false
      const shares = parseUnits(amount, 18)
      const feeRouterAddress = CONTRACT_ADDRESSES.feeRouter as `0x${string}`
      const currentAllowance = (await readContract(config, {
        address: CONTRACT_ADDRESSES.wDAG as `0x${string}`,
        abi: ABI.wDAG,
        functionName: "allowance",
        args: [address as `0x${string}`, feeRouterAddress],
      })) as bigint
      return currentAllowance >= shares
    },
    [address]
  )

  const approve = useCallback(
    async (amount: string) => {
      if (!address) throw new Error("Connect wallet to approve");
      if (!amount || Number(amount) <= 0) throw new Error("Enter a valid amount to approve");
      
      // Use fee router as the spender instead of market address
      const feeRouterAddress = CONTRACT_ADDRESSES.feeRouter as `0x${string}`;
      const shares = parseUnits(amount, 18);

      // First, check current allowance
      const currentAllowance = await readContract(config, {
        address: CONTRACT_ADDRESSES.wDAG as `0x${string}`,
        abi: ABI.wDAG,
        functionName: "allowance",
        args: [address as `0x${string}`, feeRouterAddress],
      }) as bigint;

      // If current allowance is already sufficient, return early
      if (currentAllowance >= shares) {
        return;
      }

      // If not sufficient, approve the maximum possible amount to the fee router
      await writeContract({
        address: CONTRACT_ADDRESSES.wDAG as `0x${string}`,
        abi: ABI.wDAG,
        functionName: "approve",
        args: [feeRouterAddress, shares],
      });

      // Poll until allowance is updated
      const deadline = Date.now() + 60_000;
      while (true) {
        const newAllowance = await readContract(config, {
          address: CONTRACT_ADDRESSES.wDAG as `0x${string}`,
          abi: ABI.wDAG,
          functionName: "allowance",
          args: [address as `0x${string}`, feeRouterAddress],
        }) as bigint;
        
        if (newAllowance >= shares) break;
        if (Date.now() > deadline) throw new Error("Approval not confirmed in time");
        await new Promise((r) => setTimeout(r, 800));
      }
    },
    [address, writeContract]
  )

  const buy = useCallback(
    async ({ isLong, amount }: { isLong: boolean; amount: string }) => {
      if (!address) throw new Error("Connect wallet to trade");
      if (!amount || Number(amount) <= 0) throw new Error("Enter a valid amount");

      // Resolve market address
      const marketAddress = await resolveMarketAddress();
      const feeRouterAddress = CONTRACT_ADDRESSES.feeRouter as `0x${string}`;

      // Convert human amount to token units (assume 18 decimals shares)
      const shares = parseUnits(amount, 18);

      // First, check if the fee router has enough allowance
      const allowance = await readContract(config, {
        address: CONTRACT_ADDRESSES.wDAG as `0x${string}`,
        abi: ABI.wDAG,
        functionName: "allowance",
        args: [address as `0x${string}`, feeRouterAddress],
      }) as bigint;

      if (allowance < shares) {
        throw new Error("Insufficient allowance. Please approve the fee router first.");
      }

      // Execute buy on scalar market through the fee router
      await writeContract({
        address: marketAddress,
        abi: MARKET_ABIS.scalarMarket,
        functionName: "buy",
        args: [isLong, shares],
      });
    },
    [address, resolveMarketAddress, writeContract]
  )

  const sell = useCallback(async () => {
    // Not supported by contract prior to resolution; users redeem after resolve
    addToast({
      title: "Sell not available",
      description: "Scalar markets don't support selling before resolution. You can redeem after resolution.",
      type: "error",
      duration: 5000,
    })
    throw new Error("Sell not supported for scalar market before resolution")
  }, [addToast])

  return {
    checkAllowance,
    approve,
    buy,
    sell,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
