/**
 * Platform Constants
 *
 * Application-wide constants including fees, limits, thresholds, and configuration values.
 */

import { env } from './env';

// =============================================================================
// PLATFORM CONFIGURATION
// =============================================================================

/**
 * Platform fee percentage (1.0 = 1%)
 */
export const PLATFORM_FEE_PERCENTAGE = env.platform.feePercentage;

/**
 * Minimum liquidity required to launch a token (in native token)
 */
export const MIN_LIQUIDITY = env.platform.minLiquidity;

/**
 * Maximum liquidity allowed
 */
export const MAX_LIQUIDITY = 1_000_000;

/**
 * Default token supply
 */
export const DEFAULT_TOKEN_SUPPLY = 1_000_000;

/**
 * Minimum token supply allowed
 */
export const MIN_TOKEN_SUPPLY = env.platform.minTokenSupply;

/**
 * Maximum token supply allowed
 */
export const MAX_TOKEN_SUPPLY = env.platform.maxTokenSupply;

/**
 * Default token decimals for new tokens
 */
export const DEFAULT_TOKEN_DECIMALS = {
  solana: 9,
  base: 18,
  bnb: 18,
} as const;

/**
 * Estimated transaction fee (in native token)
 */
export const ESTIMATED_TX_FEE = env.platform.estimatedTxFee;

// =============================================================================
// THEME COLORS
// =============================================================================

/**
 * Platform theme colors
 */
export const THEME_COLORS = {
  // Primary colors
  thunderBlue: '#0066FF',
  lightningYellow: '#FFD700',
  thunderPurple: '#8B5CF6',

  // Status colors
  safetyGreen: '#10B981',
  warningOrange: '#F59E0B',
  dangerRed: '#EF4444',

  // Additional colors
  success: '#10B981',
  info: '#3B82F6',
  warning: '#F59E0B',
  error: '#EF4444',

  // Neutral colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

// =============================================================================
// SECURITY & RISK THRESHOLDS
// =============================================================================

/**
 * Security check thresholds
 */
export const SECURITY_THRESHOLDS = {
  /** Holder concentration thresholds (percentage) */
  holderConcentration: {
    critical: 50, // Top holder owns >50%
    high: 30,     // Top holder owns >30%
    medium: 20,   // Top holder owns >20%
    low: 10,      // Top holder owns >10%
  },

  /** Liquidity ratio thresholds (liquidity / market cap) */
  liquidityRatio: {
    critical: 0.01, // <1% liquidity
    high: 0.05,     // <5% liquidity
    medium: 0.1,    // <10% liquidity
    low: 0.2,       // <20% liquidity
  },

  /** Locked liquidity percentage thresholds */
  lockedLiquidity: {
    critical: 0,    // 0% locked
    high: 25,       // <25% locked
    medium: 50,     // <50% locked
    low: 75,        // <75% locked
  },

  /** Tax thresholds (percentage) */
  tax: {
    critical: 20,   // >20% tax
    high: 10,       // >10% tax
    medium: 5,      // >5% tax
    low: 2,         // >2% tax
  },

  /** Maximum transaction limit (percentage of supply) */
  maxTransaction: {
    critical: 1,    // <1% of supply
    high: 2,        // <2% of supply
    medium: 5,      // <5% of supply
    low: 10,        // <10% of supply
  },
} as const;

/**
 * Risk score ranges (0-100)
 */
export const RISK_SCORE_RANGES = {
  low: { min: 0, max: 25 },
  medium: { min: 26, max: 50 },
  high: { min: 51, max: 75 },
  critical: { min: 76, max: 100 },
} as const;

/**
 * Security check weights for risk score calculation
 */
export const SECURITY_CHECK_WEIGHTS = {
  ownership_renounced: 0.15,
  liquidity_locked: 0.15,
  honeypot: 0.2,
  max_transaction_limit: 0.1,
  max_wallet_limit: 0.05,
  blacklist_function: 0.1,
  proxy_contract: 0.05,
  mint_function: 0.1,
  freeze_authority: 0.05,
  update_authority: 0.05,
  top_holders_concentration: 0.1,
  liquidity_ratio: 0.1,
  contract_verified: 0.05,
  audit_completed: 0.05,
  rugpull_risk: 0.15,
} as const;

// =============================================================================
// TRADING CONFIGURATION
// =============================================================================

/**
 * Default slippage tolerance (percentage)
 */
export const DEFAULT_SLIPPAGE = 1.0;

/**
 * Maximum slippage allowed (percentage)
 */
export const MAX_SLIPPAGE = 50;

/**
 * Minimum slippage (percentage)
 */
export const MIN_SLIPPAGE = 0.1;

/**
 * Transaction priority levels and their multipliers
 */
export const TRANSACTION_PRIORITIES = {
  slow: { label: 'Slow', multiplier: 1, estimatedTime: '~60s' },
  medium: { label: 'Medium', multiplier: 1.5, estimatedTime: '~30s' },
  fast: { label: 'Fast', multiplier: 2, estimatedTime: '~15s' },
  ultra: { label: 'Ultra', multiplier: 3, estimatedTime: '~5s' },
} as const;

/**
 * Minimum trade amounts (in USD)
 */
export const MIN_TRADE_AMOUNTS = {
  solana: 0.01,
  base: 0.01,
  bnb: 0.01,
} as const;

/**
 * Maximum trade amounts (in USD)
 */
export const MAX_TRADE_AMOUNTS = {
  solana: 1_000_000,
  base: 1_000_000,
  bnb: 1_000_000,
} as const;

// =============================================================================
// VERIFICATION TIERS
// =============================================================================

/**
 * Verification tier features and limits
 */
export const VERIFICATION_TIERS = {
  free: {
    label: 'Free',
    price: 0,
    features: [
      'Basic token creation',
      'Standard security checks',
      'Community support',
    ],
    limits: {
      tokensPerMonth: 3,
      customMetadata: false,
      prioritySupport: false,
      advancedAnalytics: false,
    },
  },
  verified: {
    label: 'Verified',
    price: 100, // in USD
    features: [
      'Unlimited token creation',
      'Enhanced security checks',
      'Custom token metadata',
      'Email support',
      'Verified badge',
    ],
    limits: {
      tokensPerMonth: Infinity,
      customMetadata: true,
      prioritySupport: false,
      advancedAnalytics: true,
    },
  },
  premium: {
    label: 'Premium',
    price: 500, // in USD
    features: [
      'All Verified features',
      'Priority support',
      'Custom branding',
      'API access',
      'Advanced analytics',
      'Audit assistance',
    ],
    limits: {
      tokensPerMonth: Infinity,
      customMetadata: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
  },
} as const;

// =============================================================================
// PAGINATION & LIMITS
// =============================================================================

/**
 * Default items per page for lists
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum items per page
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Minimum items per page
 */
export const MIN_PAGE_SIZE = 5;

/**
 * Available page size options
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// =============================================================================
// TIME PERIODS
// =============================================================================

/**
 * Time period configurations for charts and analytics
 */
export const TIME_PERIODS = {
  '1h': { label: '1 Hour', duration: 60 * 60, interval: 60 },
  '24h': { label: '24 Hours', duration: 24 * 60 * 60, interval: 60 * 5 },
  '7d': { label: '7 Days', duration: 7 * 24 * 60 * 60, interval: 60 * 60 },
  '30d': { label: '30 Days', duration: 30 * 24 * 60 * 60, interval: 60 * 60 * 6 },
  '90d': { label: '90 Days', duration: 90 * 24 * 60 * 60, interval: 60 * 60 * 24 },
  '1y': { label: '1 Year', duration: 365 * 24 * 60 * 60, interval: 60 * 60 * 24 * 7 },
  all: { label: 'All Time', duration: Infinity, interval: 60 * 60 * 24 * 7 },
} as const;

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * API rate limits (requests per minute)
 */
export const RATE_LIMITS = {
  anonymous: 10,
  authenticated: 60,
  premium: 300,
  admin: Infinity,
} as const;

/**
 * Rate limit window (in seconds)
 */
export const RATE_LIMIT_WINDOW = 60;

// =============================================================================
// CACHE DURATIONS
// =============================================================================

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATIONS = {
  tokenList: 30,        // 30 seconds
  tokenDetails: 10,     // 10 seconds
  priceData: 5,         // 5 seconds
  chartData: 60,        // 1 minute
  userProfile: 300,     // 5 minutes
  securityCheck: 3600,  // 1 hour
  staticContent: 86400, // 24 hours
} as const;

// =============================================================================
// FILE UPLOAD LIMITS
// =============================================================================

/**
 * File upload configuration
 */
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    document: ['application/pdf'],
  },
  maxFiles: 5,
} as const;

// =============================================================================
// NOTIFICATION SETTINGS
// =============================================================================

/**
 * Notification display duration (in milliseconds)
 */
export const NOTIFICATION_DURATION = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
} as const;

/**
 * Maximum notifications to show at once
 */
export const MAX_NOTIFICATIONS = 3;

// =============================================================================
// CHART CONFIGURATION
// =============================================================================

/**
 * Chart color schemes
 */
export const CHART_COLORS = {
  primary: THEME_COLORS.thunderBlue,
  success: THEME_COLORS.safetyGreen,
  danger: THEME_COLORS.dangerRed,
  warning: THEME_COLORS.warningOrange,
  info: THEME_COLORS.info,
  gradient: {
    start: THEME_COLORS.thunderBlue,
    end: THEME_COLORS.thunderPurple,
  },
} as const;

/**
 * Maximum data points for charts
 */
export const MAX_CHART_DATA_POINTS = 1000;

// =============================================================================
// VALIDATION RULES
// =============================================================================

/**
 * Input validation rules
 */
export const VALIDATION_RULES = {
  tokenName: {
    minLength: 1,
    maxLength: 32,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
  },
  tokenSymbol: {
    minLength: 1,
    maxLength: 10,
    pattern: /^[A-Z0-9]+$/,
  },
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  url: {
    pattern: /^https?:\/\/.+/,
  },
  walletAddress: {
    solana: {
      minLength: 32,
      maxLength: 44,
      pattern: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    },
    evm: {
      minLength: 42,
      maxLength: 42,
      pattern: /^0x[a-fA-F0-9]{40}$/,
    },
  },
} as const;

// =============================================================================
// FEATURE FLAGS (from environment)
// =============================================================================

/**
 * Feature flags
 */
export const FEATURES = {
  enableTestnet: env.features.enableTestnet,
  enableMainnet: env.features.enableMainnet,
  enableAnalytics: env.features.enableAnalytics,
  enableNotifications: env.features.enableNotifications,
  enableReferrals: env.features.enableReferrals,
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  // Token endpoints
  tokens: '/api/tokens',
  tokenCreate: '/api/tokens/create',
  tokenDetails: (id: string) => `/api/tokens/${id}`,

  // Trade endpoints
  trades: '/api/trades',
  tradeQuote: '/api/trades/quote',
  tradeExecute: '/api/trades/execute',

  // User endpoints
  user: '/api/user',
  userProfile: (address: string) => `/api/user/${address}`,
  userStats: '/api/user/stats',

  // Security endpoints
  security: '/api/security',
  securityCheck: (tokenId: string) => `/api/security/${tokenId}`,

  // Analytics endpoints
  analytics: '/api/analytics',
  chartData: '/api/analytics/chart',
} as const;

// =============================================================================
// EXTERNAL SERVICES
// =============================================================================

/**
 * External service URLs
 */
export const EXTERNAL_SERVICES = {
  coingecko: 'https://api.coingecko.com/api/v3',
  dexscreener: 'https://api.dexscreener.com',
  birdeye: 'https://public-api.birdeye.so',
  helius: 'https://api.helius.xyz',
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  PLATFORM_FEE_PERCENTAGE,
  MIN_LIQUIDITY,
  MAX_LIQUIDITY,
  DEFAULT_TOKEN_SUPPLY,
  THEME_COLORS,
  SECURITY_THRESHOLDS,
  RISK_SCORE_RANGES,
  DEFAULT_SLIPPAGE,
  VERIFICATION_TIERS,
  TIME_PERIODS,
  CACHE_DURATIONS,
  FEATURES,
} as const;
