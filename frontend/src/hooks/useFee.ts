// import { useReadContract } from "wagmi";
// import { CONTRACT_ADDRESSES, ABI } from "@/lib/abiAndAddress";

/**
 * Hook to get the trading fee from the smart contracts
 * The fee is set to 1% (100 basis points) in all markets
 */
export function useTradingFee() {
  // Since all markets use the same fee structure, we can use any factory
  // The fee is hardcoded to 100 basis points (1%) in the contracts
  const feeBps = 100; // 1% fee
  
  return {
    feeBps,
    feePercentage: feeBps / 100, // Convert to percentage (1.0%)
    feeDisplay: "1.0%", // Display format
    isReadOnly: true, // Fee cannot be changed
  };
}
