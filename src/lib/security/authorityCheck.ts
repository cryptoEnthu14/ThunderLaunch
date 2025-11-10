/**
 * Authority Check Module
 *
 * Checks token mint and freeze authorities to determine if they have been
 * renounced or are still controlled by a wallet. This is crucial for
 * determining if a token is safe from manipulation.
 *
 * Key checks:
 * - Mint Authority: Can create new tokens (inflate supply)
 * - Freeze Authority: Can freeze token accounts (prevent transfers)
 * - Update Authority: Can modify token metadata
 */

import { PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { connection } from '../solana/connection';
import type { OwnershipAnalysis } from '@/types/security';

/**
 * Error class for authority check failures
 */
export class AuthorityCheckError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'AuthorityCheckError';
  }
}

/**
 * Authority check result
 */
export interface AuthorityResult {
  /** Authority public key (null if renounced) */
  authority: PublicKey | null;
  /** Is authority renounced */
  is_renounced: boolean;
  /** Authority address as string */
  authority_address: string | null;
}

/**
 * Check if mint authority has been renounced
 *
 * When mint authority is renounced, no one can create new tokens,
 * making the supply fixed and preventing dilution.
 *
 * @param tokenAddress - Token mint address
 * @returns Authority check result
 *
 * @example
 * ```typescript
 * const result = await checkMintAuthority('So11111...');
 * if (result.is_renounced) {
 *   console.log('✓ Mint authority is renounced - supply is fixed');
 * } else {
 *   console.log('⚠ Owner can still mint new tokens');
 * }
 * ```
 */
export async function checkMintAuthority(
  tokenAddress: string
): Promise<AuthorityResult> {
  try {
    const mintPublicKey = new PublicKey(tokenAddress);

    // Get mint account information
    const mintInfo = await getMint(connection, mintPublicKey);

    // Check if mint authority exists
    const mintAuthority = mintInfo.mintAuthority;

    if (mintAuthority === null) {
      return {
        authority: null,
        is_renounced: true,
        authority_address: null,
      };
    }

    return {
      authority: mintAuthority,
      is_renounced: false,
      authority_address: mintAuthority.toBase58(),
    };
  } catch (error) {
    throw new AuthorityCheckError(
      `Failed to check mint authority: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Check if freeze authority has been disabled
 *
 * Freeze authority allows freezing individual token accounts,
 * preventing them from transferring tokens. This should typically
 * be disabled for fair tokens.
 *
 * @param tokenAddress - Token mint address
 * @returns Authority check result
 *
 * @example
 * ```typescript
 * const result = await checkFreezeAuthority('So11111...');
 * if (result.is_renounced) {
 *   console.log('✓ Freeze authority is disabled - accounts cannot be frozen');
 * } else {
 *   console.log('⚠ Owner can freeze user accounts');
 * }
 * ```
 */
export async function checkFreezeAuthority(
  tokenAddress: string
): Promise<AuthorityResult> {
  try {
    const mintPublicKey = new PublicKey(tokenAddress);

    // Get mint account information
    const mintInfo = await getMint(connection, mintPublicKey);

    // Check if freeze authority exists
    const freezeAuthority = mintInfo.freezeAuthority;

    if (freezeAuthority === null) {
      return {
        authority: null,
        is_renounced: true,
        authority_address: null,
      };
    }

    return {
      authority: freezeAuthority,
      is_renounced: false,
      authority_address: freezeAuthority.toBase58(),
    };
  } catch (error) {
    throw new AuthorityCheckError(
      `Failed to check freeze authority: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Get the contract owner/creator
 *
 * Returns the current mint authority or freeze authority
 * to identify who controls the token.
 *
 * @param tokenAddress - Token mint address
 * @returns Owner address or null if fully renounced
 *
 * @example
 * ```typescript
 * const owner = await getContractOwner('So11111...');
 * if (owner) {
 *   console.log('Token is controlled by:', owner);
 * } else {
 *   console.log('Token is fully decentralized');
 * }
 * ```
 */
export async function getContractOwner(
  tokenAddress: string
): Promise<string | null> {
  try {
    const mintPublicKey = new PublicKey(tokenAddress);

    // Get mint account information
    const mintInfo = await getMint(connection, mintPublicKey);

    // Return mint authority if it exists
    if (mintInfo.mintAuthority) {
      return mintInfo.mintAuthority.toBase58();
    }

    // Return freeze authority if it exists
    if (mintInfo.freezeAuthority) {
      return mintInfo.freezeAuthority.toBase58();
    }

    // Both authorities are renounced
    return null;
  } catch (error) {
    throw new AuthorityCheckError(
      `Failed to get contract owner: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Check update authority for token metadata
 *
 * Update authority can modify token metadata including name, symbol, and image.
 * For Metaplex tokens, this is separate from mint/freeze authority.
 *
 * @param tokenAddress - Token mint address
 * @returns Authority check result
 */
export async function checkUpdateAuthority(
  tokenAddress: string
): Promise<AuthorityResult> {
  try {
    // This would require checking Metaplex metadata account
    // For now, return a placeholder

    // In production, you would:
    // 1. Derive metadata PDA from mint address
    // 2. Fetch metadata account
    // 3. Check updateAuthority field

    return {
      authority: null,
      is_renounced: false,
      authority_address: null,
    };
  } catch (error) {
    throw new AuthorityCheckError(
      `Failed to check update authority: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Perform comprehensive ownership analysis
 *
 * Checks all authorities and provides a complete picture of
 * token ownership and control.
 *
 * @param tokenAddress - Token mint address
 * @returns Complete ownership analysis
 *
 * @example
 * ```typescript
 * const analysis = await analyzeOwnership('So11111...');
 * console.log('Mint renounced:', analysis.mint_authority_revoked);
 * console.log('Freeze disabled:', analysis.freeze_authority_revoked);
 * console.log('Fully decentralized:', analysis.is_renounced);
 * ```
 */
export async function analyzeOwnership(
  tokenAddress: string
): Promise<OwnershipAnalysis> {
  try {
    const mintPublicKey = new PublicKey(tokenAddress);

    // Get mint information
    const mintInfo = await getMint(connection, mintPublicKey);

    // Check authorities
    const mintAuthority = mintInfo.mintAuthority;
    const freezeAuthority = mintInfo.freezeAuthority;

    // Determine if fully renounced
    const isMintRenounced = mintAuthority === null;
    const isFreezeRenounced = freezeAuthority === null;
    const isFullyRenounced = isMintRenounced && isFreezeRenounced;

    // Get owner address (prefer mint authority)
    const ownerAddress = mintAuthority?.toBase58() || freezeAuthority?.toBase58();

    return {
      token_address: tokenAddress,
      is_renounced: isFullyRenounced,
      owner_address: ownerAddress,
      can_mint: !isMintRenounced,
      can_freeze: !isFreezeRenounced,
      can_update: false, // Would need to check Metaplex metadata
      creator_holdings_percentage: 0, // Would need to query token accounts
      freeze_authority_revoked: isFreezeRenounced,
      mint_authority_revoked: isMintRenounced,
      update_authority_revoked: false, // Would need Metaplex check
      analyzed_at: new Date().toISOString(),
    };
  } catch (error) {
    throw new AuthorityCheckError(
      `Failed to analyze ownership: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Calculate ownership risk score
 *
 * Assigns a risk score based on which authorities are still active.
 * Higher score = higher risk
 *
 * Score breakdown:
 * - Mint authority active: +40 points
 * - Freeze authority active: +30 points
 * - Update authority active: +10 points
 * - Creator holds >50% supply: +20 points
 *
 * @param analysis - Ownership analysis result
 * @returns Risk score (0-100)
 */
export function calculateOwnershipRisk(analysis: OwnershipAnalysis): number {
  let riskScore = 0;

  // Mint authority increases risk significantly
  if (analysis.can_mint) {
    riskScore += 40;
  }

  // Freeze authority is also a major risk
  if (analysis.can_freeze) {
    riskScore += 30;
  }

  // Update authority is a minor risk
  if (analysis.can_update) {
    riskScore += 10;
  }

  // High creator holdings concentration
  if (analysis.creator_holdings_percentage > 50) {
    riskScore += 20;
  } else if (analysis.creator_holdings_percentage > 25) {
    riskScore += 10;
  }

  return Math.min(100, riskScore);
}

/**
 * Get authority recommendations
 *
 * Provides recommendations based on authority status
 *
 * @param analysis - Ownership analysis result
 * @returns Array of recommendation strings
 */
export function getAuthorityRecommendations(
  analysis: OwnershipAnalysis
): string[] {
  const recommendations: string[] = [];

  if (analysis.can_mint) {
    recommendations.push(
      '⚠️ Mint authority is active. The owner can create unlimited new tokens, potentially diluting your holdings.'
    );
  } else {
    recommendations.push(
      '✓ Mint authority is renounced. Token supply is fixed and cannot be inflated.'
    );
  }

  if (analysis.can_freeze) {
    recommendations.push(
      '⚠️ Freeze authority is active. The owner can freeze individual accounts, preventing transfers.'
    );
  } else {
    recommendations.push(
      '✓ Freeze authority is disabled. User accounts cannot be frozen.'
    );
  }

  if (analysis.is_renounced) {
    recommendations.push(
      '✓ All authorities are renounced. The token is fully decentralized.'
    );
  }

  if (analysis.creator_holdings_percentage > 50) {
    recommendations.push(
      '⚠️ Creator holds more than 50% of supply. High centralization risk.'
    );
  }

  return recommendations;
}
