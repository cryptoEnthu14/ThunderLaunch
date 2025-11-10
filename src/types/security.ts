/**
 * Security Type Definitions
 *
 * Type definitions for security checks and audits in the ThunderLaunch platform.
 */

import { RiskLevel } from './token';

// =============================================================================
// ENUMS & LITERAL TYPES
// =============================================================================

/**
 * Types of security checks
 */
export type SecurityCheckType =
  | 'ownership_renounced'
  | 'liquidity_locked'
  | 'honeypot'
  | 'max_transaction_limit'
  | 'max_wallet_limit'
  | 'blacklist_function'
  | 'proxy_contract'
  | 'mint_function'
  | 'freeze_authority'
  | 'update_authority'
  | 'top_holders_concentration'
  | 'liquidity_ratio'
  | 'contract_verified'
  | 'audit_completed'
  | 'rugpull_risk';

/**
 * Severity levels for security findings
 */
export type SecuritySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Status of a security check
 */
export type SecurityCheckStatus = 'pending' | 'running' | 'completed' | 'failed' | 'error';

/**
 * Result of a security check
 */
export type SecurityCheckResult = 'passed' | 'failed' | 'warning' | 'not_applicable';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Individual security finding
 */
export interface SecurityFinding {
  /** Unique identifier for the finding */
  id: string;

  /** Type of security check */
  check_type: SecurityCheckType;

  /** Severity of the finding */
  severity: SecuritySeverity;

  /** Title of the finding */
  title: string;

  /** Detailed description */
  description: string;

  /** Result of the check */
  result: SecurityCheckResult;

  /** Additional data related to the finding */
  details?: Record<string, unknown>;

  /** Recommendation for fixing the issue */
  recommendation?: string;

  /** Reference URL for more information */
  reference_url?: string;

  /** Timestamp when the finding was detected */
  detected_at: string;
}

/**
 * Security check configuration
 */
export interface SecurityCheckConfig {
  /** Type of check */
  type: SecurityCheckType;

  /** Is this check enabled */
  enabled: boolean;

  /** Weight for risk score calculation (0-1) */
  weight: number;

  /** Threshold values for the check */
  thresholds?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
}

/**
 * Complete security check for a token
 */
export interface SecurityCheck {
  /** Unique identifier */
  id: string;

  /** Token being checked */
  token_id: string;

  /** Token mint/contract address */
  token_address: string;

  /** Overall risk level */
  risk_level: RiskLevel;

  /** Numerical risk score (0-100) */
  risk_score: number;

  /** Status of the security check */
  status: SecurityCheckStatus;

  /** List of all findings */
  findings: SecurityFinding[];

  /** Summary of passed checks */
  passed_checks: number;

  /** Summary of failed checks */
  failed_checks: number;

  /** Summary of warning checks */
  warning_checks: number;

  /** Total checks performed */
  total_checks: number;

  /** Overall security score (0-100) */
  security_score: number;

  /** Is the token contract verified */
  is_contract_verified: boolean;

  /** Is the token audited */
  is_audited: boolean;

  /** Audit report URL */
  audit_report_url?: string;

  /** Audit firm name */
  audit_firm?: string;

  /** Audit completion date */
  audit_date?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;

  /** When the check was started */
  started_at: string;

  /** When the check was completed */
  completed_at?: string;

  /** Timestamp of creation */
  created_at: string;

  /** Timestamp of last update */
  updated_at: string;
}

/**
 * Ownership analysis
 */
export interface OwnershipAnalysis {
  /** Token address */
  token_address: string;

  /** Is ownership renounced */
  is_renounced: boolean;

  /** Owner wallet address */
  owner_address?: string;

  /** Can owner mint new tokens */
  can_mint: boolean;

  /** Can owner freeze accounts */
  can_freeze: boolean;

  /** Can owner update token */
  can_update: boolean;

  /** Percentage of supply owned by creator */
  creator_holdings_percentage: number;

  /** Is freeze authority revoked */
  freeze_authority_revoked: boolean;

  /** Is mint authority revoked */
  mint_authority_revoked: boolean;

  /** Is update authority revoked */
  update_authority_revoked: boolean;

  /** Analysis timestamp */
  analyzed_at: string;
}

/**
 * Liquidity analysis
 */
export interface LiquidityAnalysis {
  /** Token address */
  token_address: string;

  /** Total liquidity in USD */
  total_liquidity_usd: number;

  /** Total liquidity in native token */
  total_liquidity_native: number;

  /** Is liquidity locked */
  is_locked: boolean;

  /** Locked liquidity percentage */
  locked_percentage: number;

  /** Lock expiration date */
  lock_expires_at?: string;

  /** Liquidity lock contract address */
  lock_contract_address?: string;

  /** Liquidity pools */
  pools: Array<{
    dex: string;
    pair_address: string;
    liquidity_usd: number;
    liquidity_native: number;
    is_locked: boolean;
  }>;

  /** Liquidity to market cap ratio */
  liquidity_ratio: number;

  /** Analysis timestamp */
  analyzed_at: string;
}

/**
 * Holder concentration analysis
 */
export interface HolderConcentration {
  /** Token address */
  token_address: string;

  /** Total number of holders */
  total_holders: number;

  /** Top 10 holders percentage */
  top10_percentage: number;

  /** Top 20 holders percentage */
  top20_percentage: number;

  /** Top 50 holders percentage */
  top50_percentage: number;

  /** Largest holder percentage */
  largest_holder_percentage: number;

  /** Largest holder address */
  largest_holder_address: string;

  /** Is concentration risky */
  is_concentrated: boolean;

  /** Top holders list */
  top_holders: Array<{
    address: string;
    balance: string;
    percentage: number;
    is_contract: boolean;
    label?: string;
  }>;

  /** Analysis timestamp */
  analyzed_at: string;
}

/**
 * Honeypot detection result
 */
export interface HoneypotCheck {
  /** Token address */
  token_address: string;

  /** Is this a honeypot */
  is_honeypot: boolean;

  /** Can users buy */
  can_buy: boolean;

  /** Can users sell */
  can_sell: boolean;

  /** Buy tax percentage */
  buy_tax: number;

  /** Sell tax percentage */
  sell_tax: number;

  /** Maximum transaction amount */
  max_tx_amount?: string;

  /** Maximum wallet amount */
  max_wallet_amount?: string;

  /** Is trading enabled */
  trading_enabled: boolean;

  /** Has blacklist function */
  has_blacklist: boolean;

  /** Has whitelist function */
  has_whitelist: boolean;

  /** Simulation result */
  simulation_result: {
    success: boolean;
    error?: string;
    gas_used?: number;
  };

  /** Analysis timestamp */
  analyzed_at: string;
}

/**
 * Contract verification status
 */
export interface ContractVerification {
  /** Token address */
  token_address: string;

  /** Is contract verified */
  is_verified: boolean;

  /** Verification source (Etherscan, Solscan, etc.) */
  verification_source?: string;

  /** Contract source code URL */
  source_code_url?: string;

  /** Compiler version */
  compiler_version?: string;

  /** Optimization enabled */
  optimization_enabled?: boolean;

  /** License type */
  license?: string;

  /** Is proxy contract */
  is_proxy: boolean;

  /** Implementation contract address (if proxy) */
  implementation_address?: string;

  /** Verification timestamp */
  verified_at?: string;

  /** Analysis timestamp */
  analyzed_at: string;
}

/**
 * Complete security report
 */
export interface SecurityReport {
  /** Token address */
  token_address: string;

  /** Token name */
  token_name: string;

  /** Token symbol */
  token_symbol: string;

  /** Overall security check */
  security_check: SecurityCheck;

  /** Ownership analysis */
  ownership: OwnershipAnalysis;

  /** Liquidity analysis */
  liquidity: LiquidityAnalysis;

  /** Holder concentration */
  concentration: HolderConcentration;

  /** Honeypot check */
  honeypot: HoneypotCheck;

  /** Contract verification */
  verification: ContractVerification;

  /** Overall verdict */
  verdict: {
    risk_level: RiskLevel;
    risk_score: number;
    is_safe: boolean;
    summary: string;
    warnings: string[];
    critical_issues: string[];
  };

  /** Report generation timestamp */
  generated_at: string;
}

/**
 * Security alert
 */
export interface SecurityAlert {
  /** Unique identifier */
  id: string;

  /** Token ID */
  token_id: string;

  /** Token address */
  token_address: string;

  /** Alert type */
  alert_type: SecurityCheckType;

  /** Severity level */
  severity: SecuritySeverity;

  /** Alert title */
  title: string;

  /** Alert message */
  message: string;

  /** Alert details */
  details?: Record<string, unknown>;

  /** Is alert resolved */
  is_resolved: boolean;

  /** Resolution notes */
  resolution_notes?: string;

  /** When alert was resolved */
  resolved_at?: string;

  /** Alert timestamp */
  created_at: string;
}

/**
 * Security audit request
 */
export interface SecurityAuditRequest {
  /** Token address to audit */
  token_address: string;

  /** Requested by user ID */
  requested_by: string;

  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'urgent';

  /** Additional notes */
  notes?: string;

  /** Request timestamp */
  requested_at: string;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid SecurityCheckType
 */
export function isSecurityCheckType(value: unknown): value is SecurityCheckType {
  const validTypes: SecurityCheckType[] = [
    'ownership_renounced',
    'liquidity_locked',
    'honeypot',
    'max_transaction_limit',
    'max_wallet_limit',
    'blacklist_function',
    'proxy_contract',
    'mint_function',
    'freeze_authority',
    'update_authority',
    'top_holders_concentration',
    'liquidity_ratio',
    'contract_verified',
    'audit_completed',
    'rugpull_risk',
  ];
  return typeof value === 'string' && validTypes.includes(value as SecurityCheckType);
}

/**
 * Type guard to check if a value is a valid SecuritySeverity
 */
export function isSecuritySeverity(value: unknown): value is SecuritySeverity {
  return typeof value === 'string' && ['info', 'low', 'medium', 'high', 'critical'].includes(value);
}

/**
 * Type guard to check if a value is a valid SecurityCheckResult
 */
export function isSecurityCheckResult(value: unknown): value is SecurityCheckResult {
  return typeof value === 'string' && ['passed', 'failed', 'warning', 'not_applicable'].includes(value);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get color for severity level
 */
export function getSeverityColor(severity: SecuritySeverity): string {
  const colors: Record<SecuritySeverity, string> = {
    info: '#3B82F6', // blue
    low: '#10B981', // green
    medium: '#F59E0B', // orange
    high: '#EF4444', // red
    critical: '#991B1B', // dark red
  };
  return colors[severity];
}

/**
 * Calculate overall risk score from findings
 */
export function calculateRiskScore(findings: SecurityFinding[]): number {
  if (findings.length === 0) return 0;

  const severityWeights: Record<SecuritySeverity, number> = {
    info: 0,
    low: 10,
    medium: 25,
    high: 50,
    critical: 100,
  };

  const totalScore = findings.reduce((sum, finding) => {
    if (finding.result === 'failed' || finding.result === 'warning') {
      return sum + severityWeights[finding.severity];
    }
    return sum;
  }, 0);

  return Math.min(100, totalScore);
}
