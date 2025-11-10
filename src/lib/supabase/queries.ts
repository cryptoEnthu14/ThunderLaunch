/**
 * Supabase Query Helpers
 *
 * Helper functions for common database operations with proper error handling
 * and type safety.
 */

import { supabase, handleSupabaseError } from './client';
import type { Tables, TablesInsert, TablesUpdate } from './database.types';
import type {
  Token,
  SecurityCheck,
  Trade,
  Chain,
  TokenFilters,
} from '@/types';

// =============================================================================
// RESULT TYPE
// =============================================================================

/**
 * Generic query result type
 */
export type QueryResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Paginated query result type
 */
export type PaginatedResult<T> = QueryResult<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}>;

// =============================================================================
// TOKEN QUERIES
// =============================================================================

/**
 * Get a list of tokens with optional filters
 *
 * @param options - Query options
 * @param options.limit - Maximum number of tokens to return (default: 20)
 * @param options.offset - Number of tokens to skip (default: 0)
 * @param options.chain - Filter by blockchain
 * @param options.verification_tier - Filter by verification tier
 * @param options.status - Filter by status
 * @param options.sortBy - Sort field (default: 'created_at')
 * @param options.sortOrder - Sort order (default: 'desc')
 * @returns Paginated list of tokens
 *
 * @example
 * ```typescript
 * const result = await getTokens({ limit: 10, chain: 'solana' });
 * if (result.data) {
 *   console.log('Tokens:', result.data.items);
 * }
 * ```
 */
export async function getTokens(options?: {
  limit?: number;
  offset?: number;
  chain?: Chain;
  verification_tier?: string;
  status?: string;
  sortBy?: keyof Tables<'tokens'>;
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResult<Token>> {
  try {
    const {
      limit = 20,
      offset = 0,
      chain,
      verification_tier,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options || {};

    // Build query
    let query = supabase.from('tokens').select('*', { count: 'exact' });

    // Apply filters
    if (chain) {
      query = query.eq('chain', chain);
    }
    if (verification_tier) {
      query = query.eq('verification_tier', verification_tier);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    const total = count || 0;
    const page = Math.floor(offset / limit) + 1;

    return {
      data: {
        items: (data as Token[]) || [],
        total,
        page,
        limit,
        has_next: offset + limit < total,
        has_previous: offset > 0,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Get a single token by ID
 *
 * @param id - Token ID
 * @returns Token data or null
 *
 * @example
 * ```typescript
 * const result = await getTokenById('token-id');
 * if (result.data) {
 *   console.log('Token:', result.data);
 * }
 * ```
 */
export async function getTokenById(id: string): Promise<QueryResult<Token>> {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as Token,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Get a token by mint/contract address
 *
 * @param mintAddress - Token mint/contract address
 * @returns Token data or null
 *
 * @example
 * ```typescript
 * const result = await getTokenByAddress('So11111...');
 * ```
 */
export async function getTokenByAddress(
  mintAddress: string
): Promise<QueryResult<Token>> {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('mint_address', mintAddress)
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as Token,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Create a new token
 *
 * @param tokenData - Token data to insert
 * @returns Created token or null
 *
 * @example
 * ```typescript
 * const result = await createToken({
 *   mint_address: 'So11111...',
 *   name: 'My Token',
 *   symbol: 'MTK',
 *   creator_wallet: 'wallet...',
 *   chain: 'solana',
 *   total_supply: '1000000',
 *   decimals: 9,
 * });
 * ```
 */
export async function createToken(
  tokenData: TablesInsert<'tokens'>
): Promise<QueryResult<Token>> {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .insert(tokenData as any)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as Token,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Update a token
 *
 * @param id - Token ID
 * @param updates - Token fields to update
 * @returns Updated token or null
 *
 * @example
 * ```typescript
 * const result = await updateToken('token-id', {
 *   current_price: 1.5,
 *   market_cap: 1500000,
 * });
 * ```
 */
export async function updateToken(
  id: string,
  updates: TablesUpdate<'tokens'>
): Promise<QueryResult<Token>> {
  try {
    const { data, error } = await supabase
      .from('tokens')
      // @ts-ignore - Supabase type inference issue
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as Token,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Delete a token
 *
 * @param id - Token ID
 * @returns Success status
 *
 * @example
 * ```typescript
 * const result = await deleteToken('token-id');
 * ```
 */
export async function deleteToken(id: string): Promise<QueryResult<boolean>> {
  try {
    const { error } = await supabase.from('tokens').delete().eq('id', id);

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: true,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

// =============================================================================
// SECURITY CHECK QUERIES
// =============================================================================

/**
 * Get security check for a token
 *
 * @param tokenId - Token ID
 * @returns Security check data or null
 *
 * @example
 * ```typescript
 * const result = await getSecurityCheck('token-id');
 * ```
 */
export async function getSecurityCheck(
  tokenId: string
): Promise<QueryResult<SecurityCheck>> {
  try {
    const { data, error } = await supabase
      .from('security_checks')
      .select('*')
      .eq('token_id', tokenId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as unknown as SecurityCheck,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Create a security check
 *
 * @param checkData - Security check data
 * @returns Created security check or null
 *
 * @example
 * ```typescript
 * const result = await createSecurityCheck({
 *   token_id: 'token-id',
 *   token_address: 'So11111...',
 *   risk_level: 'low',
 *   risk_score: 15,
 *   findings: [],
 * });
 * ```
 */
export async function createSecurityCheck(
  checkData: TablesInsert<'security_checks'>
): Promise<QueryResult<SecurityCheck>> {
  try {
    const { data, error} = await supabase
      .from('security_checks')
      .insert(checkData as any)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as unknown as SecurityCheck,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Update a security check
 *
 * @param id - Security check ID
 * @param updates - Fields to update
 * @returns Updated security check or null
 */
export async function updateSecurityCheck(
  id: string,
  updates: TablesUpdate<'security_checks'>
): Promise<QueryResult<SecurityCheck>> {
  try {
    const { data, error } = await supabase
      .from('security_checks')
      // @ts-ignore - Supabase type inference issue
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as unknown as SecurityCheck,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

// =============================================================================
// TRADE QUERIES
// =============================================================================

/**
 * Get trades for a token
 *
 * @param tokenId - Token ID
 * @param options - Query options
 * @returns List of trades
 *
 * @example
 * ```typescript
 * const result = await getTrades('token-id', { limit: 50 });
 * ```
 */
export async function getTrades(
  tokenId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<PaginatedResult<Trade>> {
  try {
    const { limit = 20, offset = 0 } = options || {};

    const { data, error, count } = await supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('token_id', tokenId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    const total = count || 0;
    const page = Math.floor(offset / limit) + 1;

    return {
      data: {
        items: (data as unknown as Trade[]) || [],
        total,
        page,
        limit,
        has_next: offset + limit < total,
        has_previous: offset > 0,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Get trade by ID
 *
 * @param id - Trade ID
 * @returns Trade data or null
 */
export async function getTradeById(id: string): Promise<QueryResult<Trade>> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as unknown as Trade,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Get trades by wallet address
 *
 * @param walletAddress - User's wallet address
 * @param options - Query options
 * @returns List of trades
 */
export async function getTradesByWallet(
  walletAddress: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<PaginatedResult<Trade>> {
  try {
    const { limit = 20, offset = 0 } = options || {};

    const { data, error, count } = await supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    const total = count || 0;
    const page = Math.floor(offset / limit) + 1;

    return {
      data: {
        items: (data as unknown as Trade[]) || [],
        total,
        page,
        limit,
        has_next: offset + limit < total,
        has_previous: offset > 0,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Create a trade
 *
 * @param tradeData - Trade data to insert
 * @returns Created trade or null
 *
 * @example
 * ```typescript
 * const result = await createTrade({
 *   token_id: 'token-id',
 *   token_address: 'So11111...',
 *   wallet_address: 'wallet...',
 *   trade_type: 'buy',
 *   token_amount: '100',
 *   native_amount: 1.5,
 *   usd_amount: 150,
 *   price_native: 0.015,
 *   price_usd: 1.5,
 *   slippage_tolerance: 1.0,
 *   chain: 'solana',
 * });
 * ```
 */
export async function createTrade(
  tradeData: TablesInsert<'trades'>
): Promise<QueryResult<Trade>> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .insert(tradeData as any)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as unknown as Trade,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Update a trade
 *
 * @param id - Trade ID
 * @param updates - Fields to update
 * @returns Updated trade or null
 */
export async function updateTrade(
  id: string,
  updates: TablesUpdate<'trades'>
): Promise<QueryResult<Trade>> {
  try {
    const { data, error } = await supabase
      .from('trades')
      // @ts-ignore - Supabase type inference issue
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data: data as unknown as Trade,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

// =============================================================================
// USER QUERIES
// =============================================================================

/**
 * Get user by wallet address
 *
 * @param walletAddress - User's wallet address
 * @returns User data or null
 */
export async function getUserByWallet(walletAddress: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Create a user
 *
 * @param userData - User data to insert
 * @returns Created user or null
 */
export async function createUser(userData: TablesInsert<'users'>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(userData as any)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

/**
 * Update a user
 *
 * @param id - User ID
 * @param updates - Fields to update
 * @returns Updated user or null
 */
export async function updateUser(
  id: string,
  updates: TablesUpdate<'users'>
) {
  try {
    const { data, error } = await supabase
      .from('users')
      // @ts-ignore - Supabase type inference issue
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error).message,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}

// =============================================================================
// AGGREGATE QUERIES
// =============================================================================

/**
 * Get token statistics
 *
 * @param tokenId - Token ID
 * @returns Token statistics
 */
export async function getTokenStats(tokenId: string) {
  try {
    const [tokenResult, tradesResult] = await Promise.all([
      getTokenById(tokenId),
      getTrades(tokenId, { limit: 1000 }),
    ]);

    if (tokenResult.error || tradesResult.error) {
      return {
        data: null,
        error: tokenResult.error || tradesResult.error,
      };
    }

    const token = tokenResult.data;
    const trades = tradesResult.data?.items || [];

    return {
      data: {
        token,
        totalTrades: trades.length,
        totalVolume: trades.reduce((sum, t) => sum + t.usd_amount, 0),
        buyVolume: trades
          .filter((t) => t.trade_type === 'buy')
          .reduce((sum, t) => sum + t.usd_amount, 0),
        sellVolume: trades
          .filter((t) => t.trade_type === 'sell')
          .reduce((sum, t) => sum + t.usd_amount, 0),
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error).message,
    };
  }
}
