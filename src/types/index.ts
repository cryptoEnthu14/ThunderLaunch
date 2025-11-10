/**
 * Type Definitions Index
 *
 * Central export point for all TypeScript type definitions in the ThunderLaunch platform.
 *
 * @example
 * ```typescript
 * // Import specific types
 * import { Token, User, Trade } from '@/types';
 *
 * // Import all types from a category
 * import type * as TokenTypes from '@/types/token';
 * import type * as UserTypes from '@/types/user';
 * ```
 */

// Import Chain type for use in this file
import type { Chain } from './token';

// =============================================================================
// TOKEN TYPES
// =============================================================================

export type {
  // Main interfaces
  Token,
  TokenCreationInput,
  TokenUpdateInput,
  TokenMetrics,
  TokenHolder,
  TokenPriceHistory,
  TokenFilters,
  TokenListResponse,
  TokenPreview,
  TokenWithMetrics,
  // Enums & Literal Types
  Chain,
  VerificationTier,
  RiskLevel,
  TokenStatus,
  TokenStandard,
} from './token';

export {
  // Type guards
  isChain,
  isVerificationTier,
  isRiskLevel,
} from './token';

// =============================================================================
// SECURITY TYPES
// =============================================================================

export type {
  // Main interfaces
  SecurityCheck,
  SecurityFinding,
  SecurityCheckConfig,
  OwnershipAnalysis,
  LiquidityAnalysis,
  HolderConcentration,
  HoneypotCheck,
  ContractVerification,
  SecurityReport,
  SecurityAlert,
  SecurityAuditRequest,
  // Enums & Literal Types
  SecurityCheckType,
  SecuritySeverity,
  SecurityCheckStatus,
  SecurityCheckResult,
} from './security';

export {
  // Type guards
  isSecurityCheckType,
  isSecuritySeverity,
  isSecurityCheckResult,
  // Helper functions
  getSeverityColor,
  calculateRiskScore,
} from './security';

// =============================================================================
// TRADE TYPES
// =============================================================================

export type {
  // Main interfaces
  Trade,
  TradeInput,
  TradeQuote,
  OrderBook,
  OrderBookEntry,
  TradingPair,
  TradingStats,
  PriceAlert,
  PortfolioPosition,
  TradeFilters,
  TradeListResponse,
  // Enums & Literal Types
  TradeType,
  TradeStatus,
  OrderType,
  TimeInForce,
  TransactionPriority,
} from './trade';

export {
  // Type guards
  isTradeType,
  isTradeStatus,
  isOrderType,
  // Helper functions
  getTradeStatusColor,
  formatTradeType,
  calculatePnL,
} from './trade';

// =============================================================================
// USER TYPES
// =============================================================================

export type {
  // Main interfaces
  User,
  UserProfile,
  UserSettings,
  UserWallet,
  UserActivity,
  UserNotification,
  UserVerificationRequest,
  UserSubscription,
  UserReferral,
  UserApiKey,
  UserSession,
  UserStats,
  // Enums & Literal Types
  UserRole,
  UserStatus,
  VerificationStatus,
  NotificationType,
  SubscriptionTier,
} from './user';

export {
  // Type guards
  isUserRole,
  isUserStatus,
  isVerificationStatus,
  isSubscriptionTier,
  // Helper functions
  getUserDisplayName,
  hasPermission,
  formatWalletAddress,
  getSubscriptionFeatures,
} from './user';

// =============================================================================
// COMMON/SHARED TYPES
// =============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Error message (if any) */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Timestamp */
  timestamp: string;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  /** List of items */
  items: T[];
  /** Total count */
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

/**
 * Generic error response
 */
export interface ApiError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Field-specific errors */
  errors?: Record<string, string[]>;
  /** Additional details */
  details?: Record<string, unknown>;
  /** Timestamp */
  timestamp: string;
}

/**
 * Sort options
 */
export interface SortOptions {
  /** Field to sort by */
  field: string;
  /** Sort order */
  order: 'asc' | 'desc';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Sort options */
  sort?: SortOptions;
}

/**
 * Date range filter
 */
export interface DateRange {
  /** Start date (ISO 8601) */
  start: string;
  /** End date (ISO 8601) */
  end: string;
}

/**
 * Price range filter
 */
export interface PriceRange {
  /** Minimum price */
  min: number;
  /** Maximum price */
  max: number;
}

/**
 * Amount range filter
 */
export interface AmountRange {
  /** Minimum amount */
  min: string;
  /** Maximum amount */
  max: string;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  /** Timestamp or x-axis label */
  timestamp: string;
  /** Value or y-axis value */
  value: number;
  /** Additional data */
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Time period for analytics
 */
export type TimePeriod = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Form field error
 */
export interface FieldError {
  /** Field name */
  field: string;
  /** Error message */
  message: string;
}

/**
 * Upload file info
 */
export interface UploadedFile {
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** File URL after upload */
  url: string;
  /** Upload timestamp */
  uploaded_at: string;
}

/**
 * Wallet connection info
 */
export interface WalletConnection {
  /** Wallet address */
  address: string;
  /** Wallet type */
  type: 'phantom' | 'solflare' | 'metamask' | 'walletconnect' | 'other';
  /** Is connected */
  connected: boolean;
  /** Chain */
  chain: Chain;
  /** Balance in native token */
  balance?: number;
}

// =============================================================================
// TYPE UTILITIES
// =============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of type T where value is of type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Omit properties by value type
 */
export type OmitByType<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

/**
 * Pick properties by value type
 */
export type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

/**
 * Make specific keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// =============================================================================
// RE-EXPORT EVERYTHING
// =============================================================================

// Re-export all types from individual modules for convenience
export * from './token';
export * from './security';
export * from './trade';
export * from './user';
