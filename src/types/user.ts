/**
 * User Type Definitions
 *
 * Type definitions for user accounts and profiles in the ThunderLaunch platform.
 */

// =============================================================================
// ENUMS & LITERAL TYPES
// =============================================================================

/**
 * User role in the platform
 */
export type UserRole = 'user' | 'creator' | 'admin' | 'moderator';

/**
 * User account status
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned';

/**
 * Verification status
 */
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

/**
 * Notification preferences
 */
export type NotificationType =
  | 'all'
  | 'trades'
  | 'price_alerts'
  | 'security_alerts'
  | 'platform_updates'
  | 'marketing';

/**
 * Subscription tier
 */
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Main User interface
 */
export interface User {
  /** Unique identifier (UUID) */
  id: string;

  /** Primary wallet address */
  wallet_address: string;

  /** Email address (optional) */
  email?: string;

  /** Is email verified */
  email_verified: boolean;

  /** Username (optional) */
  username?: string;

  /** Display name */
  display_name?: string;

  /** Avatar URL */
  avatar_url?: string;

  /** Bio/description */
  bio?: string;

  /** User role */
  role: UserRole;

  /** Account status */
  status: UserStatus;

  /** Verification status */
  verification_status: VerificationStatus;

  /** Subscription tier */
  subscription_tier: SubscriptionTier;

  /** Is user a creator */
  is_creator: boolean;

  /** Number of tokens created */
  tokens_created: number;

  /** Number of successful trades */
  trades_count: number;

  /** Total trading volume in USD */
  total_volume_usd: number;

  /** Total profit/loss in USD */
  total_pnl_usd: number;

  /** Referral code */
  referral_code?: string;

  /** Referred by user ID */
  referred_by?: string;

  /** Number of referrals */
  referrals_count: number;

  /** Last login timestamp */
  last_login_at?: string;

  /** Last activity timestamp */
  last_activity_at?: string;

  /** Account creation timestamp */
  created_at: string;

  /** Last update timestamp */
  updated_at: string;
}

/**
 * User profile (public information)
 */
export interface UserProfile {
  /** User ID */
  id: string;

  /** Primary wallet address */
  wallet_address: string;

  /** Username */
  username?: string;

  /** Display name */
  display_name?: string;

  /** Avatar URL */
  avatar_url?: string;

  /** Bio */
  bio?: string;

  /** Verification status */
  verification_status: VerificationStatus;

  /** Is creator */
  is_creator: boolean;

  /** Number of tokens created */
  tokens_created: number;

  /** Number of trades */
  trades_count: number;

  /** Total volume (public metrics) */
  total_volume_usd: number;

  /** Social links */
  social_links?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };

  /** Joined timestamp */
  joined_at: string;
}

/**
 * User settings
 */
export interface UserSettings {
  /** User ID */
  user_id: string;

  /** Notification preferences */
  notifications: {
    email_enabled: boolean;
    push_enabled: boolean;
    types: NotificationType[];
  };

  /** Trading preferences */
  trading: {
    default_slippage: number;
    default_priority: 'slow' | 'medium' | 'fast' | 'ultra';
    auto_approve: boolean;
    expert_mode: boolean;
  };

  /** Display preferences */
  display: {
    theme: 'light' | 'dark' | 'system';
    currency: 'usd' | 'sol' | 'eth' | 'bnb';
    language: string;
    timezone: string;
  };

  /** Privacy settings */
  privacy: {
    show_portfolio: boolean;
    show_trades: boolean;
    show_profile: boolean;
  };

  /** Security settings */
  security: {
    two_factor_enabled: boolean;
    session_timeout: number; // in minutes
    require_confirmation: boolean;
  };

  /** Last updated */
  updated_at: string;
}

/**
 * User wallet information
 */
export interface UserWallet {
  /** Wallet address */
  address: string;

  /** User ID */
  user_id: string;

  /** Wallet label */
  label?: string;

  /** Is primary wallet */
  is_primary: boolean;

  /** Chain type */
  chain: 'solana' | 'ethereum' | 'bsc' | 'base';

  /** Wallet type */
  wallet_type: 'phantom' | 'solflare' | 'metamask' | 'walletconnect' | 'other';

  /** Last used timestamp */
  last_used_at?: string;

  /** Connected timestamp */
  connected_at: string;

  /** Is active */
  is_active: boolean;
}

/**
 * User activity log entry
 */
export interface UserActivity {
  /** Unique identifier */
  id: string;

  /** User ID */
  user_id: string;

  /** Activity type */
  activity_type:
    | 'login'
    | 'logout'
    | 'token_created'
    | 'trade_executed'
    | 'profile_updated'
    | 'settings_changed'
    | 'wallet_connected'
    | 'wallet_disconnected';

  /** Activity description */
  description: string;

  /** IP address */
  ip_address?: string;

  /** User agent */
  user_agent?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;

  /** Activity timestamp */
  created_at: string;
}

/**
 * User notification
 */
export interface UserNotification {
  /** Unique identifier */
  id: string;

  /** User ID */
  user_id: string;

  /** Notification type */
  type: NotificationType;

  /** Notification title */
  title: string;

  /** Notification message */
  message: string;

  /** Link/action URL */
  action_url?: string;

  /** Is read */
  is_read: boolean;

  /** Read at timestamp */
  read_at?: string;

  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'urgent';

  /** Additional data */
  data?: Record<string, unknown>;

  /** Expiration timestamp */
  expires_at?: string;

  /** Created timestamp */
  created_at: string;
}

/**
 * User verification request
 */
export interface UserVerificationRequest {
  /** Unique identifier */
  id: string;

  /** User ID */
  user_id: string;

  /** Verification type */
  verification_type: 'identity' | 'creator' | 'premium';

  /** Verification status */
  status: VerificationStatus;

  /** Submitted documents */
  documents: Array<{
    type: string;
    url: string;
    uploaded_at: string;
  }>;

  /** Verification notes */
  notes?: string;

  /** Rejection reason */
  rejection_reason?: string;

  /** Reviewed by admin ID */
  reviewed_by?: string;

  /** Review notes */
  review_notes?: string;

  /** Submitted timestamp */
  submitted_at: string;

  /** Reviewed timestamp */
  reviewed_at?: string;

  /** Expires at */
  expires_at?: string;
}

/**
 * User subscription
 */
export interface UserSubscription {
  /** Unique identifier */
  id: string;

  /** User ID */
  user_id: string;

  /** Subscription tier */
  tier: SubscriptionTier;

  /** Subscription status */
  status: 'active' | 'cancelled' | 'expired' | 'suspended';

  /** Billing period */
  billing_period: 'monthly' | 'yearly';

  /** Price in USD */
  price_usd: number;

  /** Payment method */
  payment_method?: string;

  /** Next billing date */
  next_billing_date?: string;

  /** Subscription start date */
  started_at: string;

  /** Subscription end date */
  ends_at?: string;

  /** Auto-renew enabled */
  auto_renew: boolean;

  /** Trial end date */
  trial_ends_at?: string;

  /** Is on trial */
  is_trial: boolean;

  /** Created timestamp */
  created_at: string;

  /** Updated timestamp */
  updated_at: string;
}

/**
 * User referral information
 */
export interface UserReferral {
  /** Unique identifier */
  id: string;

  /** Referrer user ID */
  referrer_id: string;

  /** Referred user ID */
  referred_id: string;

  /** Referral code used */
  referral_code: string;

  /** Reward amount in USD */
  reward_amount_usd: number;

  /** Reward status */
  reward_status: 'pending' | 'paid' | 'cancelled';

  /** Reward paid at */
  reward_paid_at?: string;

  /** Referred user's total volume */
  referred_user_volume_usd: number;

  /** Commission earned */
  commission_earned_usd: number;

  /** Created timestamp */
  created_at: string;

  /** Updated timestamp */
  updated_at: string;
}

/**
 * User API key (for programmatic access)
 */
export interface UserApiKey {
  /** Unique identifier */
  id: string;

  /** User ID */
  user_id: string;

  /** API key name/label */
  name: string;

  /** API key (hashed in database) */
  key: string;

  /** Permissions/scopes */
  scopes: Array<'read' | 'trade' | 'create_token' | 'admin'>;

  /** Is active */
  is_active: boolean;

  /** Last used timestamp */
  last_used_at?: string;

  /** Expiration timestamp */
  expires_at?: string;

  /** Created timestamp */
  created_at: string;
}

/**
 * User session
 */
export interface UserSession {
  /** Session ID */
  id: string;

  /** User ID */
  user_id: string;

  /** Session token (hashed) */
  token: string;

  /** IP address */
  ip_address: string;

  /** User agent */
  user_agent: string;

  /** Device info */
  device_info?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };

  /** Is active */
  is_active: boolean;

  /** Last activity timestamp */
  last_activity_at: string;

  /** Expires at */
  expires_at: string;

  /** Created timestamp */
  created_at: string;
}

/**
 * User statistics
 */
export interface UserStats {
  /** User ID */
  user_id: string;

  /** Portfolio value in USD */
  portfolio_value_usd: number;

  /** Total invested in USD */
  total_invested_usd: number;

  /** Total profit/loss in USD */
  total_pnl_usd: number;

  /** Total profit/loss percentage */
  total_pnl_percentage: number;

  /** Win rate percentage */
  win_rate: number;

  /** Total trades */
  total_trades: number;

  /** Successful trades */
  successful_trades: number;

  /** Failed trades */
  failed_trades: number;

  /** Total volume in USD */
  total_volume_usd: number;

  /** Total fees paid */
  total_fees_paid_usd: number;

  /** Tokens created */
  tokens_created: number;

  /** Active positions */
  active_positions: number;

  /** Total tokens held */
  total_tokens_held: number;

  /** Referral earnings */
  referral_earnings_usd: number;

  /** Last updated */
  updated_at: string;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && ['user', 'creator', 'admin', 'moderator'].includes(value);
}

/**
 * Type guard to check if a value is a valid UserStatus
 */
export function isUserStatus(value: unknown): value is UserStatus {
  return typeof value === 'string' && ['active', 'inactive', 'suspended', 'banned'].includes(value);
}

/**
 * Type guard to check if a value is a valid VerificationStatus
 */
export function isVerificationStatus(value: unknown): value is VerificationStatus {
  return typeof value === 'string' && ['unverified', 'pending', 'verified', 'rejected'].includes(value);
}

/**
 * Type guard to check if a value is a valid SubscriptionTier
 */
export function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return typeof value === 'string' && ['free', 'basic', 'pro', 'enterprise'].includes(value);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get display name for user
 */
export function getUserDisplayName(user: User | UserProfile): string {
  return user.display_name || user.username || `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`;
}

/**
 * Check if user has permission
 */
export function hasPermission(user: User, permission: 'create_token' | 'trade' | 'moderate' | 'admin'): boolean {
  const permissions: Record<UserRole, string[]> = {
    user: ['trade'],
    creator: ['trade', 'create_token'],
    moderator: ['trade', 'create_token', 'moderate'],
    admin: ['trade', 'create_token', 'moderate', 'admin'],
  };

  return permissions[user.role]?.includes(permission) || false;
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Get subscription features
 */
export function getSubscriptionFeatures(tier: SubscriptionTier): string[] {
  const features: Record<SubscriptionTier, string[]> = {
    free: ['Basic trading', 'Limited token creation', 'Standard support'],
    basic: ['Unlimited trading', 'Token creation', 'Email support', 'Basic analytics'],
    pro: [
      'Priority trading',
      'Advanced analytics',
      'API access',
      'Priority support',
      'Custom verification',
      'Reduced fees',
    ],
    enterprise: [
      'All Pro features',
      'Dedicated support',
      'Custom solutions',
      'White-label options',
      'Volume discounts',
    ],
  };

  return features[tier] || [];
}
