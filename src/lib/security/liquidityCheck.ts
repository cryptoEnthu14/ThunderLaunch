/**
 * Liquidity Check Module
 *
 * Analyzes token liquidity and checks if liquidity is locked.
 * Locked liquidity prevents rug pulls by ensuring DEX pools
 * cannot be drained by developers.
 *
 * Key checks:
 * - Liquidity lock status
 * - Lock duration
 * - Lock contract verification
 * - Liquidity to market cap ratio
 */

import { PublicKey } from '@solana/web3.js';
import { connection } from '../solana/connection';
import type { LiquidityAnalysis } from '@/types/security';

/**
 * Error class for liquidity check failures
 */
export class LiquidityCheckError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'LiquidityCheckError';
  }
}

/**
 * Liquidity pool information
 */
export interface LiquidityPool {
  /** DEX name (Raydium, Orca, etc.) */
  dex: string;
  /** Pool/pair address */
  pair_address: string;
  /** Liquidity in USD */
  liquidity_usd: number;
  /** Liquidity in native token (SOL) */
  liquidity_native: number;
  /** Is liquidity locked */
  is_locked: boolean;
  /** Lock expiration date */
  lock_expires_at?: string;
}

/**
 * Lock contract information
 */
export interface LockContract {
  /** Lock contract address */
  address: string;
  /** Locked amount */
  locked_amount: string;
  /** Lock expiration timestamp */
  expires_at: string;
  /** Is lock verified */
  is_verified: boolean;
}

/**
 * Check if liquidity is locked
 *
 * Checks if DEX liquidity pools have their LP tokens locked
 * in a verified lock contract.
 *
 * @param tokenAddress - Token mint address
 * @returns True if liquidity is locked
 *
 * @example
 * ```typescript
 * const isLocked = await checkLiquidityLock('So11111...');
 * if (isLocked) {
 *   console.log('✓ Liquidity is locked - safe from rug pull');
 * } else {
 *   console.log('⚠ Liquidity is not locked - rug pull risk');
 * }
 * ```
 */
export async function checkLiquidityLock(
  tokenAddress: string
): Promise<boolean> {
  try {
    // Get liquidity pools for token
    const pools = await getLiquidityPools(tokenAddress);

    if (pools.length === 0) {
      return false;
    }

    // Check if any pool has locked liquidity
    return pools.some((pool) => pool.is_locked);
  } catch (error) {
    console.error('Error checking liquidity lock:', error);
    return false;
  }
}

/**
 * Get lock duration for liquidity
 *
 * Returns the remaining lock duration in days.
 *
 * @param tokenAddress - Token mint address
 * @returns Lock duration in days, or null if not locked
 *
 * @example
 * ```typescript
 * const duration = await getLockDuration('So11111...');
 * if (duration) {
 *   console.log(`Liquidity locked for ${duration} days`);
 * }
 * ```
 */
export async function getLockDuration(
  tokenAddress: string
): Promise<number | null> {
  try {
    const pools = await getLiquidityPools(tokenAddress);

    // Find the pool with the longest lock
    let maxDuration: number | null = null;

    for (const pool of pools) {
      if (pool.is_locked && pool.lock_expires_at) {
        const expiresAt = new Date(pool.lock_expires_at);
        const now = new Date();
        const daysRemaining = Math.floor(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (maxDuration === null || daysRemaining > maxDuration) {
          maxDuration = daysRemaining;
        }
      }
    }

    return maxDuration;
  } catch (error) {
    console.error('Error getting lock duration:', error);
    return null;
  }
}

/**
 * Verify lock contract
 *
 * Verifies that a lock contract is legitimate and properly
 * secures the liquidity.
 *
 * @param lockAddress - Lock contract address
 * @returns True if lock contract is verified
 *
 * @example
 * ```typescript
 * const verified = await verifyLockContract('Lock11111...');
 * if (verified) {
 *   console.log('✓ Lock contract is verified');
 * }
 * ```
 */
export async function verifyLockContract(
  lockAddress: string
): Promise<boolean> {
  try {
    const lockPublicKey = new PublicKey(lockAddress);

    // Get lock contract account info
    const accountInfo = await connection.getAccountInfo(lockPublicKey);

    if (!accountInfo) {
      return false;
    }

    // Known verified lock programs on Solana
    const verifiedLockPrograms = [
      // Team Finance
      'TLckm2U5YEp3K2qDHhKvDL4m28WkNJuMsyZDN5Yb3Z1',
      // Unicrypt
      'UCr11111111111111111111111111111111111111',
      // Add more verified lock programs
    ];

    // Check if owned by a verified lock program
    const isVerified = verifiedLockPrograms.some(
      (program) => accountInfo.owner.toBase58() === program
    );

    return isVerified;
  } catch (error) {
    console.error('Error verifying lock contract:', error);
    return false;
  }
}

/**
 * Get liquidity pools for a token
 *
 * Fetches all DEX pools where the token is traded.
 *
 * @param tokenAddress - Token mint address
 * @returns Array of liquidity pools
 */
async function getLiquidityPools(
  tokenAddress: string
): Promise<LiquidityPool[]> {
  try {
    // In production, you would query major DEXs:
    // - Raydium
    // - Orca
    // - Jupiter aggregator
    //
    // For now, return empty array as this requires DEX-specific APIs

    // Placeholder implementation
    const pools: LiquidityPool[] = [];

    // Example: Query Raydium pools
    // const raydiumPools = await queryRaydiumPools(tokenAddress);
    // pools.push(...raydiumPools);

    // Example: Query Orca pools
    // const orcaPools = await queryOrcaPools(tokenAddress);
    // pools.push(...orcaPools);

    return pools;
  } catch (error) {
    console.error('Error getting liquidity pools:', error);
    return [];
  }
}

/**
 * Perform complete liquidity analysis
 *
 * Analyzes all aspects of token liquidity including lock status,
 * pool distribution, and liquidity ratios.
 *
 * @param tokenAddress - Token mint address
 * @param marketCap - Token market cap in USD (optional)
 * @returns Complete liquidity analysis
 *
 * @example
 * ```typescript
 * const analysis = await analyzeLiquidity('So11111...', 1000000);
 * console.log(`Total liquidity: $${analysis.total_liquidity_usd}`);
 * console.log(`Locked: ${analysis.locked_percentage}%`);
 * console.log(`Liquidity ratio: ${analysis.liquidity_ratio}`);
 * ```
 */
export async function analyzeLiquidity(
  tokenAddress: string,
  marketCap?: number
): Promise<LiquidityAnalysis> {
  try {
    // Get all liquidity pools
    const pools = await getLiquidityPools(tokenAddress);

    // Calculate total liquidity
    const totalLiquidityUsd = pools.reduce(
      (sum, pool) => sum + pool.liquidity_usd,
      0
    );
    const totalLiquidityNative = pools.reduce(
      (sum, pool) => sum + pool.liquidity_native,
      0
    );

    // Calculate locked percentage
    const lockedPools = pools.filter((p) => p.is_locked);
    const lockedLiquidityUsd = lockedPools.reduce(
      (sum, pool) => sum + pool.liquidity_usd,
      0
    );
    const lockedPercentage =
      totalLiquidityUsd > 0
        ? (lockedLiquidityUsd / totalLiquidityUsd) * 100
        : 0;

    // Find longest lock expiration
    let lockExpiresAt: string | undefined;
    for (const pool of lockedPools) {
      if (pool.lock_expires_at) {
        if (!lockExpiresAt || pool.lock_expires_at > lockExpiresAt) {
          lockExpiresAt = pool.lock_expires_at;
        }
      }
    }

    // Calculate liquidity ratio (liquidity / market cap)
    const liquidityRatio =
      marketCap && marketCap > 0 ? totalLiquidityUsd / marketCap : 0;

    return {
      token_address: tokenAddress,
      total_liquidity_usd: totalLiquidityUsd,
      total_liquidity_native: totalLiquidityNative,
      is_locked: lockedPools.length > 0,
      locked_percentage: lockedPercentage,
      lock_expires_at: lockExpiresAt,
      pools: pools,
      liquidity_ratio: liquidityRatio,
      analyzed_at: new Date().toISOString(),
    };
  } catch (error) {
    throw new LiquidityCheckError(
      `Failed to analyze liquidity: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Calculate liquidity risk score
 *
 * Assigns a risk score based on liquidity status.
 * Higher score = higher risk
 *
 * Score breakdown:
 * - No liquidity: 100 points
 * - Liquidity not locked: 60 points
 * - Less than 50% locked: 40 points
 * - Lock expires in <30 days: +20 points
 * - Low liquidity ratio (<5%): +20 points
 * - Very low liquidity (<$10k): +30 points
 *
 * @param analysis - Liquidity analysis result
 * @returns Risk score (0-100)
 */
export function calculateLiquidityRisk(analysis: LiquidityAnalysis): number {
  let riskScore = 0;

  // No liquidity
  if (analysis.total_liquidity_usd === 0) {
    return 100;
  }

  // Liquidity not locked at all
  if (!analysis.is_locked) {
    riskScore += 60;
  }
  // Partially locked
  else if (analysis.locked_percentage < 50) {
    riskScore += 40;
  } else if (analysis.locked_percentage < 80) {
    riskScore += 20;
  }

  // Short lock duration
  if (analysis.lock_expires_at) {
    const expiresAt = new Date(analysis.lock_expires_at);
    const now = new Date();
    const daysRemaining = Math.floor(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 30) {
      riskScore += 20;
    }
  }

  // Low liquidity ratio
  if (analysis.liquidity_ratio > 0 && analysis.liquidity_ratio < 0.05) {
    riskScore += 20;
  }

  // Very low absolute liquidity
  if (analysis.total_liquidity_usd < 10000) {
    riskScore += 30;
  } else if (analysis.total_liquidity_usd < 50000) {
    riskScore += 15;
  }

  return Math.min(100, riskScore);
}

/**
 * Get liquidity recommendations
 *
 * Provides recommendations based on liquidity analysis
 *
 * @param analysis - Liquidity analysis result
 * @returns Array of recommendation strings
 */
export function getLiquidityRecommendations(
  analysis: LiquidityAnalysis
): string[] {
  const recommendations: string[] = [];

  if (analysis.total_liquidity_usd === 0) {
    recommendations.push(
      '🚫 No liquidity found. Token cannot be traded on DEXs.'
    );
    return recommendations;
  }

  if (!analysis.is_locked) {
    recommendations.push(
      '⚠️ Liquidity is NOT locked. High rug pull risk - developers can drain the pool.'
    );
  } else if (analysis.locked_percentage < 50) {
    recommendations.push(
      `⚠️ Only ${analysis.locked_percentage.toFixed(1)}% of liquidity is locked. Partial rug pull possible.`
    );
  } else if (analysis.locked_percentage >= 80) {
    recommendations.push(
      `✓ ${analysis.locked_percentage.toFixed(1)}% of liquidity is locked. Good protection against rug pulls.`
    );
  }

  if (analysis.lock_expires_at) {
    const expiresAt = new Date(analysis.lock_expires_at);
    const now = new Date();
    const daysRemaining = Math.floor(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 30) {
      recommendations.push(
        `⚠ Liquidity lock expires in ${daysRemaining} days. Monitor closely as expiration approaches.`
      );
    } else if (daysRemaining > 365) {
      recommendations.push(
        `✓ Liquidity locked for ${Math.floor(daysRemaining / 365)} years. Long-term commitment.`
      );
    }
  }

  if (analysis.total_liquidity_usd < 10000) {
    recommendations.push(
      `⚠️ Very low liquidity ($${analysis.total_liquidity_usd.toLocaleString()}). High slippage risk.`
    );
  } else if (analysis.total_liquidity_usd > 100000) {
    recommendations.push(
      `✓ Healthy liquidity ($${analysis.total_liquidity_usd.toLocaleString()}).`
    );
  }

  if (analysis.liquidity_ratio > 0) {
    if (analysis.liquidity_ratio < 0.05) {
      recommendations.push(
        '⚠️ Low liquidity-to-market-cap ratio. Price may be manipulated easily.'
      );
    } else if (analysis.liquidity_ratio > 0.2) {
      recommendations.push(
        '✓ Good liquidity-to-market-cap ratio. Prices are more stable.'
      );
    }
  }

  return recommendations;
}
