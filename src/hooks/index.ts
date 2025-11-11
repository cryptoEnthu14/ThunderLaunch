/**
 * Hooks Index
 *
 * Centralized exports for all custom hooks
 */

export { useWalletBalance } from './useWalletBalance';
export type { WalletBalanceState } from './useWalletBalance';

export { useRealtimeTokens } from './useRealtimeTokens';
export type {
  TokenUpdate,
  RealtimeTokensState,
  UseRealtimeTokensOptions,
} from './useRealtimeTokens';

export { useRealtimeTrades } from './useRealtimeTrades';
export type {
  TradeUpdate,
  TradeMetrics,
  RealtimeTradesState,
  UseRealtimeTradesOptions,
} from './useRealtimeTrades';

export { useNotifications } from './useNotifications';
export type {
  NotificationPreferences,
  NotificationType,
} from './useNotifications';

export { useWatchlist } from './useWatchlist';
export type {
  UseWatchlistOptions,
  UseWatchlistReturn,
} from './useWatchlist';
