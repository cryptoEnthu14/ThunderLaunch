/**
 * Holder Analysis Module
 *
 * Analyzes token holder distribution to detect concentration risks.
 * High holder concentration (whales) can indicate manipulation risk
 * or unfair token distribution.
 *
 * Key metrics:
 * - Top 10/20/50 holder percentages
 * - Largest holder percentage
 * - Total holder count
 * - Concentration risk assessment
 */

import { PublicKey } from '@solana/web3.js';
import { connection } from '../solana/connection';
import type { HolderConcentration } from '@/types/security';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

/**
 * Error class for holder analysis failures
 */
export class HolderAnalysisError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'HolderAnalysisError';
  }
}

/**
 * Holder information
 */
export interface TokenHolder {
  /** Holder wallet address */
  address: string;
  /** Token balance (raw amount) */
  balance: string;
  /** Percentage of total supply */
  percentage: number;
  /** Is this a contract/program address */
  is_contract: boolean;
  /** Optional label (DEX, locked, etc.) */
  label?: string;
}

/**
 * Get token holder distribution
 *
 * Fetches all token accounts for a given mint and analyzes
 * the distribution of holdings.
 *
 * @param tokenAddress - Token mint address
 * @param limit - Maximum number of holders to fetch (default: 1000)
 * @returns Array of token holders sorted by balance
 *
 * @example
 * ```typescript
 * const holders = await getHolderDistribution('So11111...');
 * console.log(`Total holders: ${holders.length}`);
 * console.log(`Top holder: ${holders[0].address} (${holders[0].percentage}%)`);
 * ```
 */
export async function getHolderDistribution(
  tokenAddress: string,
  limit: number = 1000
): Promise<TokenHolder[]> {
  try {
    const mintPublicKey = new PublicKey(tokenAddress);

    // Get all token accounts for this mint
    const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters: [
        {
          dataSize: 165, // Size of token account
        },
        {
          memcmp: {
            offset: 0,
            bytes: mintPublicKey.toBase58(),
          },
        },
      ],
    });

    // Parse token accounts and extract holder information
    const holders: TokenHolder[] = [];
    let totalSupply = BigInt(0);

    for (const account of accounts.slice(0, limit)) {
      try {
        // Parse token account data
        // Token account structure:
        // - mint: 0-32
        // - owner: 32-64
        // - amount: 64-72
        const data = account.account.data;
        const owner = new PublicKey(data.slice(32, 64));
        const amount = data.readBigUInt64LE(64);

        totalSupply += amount;

        holders.push({
          address: owner.toBase58(),
          balance: amount.toString(),
          percentage: 0, // Will calculate after getting total supply
          is_contract: await isContractAddress(owner),
        });
      } catch (error) {
        console.error('Error parsing token account:', error);
        continue;
      }
    }

    // Calculate percentages
    const totalSupplyNumber = Number(totalSupply);
    holders.forEach((holder) => {
      holder.percentage =
        (Number(holder.balance) / totalSupplyNumber) * 100;
    });

    // Sort by balance (highest first)
    holders.sort((a, b) => Number(b.balance) - Number(a.balance));

    // Add labels for known addresses
    await addHolderLabels(holders);

    return holders;
  } catch (error) {
    throw new HolderAnalysisError(
      `Failed to get holder distribution: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Calculate top holder percentage
 *
 * Calculates the percentage of supply held by the top N holders.
 *
 * @param holders - Array of token holders
 * @param topN - Number of top holders to include
 * @returns Percentage of supply held by top N holders
 *
 * @example
 * ```typescript
 * const holders = await getHolderDistribution('So11111...');
 * const top10Pct = calculateTopHolderPercentage(holders, 10);
 * console.log(`Top 10 holders own ${top10Pct}% of supply`);
 * ```
 */
export function calculateTopHolderPercentage(
  holders: TokenHolder[],
  topN: number
): number {
  if (holders.length === 0) return 0;

  const topHolders = holders.slice(0, topN);
  const totalPercentage = topHolders.reduce(
    (sum, holder) => sum + holder.percentage,
    0
  );

  return Number(totalPercentage.toFixed(2));
}

/**
 * Check holder concentration risk
 *
 * Determines if the token has risky holder concentration.
 * High concentration indicates potential manipulation risk.
 *
 * Risk thresholds:
 * - Top holder >50%: Critical risk
 * - Top 10 holders >75%: High risk
 * - Top 10 holders >50%: Medium risk
 * - Otherwise: Low risk
 *
 * @param holders - Array of token holders
 * @returns True if concentration is risky
 *
 * @example
 * ```typescript
 * const holders = await getHolderDistribution('So11111...');
 * if (checkHolderConcentration(holders)) {
 *   console.log('⚠ High holder concentration detected');
 * }
 * ```
 */
export function checkHolderConcentration(
  holders: TokenHolder[]
): boolean {
  if (holders.length === 0) return false;

  // Check if largest holder owns >50%
  const largestHolderPct = holders[0]?.percentage || 0;
  if (largestHolderPct > 50) {
    return true;
  }

  // Check if top 10 holders own >75%
  const top10Pct = calculateTopHolderPercentage(holders, 10);
  if (top10Pct > 75) {
    return true;
  }

  return false;
}

/**
 * Perform complete holder concentration analysis
 *
 * Analyzes holder distribution and provides comprehensive metrics.
 *
 * @param tokenAddress - Token mint address
 * @returns Complete holder concentration analysis
 *
 * @example
 * ```typescript
 * const analysis = await analyzeHolderConcentration('So11111...');
 * console.log(`Total holders: ${analysis.total_holders}`);
 * console.log(`Top 10 own: ${analysis.top10_percentage}%`);
 * console.log(`Concentrated: ${analysis.is_concentrated}`);
 * ```
 */
export async function analyzeHolderConcentration(
  tokenAddress: string
): Promise<HolderConcentration> {
  try {
    // Get holder distribution
    const holders = await getHolderDistribution(tokenAddress);

    // Calculate metrics
    const top10Percentage = calculateTopHolderPercentage(holders, 10);
    const top20Percentage = calculateTopHolderPercentage(holders, 20);
    const top50Percentage = calculateTopHolderPercentage(holders, 50);

    const largestHolder = holders[0] || {
      address: '',
      percentage: 0,
      balance: '0',
      is_contract: false,
    };

    const isConcentrated = checkHolderConcentration(holders);

    return {
      token_address: tokenAddress,
      total_holders: holders.length,
      top10_percentage: top10Percentage,
      top20_percentage: top20Percentage,
      top50_percentage: top50Percentage,
      largest_holder_percentage: largestHolder.percentage,
      largest_holder_address: largestHolder.address,
      is_concentrated: isConcentrated,
      top_holders: holders.slice(0, 50).map((h) => ({
        address: h.address,
        balance: h.balance,
        percentage: h.percentage,
        is_contract: h.is_contract,
        label: h.label,
      })),
      analyzed_at: new Date().toISOString(),
    };
  } catch (error) {
    throw new HolderAnalysisError(
      `Failed to analyze holder concentration: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Check if an address is a contract/program
 *
 * Determines if an address is executable (a program) rather than
 * a regular user wallet.
 *
 * @param address - Address to check
 * @returns True if address is a contract
 */
async function isContractAddress(address: PublicKey): Promise<boolean> {
  try {
    const accountInfo = await connection.getAccountInfo(address);

    if (!accountInfo) {
      return false;
    }

    // Check if account is executable (program)
    return accountInfo.executable;
  } catch (error) {
    return false;
  }
}

/**
 * Add labels to known holder addresses
 *
 * Identifies and labels known addresses (DEXs, locks, burns, etc.)
 * to provide more context in holder analysis.
 *
 * @param holders - Array of token holders to label
 */
async function addHolderLabels(holders: TokenHolder[]): Promise<void> {
  // Known address labels
  const knownAddresses: Record<string, string> = {
    // Raydium
    '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1': 'Raydium AMM',
    '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium Authority',

    // Orca
    '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP': 'Orca Whirlpool',

    // Burn addresses
    '1111111111111111111111111111111111111111111': 'Burn Address',
    'So11111111111111111111111111111111111111112': 'Wrapped SOL',

    // Add more as needed
  };

  for (const holder of holders) {
    if (knownAddresses[holder.address]) {
      holder.label = knownAddresses[holder.address];
    } else if (holder.is_contract) {
      holder.label = 'Contract/Program';
    }
  }
}

/**
 * Calculate holder concentration risk score
 *
 * Assigns a risk score based on holder distribution.
 * Higher score = higher concentration risk
 *
 * Score breakdown:
 * - Top holder >80%: 100 points
 * - Top holder >50%: 80 points
 * - Top holder >25%: 50 points
 * - Top 10 holders >90%: +20 points
 * - Top 10 holders >75%: +15 points
 * - Top 10 holders >50%: +10 points
 * - Less than 100 holders: +20 points
 *
 * @param analysis - Holder concentration analysis
 * @returns Risk score (0-100)
 */
export function calculateConcentrationRisk(
  analysis: HolderConcentration
): number {
  let riskScore = 0;

  // Largest holder risk
  if (analysis.largest_holder_percentage > 80) {
    riskScore += 100;
  } else if (analysis.largest_holder_percentage > 50) {
    riskScore += 80;
  } else if (analysis.largest_holder_percentage > 25) {
    riskScore += 50;
  } else if (analysis.largest_holder_percentage > 10) {
    riskScore += 25;
  }

  // Top 10 concentration risk
  if (analysis.top10_percentage > 90) {
    riskScore += 20;
  } else if (analysis.top10_percentage > 75) {
    riskScore += 15;
  } else if (analysis.top10_percentage > 50) {
    riskScore += 10;
  }

  // Low holder count risk
  if (analysis.total_holders < 100) {
    riskScore += 20;
  } else if (analysis.total_holders < 500) {
    riskScore += 10;
  }

  return Math.min(100, riskScore);
}

/**
 * Get holder concentration recommendations
 *
 * Provides recommendations based on holder distribution
 *
 * @param analysis - Holder concentration analysis
 * @returns Array of recommendation strings
 */
export function getConcentrationRecommendations(
  analysis: HolderConcentration
): string[] {
  const recommendations: string[] = [];

  if (analysis.largest_holder_percentage > 50) {
    recommendations.push(
      `⚠️ Largest holder owns ${analysis.largest_holder_percentage.toFixed(1)}% of supply. Extreme concentration risk.`
    );
  } else if (analysis.largest_holder_percentage > 25) {
    recommendations.push(
      `⚠ Largest holder owns ${analysis.largest_holder_percentage.toFixed(1)}% of supply. Moderate concentration risk.`
    );
  } else {
    recommendations.push(
      `✓ Largest holder owns ${analysis.largest_holder_percentage.toFixed(1)}% of supply. Good distribution.`
    );
  }

  if (analysis.top10_percentage > 75) {
    recommendations.push(
      `⚠️ Top 10 holders control ${analysis.top10_percentage.toFixed(1)}% of supply. High manipulation risk.`
    );
  } else if (analysis.top10_percentage > 50) {
    recommendations.push(
      `⚠ Top 10 holders control ${analysis.top10_percentage.toFixed(1)}% of supply. Moderate risk.`
    );
  } else {
    recommendations.push(
      `✓ Top 10 holders control ${analysis.top10_percentage.toFixed(1)}% of supply. Well distributed.`
    );
  }

  if (analysis.total_holders < 100) {
    recommendations.push(
      `⚠ Only ${analysis.total_holders} holders. Very low adoption.`
    );
  } else if (analysis.total_holders > 1000) {
    recommendations.push(
      `✓ ${analysis.total_holders} holders. Good adoption.`
    );
  }

  return recommendations;
}
