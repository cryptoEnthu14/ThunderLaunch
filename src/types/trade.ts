/**
 * Trade Type Definitions
 *
 * Type definitions for trading activities in the ThunderLaunch platform.
 */

import { Chain } from './token';

// =============================================================================
// ENUMS & LITERAL TYPES
// =============================================================================

/**
 * Type of trade operation
 */
export type TradeType = 'buy' | 'sell';

/**
 * Status of a trade
 */
export type TradeStatus =
  | 'pending'
  | 'submitted'
  | 'processing'
  | 'confirmed'
  | 'failed'
  | 'cancelled'
  | 'expired';

/**
 * Order type
 */
export type OrderType = 'market' | 'limit' | 'stop_loss' | 'take_profit';

/**
 * Time in force for orders
 */
export type TimeInForce = 'good_till_cancelled' | 'immediate_or_cancel' | 'fill_or_kill';

/**
 * Transaction priority/speed
 */
export type TransactionPriority = 'slow' | 'medium' | 'fast' | 'ultra';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Main Trade interface
 */
export interface Trade {
  /** Unique identifier */
  id: string;

  /** Token being traded */
  token_id: string;

  /** Token address */
  token_address: string;

  /** User wallet address */
  wallet_address: string;

  /** User ID (if registered) */
  user_id?: string;

  /** Trade type (buy/sell) */
  trade_type: TradeType;

  /** Order type */
  order_type: OrderType;

  /** Trade status */
  status: TradeStatus;

  /** Amount of tokens */
  token_amount: string; // Use string for precision

  /** Amount in native currency (SOL, ETH, BNB) */
  native_amount: number;

  /** Amount in USD */
  usd_amount: number;

  /** Price per token in native currency */
  price_native: number;

  /** Price per token in USD */
  price_usd: number;

  /** Slippage tolerance percentage */
  slippage_tolerance: number;

  /** Actual slippage percentage */
  actual_slippage?: number;

  /** Transaction fee in native currency */
  transaction_fee: number;

  /** Platform fee in native currency */
  platform_fee: number;

  /** Total fee (transaction + platform) */
  total_fee: number;

  /** Transaction signature/hash */
  transaction_signature?: string;

  /** Block number */
  block_number?: number;

  /** Blockchain network */
  chain: Chain;

  /** DEX/Exchange used */
  dex?: string;

  /** Liquidity pool address */
  pool_address?: string;

  /** Transaction priority */
  priority: TransactionPriority;

  /** Estimated completion time */
  estimated_completion?: string;

  /** Error message (if failed) */
  error_message?: string;

  /** Number of retry attempts */
  retry_count: number;

  /** Additional metadata */
  metadata?: Record<string, unknown>;

  /** Timestamp when trade was created */
  created_at: string;

  /** Timestamp when trade was submitted */
  submitted_at?: string;

  /** Timestamp when trade was confirmed */
  confirmed_at?: string;

  /** Timestamp of last update */
  updated_at: string;
}

/**
 * Trade creation input
 */
export interface TradeInput {
  /** Token address to trade */
  token_address: string;

  /** Trade type */
  trade_type: TradeType;

  /** Order type */
  order_type: OrderType;

  /** Amount of tokens (for sell) or native currency (for buy) */
  amount: string;

  /** Is amount in tokens or native currency */
  amount_type: 'tokens' | 'native';

  /** Slippage tolerance (0-100) */
  slippage_tolerance: number;

  /** Transaction priority */
  priority?: TransactionPriority;

  /** Limit price (for limit orders) */
  limit_price?: number;

  /** Stop loss price (for stop loss orders) */
  stop_loss_price?: number;

  /** Take profit price (for take profit orders) */
  take_profit_price?: number;

  /** Time in force */
  time_in_force?: TimeInForce;

  /** Expiration time for the order */
  expires_at?: string;
}

/**
 * Trade quote/estimation
 */
export interface TradeQuote {
  /** Token address */
  token_address: string;

  /** Trade type */
  trade_type: TradeType;

  /** Input amount */
  input_amount: string;

  /** Output amount */
  output_amount: string;

  /** Price per token */
  price: number;

  /** Price impact percentage */
  price_impact: number;

  /** Minimum received (accounting for slippage) */
  minimum_received: string;

  /** Estimated transaction fee */
  estimated_fee: number;

  /** Platform fee */
  platform_fee: number;

  /** Total fee */
  total_fee: number;

  /** Route information */
  route?: Array<{
    dex: string;
    pair: string;
    percentage: number;
  }>;

  /** Quote expires at */
  expires_at: string;

  /** Quote generation timestamp */
  generated_at: string;
}

/**
 * Order book entry
 */
export interface OrderBookEntry {
  /** Price level */
  price: number;

  /** Total amount at this price level */
  amount: string;

  /** Number of orders at this price */
  count: number;

  /** Total value in USD */
  total_usd: number;
}

/**
 * Order book for a token
 */
export interface OrderBook {
  /** Token address */
  token_address: string;

  /** Buy orders (bids) */
  bids: OrderBookEntry[];

  /** Sell orders (asks) */
  asks: OrderBookEntry[];

  /** Spread percentage */
  spread: number;

  /** Best bid price */
  best_bid: number;

  /** Best ask price */
  best_ask: number;

  /** Mid price */
  mid_price: number;

  /** Last update timestamp */
  updated_at: string;
}

/**
 * Trading pair information
 */
export interface TradingPair {
  /** Pair address */
  address: string;

  /** Token A address */
  token_a_address: string;

  /** Token A symbol */
  token_a_symbol: string;

  /** Token B address */
  token_b_address: string;

  /** Token B symbol */
  token_b_symbol: string;

  /** DEX name */
  dex: string;

  /** Total liquidity in USD */
  liquidity_usd: number;

  /** 24h volume in USD */
  volume_24h_usd: number;

  /** Current price */
  price: number;

  /** 24h price change percentage */
  price_change_24h: number;

  /** Number of transactions */
  tx_count_24h: number;

  /** Is pair active */
  is_active: boolean;

  /** Last update timestamp */
  updated_at: string;
}

/**
 * Trading statistics for a user
 */
export interface TradingStats {
  /** User wallet address */
  wallet_address: string;

  /** Total trades */
  total_trades: number;

  /** Total buy trades */
  total_buys: number;

  /** Total sell trades */
  total_sells: number;

  /** Total volume in USD */
  total_volume_usd: number;

  /** Total profit/loss in USD */
  total_pnl_usd: number;

  /** Total profit/loss percentage */
  total_pnl_percentage: number;

  /** Win rate percentage */
  win_rate: number;

  /** Average trade size in USD */
  avg_trade_size_usd: number;

  /** Total fees paid */
  total_fees_paid: number;

  /** Largest win in USD */
  largest_win_usd: number;

  /** Largest loss in USD */
  largest_loss_usd: number;

  /** Most traded token */
  most_traded_token?: {
    token_address: string;
    token_symbol: string;
    trade_count: number;
  };

  /** First trade timestamp */
  first_trade_at?: string;

  /** Last trade timestamp */
  last_trade_at?: string;

  /** Last updated */
  updated_at: string;
}

/**
 * Price alert
 */
export interface PriceAlert {
  /** Unique identifier */
  id: string;

  /** User ID */
  user_id: string;

  /** Token address */
  token_address: string;

  /** Token symbol */
  token_symbol: string;

  /** Alert type */
  alert_type: 'price_above' | 'price_below' | 'price_change';

  /** Target price (for price_above/price_below) */
  target_price?: number;

  /** Change percentage (for price_change) */
  change_percentage?: number;

  /** Is alert active */
  is_active: boolean;

  /** Is alert triggered */
  is_triggered: boolean;

  /** When alert was triggered */
  triggered_at?: string;

  /** Alert expiration */
  expires_at?: string;

  /** Notification sent */
  notification_sent: boolean;

  /** Created timestamp */
  created_at: string;

  /** Updated timestamp */
  updated_at: string;
}

/**
 * Portfolio position
 */
export interface PortfolioPosition {
  /** User wallet address */
  wallet_address: string;

  /** Token address */
  token_address: string;

  /** Token symbol */
  token_symbol: string;

  /** Current balance */
  balance: string;

  /** Average buy price */
  avg_buy_price: number;

  /** Current price */
  current_price: number;

  /** Total invested in USD */
  total_invested_usd: number;

  /** Current value in USD */
  current_value_usd: number;

  /** Unrealized profit/loss in USD */
  unrealized_pnl_usd: number;

  /** Unrealized profit/loss percentage */
  unrealized_pnl_percentage: number;

  /** Realized profit/loss in USD */
  realized_pnl_usd: number;

  /** Total fees paid */
  fees_paid: number;

  /** First purchase timestamp */
  first_purchase_at: string;

  /** Last update timestamp */
  updated_at: string;
}

/**
 * Transaction history filters
 */
export interface TradeFilters {
  /** Filter by wallet address */
  wallet_address?: string;

  /** Filter by token address */
  token_address?: string;

  /** Filter by trade type */
  trade_type?: TradeType;

  /** Filter by status */
  status?: TradeStatus;

  /** Filter by chain */
  chain?: Chain;

  /** Start date */
  start_date?: string;

  /** End date */
  end_date?: string;

  /** Minimum USD amount */
  min_usd_amount?: number;

  /** Maximum USD amount */
  max_usd_amount?: number;

  /** Sort by field */
  sort_by?: 'created_at' | 'usd_amount' | 'token_amount';

  /** Sort order */
  sort_order?: 'asc' | 'desc';

  /** Page number */
  page?: number;

  /** Items per page */
  limit?: number;
}

/**
 * Trade list response
 */
export interface TradeListResponse {
  /** List of trades */
  trades: Trade[];

  /** Total count */
  total: number;

  /** Current page */
  page: number;

  /** Items per page */
  limit: number;

  /** Total pages */
  total_pages: number;

  /** Has next page */
  has_next: boolean;

  /** Has previous page */
  has_previous: boolean;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid TradeType
 */
export function isTradeType(value: unknown): value is TradeType {
  return typeof value === 'string' && ['buy', 'sell'].includes(value);
}

/**
 * Type guard to check if a value is a valid TradeStatus
 */
export function isTradeStatus(value: unknown): value is TradeStatus {
  return (
    typeof value === 'string' &&
    ['pending', 'submitted', 'processing', 'confirmed', 'failed', 'cancelled', 'expired'].includes(value)
  );
}

/**
 * Type guard to check if a value is a valid OrderType
 */
export function isOrderType(value: unknown): value is OrderType {
  return typeof value === 'string' && ['market', 'limit', 'stop_loss', 'take_profit'].includes(value);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get status color
 */
export function getTradeStatusColor(status: TradeStatus): string {
  const colors: Record<TradeStatus, string> = {
    pending: '#F59E0B', // orange
    submitted: '#3B82F6', // blue
    processing: '#3B82F6', // blue
    confirmed: '#10B981', // green
    failed: '#EF4444', // red
    cancelled: '#6B7280', // gray
    expired: '#6B7280', // gray
  };
  return colors[status];
}

/**
 * Format trade type for display
 */
export function formatTradeType(type: TradeType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Calculate profit/loss
 */
export function calculatePnL(
  tradeType: TradeType,
  buyPrice: number,
  sellPrice: number,
  amount: number
): { pnl: number; pnlPercentage: number } {
  if (tradeType === 'buy') {
    const pnl = (sellPrice - buyPrice) * amount;
    const pnlPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;
    return { pnl, pnlPercentage };
  } else {
    const pnl = (buyPrice - sellPrice) * amount;
    const pnlPercentage = ((buyPrice - sellPrice) / sellPrice) * 100;
    return { pnl, pnlPercentage };
  }
}
