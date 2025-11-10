/**
 * Mock Data for Trading Components
 *
 * Sample data for testing and development
 */

import type { Trade } from '@/types/trade';
import type { TokenPriceHistory } from '@/types/token';

/**
 * Generate mock price history data
 */
export function generateMockPriceHistory(
  points: number = 100,
  basePrice: number = 0.05,
  volatility: number = 0.1
): TokenPriceHistory[] {
  const now = Date.now();
  const interval = 3600000; // 1 hour in ms
  const history: TokenPriceHistory[] = [];

  let price = basePrice;

  for (let i = 0; i < points; i++) {
    // Random walk with trend
    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(0.0001, price + change);

    const volume = Math.random() * 100000 + 50000;
    const marketCap = price * 1_000_000;
    const liquidity = marketCap * 0.1;

    history.push({
      token_id: 'mock-token-id',
      timestamp: new Date(now - (points - i) * interval).toISOString(),
      price_usd: price,
      price_native: price / 100, // Assuming 1 SOL = $100
      volume,
      market_cap: marketCap,
      liquidity,
    });
  }

  return history;
}

/**
 * Generate mock trade data
 */
export function generateMockTrades(count: number = 20): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const isBuy = Math.random() > 0.5;
    const tokenAmount = Math.random() * 10000 + 100;
    const priceUsd = Math.random() * 0.1 + 0.01;
    const nativeAmount = (tokenAmount * priceUsd) / 100; // Assuming 1 SOL = $100
    const usdAmount = tokenAmount * priceUsd;

    trades.push({
      id: `trade-${i}`,
      token_id: 'mock-token-id',
      token_address: 'So11111111111111111111111111111111111111112',
      wallet_address: `${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 6)}`,
      trade_type: isBuy ? 'buy' : 'sell',
      order_type: 'market',
      status: 'confirmed',
      token_amount: tokenAmount.toString(),
      native_amount: nativeAmount,
      usd_amount: usdAmount,
      price_native: priceUsd / 100,
      price_usd: priceUsd,
      slippage_tolerance: 1,
      actual_slippage: Math.random() * 0.5,
      transaction_fee: 0.000005,
      platform_fee: nativeAmount * 0.01,
      total_fee: nativeAmount * 0.02,
      transaction_signature: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      chain: 'solana',
      priority: 'medium',
      retry_count: 0,
      created_at: new Date(now - i * 60000).toISOString(), // 1 minute intervals
      updated_at: new Date(now - i * 60000).toISOString(),
    });
  }

  return trades;
}

/**
 * Sample token data
 */
export const sampleTokenData = {
  address: 'So11111111111111111111111111111111111111112',
  symbol: 'THDR',
  name: 'Thunder Token',
  currentPrice: 0.05,
  currentSupply: 1_000_000,
  solBalance: 10.5,
  tokenBalance: 5000,
};

/**
 * Sample slippage presets
 */
export const slippagePresets = [0.5, 1, 2, 5];

/**
 * Default trading settings
 */
export const defaultTradingSettings = {
  slippage: 1,
  priorityFee: 'medium' as const,
  autoApprove: false,
};
