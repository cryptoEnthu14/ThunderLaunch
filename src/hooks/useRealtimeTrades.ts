/**
 * useRealtimeTrades Hook
 *
 * Custom hook to subscribe to real-time trade events from Supabase.
 * Features:
 * - Subscribe to trade events
 * - Update trade history in real-time
 * - Update token metrics based on trades
 * - Show notifications for trades
 * - Handle reconnection gracefully
 * - Automatic cleanup on unmount
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { subscribeToTable, type TableSubscription } from '@/lib/supabase/client';
import type { Trade, TradeType, TransactionPriority } from '@/types/trade';
import type { Tables } from '@/lib/supabase/database.types';

// =============================================================================
// TYPES
// =============================================================================

export interface TradeUpdate {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  trade: Trade;
  timestamp: string;
}

export interface TradeMetrics {
  totalTrades: number;
  totalBuys: number;
  totalSells: number;
  totalVolume: number;
  last24hVolume: number;
  last24hTrades: number;
}

export interface RealtimeTradesState {
  /** List of real-time trade updates */
  updates: TradeUpdate[];
  /** Recent confirmed trades */
  recentTrades: Trade[];
  /** Pending trades */
  pendingTrades: Trade[];
  /** Trade metrics */
  metrics: TradeMetrics;
  /** Connection status */
  isConnected: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Clear all updates */
  clearUpdates: () => void;
  /** Manually reconnect */
  reconnect: () => void;
}

// =============================================================================
// HOOK OPTIONS
// =============================================================================

export interface UseRealtimeTradesOptions {
  /** Filter by token ID */
  tokenId?: string;
  /** Filter by wallet address */
  walletAddress?: string;
  /** Filter by trade type */
  tradeType?: TradeType;
  /** Maximum number of updates to keep */
  maxUpdates?: number;
  /** Maximum number of recent trades */
  maxRecentTrades?: number;
  /** Enable notifications */
  enableNotifications?: boolean;
  /** Enable auto-reconnection */
  autoReconnect?: boolean;
  /** Reconnection interval in ms */
  reconnectInterval?: number;
  /** Callback when new trade is created */
  onNewTrade?: (trade: Trade) => void;
  /** Callback when trade status changes */
  onTradeUpdate?: (trade: Trade, oldTrade: Trade | null) => void;
  /** Callback when trade is confirmed */
  onTradeConfirmed?: (trade: Trade) => void;
  /** Callback when trade fails */
  onTradeFailed?: (trade: Trade) => void;
  /** Callback when connection status changes */
  onConnectionChange?: (isConnected: boolean) => void;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate trade metrics from trade list
 */
function calculateMetrics(trades: Trade[]): TradeMetrics {
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;

  const metrics: TradeMetrics = {
    totalTrades: trades.length,
    totalBuys: 0,
    totalSells: 0,
    totalVolume: 0,
    last24hVolume: 0,
    last24hTrades: 0,
  };

  trades.forEach((trade) => {
    // Count trade types
    if (trade.trade_type === 'buy') {
      metrics.totalBuys++;
    } else {
      metrics.totalSells++;
    }

    // Total volume
    metrics.totalVolume += trade.usd_amount;

    // Last 24h metrics
    const tradeTime = new Date(trade.created_at).getTime();
    if (tradeTime >= last24h) {
      metrics.last24hVolume += trade.usd_amount;
      metrics.last24hTrades++;
    }
  });

  return metrics;
}

/**
 * Show browser notification for trade
 */
function showTradeNotification(trade: Trade, type: 'new' | 'confirmed' | 'failed') {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const titles = {
    new: '🔔 New Trade',
    confirmed: '✅ Trade Confirmed',
    failed: '❌ Trade Failed',
  };

  const messages = {
    new: `${trade.trade_type.toUpperCase()}: ${trade.token_amount} tokens`,
    confirmed: `${trade.trade_type.toUpperCase()}: $${trade.usd_amount.toFixed(2)}`,
    failed: `${trade.trade_type.toUpperCase()} failed: ${trade.error_message || 'Unknown error'}`,
  };

  new Notification(titles[type], {
    body: messages[type],
    icon: '/favicon.ico',
    tag: `trade-${trade.id}`,
  });
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Subscribe to real-time trade events
 *
 * @param options - Configuration options
 * @returns Real-time trades state and controls
 *
 * @example
 * ```tsx
 * const { recentTrades, metrics, isConnected } = useRealtimeTrades({
 *   tokenId: 'abc-123',
 *   enableNotifications: true,
 *   onTradeConfirmed: (trade) => {
 *     toast.success(`Trade confirmed: $${trade.usd_amount}`);
 *   },
 * });
 * ```
 */
export function useRealtimeTrades(
  options: UseRealtimeTradesOptions = {}
): RealtimeTradesState {
  const {
    tokenId,
    walletAddress,
    tradeType,
    maxUpdates = 100,
    maxRecentTrades = 50,
    enableNotifications = false,
    autoReconnect = true,
    reconnectInterval = 5000,
    onNewTrade,
    onTradeUpdate,
    onTradeConfirmed,
    onTradeFailed,
    onConnectionChange,
  } = options;

  // State
  const [updates, setUpdates] = useState<TradeUpdate[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [pendingTrades, setPendingTrades] = useState<Trade[]>([]);
  const [metrics, setMetrics] = useState<TradeMetrics>({
    totalTrades: 0,
    totalBuys: 0,
    totalSells: 0,
    totalVolume: 0,
    last24hVolume: 0,
    last24hTrades: 0,
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Refs
  const subscriptionRef = useRef<TableSubscription | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef<boolean>(false);
  const callbacksRef = useRef<{
    onNewTrade?: UseRealtimeTradesOptions['onNewTrade'];
    onTradeUpdate?: UseRealtimeTradesOptions['onTradeUpdate'];
    onTradeConfirmed?: UseRealtimeTradesOptions['onTradeConfirmed'];
    onTradeFailed?: UseRealtimeTradesOptions['onTradeFailed'];
    onConnectionChange?: UseRealtimeTradesOptions['onConnectionChange'];
  }>({
    onNewTrade,
    onTradeUpdate,
    onTradeConfirmed,
    onTradeFailed,
    onConnectionChange,
  });

  useEffect(() => {
    callbacksRef.current = {
      onNewTrade,
      onTradeUpdate,
      onTradeConfirmed,
      onTradeFailed,
      onConnectionChange,
    };
  }, [onNewTrade, onTradeUpdate, onTradeConfirmed, onTradeFailed, onConnectionChange]);

  /**
   * Request notification permission
   */
  useEffect(() => {
    if (enableNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [enableNotifications]);

  /**
   * Handle trade updates from Supabase
   */
  const handleTradeChange = useCallback(
    (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: Tables<'trades'>['Row'] | null;
      old: Tables<'trades'>['Row'] | null;
    }) => {
      if (isUnmountedRef.current) return;

      const { eventType, new: newData, old: oldData } = payload;
      const normalizedNew = newData ? normalizeTradeRow(newData) : null;
      const normalizedOld = oldData ? normalizeTradeRow(oldData) : null;
      const tradeData = normalizedNew || normalizedOld;

      if (!tradeData) {
        return;
      }

      // Create update object
      const update: TradeUpdate = {
        eventType,
        trade: tradeData,
        timestamp: new Date().toISOString(),
      };

      // Add to updates list
      setUpdates((prev) => {
        const newUpdates = [update, ...prev];
        return newUpdates.slice(0, maxUpdates);
      });

      const {
        onNewTrade: onNewTradeCallback,
        onTradeUpdate: onTradeUpdateCallback,
        onTradeConfirmed: onTradeConfirmedCallback,
        onTradeFailed: onTradeFailedCallback,
      } = callbacksRef.current;

      // Handle different event types
      switch (eventType) {
        case 'INSERT':
          if (normalizedNew) {
            // Add to recent trades if confirmed
            if (normalizedNew.status === 'confirmed') {
              setRecentTrades((prev) => {
                const filtered = [normalizedNew, ...prev].slice(0, maxRecentTrades);
                return filtered;
              });
            }

            // Add to pending trades if pending
            if (
              normalizedNew.status === 'pending' ||
              normalizedNew.status === 'submitted' ||
              normalizedNew.status === 'processing'
            ) {
              setPendingTrades((prev) => [normalizedNew, ...prev]);
            }

            // Call callback
            onNewTradeCallback?.(normalizedNew);

            // Show notification
            if (enableNotifications) {
              showTradeNotification(normalizedNew, 'new');
            }
          }
          break;

        case 'UPDATE':
          if (normalizedNew) {
            const oldStatus = normalizedOld?.status;
            const newStatus = normalizedNew.status;

            // Update recent trades
            if (newStatus === 'confirmed') {
              setRecentTrades((prev) => {
                const filtered = prev.filter((t) => t.id !== normalizedNew.id);
                return [normalizedNew, ...filtered].slice(0, maxRecentTrades);
              });

              // Remove from pending
              setPendingTrades((prev) => prev.filter((t) => t.id !== normalizedNew.id));

              // Call callback
              if (oldStatus !== 'confirmed') {
                onTradeConfirmedCallback?.(normalizedNew);

                // Show notification
                if (enableNotifications) {
                  showTradeNotification(normalizedNew, 'confirmed');
                }
              }
            } else if (newStatus === 'failed') {
              // Remove from pending
              setPendingTrades((prev) => prev.filter((t) => t.id !== normalizedNew.id));

              // Call callback
              onTradeFailedCallback?.(normalizedNew);

              // Show notification
              if (enableNotifications) {
                showTradeNotification(normalizedNew, 'failed');
              }
            } else if (
              newStatus === 'pending' ||
              newStatus === 'submitted' ||
              newStatus === 'processing'
            ) {
              // Update pending trades
              setPendingTrades((prev) => {
                const filtered = prev.filter((t) => t.id !== normalizedNew.id);
                return [normalizedNew, ...filtered];
              });
            }

            // Call update callback
            onTradeUpdateCallback?.(normalizedNew, normalizedOld);
          }
          break;

        case 'DELETE':
          // Remove from all lists
          setRecentTrades((prev) => prev.filter((t) => t.id !== tradeData.id));
          setPendingTrades((prev) => prev.filter((t) => t.id !== tradeData.id));
          break;
      }
    },
    [maxUpdates, maxRecentTrades, enableNotifications]
  );

  /**
   * Update metrics whenever recent trades change
   */
  useEffect(() => {
    const newMetrics = calculateMetrics(recentTrades);
    setMetrics(newMetrics);
  }, [recentTrades]);

  /**
   * Update connection status
   */
  const updateConnectionStatus = useCallback((connected: boolean) => {
    if (isUnmountedRef.current) return;
    setIsConnected(connected);
    callbacksRef.current.onConnectionChange?.(connected);
  }, []);

  /**
   * Unsubscribe from trade changes
   */
  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    updateConnectionStatus(false);
  }, [updateConnectionStatus]);

  /**
   * Subscribe to trade changes
   */
  const subscribe = useCallback(function subscribeCallback() {
    if (isUnmountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Build filter string
      const filters: string[] = [];
      if (tokenId) filters.push(`token_id=eq.${tokenId}`);
      if (walletAddress) filters.push(`wallet_address=eq.${walletAddress}`);
      if (tradeType) filters.push(`trade_type=eq.${tradeType}`);

      const filter = filters.length > 0 ? filters.join(',') : undefined;

      // Subscribe to trades table
      const subscription = subscribeToTable('trades', handleTradeChange, filter);
      subscriptionRef.current = subscription;

      // Check connection status
      subscription.channel.on('system', { event: 'connected' }, () => {
        updateConnectionStatus(true);
        setIsLoading(false);
      });

      subscription.channel.on('system', { event: 'disconnected' }, () => {
        updateConnectionStatus(false);

        // Auto-reconnect if enabled
        if (autoReconnect && !isUnmountedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[useRealtimeTrades] Attempting to reconnect...');
            unsubscribe();
            subscribeCallback();
          }, reconnectInterval);
        }
      });

      subscription.channel.on('system', { event: 'error' }, (error) => {
        console.error('[useRealtimeTrades] Connection error:', error);
        setError(new Error('Real-time connection error'));
        updateConnectionStatus(false);
      });

      subscription.subscribe();

      // Assume connected after subscription
      setTimeout(() => {
        if (!isUnmountedRef.current) {
          updateConnectionStatus(true);
          setIsLoading(false);
        }
      }, 1000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to subscribe to trades');
      console.error('[useRealtimeTrades] Subscription error:', error);
      setError(error);
      setIsLoading(false);
      updateConnectionStatus(false);
    }
  }, [
    tokenId,
    walletAddress,
    tradeType,
    handleTradeChange,
    updateConnectionStatus,
    autoReconnect,
    reconnectInterval,
    unsubscribe,
  ]);

  /**
   * Manually reconnect
   */
  const reconnect = useCallback(() => {
    unsubscribe();
    subscribe();
  }, [subscribe, unsubscribe]);

  /**
   * Clear all updates
   */
  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setRecentTrades([]);
    setPendingTrades([]);
    setMetrics({
      totalTrades: 0,
      totalBuys: 0,
      totalSells: 0,
      totalVolume: 0,
      last24hVolume: 0,
      last24hTrades: 0,
    });
  }, []);

  /**
   * Initial subscription
   */
  useEffect(() => {
    isUnmountedRef.current = false;
    subscribe();

    return () => {
      isUnmountedRef.current = true;
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  return {
    updates,
    recentTrades,
    pendingTrades,
    metrics,
    isConnected,
    isLoading,
    error,
    clearUpdates,
    reconnect,
  };
}

/**
 * Export default for convenience
 */
export default useRealtimeTrades;

// =============================================================================
// HELPERS
// =============================================================================

function normalizeTradeRow(row: Tables<'trades'>['Row']): Trade {
  return {
    ...row,
    user_id: row.user_id ?? undefined,
    actual_slippage: row.actual_slippage ?? undefined,
    transaction_signature: row.transaction_signature ?? undefined,
    block_number: row.block_number ?? undefined,
    dex: row.dex ?? undefined,
    pool_address: row.pool_address ?? undefined,
    estimated_completion: row.estimated_completion ?? undefined,
    error_message: row.error_message ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    submitted_at: row.submitted_at ?? undefined,
    confirmed_at: row.confirmed_at ?? undefined,
    priority: normalizePriority(row.priority),
  };
}

function normalizePriority(value: string): TransactionPriority {
  const normalized = value.toLowerCase() as TransactionPriority;
  switch (normalized) {
    case 'slow':
    case 'fast':
    case 'ultra':
      return normalized;
    case 'medium':
    default:
      return 'medium';
  }
}
