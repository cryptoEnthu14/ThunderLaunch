/**
 * useWatchlist Hook
 *
 * Hook for managing user watchlist with optimistic updates.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  addToWatchlist as addToWatchlistDB,
  removeFromWatchlist as removeFromWatchlistDB,
  isInWatchlist as isInWatchlistDB,
  getWatchlist as getWatchlistDB,
  getWatchlistCount as getWatchlistCountDB,
  toggleWatchlist as toggleWatchlistDB,
  type WatchlistItemWithToken,
} from '@/lib/supabase/watchlist';
import { toast } from '@/lib/notifications/toast';

// =============================================================================
// TYPES
// =============================================================================

export interface UseWatchlistOptions {
  /** Auto-load watchlist on mount */
  autoLoad?: boolean;
  /** Page number for pagination */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Sort field */
  sortBy?: 'created_at' | 'name' | 'market_cap' | 'volume_24h';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

export interface UseWatchlistReturn {
  /** Watchlist items */
  watchlist: WatchlistItemWithToken[];
  /** Total count of watchlist items */
  count: number;
  /** Check if token is in watchlist */
  isInWatchlist: (tokenId: string) => boolean;
  /** Add token to watchlist */
  addToWatchlist: (tokenId: string, tokenAddress: string) => Promise<boolean>;
  /** Remove token from watchlist */
  removeFromWatchlist: (tokenId: string) => Promise<boolean>;
  /** Toggle token in watchlist */
  toggleWatchlist: (tokenId: string, tokenAddress: string) => Promise<boolean>;
  /** Reload watchlist from database */
  reload: () => Promise<void>;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for managing user watchlist
 *
 * @example
 * ```tsx
 * const { watchlist, isInWatchlist, addToWatchlist, removeFromWatchlist } =
 *   useWatchlist(walletAddress);
 *
 * // Check if token is in watchlist
 * const inWatchlist = isInWatchlist('token-id-123');
 *
 * // Add to watchlist
 * await addToWatchlist('token-id-123', 'token-address-abc');
 *
 * // Remove from watchlist
 * await removeFromWatchlist('token-id-123');
 * ```
 */
export function useWatchlist(
  walletAddress: string | null | undefined,
  options: UseWatchlistOptions = {}
): UseWatchlistReturn {
  const {
    autoLoad = true,
    page = 1,
    limit = 100,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options;

  // State
  const [watchlist, setWatchlist] = useState<WatchlistItemWithToken[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load watchlist from database
   */
  const loadWatchlist = useCallback(async () => {
    if (!walletAddress) {
      setWatchlist([]);
      setCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: loadError } = await getWatchlistDB(walletAddress, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      if (loadError) {
        setError(loadError);
        console.error('[useWatchlist] Load error:', loadError);
        return;
      }

      if (data) {
        setWatchlist(data.items);
        setCount(data.total);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load watchlist';
      setError(errorMessage);
      console.error('[useWatchlist] Exception:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, page, limit, sortBy, sortOrder]);

  /**
   * Check if token is in watchlist (local check)
   */
  const isInWatchlist = useCallback(
    (tokenId: string): boolean => {
      return watchlist.some((item) => item.token_id === tokenId);
    },
    [watchlist]
  );

  /**
   * Add token to watchlist
   */
  const addToWatchlist = useCallback(
    async (tokenId: string, tokenAddress: string): Promise<boolean> => {
      if (!walletAddress) {
        toast.error('Connect wallet', 'Please connect your wallet to add to watchlist');
        return false;
      }

      // Check if already in watchlist
      if (isInWatchlist(tokenId)) {
        toast.info('Already in watchlist', 'This token is already in your watchlist');
        return false;
      }

      // Optimistic update - add placeholder item
      const optimisticItem: WatchlistItemWithToken = {
        id: `temp-${Date.now()}`,
        user_id: '',
        wallet_address: walletAddress,
        token_id: tokenId,
        token_address: tokenAddress,
        created_at: new Date().toISOString(),
        token: null as any, // Will be loaded on reload
      };

      setWatchlist((prev) => [optimisticItem, ...prev]);
      setCount((prev) => prev + 1);

      try {
        const { data, error: addError } = await addToWatchlistDB(
          walletAddress,
          tokenId,
          tokenAddress
        );

        if (addError) {
          // Revert optimistic update
          setWatchlist((prev) => prev.filter((item) => item.id !== optimisticItem.id));
          setCount((prev) => prev - 1);

          toast.error('Failed to add to watchlist', addError);
          return false;
        }

        // Reload to get full token data
        await loadWatchlist();
        toast.success('Added to watchlist', 'Token has been added to your watchlist');
        return true;
      } catch (err) {
        // Revert optimistic update
        setWatchlist((prev) => prev.filter((item) => item.id !== optimisticItem.id));
        setCount((prev) => prev - 1);

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast.error('Failed to add to watchlist', errorMessage);
        return false;
      }
    },
    [walletAddress, isInWatchlist, loadWatchlist]
  );

  /**
   * Remove token from watchlist
   */
  const removeFromWatchlist = useCallback(
    async (tokenId: string): Promise<boolean> => {
      if (!walletAddress) {
        toast.error('Connect wallet', 'Please connect your wallet');
        return false;
      }

      // Optimistic update - remove from list
      const itemToRemove = watchlist.find((item) => item.token_id === tokenId);
      if (!itemToRemove) {
        toast.error('Not in watchlist', 'This token is not in your watchlist');
        return false;
      }

      setWatchlist((prev) => prev.filter((item) => item.token_id !== tokenId));
      setCount((prev) => prev - 1);

      try {
        const { error: removeError } = await removeFromWatchlistDB(walletAddress, tokenId);

        if (removeError) {
          // Revert optimistic update
          setWatchlist((prev) => [itemToRemove, ...prev]);
          setCount((prev) => prev + 1);

          toast.error('Failed to remove from watchlist', removeError);
          return false;
        }

        toast.success('Removed from watchlist', 'Token has been removed from your watchlist');
        return true;
      } catch (err) {
        // Revert optimistic update
        setWatchlist((prev) => [itemToRemove, ...prev]);
        setCount((prev) => prev + 1);

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast.error('Failed to remove from watchlist', errorMessage);
        return false;
      }
    },
    [walletAddress, watchlist]
  );

  /**
   * Toggle token in watchlist
   */
  const toggleWatchlist = useCallback(
    async (tokenId: string, tokenAddress: string): Promise<boolean> => {
      if (isInWatchlist(tokenId)) {
        return await removeFromWatchlist(tokenId);
      } else {
        return await addToWatchlist(tokenId, tokenAddress);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  /**
   * Load watchlist on mount and when dependencies change
   */
  useEffect(() => {
    if (autoLoad && walletAddress) {
      loadWatchlist();
    }
  }, [autoLoad, walletAddress, loadWatchlist]);

  return {
    watchlist,
    count,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    reload: loadWatchlist,
    isLoading,
    error,
  };
}

export default useWatchlist;
