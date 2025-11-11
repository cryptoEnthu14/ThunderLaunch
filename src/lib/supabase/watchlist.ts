/**
 * Watchlist Database Operations
 *
 * Functions for managing user watchlists.
 */

import { supabase } from './client';
import type { Token } from '@/types/token';

// =============================================================================
// TYPES
// =============================================================================

export interface WatchlistItem {
  id: string;
  user_id: string;
  wallet_address: string;
  token_id: string;
  token_address: string;
  created_at: string;
}

export interface WatchlistItemWithToken extends WatchlistItem {
  token: Token;
}

export interface QueryResult<T> {
  data: T | null;
  error: string | null;
}

// =============================================================================
// WATCHLIST OPERATIONS
// =============================================================================

/**
 * Add token to watchlist
 */
export async function addToWatchlist(
  walletAddress: string,
  tokenId: string,
  tokenAddress: string
): Promise<QueryResult<WatchlistItem>> {
  try {
    // Check if already in watchlist
    const { data: existing } = await supabase
      .from('watchlist')
      .select('id')
      .eq('wallet_address', walletAddress)
      .eq('token_id', tokenId)
      .single();

    if (existing) {
      return {
        data: null,
        error: 'Token is already in watchlist',
      };
    }

    // Add to watchlist
    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        wallet_address: walletAddress,
        token_id: tokenId,
        token_address: tokenAddress,
      })
      .select()
      .single();

    if (error) {
      console.error('[addToWatchlist] Error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as WatchlistItem, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[addToWatchlist] Exception:', error);
    return { data: null, error };
  }
}

/**
 * Remove token from watchlist
 */
export async function removeFromWatchlist(
  walletAddress: string,
  tokenId: string
): Promise<QueryResult<boolean>> {
  try {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('wallet_address', walletAddress)
      .eq('token_id', tokenId);

    if (error) {
      console.error('[removeFromWatchlist] Error:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[removeFromWatchlist] Exception:', error);
    return { data: null, error };
  }
}

/**
 * Check if token is in watchlist
 */
export async function isInWatchlist(
  walletAddress: string,
  tokenId: string
): Promise<QueryResult<boolean>> {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('id')
      .eq('wallet_address', walletAddress)
      .eq('token_id', tokenId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('[isInWatchlist] Error:', error);
      return { data: null, error: error.message };
    }

    return { data: !!data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[isInWatchlist] Exception:', error);
    return { data: null, error };
  }
}

/**
 * Get user's watchlist
 */
export async function getWatchlist(
  walletAddress: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: 'created_at' | 'name' | 'market_cap' | 'volume_24h';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<QueryResult<{ items: WatchlistItemWithToken[]; total: number }>> {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    const offset = (page - 1) * limit;

    // Get watchlist items with token data
    let query = supabase
      .from('watchlist')
      .select(
        `
        id,
        user_id,
        wallet_address,
        token_id,
        token_address,
        created_at,
        tokens (*)
      `,
        { count: 'exact' }
      )
      .eq('wallet_address', walletAddress);

    // Apply sorting based on sortBy
    if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    }

    // Get total count
    const { count, error: countError } = await query;

    if (countError) {
      console.error('[getWatchlist] Count error:', countError);
      return { data: null, error: countError.message };
    }

    // Get items with pagination
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('[getWatchlist] Error:', error);
      return { data: null, error: error.message };
    }

    // Map and sort the results
    let items = (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      wallet_address: item.wallet_address,
      token_id: item.token_id,
      token_address: item.token_address,
      created_at: item.created_at,
      token: item.tokens,
    })) as WatchlistItemWithToken[];

    // Apply sorting by token fields if needed
    if (sortBy !== 'created_at' && items.length > 0) {
      items.sort((a, b) => {
        let aValue: number | string = 0;
        let bValue: number | string = 0;

        switch (sortBy) {
          case 'name':
            aValue = a.token?.name || '';
            bValue = b.token?.name || '';
            break;
          case 'market_cap':
            aValue = a.token?.market_cap || 0;
            bValue = b.token?.market_cap || 0;
            break;
          case 'volume_24h':
            aValue = a.token?.volume_24h || 0;
            bValue = b.token?.volume_24h || 0;
            break;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return {
      data: {
        items,
        total: count || 0,
      },
      error: null,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getWatchlist] Exception:', error);
    return { data: null, error };
  }
}

/**
 * Get watchlist count for user
 */
export async function getWatchlistCount(
  walletAddress: string
): Promise<QueryResult<number>> {
  try {
    const { count, error } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('wallet_address', walletAddress);

    if (error) {
      console.error('[getWatchlistCount] Error:', error);
      return { data: null, error: error.message };
    }

    return { data: count || 0, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getWatchlistCount] Exception:', error);
    return { data: null, error };
  }
}

/**
 * Toggle token in watchlist (add if not present, remove if present)
 */
export async function toggleWatchlist(
  walletAddress: string,
  tokenId: string,
  tokenAddress: string
): Promise<QueryResult<{ isInWatchlist: boolean }>> {
  try {
    // Check if in watchlist
    const { data: inWatchlist } = await isInWatchlist(walletAddress, tokenId);

    if (inWatchlist) {
      // Remove from watchlist
      const { error } = await removeFromWatchlist(walletAddress, tokenId);
      if (error) {
        return { data: null, error };
      }
      return { data: { isInWatchlist: false }, error: null };
    } else {
      // Add to watchlist
      const { error } = await addToWatchlist(walletAddress, tokenId, tokenAddress);
      if (error && !error.includes('already in watchlist')) {
        return { data: null, error };
      }
      return { data: { isInWatchlist: true }, error: null };
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[toggleWatchlist] Exception:', error);
    return { data: null, error };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getWatchlist,
  getWatchlistCount,
  toggleWatchlist,
};
