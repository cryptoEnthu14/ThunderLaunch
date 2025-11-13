/**
 * useRealtimeTokens Hook
 *
 * Custom hook to subscribe to real-time token updates from Supabase.
 * Features:
 * - Subscribe to token price changes
 * - Listen for new token launches
 * - Auto-update token data
 * - Handle reconnection gracefully
 * - Automatic cleanup on unmount
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { subscribeToTable, type TableSubscription } from '@/lib/supabase/client';
import type { Token, TokenStandard } from '@/types/token';
import type { Tables } from '@/lib/supabase/database.types';

// =============================================================================
// TYPES
// =============================================================================

export interface TokenUpdate {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  token: Token;
  timestamp: string;
}

export interface RealtimeTokensState {
  /** List of real-time token updates */
  updates: TokenUpdate[];
  /** Latest new token launches */
  newTokens: Token[];
  /** Tokens that have been updated */
  updatedTokens: Token[];
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

export interface UseRealtimeTokensOptions {
  /** Maximum number of updates to keep in memory */
  maxUpdates?: number;
  /** Filter by chain */
  chain?: string;
  /** Filter by status */
  status?: string;
  /** Enable auto-reconnection */
  autoReconnect?: boolean;
  /** Reconnection interval in ms */
  reconnectInterval?: number;
  /** Callback when new token is created */
  onNewToken?: (token: Token) => void;
  /** Callback when token is updated */
  onTokenUpdate?: (token: Token, oldToken: Token | null) => void;
  /** Callback when token is deleted */
  onTokenDelete?: (token: Token) => void;
  /** Callback when connection status changes */
  onConnectionChange?: (isConnected: boolean) => void;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Subscribe to real-time token updates
 *
 * @param options - Configuration options
 * @returns Real-time tokens state and controls
 *
 * @example
 * ```tsx
 * const { updates, newTokens, isConnected } = useRealtimeTokens({
 *   maxUpdates: 50,
 *   onNewToken: (token) => {
 *     toast.success(`New token launched: ${token.name}`);
 *   },
 * });
 * ```
 */
export function useRealtimeTokens(
  options: UseRealtimeTokensOptions = {}
): RealtimeTokensState {
  const {
    maxUpdates = 100,
    chain,
    status = 'active',
    autoReconnect = true,
    reconnectInterval = 5000,
    onNewToken,
    onTokenUpdate,
    onTokenDelete,
    onConnectionChange,
  } = options;

  // State
  const [updates, setUpdates] = useState<TokenUpdate[]>([]);
  const [newTokens, setNewTokens] = useState<Token[]>([]);
  const [updatedTokens, setUpdatedTokens] = useState<Token[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Refs
  const subscriptionRef = useRef<TableSubscription | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef<boolean>(false);
  const callbacksRef = useRef<{
    onNewToken?: UseRealtimeTokensOptions['onNewToken'];
    onTokenUpdate?: UseRealtimeTokensOptions['onTokenUpdate'];
    onTokenDelete?: UseRealtimeTokensOptions['onTokenDelete'];
    onConnectionChange?: UseRealtimeTokensOptions['onConnectionChange'];
  }>({
    onNewToken,
    onTokenUpdate,
    onTokenDelete,
    onConnectionChange,
  });
  const filtersRef = useRef<{ chain?: string; status?: string }>({ chain, status });

  useEffect(() => {
    callbacksRef.current = {
      onNewToken,
      onTokenUpdate,
      onTokenDelete,
      onConnectionChange,
    };
  }, [onNewToken, onTokenUpdate, onTokenDelete, onConnectionChange]);

  useEffect(() => {
    filtersRef.current = { chain, status };
  }, [chain, status]);

  /**
   * Handle token updates from Supabase
   */
  const handleTokenChange = useCallback(
    (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: Tables<'tokens'>['Row'] | null;
      old: Tables<'tokens'>['Row'] | null;
    }) => {
      if (isUnmountedRef.current) return;

      const { eventType, new: newData, old: oldData } = payload;
      const normalizedNew = newData ? normalizeTokenRow(newData) : null;
      const normalizedOld = oldData ? normalizeTokenRow(oldData) : null;
      const tokenData = normalizedNew || normalizedOld;

      if (!tokenData) {
        return;
      }

      const { chain: chainFilter, status: statusFilter } = filtersRef.current;

      const statusMatch =
        !statusFilter ||
        normalizedNew?.status === statusFilter ||
        normalizedOld?.status === statusFilter;

      const chainMatch =
        !chainFilter ||
        normalizedNew?.chain === chainFilter ||
        normalizedOld?.chain === chainFilter;

      if (!statusMatch || !chainMatch) {
        return;
      }

      // Create update object
      const update: TokenUpdate = {
        eventType,
        token: tokenData,
        timestamp: new Date().toISOString(),
      };

      // Add to updates list (limited by maxUpdates)
      setUpdates((prev) => {
        const newUpdates = [update, ...prev];
        return newUpdates.slice(0, maxUpdates);
      });

      const {
        onNewToken: onNewTokenCallback,
        onTokenUpdate: onTokenUpdateCallback,
        onTokenDelete: onTokenDeleteCallback,
      } = callbacksRef.current;

      // Handle different event types
      switch (eventType) {
        case 'INSERT':
          if (normalizedNew) {
            setNewTokens((prev) => {
              const filtered = [normalizedNew, ...prev].slice(0, maxUpdates);
              return filtered;
            });
            onNewTokenCallback?.(normalizedNew);
          }
          break;

        case 'UPDATE':
          if (normalizedNew) {
            setUpdatedTokens((prev) => {
              // Remove old entry if exists, add new one
              const filtered = prev.filter((t) => t.id !== normalizedNew.id);
              return [normalizedNew, ...filtered].slice(0, maxUpdates);
            });
            onTokenUpdateCallback?.(normalizedNew, normalizedOld);
          }
          break;

        case 'DELETE':
          setNewTokens((prev) => prev.filter((t) => t.id !== tokenData.id));
          setUpdatedTokens((prev) => prev.filter((t) => t.id !== tokenData.id));
          onTokenDeleteCallback?.(tokenData);
          break;
      }
    },
    [maxUpdates]
  );

  /**
   * Update connection status
   */
  const updateConnectionStatus = useCallback((connected: boolean) => {
    if (isUnmountedRef.current) return;
    setIsConnected(connected);
    callbacksRef.current.onConnectionChange?.(connected);
  }, []);

  /**
   * Unsubscribe from token changes
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
   * Subscribe to token changes
   */
  const subscribe = useCallback(function subscribeCallback() {
    if (isUnmountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Subscribe to tokens table
      const subscription = subscribeToTable('tokens', handleTokenChange);
      subscriptionRef.current = subscription;

      // Subscribe to channel lifecycle events
      subscription.channel.on('system', { event: 'connected' }, () => {
        updateConnectionStatus(true);
        setIsLoading(false);
      });

      subscription.channel.on('system', { event: 'disconnected' }, () => {
        updateConnectionStatus(false);

        // Auto-reconnect if enabled
        if (autoReconnect && !isUnmountedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[useRealtimeTokens] Attempting to reconnect...');
            unsubscribe();
            subscribeCallback();
          }, reconnectInterval);
        }
      });

      subscription.channel.on('system', { event: 'error' }, (error) => {
        console.error('[useRealtimeTokens] Connection error:', error);
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
      const error = err instanceof Error ? err : new Error('Failed to subscribe to tokens');
      console.error('[useRealtimeTokens] Subscription error:', error);
      setError(error);
      setIsLoading(false);
      updateConnectionStatus(false);
    }
  }, [
    handleTokenChange,
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
    setNewTokens([]);
    setUpdatedTokens([]);
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
    newTokens,
    updatedTokens,
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
export default useRealtimeTokens;

// =============================================================================
// HELPERS
// =============================================================================

function normalizeTokenStandard(value: string): TokenStandard {
  const normalized = value.toLowerCase().replace(/[_\s]/g, '-');
  switch (normalized) {
    case 'spl':
    case 'spl-token':
      return 'spl-token';
    case 'erc20':
    case 'erc-20':
      return 'erc20';
    case 'bep20':
    case 'bep-20':
      return 'bep20';
    default:
      return 'spl-token';
  }
}

function normalizeTokenRow(row: Tables<'tokens'>['Row']): Token {
  return {
    ...row,
    token_standard: normalizeTokenStandard(row.token_standard),
  };
}
