import { useBalance, useAccount } from "wagmi";
import { formatPrice } from "@/lib/utils";
import { Wallet } from "lucide-react";

export function WDAGBalance() {
  const { address } = useAccount();

  const { data: balance, isLoading } = useBalance({
    address: address,
  });

  if (!address) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wallet className="h-4 w-4" />
        <span>Connect wallet to view balance</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wallet className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  const balanceInBdag = balance ? Number(balance.value) / 1e18 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Wallet className="h-4 w-4" />
      <span className="font-medium">
        {formatPrice(balanceInBdag.toString())} BDAG
      </span>
    </div>
  );
}
