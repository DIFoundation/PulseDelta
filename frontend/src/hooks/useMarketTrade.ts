// hooks/useMarketTrade.ts
import { useBinaryTrade } from './useBinaryTrade';
import { useScalarTrade } from './useScalarTrade';
import { useMultiOutcomeTrade } from './useMultiOutcomeTrade';

export function useMarketTrade(marketId: string, outcomeIndex?: number) {
  const [marketType] = marketId.split(':');
  
  // Initialize the appropriate trade hook based on market type
  const tradeHook = (() => {
    switch(marketType) {
      case 'binary':
        return useBinaryTrade(marketId);
      case 'scalar':
        return useScalarTrade(marketId);
      case 'multi':
        return useMultiOutcomeTrade(marketId, outcomeIndex || 0);
      default:
        throw new Error(`Unsupported market type: ${marketType}`);
    }
  })();

  return {
    ...tradeHook,
    marketType
  };
}