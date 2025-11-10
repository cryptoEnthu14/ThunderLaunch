/**
 * Token Type Definitions
 *
 * Type definitions for token-related data structures in the ThunderLaunch platform.
 */

// =============================================================================
// ENUMS & LITERAL TYPES
// =============================================================================

/**
 * Supported blockchain networks
 */
export type Chain = 'solana' | 'base' | 'bnb';

/**
 * Verification tier levels for tokens
 */
export type VerificationTier = 'free' | 'verified' | 'premium';

/**
 * Risk assessment levels
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Token status in the platform
 */
export type TokenStatus = 'draft' | 'pending' | 'active' | 'paused' | 'delisted';

/**
 * Token standard types
 */
export type TokenStandard = 'spl-token' | 'erc20' | 'bep20';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Main Token interface representing a token in the database
 */
export interface Token {
  /** Unique identifier (UUID) */
  id: string;

  /** On-chain mint/contract address */
  mint_address: string;

  /** Token name (e.g., "Thunder Token") */
  name: string;

  /** Token symbol (e.g., "THDR") */
  symbol: string;

  /** Detailed description of the token */
  description: string | null;

  /** URL to token logo/image */
  image_url: string | null;

  /** Creator's wallet address */
  creator_wallet: string;

  /** Total supply of tokens */
  total_supply: string; // Use string to avoid precision issues with large numbers

  /** Current price in USD */
  current_price: number;

  /** Market capitalization in USD */
  market_cap: number;

  /** Total liquidity in USD */
  liquidity: number;

  /** Number of unique token holders */
  holders_count: number;

  /** Calculated risk score (0-100) */
  risk_score: number;

  /** Risk level based on risk_score */
  risk_level: RiskLevel;

  /** Verification tier of the token */
  verification_tier: VerificationTier;

  /** Blockchain network */
  chain: Chain;

  /** Token standard */
  token_standard: TokenStandard;

  /** Token status */
  status: TokenStatus;

  /** Token decimals */
  decimals: number;

  /** Website URL */
  website_url: string | null;

  /** Twitter handle */
  twitter_handle: string | null;

  /** Telegram group */
  telegram_url: string | null;

  /** Discord server */
  discord_url: string | null;

  /** Whitepaper URL */
  whitepaper_url: string | null;

  /** Metadata URI (IPFS, Arweave, etc.) */
  metadata_uri: string | null;

  /** Is token tradable */
  is_tradable: boolean;

  /** Is token burnable */
  is_burnable: boolean;

  /** Is token mintable (can create more supply) */
  is_mintable: boolean;

  /** Platform fee paid in SOL */
  fee_paid: number;

  /** Transaction signature of token creation */
  creation_tx_signature: string | null;

  /** 24h price change percentage */
  price_change_24h: number;

  /** 24h volume in USD */
  volume_24h: number;

  /** Total volume in USD */
  total_volume: number;

  /** Number of trades */
  trades_count: number;

  /** Timestamp of token creation */
  created_at: string; // ISO 8601 format

  /** Timestamp of last update */
  updated_at: string; // ISO 8601 format
}

/**
 * Input data for creating a new token
 */
export interface TokenCreationInput {
  /** Token name */
  name: string;

  /** Token symbol */
  symbol: string;

  /** Token description */
  description?: string;

  /** Token image/logo */
  image_url?: string;

  /** Total supply */
  total_supply: string;

  /** Token decimals (usually 9 for Solana) */
  decimals: number;

  /** Blockchain network */
  chain: Chain;

  /** Initial liquidity in native token (SOL, ETH, BNB) */
  initial_liquidity: number;

  /** Website URL */
  website_url?: string;

  /** Twitter handle (without @) */
  twitter_handle?: string;

  /** Telegram group URL */
  telegram_url?: string;

  /** Discord server URL */
  discord_url?: string;

  /** Whitepaper URL */
  whitepaper_url?: string;

  /** Metadata URI */
  metadata_uri?: string;

  /** Is token burnable */
  is_burnable?: boolean;

  /** Is token mintable */
  is_mintable?: boolean;

  /** Verification tier */
  verification_tier?: VerificationTier;
}

/**
 * Token update data
 */
export interface TokenUpdateInput {
  /** Updated description */
  description?: string;

  /** Updated image URL */
  image_url?: string;

  /** Updated website URL */
  website_url?: string;

  /** Updated Twitter handle */
  twitter_handle?: string;

  /** Updated Telegram URL */
  telegram_url?: string;

  /** Updated Discord URL */
  discord_url?: string;

  /** Updated whitepaper URL */
  whitepaper_url?: string;

  /** Updated metadata URI */
  metadata_uri?: string;

  /** Updated status */
  status?: TokenStatus;
}

/**
 * Token metrics/statistics
 */
export interface TokenMetrics {
  /** Token ID */
  token_id: string;

  /** Current price in USD */
  price_usd: number;

  /** Price in native token (SOL, ETH, BNB) */
  price_native: number;

  /** Market cap in USD */
  market_cap: number;

  /** Fully diluted valuation */
  fdv: number;

  /** Total liquidity */
  liquidity_usd: number;

  /** Number of holders */
  holders: number;

  /** 24h price change % */
  price_change_24h: number;

  /** 7d price change % */
  price_change_7d: number;

  /** 24h volume */
  volume_24h: number;

  /** 7d volume */
  volume_7d: number;

  /** All-time high price */
  ath_price: number;

  /** All-time high timestamp */
  ath_timestamp: string;

  /** All-time low price */
  atl_price: number;

  /** All-time low timestamp */
  atl_timestamp: string;

  /** Last updated timestamp */
  updated_at: string;
}

/**
 * Token holder information
 */
export interface TokenHolder {
  /** Wallet address */
  wallet_address: string;

  /** Token address */
  token_address: string;

  /** Balance (as string to avoid precision issues) */
  balance: string;

  /** Percentage of total supply */
  percentage: number;

  /** Is this a known wallet (exchange, dev, etc.) */
  is_known: boolean;

  /** Label for known wallets */
  label?: string;

  /** First acquisition timestamp */
  first_tx_at: string;

  /** Last transaction timestamp */
  last_tx_at: string;
}

/**
 * Token price history point
 */
export interface TokenPriceHistory {
  /** Token ID */
  token_id: string;

  /** Timestamp */
  timestamp: string;

  /** Price in USD */
  price_usd: number;

  /** Price in native token */
  price_native: number;

  /** Volume at this point */
  volume: number;

  /** Market cap at this point */
  market_cap: number;

  /** Liquidity at this point */
  liquidity: number;
}

/**
 * Token search filters
 */
export interface TokenFilters {
  /** Filter by chain */
  chain?: Chain;

  /** Filter by verification tier */
  verification_tier?: VerificationTier;

  /** Filter by risk level */
  risk_level?: RiskLevel;

  /** Filter by status */
  status?: TokenStatus;

  /** Minimum market cap */
  min_market_cap?: number;

  /** Maximum market cap */
  max_market_cap?: number;

  /** Minimum liquidity */
  min_liquidity?: number;

  /** Maximum liquidity */
  max_liquidity?: number;

  /** Minimum holders count */
  min_holders?: number;

  /** Search query (name or symbol) */
  search?: string;

  /** Sort by field */
  sort_by?: 'created_at' | 'market_cap' | 'volume_24h' | 'holders_count' | 'price_change_24h';

  /** Sort order */
  sort_order?: 'asc' | 'desc';

  /** Page number */
  page?: number;

  /** Items per page */
  limit?: number;
}

/**
 * Token list response
 */
export interface TokenListResponse {
  /** List of tokens */
  tokens: Token[];

  /** Total count of tokens */
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
 * Type guard to check if a value is a valid Chain
 */
export function isChain(value: unknown): value is Chain {
  return typeof value === 'string' && ['solana', 'base', 'bnb'].includes(value);
}

/**
 * Type guard to check if a value is a valid VerificationTier
 */
export function isVerificationTier(value: unknown): value is VerificationTier {
  return typeof value === 'string' && ['free', 'verified', 'premium'].includes(value);
}

/**
 * Type guard to check if a value is a valid RiskLevel
 */
export function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === 'string' && ['low', 'medium', 'high', 'critical'].includes(value);
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Partial token for preview/list views
 */
export type TokenPreview = Pick<
  Token,
  | 'id'
  | 'mint_address'
  | 'name'
  | 'symbol'
  | 'image_url'
  | 'current_price'
  | 'market_cap'
  | 'price_change_24h'
  | 'volume_24h'
  | 'verification_tier'
  | 'chain'
>;

/**
 * Token with metrics
 */
export type TokenWithMetrics = Token & {
  metrics: TokenMetrics;
};
