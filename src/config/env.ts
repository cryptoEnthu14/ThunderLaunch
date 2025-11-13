/**
 * Environment Configuration
 *
 * Centralized environment variable access with type safety and validation.
 * All environment variables should be accessed through this file.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta';
export type Environment = 'development' | 'staging' | 'production';
export type Commitment = 'processed' | 'confirmed' | 'finalized';
export type GraduationDestination = 'raydium' | 'orca' | 'jupiter';

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

export const env = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Solana
  solana: {
    network: (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as SolanaNetwork,
    rpcEndpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com',
    wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS_ENDPOINT || 'wss://api.devnet.solana.com',
    commitment: (process.env.NEXT_PUBLIC_SOLANA_COMMITMENT || 'confirmed') as Commitment,
  },

  // Application
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: (process.env.NEXT_PUBLIC_ENVIRONMENT || 'development') as Environment,
  },

  // Platform Configuration
  platform: {
    feePercentage: parseFloat(process.env.NEXT_PUBLIC_FEE_PERCENTAGE || '1.0'),
    minLiquidity: parseInt(process.env.NEXT_PUBLIC_MIN_LIQUIDITY || '1000', 10),
    maxTokenSupply: parseInt(process.env.NEXT_PUBLIC_MAX_TOKEN_SUPPLY || '1000000000', 10),
    minTokenSupply: parseInt(process.env.NEXT_PUBLIC_MIN_TOKEN_SUPPLY || '1000', 10),
    estimatedTxFee: parseFloat(process.env.NEXT_PUBLIC_ESTIMATED_TX_FEE || '0.001'),
  },

  // Wallet Addresses
  wallets: {
    feeWallet: process.env.NEXT_PUBLIC_FEE_WALLET_ADDRESS || '',
    treasury: process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS || '',
  },

  // Analytics
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  },

  // Error Tracking
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    authToken: process.env.SENTRY_AUTH_TOKEN || '',
  },

  // IPFS/Storage
  ipfs: {
    gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
    pinataApiKey: process.env.PINATA_API_KEY || '',
    pinataSecretKey: process.env.PINATA_SECRET_KEY || '',
  },

  // Security
  security: {
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100', 10),
    apiSecretKey: process.env.API_SECRET_KEY || '',
    jwtSecret: process.env.JWT_SECRET || '',
  },

  // Feature Flags
  features: {
    enableTestnet: process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true',
    enableMainnet: process.env.NEXT_PUBLIC_ENABLE_MAINNET === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    enableReferrals: process.env.NEXT_PUBLIC_ENABLE_REFERRALS === 'true',
  },

  // Development
  dev: {
    skipSignatureVerification: process.env.DEV_SKIP_SIGNATURE_VERIFICATION === 'true',
    mockTransactions: process.env.DEV_MOCK_TRANSACTIONS === 'true',
    debug: process.env.DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === 'true',
  },

  // Graduation / Liquidity
  graduation: {
    destination: (process.env.NEXT_PUBLIC_GRADUATION_DEX || 'raydium') as GraduationDestination,
  },
} as const;

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates required environment variables
 * Throws an error if any required variables are missing
 */
export function validateEnv() {
  const errors: string[] = [];

  // Check Supabase (required for production)
  if (env.app.environment === 'production') {
    if (!env.supabase.url) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
    }
    if (!env.supabase.anonKey) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
    }
  }

  // Check Solana RPC
  if (!env.solana.rpcEndpoint) {
    errors.push('NEXT_PUBLIC_SOLANA_RPC_ENDPOINT is required');
  }

  // Check wallet addresses for production
  if (env.app.environment === 'production') {
    if (!env.wallets.feeWallet) {
      errors.push('NEXT_PUBLIC_FEE_WALLET_ADDRESS is required for production');
    }
    if (!env.wallets.treasury) {
      errors.push('NEXT_PUBLIC_TREASURY_WALLET_ADDRESS is required for production');
    }
  }

  // Validate network settings
  const validNetworks: SolanaNetwork[] = ['devnet', 'testnet', 'mainnet-beta'];
  if (!validNetworks.includes(env.solana.network)) {
    errors.push(`Invalid SOLANA_NETWORK: ${env.solana.network}. Must be one of: ${validNetworks.join(', ')}`);
  }

  const validDex: GraduationDestination[] = ['raydium', 'orca', 'jupiter'];
  if (!validDex.includes(env.graduation.destination)) {
    errors.push(`Invalid NEXT_PUBLIC_GRADUATION_DEX: ${env.graduation.destination}. Must be one of: ${validDex.join(', ')}`);
  }

  // Throw error if any validation failed
  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Check if running in development mode
 */
export const isDevelopment = env.app.environment === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.app.environment === 'production';

/**
 * Check if running in staging mode
 */
export const isStaging = env.app.environment === 'staging';

/**
 * Check if using devnet
 */
export const isDevnet = env.solana.network === 'devnet';

/**
 * Check if using testnet
 */
export const isTestnet = env.solana.network === 'testnet';

/**
 * Check if using mainnet
 */
export const isMainnet = env.solana.network === 'mainnet-beta';

/**
 * Get Solana explorer URL for the current network
 */
export function getExplorerUrl(address: string, type: 'tx' | 'address' = 'address'): string {
  const cluster = isMainnet ? '' : `?cluster=${env.solana.network}`;
  return `https://explorer.solana.com/${type}/${address}${cluster}`;
}

/**
 * Get Solscan URL for the current network
 */
export function getSolscanUrl(address: string, type: 'tx' | 'account' | 'token' = 'account'): string {
  const cluster = isMainnet ? '' : `?cluster=${env.solana.network}`;
  return `https://solscan.io/${type}/${address}${cluster}`;
}

// =============================================================================
// VALIDATION ON IMPORT (only in production)
// =============================================================================

if (isProduction && typeof window === 'undefined') {
  // Only validate on server-side in production
  try {
    validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // In production, we want to fail fast
    throw error;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default env;
