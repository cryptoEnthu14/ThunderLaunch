/**
 * Security Module
 *
 * Centralized exports for all security scanning functionality
 */

// Main scanner
export {
  runSecurityCheck,
  clearScanCache,
  getCachedScanResult,
  SecurityScannerError,
} from './scanner';
export type { SecurityScanOptions, SecurityScanResult } from './scanner';

// Honeypot detection
export {
  checkHoneypot,
  isHoneypot,
  clearHoneypotCache,
  HoneypotCheckError,
} from './honeypotCheck';

// Authority checks
export {
  checkMintAuthority,
  checkFreezeAuthority,
  checkUpdateAuthority,
  getContractOwner,
  analyzeOwnership,
  calculateOwnershipRisk,
  getAuthorityRecommendations,
  AuthorityCheckError,
} from './authorityCheck';
export type { AuthorityResult } from './authorityCheck';

// Holder analysis
export {
  getHolderDistribution,
  calculateTopHolderPercentage,
  checkHolderConcentration,
  analyzeHolderConcentration,
  calculateConcentrationRisk,
  getConcentrationRecommendations,
  HolderAnalysisError,
} from './holderAnalysis';
export type { TokenHolder } from './holderAnalysis';

// Liquidity checks
export {
  checkLiquidityLock,
  getLockDuration,
  verifyLockContract,
  analyzeLiquidity,
  calculateLiquidityRisk,
  getLiquidityRecommendations,
  LiquidityCheckError,
} from './liquidityCheck';
export type { LiquidityPool, LockContract } from './liquidityCheck';
