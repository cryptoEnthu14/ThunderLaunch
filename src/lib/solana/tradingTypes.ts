/**
 * Trading Types
 *
 * Type definitions for Solana trading operations
 */

import { PublicKey, TransactionSignature } from '@solana/web3.js';
import type { BondingCurveType } from '@/lib/bonding-curve';
import type { TradeType } from '@/types/trade';

/**
 * Progress callback for trading operations
 */
export type TradingProgressCallback = (step: string, progress: number) => void;

/**
 * Trade execution configuration
 */
export interface TradeConfig {
  /** Token mint address */
  tokenMint: PublicKey;
  /** User's wallet address */
  userWallet: PublicKey;
  /** Liquidity pool address */
  poolAddress: PublicKey;
  /** Current token supply */
  currentSupply: number;
  /** Bonding curve type */
  curveType?: BondingCurveType;
  /** Slippage tolerance (0-1, e.g., 0.01 = 1%) */
  slippageTolerance?: number;
  /** Progress callback */
  onProgress?: TradingProgressCallback;
}

/**
 * Buy trade configuration
 */
export interface BuyTradeConfig extends TradeConfig {
  /** Amount of SOL to spend */
  solAmount: number;
}

/**
 * Sell trade configuration
 */
export interface SellTradeConfig extends TradeConfig {
  /** Amount of tokens to sell */
  tokenAmount: number;
}

/**
 * Trade execution result
 */
export interface TradeExecutionResult {
  /** Transaction signature */
  signature: TransactionSignature;
  /** Trade type */
  tradeType: TradeType;
  /** Amount of tokens traded */
  tokenAmount: number;
  /** Amount of SOL traded */
  solAmount: number;
  /** Price per token */
  price: number;
  /** Platform fee paid */
  platformFee: number;
  /** Creator fee paid */
  creatorFee: number;
  /** Total fees paid */
  totalFees: number;
  /** Actual slippage experienced */
  actualSlippage: number;
  /** New token supply after trade */
  newSupply: number;
  /** Timestamp */
  timestamp: number;
}

/**
 * Trade preview result
 */
export interface TradePreview {
  /** Expected tokens to receive (for buy) or SOL to receive (for sell) */
  expectedOutput: number;
  /** Price per token */
  price: number;
  /** Price impact percentage (0-1) */
  priceImpact: number;
  /** Platform fee */
  platformFee: number;
  /** Creator fee */
  creatorFee: number;
  /** Total fees */
  totalFees: number;
  /** Minimum output accounting for slippage */
  minimumOutput: number;
  /** New supply after trade */
  newSupply: number;
}

/**
 * Token price information
 */
export interface TokenPriceInfo {
  /** Current price in SOL per token */
  priceInSol: number;
  /** Current price in USD per token */
  priceInUsd?: number;
  /** Current supply */
  supply: number;
  /** Market cap in SOL */
  marketCapSol: number;
  /** Market cap in USD */
  marketCapUsd?: number;
  /** Timestamp */
  timestamp: number;
}

/**
 * Pool liquidity information
 */
export interface PoolLiquidityInfo {
  /** Pool address */
  poolAddress: PublicKey;
  /** Token mint address */
  tokenMint: PublicKey;
  /** SOL reserves in the pool */
  solReserves: number;
  /** Token reserves in the pool */
  tokenReserves: number;
  /** Total liquidity in SOL */
  totalLiquiditySol: number;
  /** Total liquidity in USD */
  totalLiquidityUsd?: number;
  /** Current supply */
  currentSupply: number;
  /** Bonding curve type */
  curveType: BondingCurveType;
}

/**
 * Transaction status for monitoring
 */
export enum TransactionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

/**
 * Trade error types
 */
export enum TradeErrorType {
  INSUFFICIENT_SOL = 'INSUFFICIENT_SOL',
  INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',
  SLIPPAGE_EXCEEDED = 'SLIPPAGE_EXCEEDED',
  POOL_NOT_FOUND = 'POOL_NOT_FOUND',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error for trading operations
 */
export class TradeError extends Error {
  constructor(
    public type: TradeErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TradeError';
  }
}

/**
 * Trade monitoring options
 */
export interface TradeMonitoringOptions {
  /** Maximum time to wait for confirmation (ms) */
  timeout?: number;
  /** Polling interval (ms) */
  pollingInterval?: number;
  /** Maximum retries */
  maxRetries?: number;
  /** Callback for status updates */
  onStatusChange?: (status: TransactionStatus) => void;
}

/**
 * Platform configuration for trading
 */
export interface TradingPlatformConfig {
  /** Platform fee percentage (0-1) */
  platformFeePercentage: number;
  /** Creator fee percentage (0-1) */
  creatorFeePercentage: number;
  /** Platform fee wallet */
  platformFeeWallet: PublicKey;
  /** Token creator wallet */
  creatorWallet: PublicKey;
  /** Minimum trade amount in SOL */
  minTradeAmountSol: number;
  /** Minimum trade amount in tokens */
  minTradeAmountTokens: number;
  /** Maximum slippage allowed (0-1) */
  maxSlippageTolerance: number;
}
