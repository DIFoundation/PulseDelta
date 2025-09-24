import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Market, CreateMarketParams, TradeOrder } from '@/types/market';

/**
 * Hook for fetching market list with pagination and filtering
 */
export function useMarketList(
  offset: number = 0,
  limit: number = 20,
  filters?: {
    category?: string;
    status?: string;
    search?: string;
  }
) {
  return useQuery({
    queryKey: ['markets', offset, limit, filters],
    queryFn: async () => {
      // Mock data for development - replace with actual contract calls
      return generateMockMarkets(limit);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for fetching individual market details
 */
export function useMarket(marketId: string) {
  return useQuery({
    queryKey: ['market', marketId],
    queryFn: async () => {
      // Mock data for development - replace with actual contract calls
      return generateMockMarket(marketId);
    },
    enabled: !!marketId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook for trading (buy/sell outcomes)
 */
export function useTrade(marketId: string) {
  const queryClient = useQueryClient();

  const buyMutation = useMutation({
    mutationFn: async ({ outcomeIndex, amount }: { outcomeIndex: number; amount: string }) => {
      // Mock transaction - replace with actual contract call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { hash: `0x${'0'.repeat(64)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', marketId] });
      queryClient.invalidateQueries({ queryKey: ['markets'] });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async ({ outcomeIndex, amount }: { outcomeIndex: number; amount: string }) => {
      // Mock transaction - replace with actual contract call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { hash: `0x${'0'.repeat(64)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', marketId] });
      queryClient.invalidateQueries({ queryKey: ['markets'] });
    },
  });

  return {
    buy: buyMutation.mutateAsync,
    sell: sellMutation.mutateAsync,
    isBuying: buyMutation.isPending,
    isSelling: sellMutation.isPending,
    buyError: buyMutation.error,
    sellError: sellMutation.error,
  };
}

/**
 * Hook for liquidity provision
 */
export function useLiquidity(marketId: string) {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      // Mock transaction - replace with actual contract call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { hash: `0x${'0'.repeat(64)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', marketId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({ lpTokens }: { lpTokens: string }) => {
      // Mock transaction - replace with actual contract call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { hash: `0x${'0'.repeat(64)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', marketId] });
    },
  });

  return {
    addLiquidity: addMutation.mutateAsync,
    removeLiquidity: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    addError: addMutation.error,
    removeError: removeMutation.error,
  };
}

/**
 * Hook for creating new markets
 */
export function useCreateMarket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateMarketParams) => {
      // Mock transaction - replace with actual contract call
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { hash: `0x${'0'.repeat(64)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
    },
  });
}

// Mock data generators for development
function generateMockMarkets(count: number): Market[] {
  const categories = ['sports', 'crypto', 'politics', 'entertainment', 'technology'];
  const markets: Market[] = [];
  
  const titles = [
    'Will Bitcoin reach $100k by end of 2024?',
    'Will the Lakers make the playoffs this season?',
    'Will OpenAI release GPT-5 before June 2024?',
    'Will Netflix gain more than 10M subscribers this quarter?',
    'Will Tesla stock hit $300 before year end?',
    'Will the Fed cut interest rates in Q1 2024?',
    'Will Ethereum upgrade successfully complete?',
    'Will unemployment rate drop below 3.5%?',
    'Will Apple announce VR headset this year?',
    'Will Twitter rebrand be successful?',
  ];
  
  for (let i = 0; i < count; i++) {
    const resolved = i > 10 ? Math.random() > 0.7 : false;
    const price1 = 0.3 + Math.random() * 0.4;
    const price2 = Math.max(0.1, 1 - price1 - (Math.random() * 0.2 - 0.1));
    
    markets.push({
      id: String(i + 1),
      title: titles[i % titles.length] || `Market ${i + 1}: Will this event happen?`,
      description: `This is a prediction market for event ${i + 1}. Participants can trade shares representing different outcomes.`,
      outcomes: ['Yes', 'No'],
      endTime: Date.now() / 1000 + 86400 * (Math.random() * 30 + 1), // 1-30 days from now
      resolved,
      winningOutcome: resolved ? Math.floor(Math.random() * 2) : undefined,
      totalLiquidity: String(Math.floor(Math.random() * 500000) + 50000),
      creator: `0x${Math.random().toString(16).substr(2, 40)}`,
      category: categories[i % categories.length] as any,
      volume24h: String(Math.floor(Math.random() * 100000) + 5000),
      volume7d: String(Math.floor(Math.random() * 400000) + 20000),
      volumeTotal: String(Math.floor(Math.random() * 1000000) + 100000),
      createdAt: Date.now() / 1000 - 86400 * Math.random() * 30,
      updatedAt: Date.now() / 1000,
      outcomeShares: [
        {
          outcomeIndex: 0,
          totalShares: String(Math.floor(Math.random() * 50000) + 10000),
          price: String(price1.toFixed(3)),
          priceChange24h: (Math.random() - 0.5) * 10,
          holders: Math.floor(Math.random() * 1000) + 50,
        },
        {
          outcomeIndex: 1,
          totalShares: String(Math.floor(Math.random() * 50000) + 10000),
          price: String(price2.toFixed(3)),
          priceChange24h: (Math.random() - 0.5) * 10,
          holders: Math.floor(Math.random() * 1000) + 50,
        },
      ],
      priceHistory: [],
    });
  }
  
  return markets;
}

function generateMockMarket(marketId: string): Market {
  const markets = generateMockMarkets(1);
  return { ...markets[0], id: marketId };
}