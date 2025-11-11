/**
 * User Database Operations
 *
 * Functions for managing user profiles, settings, and related data.
 */

import { supabase } from './client';
import type { User, UserProfile, UserStats } from '@/types/user';
import type { Token } from '@/types/token';
import type { Trade} from '@/types/trade';

// =============================================================================
// TYPES
// =============================================================================

export interface QueryResult<T> {
  data: T | null;
  error: string | null;
}

export interface UpdateProfileData {
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  social_links?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };
}

// =============================================================================
// USER PROFILE OPERATIONS
// =============================================================================

/**
 * Get user profile by wallet address
 */
export async function getUserProfile(
  walletAddress: string
): Promise<QueryResult<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      console.error('[getUserProfile] Error:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: 'User not found' };
    }

    // Map to UserProfile type
    const profile: UserProfile = {
      id: data.id,
      wallet_address: data.wallet_address,
      username: data.username || undefined,
      display_name: data.display_name || undefined,
      avatar_url: data.avatar_url || undefined,
      bio: data.bio || undefined,
      verification_status: data.verification_status,
      is_creator: data.is_creator,
      tokens_created: data.tokens_created || 0,
      trades_count: data.trades_count || 0,
      total_volume_usd: data.total_volume_usd || 0,
      social_links: data.social_links || undefined,
      joined_at: data.created_at,
    };

    return { data: profile, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getUserProfile] Exception:', error);
    return { data: null, error };
  }
}

/**
 * Get user profile by user ID
 */
export async function getUserProfileById(
  userId: string
): Promise<QueryResult<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[getUserProfileById] Error:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: 'User not found' };
    }

    const profile: UserProfile = {
      id: data.id,
      wallet_address: data.wallet_address,
      username: data.username || undefined,
      display_name: data.display_name || undefined,
      avatar_url: data.avatar_url || undefined,
      bio: data.bio || undefined,
      verification_status: data.verification_status,
      is_creator: data.is_creator,
      tokens_created: data.tokens_created || 0,
      trades_count: data.trades_count || 0,
      total_volume_usd: data.total_volume_usd || 0,
      social_links: data.social_links || undefined,
      joined_at: data.created_at,
    };

    return { data: profile, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getUserProfileById] Exception:', error);
    return { data: null, error };
  }
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(
  walletAddress: string,
  profileData?: Partial<UpdateProfileData>
): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          wallet_address: walletAddress,
          ...profileData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'wallet_address',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[upsertUserProfile] Error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as User, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[upsertUserProfile] Exception:', error);
    return { data: null, error };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  walletAddress: string,
  updates: UpdateProfileData
): Promise<QueryResult<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) {
      console.error('[updateUserProfile] Error:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: 'User not found' };
    }

    const profile: UserProfile = {
      id: data.id,
      wallet_address: data.wallet_address,
      username: data.username || undefined,
      display_name: data.display_name || undefined,
      avatar_url: data.avatar_url || undefined,
      bio: data.bio || undefined,
      verification_status: data.verification_status,
      is_creator: data.is_creator,
      tokens_created: data.tokens_created || 0,
      trades_count: data.trades_count || 0,
      total_volume_usd: data.total_volume_usd || 0,
      social_links: data.social_links || undefined,
      joined_at: data.created_at,
    };

    return { data: profile, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[updateUserProfile] Exception:', error);
    return { data: null, error };
  }
}

// =============================================================================
// USER TOKENS
// =============================================================================

/**
 * Get tokens created by user
 */
export async function getUserTokens(
  walletAddress: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: 'created_at' | 'market_cap' | 'volume_24h';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<QueryResult<{ tokens: Token[]; total: number }>> {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    const offset = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .eq('creator_wallet', walletAddress);

    if (countError) {
      console.error('[getUserTokens] Count error:', countError);
      return { data: null, error: countError.message };
    }

    // Get tokens
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('creator_wallet', walletAddress)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[getUserTokens] Error:', error);
      return { data: null, error: error.message };
    }

    return {
      data: {
        tokens: (data || []) as Token[],
        total: count || 0,
      },
      error: null,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getUserTokens] Exception:', error);
    return { data: null, error };
  }
}

// =============================================================================
// USER TRADES
// =============================================================================

/**
 * Get user trading history
 */
export async function getUserTrades(
  walletAddress: string,
  options: {
    page?: number;
    limit?: number;
    status?: 'confirmed' | 'pending' | 'failed';
    sortBy?: 'created_at' | 'usd_amount';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<QueryResult<{ trades: Trade[]; total: number }>> {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('wallet_address', walletAddress);

    if (status) {
      query = query.eq('status', status);
    }

    // Get total count
    const { count, error: countError } = await query;

    if (countError) {
      console.error('[getUserTrades] Count error:', countError);
      return { data: null, error: countError.message };
    }

    // Get trades
    const { data, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[getUserTrades] Error:', error);
      return { data: null, error: error.message };
    }

    return {
      data: {
        trades: (data || []) as Trade[],
        total: count || 0,
      },
      error: null,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getUserTrades] Exception:', error);
    return { data: null, error };
  }
}

// =============================================================================
// USER STATISTICS
// =============================================================================

/**
 * Get user statistics
 */
export async function getUserStats(
  walletAddress: string
): Promise<QueryResult<UserStats>> {
  try {
    // Get user basic info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError) {
      console.error('[getUserStats] User error:', userError);
      return { data: null, error: userError.message };
    }

    // Get trade statistics
    const { data: tradesData, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('status', 'confirmed');

    if (tradesError) {
      console.error('[getUserStats] Trades error:', tradesError);
      // Continue even if trades query fails
    }

    const trades = (tradesData || []) as Trade[];

    // Calculate statistics
    const totalTrades = trades.length;
    const successfulTrades = trades.filter((t) => t.status === 'confirmed').length;
    const failedTrades = trades.filter((t) => t.status === 'failed').length;
    const totalVolume = trades.reduce((sum, t) => sum + t.usd_amount, 0);
    const totalFees = trades.reduce((sum, t) => sum + t.total_fee, 0);

    // Calculate P&L (simplified - would need more complex logic in production)
    const buyTrades = trades.filter((t) => t.trade_type === 'buy');
    const sellTrades = trades.filter((t) => t.trade_type === 'sell');
    const buyVolume = buyTrades.reduce((sum, t) => sum + t.usd_amount, 0);
    const sellVolume = sellTrades.reduce((sum, t) => sum + t.usd_amount, 0);
    const totalPnl = sellVolume - buyVolume - totalFees;

    const stats: UserStats = {
      user_id: userData.id,
      portfolio_value_usd: userData.total_volume_usd || 0,
      total_invested_usd: buyVolume,
      total_pnl_usd: totalPnl,
      total_pnl_percentage: buyVolume > 0 ? (totalPnl / buyVolume) * 100 : 0,
      win_rate: totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0,
      total_trades: totalTrades,
      successful_trades: successfulTrades,
      failed_trades: failedTrades,
      total_volume_usd: totalVolume,
      total_fees_paid_usd: totalFees,
      tokens_created: userData.tokens_created || 0,
      active_positions: 0, // Would need to calculate from current holdings
      total_tokens_held: 0, // Would need to calculate from current holdings
      referral_earnings_usd: 0, // Would need referral data
      updated_at: new Date().toISOString(),
    };

    return { data: stats, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getUserStats] Exception:', error);
    return { data: null, error };
  }
}

// =============================================================================
// USERNAME OPERATIONS
// =============================================================================

/**
 * Check if username is available
 */
export async function isUsernameAvailable(
  username: string,
  currentWalletAddress?: string
): Promise<QueryResult<boolean>> {
  try {
    let query = supabase
      .from('users')
      .select('id')
      .eq('username', username);

    // Exclude current user if updating
    if (currentWalletAddress) {
      query = query.neq('wallet_address', currentWalletAddress);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('[isUsernameAvailable] Error:', error);
      return { data: null, error: error.message };
    }

    // Username is available if no data found
    return { data: !data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[isUsernameAvailable] Exception:', error);
    return { data: null, error };
  }
}

// =============================================================================
// AVATAR UPLOAD
// =============================================================================

/**
 * Upload user avatar
 */
export async function uploadAvatar(
  walletAddress: string,
  file: File
): Promise<QueryResult<string>> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${walletAddress}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[uploadAvatar] Upload error:', uploadError);
      return { data: null, error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('user-assets').getPublicUrl(filePath);

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('[uploadAvatar] Update error:', updateError);
      return { data: null, error: updateError.message };
    }

    return { data: publicUrl, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[uploadAvatar] Exception:', error);
    return { data: null, error };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getUserProfile,
  getUserProfileById,
  upsertUserProfile,
  updateUserProfile,
  getUserTokens,
  getUserTrades,
  getUserStats,
  isUsernameAvailable,
  uploadAvatar,
};
