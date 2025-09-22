import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Market } from '@/types/market';

interface LiquidityPanelProps {
  market: Market;
}

export function LiquidityPanel({ market }: LiquidityPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add Liquidity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Amount to add" />
          <Button className="w-full primary-gradient">Add Liquidity</Button>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Remove Liquidity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="LP tokens to remove" />
          <Button className="w-full" variant="outline">Remove Liquidity</Button>
        </CardContent>
      </Card>
    </div>
  );
}