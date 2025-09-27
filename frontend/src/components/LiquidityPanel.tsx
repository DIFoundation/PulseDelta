import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useLiquidity } from '@/hooks/use-liquidity';
import type { Market } from '@/types/market';
// import { formatUnits } from 'viem';

interface LiquidityPanelProps {
  market: Market;
}

export function LiquidityPanel({ market }: LiquidityPanelProps) {
  const [addAmount, setAddAmount] = useState('');
  const [removeAmount, setRemoveAmount] = useState('');
  
  const {
    addLiquidity,
    removeLiquidity,
    position,
    isLoading,
    txState,
    // resetTransaction,
  } = useLiquidity(market.id);

  const handleAddLiquidity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) return;
    
    try {
      await addLiquidity(Number(addAmount));
      setAddAmount('');
    } catch (error) {
      console.error('Failed to add liquidity:', error);
    }
  };

  const handleRemoveLiquidity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeAmount || isNaN(Number(removeAmount)) || Number(removeAmount) <= 0) return;
    
    try {
      await removeLiquidity(Number(removeAmount));
      setRemoveAmount('');
    } catch (error) {
      console.error('Failed to remove liquidity:', error);
    }
  };

  // Format liquidity values for display
  const formatValue = (value: string | number) => {
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddLiquidity} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-amount">Amount (BDAG)</Label>
              <Input
                id="add-amount"
                type="number"
                min="0"
                step="any"
                placeholder="0.0"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit"
              className="w-full primary-gradient"
              disabled={isLoading || !addAmount || Number(addAmount) <= 0}
            >
              {isLoading && txState.status === 'pending' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Liquidity'
              )}
            </Button>
          </form>
          {position && position.shares > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <span>Your LP Tokens:</span>
                <span className="font-medium">{formatValue(position.shares)} LP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Your Share:</span>
                <span className="font-medium">
                  {market.totalLiquidity 
                    ? ((position.value / Number(market.totalLiquidity)) * 100).toFixed(2) 
                    : '0.00'}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Remove Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRemoveLiquidity} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remove-amount">LP Tokens to Remove</Label>
              <Input
                id="remove-amount"
                type="number"
                min="0"
                step="any"
                placeholder="0.0"
                value={removeAmount}
                onChange={(e) => setRemoveAmount(e.target.value)}
                disabled={isLoading || !position || position.shares <= 0}
              />
              {position && position.shares > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Max: {formatValue(position.shares)} LP</span>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setRemoveAmount(position.shares.toString())}
                  >
                    Use Max
                  </button>
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              variant="outline"
              disabled={
                isLoading || 
                !removeAmount || 
                Number(removeAmount) <= 0 || 
                !position || 
                position.shares <= 0 ||
                Number(removeAmount) > position.shares
              }
            >
              {isLoading && txState.status === 'pending' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Liquidity'
              )}
            </Button>
          </form>
          
          {position && position.shares > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your Position Value:</span>
                <span className="font-medium">${formatValue(position.value)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>24h Fees Earned:</span>
                <span className="text-green-500">+${formatValue(position.fees24h)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated APY:</span>
                <span className="text-green-500">{position.apy.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}