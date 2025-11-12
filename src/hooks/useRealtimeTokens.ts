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
import { supabase, subscribeToTable } from '@/lib/supabase/client';
import type { Token } from '@/types/token';

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
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
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

  useEffect(() => {
    callbacksRef.current = {
      onNewToken,
      onTokenUpdate,
      onTokenDelete,
      onConnectionChange,
    };
  }, [onNewToken, onTokenUpdate, onTokenDelete, onConnectionChange]);

  /**
   * Handle token updates from Supabase
   */
  const handleTokenChange = useCallback(
    (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: Token | null;
      old: Token | null;
    }) => {
      if (isUnmountedRef.current) return;

      const { eventType, new: newData, old: oldData } = payload;

      // Create update object
      const update: TokenUpdate = {
        eventType,
        token: (newData || oldData) as Token,
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
          if (newData) {
            setNewTokens((prev) => {
              const filtered = [newData, ...prev].slice(0, maxUpdates);
              return filtered;
            });
            onNewTokenCallback?.(newData);
          }
          break;

        case 'UPDATE':
          if (newData) {
            setUpdatedTokens((prev) => {
              // Remove old entry if exists, add new one
              const filtered = prev.filter((t) => t.id !== newData.id);
              return [newData, ...filtered].slice(0, maxUpdates);
            });
            onTokenUpdateCallback?.(newData, oldData);
          }
          break;

        case 'DELETE':
          if (oldData) {
            // Remove from lists
            setNewTokens((prev) => prev.filter((t) => t.id !== oldData.id));
            setUpdatedTokens((prev) => prev.filter((t) => t.id !== oldData.id));
            onTokenDeleteCallback?.(oldData);
          }
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

      // Build filter string
      let filter = status ? `status=eq.${status}` : undefined;
      if (chain && filter) {
        filter += `,chain=eq.${chain}`;
      } else if (chain) {
        filter = `chain=eq.${chain}`;
      }

      // Subscribe to tokens table
      const subscription = subscribeToTable('tokens', handleTokenChange, filter);
      subscriptionRef.current = subscription;

      // Check connection status via Supabase realtime
      const channel = supabase.channel('tokens_changes');
      channel.on('system', { event: 'connected' }, () => {
        updateConnectionStatus(true);
        setIsLoading(false);
      });

      channel.on('system', { event: 'disconnected' }, () => {
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

      channel.on('system', { event: 'error' }, (error) => {
        console.error('[useRealtimeTokens] Connection error:', error);
        setError(new Error('Real-time connection error'));
        updateConnectionStatus(false);
      });

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
    chain,
    status,
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
