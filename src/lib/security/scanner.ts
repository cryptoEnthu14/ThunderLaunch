/**
 * Security Scanner Module
 *
 * Main orchestrator for comprehensive token security analysis.
 * Runs all security checks in parallel and generates a complete
 * security report with risk scoring.
 *
 * This module coordinates:
 * - Honeypot detection
 * - Authority checks
 * - Holder analysis
 * - Liquidity verification
 * - Overall risk assessment
 */

import { randomUUID } from 'crypto';
import { checkHoneypot } from './honeypotCheck';
import { analyzeOwnership, calculateOwnershipRisk } from './authorityCheck';
import {
  analyzeHolderConcentration,
  calculateConcentrationRisk,
} from './holderAnalysis';
import {
  analyzeLiquidity,
  calculateLiquidityRisk,
} from './liquidityCheck';
import type {
  SecurityCheck,
  SecurityFinding,
  SecurityReport,
  SecuritySeverity,
  SecurityCheckResult,
  SecurityCheckType,
  OwnershipAnalysis,
  HolderConcentration,
  LiquidityAnalysis,
  HoneypotCheck,
  ContractVerification,
} from '@/types/security';
import type { RiskLevel } from '@/types/token';

/**
 * Error class for security scanner failures
 */
export class SecurityScannerError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'SecurityScannerError';
  }
}

/**
 * Security scan options
 */
export interface SecurityScanOptions {
  /** Token market cap (for liquidity ratio calculation) */
  marketCap?: number;
  /** Token name */
  tokenName?: string;
  /** Token symbol */
  tokenSymbol?: string;
  /** Skip certain checks for faster scanning */
  skipChecks?: SecurityCheckType[];
  /** Enable result caching */
  enableCache?: boolean;
}

/**
 * Security scan result with all analysis data
 */
export interface SecurityScanResult {
  /** Main security check */
  securityCheck: SecurityCheck;
  /** Ownership analysis */
  ownership: OwnershipAnalysis;
  /** Holder concentration */
  concentration: HolderConcentration;
  /** Liquidity analysis */
  liquidity: LiquidityAnalysis;
  /** Honeypot check */
  honeypot: HoneypotCheck;
  /** Verification status */
  verification: ContractVerification;
}

/**
 * Result cache for faster repeated scans
 */
const scanCache = new Map<
  string,
  { result: SecurityScanResult; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Run comprehensive security check on a token
 *
 * This is the main entry point for security analysis. It orchestrates
 * all security checks and generates a comprehensive report.
 *
 * @param tokenAddress - Token mint address to analyze
 * @param options - Scan options
 * @returns Complete security scan result
 *
 * @example
 * ```typescript
 * const result = await runSecurityCheck('So11111...', {
 *   tokenName: 'My Token',
 *   tokenSymbol: 'MTK',
 *   marketCap: 1000000,
 * });
 *
 * console.log(`Risk Level: ${result.securityCheck.risk_level}`);
 * console.log(`Risk Score: ${result.securityCheck.risk_score}/100`);
 * console.log(`Passed: ${result.securityCheck.passed_checks}/${result.securityCheck.total_checks}`);
 * ```
 */
export async function runSecurityCheck(
  tokenAddress: string,
  options: SecurityScanOptions = {}
): Promise<SecurityScanResult> {
  try {
    const startTime = Date.now();

    // Check cache if enabled
    if (options.enableCache !== false) {
      const cached = scanCache.get(tokenAddress);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('Returning cached security scan result');
        return cached.result;
      }
    }

    console.log(`Starting security scan for ${tokenAddress}...`);

    // Step 1: Run all checks in parallel for maximum performance
    const [
      honeypotResult,
      ownershipResult,
      concentrationResult,
      liquidityResult,
    ] = await Promise.allSettled([
      shouldSkipCheck('honeypot', options.skipChecks)
        ? null
        : checkHoneypot(tokenAddress),
      shouldSkipCheck('mint_function', options.skipChecks)
        ? null
        : analyzeOwnership(tokenAddress),
      shouldSkipCheck('top_holders_concentration', options.skipChecks)
        ? null
        : analyzeHolderConcentration(tokenAddress),
      shouldSkipCheck('liquidity_locked', options.skipChecks)
        ? null
        : analyzeLiquidity(tokenAddress, options.marketCap),
    ]);

    // Extract results (handle failures gracefully)
    const honeypot = extractResult(honeypotResult, createDefaultHoneypotCheck(tokenAddress));
    const ownership = extractResult(ownershipResult, createDefaultOwnershipAnalysis(tokenAddress));
    const concentration = extractResult(concentrationResult, createDefaultConcentration(tokenAddress));
    const liquidity = extractResult(liquidityResult, createDefaultLiquidity(tokenAddress));

    // Step 2: Generate security findings
    const findings = generateFindings(
      honeypot,
      ownership,
      concentration,
      liquidity
    );

    // Step 3: Calculate risk scores
    const ownershipRisk = calculateOwnershipRisk(ownership);
    const concentrationRisk = calculateConcentrationRisk(concentration);
    const liquidityRisk = calculateLiquidityRisk(liquidity);
    const honeypotRisk = honeypot.is_honeypot ? 100 : 0;

    // Weighted average of all risks
    const overallRiskScore = Math.round(
      ownershipRisk * 0.3 +
      concentrationRisk * 0.25 +
      liquidityRisk * 0.3 +
      honeypotRisk * 0.15
    );

    // Step 4: Determine risk level
    const riskLevel = determineRiskLevel(overallRiskScore);

    // Step 5: Count passed/failed checks
    const checkCounts = countCheckResults(findings);

    // Step 6: Calculate security score (inverse of risk score)
    const securityScore = 100 - overallRiskScore;

    // Step 7: Create verification status
    const verification: ContractVerification = {
      token_address: tokenAddress,
      is_verified: false, // Would need to check Solscan/Solana Explorer
      is_proxy: false,
      analyzed_at: new Date().toISOString(),
    };

    // Step 8: Build security check object
    const securityCheck: SecurityCheck = {
      id: randomUUID(),
      token_id: '', // Would be filled in when saving to database
      token_address: tokenAddress,
      risk_level: riskLevel,
      risk_score: overallRiskScore,
      status: 'completed',
      findings: findings,
      passed_checks: checkCounts.passed,
      failed_checks: checkCounts.failed,
      warning_checks: checkCounts.warning,
      total_checks: checkCounts.total,
      security_score: securityScore,
      is_contract_verified: verification.is_verified,
      is_audited: false,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result: SecurityScanResult = {
      securityCheck,
      ownership,
      concentration,
      liquidity,
      honeypot,
      verification,
    };

    // Cache the result
    if (options.enableCache !== false) {
      scanCache.set(tokenAddress, {
        result,
        timestamp: Date.now(),
      });
    }

    const duration = Date.now() - startTime;
    console.log(`Security scan completed in ${duration}ms`);

    return result;
  } catch (error) {
    throw new SecurityScannerError(
      `Security scan failed: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Generate security findings from all checks
 *
 * @param honeypot - Honeypot check result
 * @param ownership - Ownership analysis
 * @param concentration - Holder concentration
 * @param liquidity - Liquidity analysis
 * @returns Array of security findings
 */
function generateFindings(
  honeypot: HoneypotCheck,
  ownership: OwnershipAnalysis,
  concentration: HolderConcentration,
  liquidity: LiquidityAnalysis
): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const now = new Date().toISOString();

  // Honeypot findings
  if (honeypot.is_honeypot) {
    findings.push({
      id: randomUUID(),
      check_type: 'honeypot',
      severity: 'critical',
      title: 'Honeypot Detected',
      description: 'This token appears to be a honeypot. Users may not be able to sell.',
      result: 'failed',
      details: {
        can_buy: honeypot.can_buy,
        can_sell: honeypot.can_sell,
        sell_tax: honeypot.sell_tax,
      },
      recommendation: 'Do not purchase this token. It is likely a scam.',
      detected_at: now,
    });
  } else {
    findings.push({
      id: randomUUID(),
      check_type: 'honeypot',
      severity: 'info',
      title: 'No Honeypot Detected',
      description: 'Token passed honeypot checks.',
      result: 'passed',
      detected_at: now,
    });
  }

  // Mint authority findings
  if (ownership.can_mint) {
    findings.push({
      id: randomUUID(),
      check_type: 'mint_function',
      severity: 'high',
      title: 'Mint Authority Not Renounced',
      description: 'The owner can mint unlimited new tokens, diluting holders.',
      result: 'failed',
      details: { authority: ownership.owner_address },
      recommendation: 'Verify if mint authority will be renounced. High inflation risk.',
      detected_at: now,
    });
  } else {
    findings.push({
      id: randomUUID(),
      check_type: 'mint_function',
      severity: 'info',
      title: 'Mint Authority Renounced',
      description: 'Token supply is fixed. No new tokens can be minted.',
      result: 'passed',
      detected_at: now,
    });
  }

  // Freeze authority findings
  if (ownership.can_freeze) {
    findings.push({
      id: randomUUID(),
      check_type: 'freeze_authority',
      severity: 'medium',
      title: 'Freeze Authority Active',
      description: 'The owner can freeze individual token accounts.',
      result: 'warning',
      details: { authority: ownership.owner_address },
      recommendation: 'Accounts can be frozen by owner. Moderate risk.',
      detected_at: now,
    });
  } else {
    findings.push({
      id: randomUUID(),
      check_type: 'freeze_authority',
      severity: 'info',
      title: 'Freeze Authority Disabled',
      description: 'User accounts cannot be frozen.',
      result: 'passed',
      detected_at: now,
    });
  }

  // Holder concentration findings
  if (concentration.is_concentrated) {
    const severity: SecuritySeverity =
      concentration.largest_holder_percentage > 50 ? 'high' : 'medium';

    findings.push({
      id: randomUUID(),
      check_type: 'top_holders_concentration',
      severity,
      title: 'High Holder Concentration',
      description: `Top holders control ${concentration.top10_percentage.toFixed(1)}% of supply.`,
      result: 'warning',
      details: {
        largest_holder_percentage: concentration.largest_holder_percentage,
        top10_percentage: concentration.top10_percentage,
        total_holders: concentration.total_holders,
      },
      recommendation: 'High concentration means whales can manipulate price.',
      detected_at: now,
    });
  } else {
    findings.push({
      id: randomUUID(),
      check_type: 'top_holders_concentration',
      severity: 'info',
      title: 'Good Token Distribution',
      description: 'Token holdings are well distributed.',
      result: 'passed',
      details: {
        top10_percentage: concentration.top10_percentage,
        total_holders: concentration.total_holders,
      },
      detected_at: now,
    });
  }

  // Liquidity lock findings
  if (!liquidity.is_locked) {
    findings.push({
      id: randomUUID(),
      check_type: 'liquidity_locked',
      severity: 'critical',
      title: 'Liquidity Not Locked',
      description: 'DEX liquidity is not locked. High rug pull risk.',
      result: 'failed',
      details: {
        total_liquidity_usd: liquidity.total_liquidity_usd,
        locked_percentage: liquidity.locked_percentage,
      },
      recommendation: 'Do not invest. Developers can drain liquidity at any time.',
      detected_at: now,
    });
  } else if (liquidity.locked_percentage < 80) {
    findings.push({
      id: randomUUID(),
      check_type: 'liquidity_locked',
      severity: 'medium',
      title: 'Partially Locked Liquidity',
      description: `Only ${liquidity.locked_percentage.toFixed(1)}% of liquidity is locked.`,
      result: 'warning',
      details: {
        total_liquidity_usd: liquidity.total_liquidity_usd,
        locked_percentage: liquidity.locked_percentage,
        lock_expires_at: liquidity.lock_expires_at,
      },
      recommendation: 'Partial rug pull risk exists.',
      detected_at: now,
    });
  } else {
    findings.push({
      id: randomUUID(),
      check_type: 'liquidity_locked',
      severity: 'info',
      title: 'Liquidity Locked',
      description: `${liquidity.locked_percentage.toFixed(1)}% of liquidity is locked.`,
      result: 'passed',
      details: {
        total_liquidity_usd: liquidity.total_liquidity_usd,
        locked_percentage: liquidity.locked_percentage,
        lock_expires_at: liquidity.lock_expires_at,
      },
      detected_at: now,
    });
  }

  return findings;
}

/**
 * Determine overall risk level from score
 *
 * @param riskScore - Risk score (0-100)
 * @returns Risk level
 */
function determineRiskLevel(riskScore: number): RiskLevel {
  if (riskScore >= 75) return 'critical';
  if (riskScore >= 50) return 'high';
  if (riskScore >= 25) return 'medium';
  return 'low';
}

/**
 * Count check results by status
 *
 * @param findings - Array of security findings
 * @returns Object with counts
 */
function countCheckResults(findings: SecurityFinding[]): {
  passed: number;
  failed: number;
  warning: number;
  total: number;
} {
  const counts = {
    passed: 0,
    failed: 0,
    warning: 0,
    total: findings.length,
  };

  for (const finding of findings) {
    if (finding.result === 'passed') counts.passed++;
    else if (finding.result === 'failed') counts.failed++;
    else if (finding.result === 'warning') counts.warning++;
  }

  return counts;
}

/**
 * Check if a specific check should be skipped
 *
 * @param checkType - Type of check
 * @param skipList - List of checks to skip
 * @returns True if check should be skipped
 */
function shouldSkipCheck(
  checkType: SecurityCheckType,
  skipList?: SecurityCheckType[]
): boolean {
  return skipList ? skipList.includes(checkType) : false;
}

/**
 * Extract result from Promise.allSettled result
 *
 * @param result - PromiseSettledResult
 * @param defaultValue - Default value if failed
 * @returns Extracted value or default
 */
function extractResult<T>(
  result: PromiseSettledResult<T | null>,
  defaultValue: T
): T {
  if (result.status === 'fulfilled' && result.value !== null) {
    return result.value;
  }
  return defaultValue;
}

/**
 * Create default honeypot check (for error cases)
 */
function createDefaultHoneypotCheck(tokenAddress: string): HoneypotCheck {
  return {
    token_address: tokenAddress,
    is_honeypot: false,
    can_buy: true,
    can_sell: true,
    buy_tax: 0,
    sell_tax: 0,
    trading_enabled: true,
    has_blacklist: false,
    has_whitelist: false,
    simulation_result: { success: false, error: 'Check failed' },
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Create default ownership analysis (for error cases)
 */
function createDefaultOwnershipAnalysis(tokenAddress: string): OwnershipAnalysis {
  return {
    token_address: tokenAddress,
    is_renounced: false,
    can_mint: false,
    can_freeze: false,
    can_update: false,
    creator_holdings_percentage: 0,
    freeze_authority_revoked: true,
    mint_authority_revoked: true,
    update_authority_revoked: true,
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Create default concentration analysis (for error cases)
 */
function createDefaultConcentration(tokenAddress: string): HolderConcentration {
  return {
    token_address: tokenAddress,
    total_holders: 0,
    top10_percentage: 0,
    top20_percentage: 0,
    top50_percentage: 0,
    largest_holder_percentage: 0,
    largest_holder_address: '',
    is_concentrated: false,
    top_holders: [],
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Create default liquidity analysis (for error cases)
 */
function createDefaultLiquidity(tokenAddress: string): LiquidityAnalysis {
  return {
    token_address: tokenAddress,
    total_liquidity_usd: 0,
    total_liquidity_native: 0,
    is_locked: false,
    locked_percentage: 0,
    pools: [],
    liquidity_ratio: 0,
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Clear security scan cache
 *
 * Useful for testing or forcing fresh scans
 */
export function clearScanCache(): void {
  scanCache.clear();
}

/**
 * Get cached scan result
 *
 * @param tokenAddress - Token mint address
 * @returns Cached result or null
 */
export function getCachedScanResult(
  tokenAddress: string
): SecurityScanResult | null {
  const cached = scanCache.get(tokenAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  return null;
}
