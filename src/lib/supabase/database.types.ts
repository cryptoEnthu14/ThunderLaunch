/**
 * Supabase Database Types
 *
 * TypeScript types for the Supabase database schema.
 * These types are generated to match the database structure.
 */

import type {
  Chain,
  VerificationTier,
  RiskLevel,
  TokenStatus,
  TradeType,
  TradeStatus,
  OrderType,
  UserRole,
  UserStatus,
  VerificationStatus as UserVerificationStatus,
  SecurityCheckType,
  SecuritySeverity,
  SecurityCheckStatus,
  SecurityCheckResult,
} from '@/types';

// =============================================================================
// DATABASE SCHEMA
// =============================================================================

export interface Database {
  public: {
    Tables: {
      // Token table
      tokens: {
        Row: {
          id: string;
          mint_address: string;
          name: string;
          symbol: string;
          description: string | null;
          image_url: string | null;
          creator_wallet: string;
          total_supply: string;
          current_price: number;
          market_cap: number;
          liquidity: number;
          holders_count: number;
          risk_score: number;
          risk_level: RiskLevel;
          verification_tier: VerificationTier;
          chain: Chain;
          token_standard: string;
          status: TokenStatus;
          decimals: number;
          website_url: string | null;
          twitter_handle: string | null;
          telegram_url: string | null;
          discord_url: string | null;
          whitepaper_url: string | null;
          metadata_uri: string | null;
          is_tradable: boolean;
          is_burnable: boolean;
          is_mintable: boolean;
          fee_paid: number;
          creation_tx_signature: string | null;
          price_change_24h: number;
          volume_24h: number;
          total_volume: number;
          trades_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mint_address: string;
          name: string;
          symbol: string;
          description?: string | null;
          image_url?: string | null;
          creator_wallet: string;
          total_supply: string;
          current_price?: number;
          market_cap?: number;
          liquidity?: number;
          holders_count?: number;
          risk_score?: number;
          risk_level?: RiskLevel;
          verification_tier?: VerificationTier;
          chain: Chain;
          token_standard?: string;
          status?: TokenStatus;
          decimals: number;
          website_url?: string | null;
          twitter_handle?: string | null;
          telegram_url?: string | null;
          discord_url?: string | null;
          whitepaper_url?: string | null;
          metadata_uri?: string | null;
          is_tradable?: boolean;
          is_burnable?: boolean;
          is_mintable?: boolean;
          fee_paid?: number;
          creation_tx_signature?: string | null;
          price_change_24h?: number;
          volume_24h?: number;
          total_volume?: number;
          trades_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mint_address?: string;
          name?: string;
          symbol?: string;
          description?: string | null;
          image_url?: string | null;
          creator_wallet?: string;
          total_supply?: string;
          current_price?: number;
          market_cap?: number;
          liquidity?: number;
          holders_count?: number;
          risk_score?: number;
          risk_level?: RiskLevel;
          verification_tier?: VerificationTier;
          chain?: Chain;
          token_standard?: string;
          status?: TokenStatus;
          decimals?: number;
          website_url?: string | null;
          twitter_handle?: string | null;
          telegram_url?: string | null;
          discord_url?: string | null;
          whitepaper_url?: string | null;
          metadata_uri?: string | null;
          is_tradable?: boolean;
          is_burnable?: boolean;
          is_mintable?: boolean;
          fee_paid?: number;
          creation_tx_signature?: string | null;
          price_change_24h?: number;
          volume_24h?: number;
          total_volume?: number;
          trades_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Security checks table
      security_checks: {
        Row: {
          id: string;
          token_id: string;
          token_address: string;
          risk_level: RiskLevel;
          risk_score: number;
          status: SecurityCheckStatus;
          findings: unknown; // JSON
          passed_checks: number;
          failed_checks: number;
          warning_checks: number;
          total_checks: number;
          security_score: number;
          is_contract_verified: boolean;
          is_audited: boolean;
          audit_report_url: string | null;
          audit_firm: string | null;
          audit_date: string | null;
          metadata: unknown | null; // JSON
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          token_id: string;
          token_address: string;
          risk_level: RiskLevel;
          risk_score: number;
          status?: SecurityCheckStatus;
          findings?: unknown;
          passed_checks?: number;
          failed_checks?: number;
          warning_checks?: number;
          total_checks?: number;
          security_score?: number;
          is_contract_verified?: boolean;
          is_audited?: boolean;
          audit_report_url?: string | null;
          audit_firm?: string | null;
          audit_date?: string | null;
          metadata?: unknown | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          token_id?: string;
          token_address?: string;
          risk_level?: RiskLevel;
          risk_score?: number;
          status?: SecurityCheckStatus;
          findings?: unknown;
          passed_checks?: number;
          failed_checks?: number;
          warning_checks?: number;
          total_checks?: number;
          security_score?: number;
          is_contract_verified?: boolean;
          is_audited?: boolean;
          audit_report_url?: string | null;
          audit_firm?: string | null;
          audit_date?: string | null;
          metadata?: unknown | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Trades table
      trades: {
        Row: {
          id: string;
          token_id: string;
          token_address: string;
          wallet_address: string;
          user_id: string | null;
          trade_type: TradeType;
          order_type: OrderType;
          status: TradeStatus;
          token_amount: string;
          native_amount: number;
          usd_amount: number;
          price_native: number;
          price_usd: number;
          slippage_tolerance: number;
          actual_slippage: number | null;
          transaction_fee: number;
          platform_fee: number;
          total_fee: number;
          transaction_signature: string | null;
          block_number: number | null;
          chain: Chain;
          dex: string | null;
          pool_address: string | null;
          priority: string;
          estimated_completion: string | null;
          error_message: string | null;
          retry_count: number;
          metadata: unknown | null;
          created_at: string;
          submitted_at: string | null;
          confirmed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          token_id: string;
          token_address: string;
          wallet_address: string;
          user_id?: string | null;
          trade_type: TradeType;
          order_type?: OrderType;
          status?: TradeStatus;
          token_amount: string;
          native_amount: number;
          usd_amount: number;
          price_native: number;
          price_usd: number;
          slippage_tolerance: number;
          actual_slippage?: number | null;
          transaction_fee?: number;
          platform_fee?: number;
          total_fee?: number;
          transaction_signature?: string | null;
          block_number?: number | null;
          chain: Chain;
          dex?: string | null;
          pool_address?: string | null;
          priority?: string;
          estimated_completion?: string | null;
          error_message?: string | null;
          retry_count?: number;
          metadata?: unknown | null;
          created_at?: string;
          submitted_at?: string | null;
          confirmed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          token_id?: string;
          token_address?: string;
          wallet_address?: string;
          user_id?: string | null;
          trade_type?: TradeType;
          order_type?: OrderType;
          status?: TradeStatus;
          token_amount?: string;
          native_amount?: number;
          usd_amount?: number;
          price_native?: number;
          price_usd?: number;
          slippage_tolerance?: number;
          actual_slippage?: number | null;
          transaction_fee?: number;
          platform_fee?: number;
          total_fee?: number;
          transaction_signature?: string | null;
          block_number?: number | null;
          chain?: Chain;
          dex?: string | null;
          pool_address?: string | null;
          priority?: string;
          estimated_completion?: string | null;
          error_message?: string | null;
          retry_count?: number;
          metadata?: unknown | null;
          created_at?: string;
          submitted_at?: string | null;
          confirmed_at?: string | null;
          updated_at?: string;
        };
      };

      // Users table
      users: {
        Row: {
          id: string;
          wallet_address: string;
          email: string | null;
          email_verified: boolean;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          status: UserStatus;
          verification_status: UserVerificationStatus;
          subscription_tier: string;
          is_creator: boolean;
          tokens_created: number;
          trades_count: number;
          total_volume_usd: number;
          total_pnl_usd: number;
          referral_code: string | null;
          referred_by: string | null;
          referrals_count: number;
          last_login_at: string | null;
          last_activity_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          email?: string | null;
          email_verified?: boolean;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          status?: UserStatus;
          verification_status?: UserVerificationStatus;
          subscription_tier?: string;
          is_creator?: boolean;
          tokens_created?: number;
          trades_count?: number;
          total_volume_usd?: number;
          total_pnl_usd?: number;
          referral_code?: string | null;
          referred_by?: string | null;
          referrals_count?: number;
          last_login_at?: string | null;
          last_activity_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          email?: string | null;
          email_verified?: boolean;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          status?: UserStatus;
          verification_status?: UserVerificationStatus;
          subscription_tier?: string;
          is_creator?: boolean;
          tokens_created?: number;
          trades_count?: number;
          total_volume_usd?: number;
          total_pnl_usd?: number;
          referral_code?: string | null;
          referred_by?: string | null;
          referrals_count?: number;
          last_login_at?: string | null;
          last_activity_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      chain: Chain;
      verification_tier: VerificationTier;
      risk_level: RiskLevel;
      token_status: TokenStatus;
      trade_type: TradeType;
      trade_status: TradeStatus;
      order_type: OrderType;
      user_role: UserRole;
      user_status: UserStatus;
      verification_status: UserVerificationStatus;
      security_check_status: SecurityCheckStatus;
    };
  };
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Extract table row type
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/**
 * Extract table insert type
 */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/**
 * Extract table update type
 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/**
 * Table names
 */
export type TableName = keyof Database['public']['Tables'];

// =============================================================================
// EXPORTS
// =============================================================================

export default Database;
