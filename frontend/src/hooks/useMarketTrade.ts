// hooks/useMarketTrade.ts
import { useBinaryTrade } from './useBinaryTrade';
import { useScalarTrade } from './useScalarTrade';
import { useMultiOutcomeTrade } from './useMultiOutcomeTrade';

export function useMarketTrade(marketId: string, outcomeIndex?: number) {
  const [marketType] = marketId.split(':');

  // Call all hooks unconditionally
  const binaryTrade = useBinaryTrade(marketId);
  const scalarTrade = useScalarTrade(marketId);
  const multiOutcomeTrade = useMultiOutcomeTrade(marketId, outcomeIndex || 0);

  let tradeHook;
  switch (marketType) {
    case 'binary':
      tradeHook = binaryTrade;
      break;
    case 'scalar':
      tradeHook = scalarTrade;
      break;
    case 'multi':
      tradeHook = multiOutcomeTrade;
      break;
    default:
      throw new Error(`Unsupported market type: ${marketType}`);
  }

  return {
    ...tradeHook,
    marketType
  };
}