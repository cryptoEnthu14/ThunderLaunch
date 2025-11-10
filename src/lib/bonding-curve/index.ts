/**
 * Bonding Curve Library
 *
 * Mathematical functions and utilities for token bonding curve pricing.
 *
 * @module bonding-curve
 */

// Export all calculator functions
export {
  calculateLinearPrice,
  calculateExponentialPrice,
  calculateBuyPrice,
  calculateSellProceeds,
  calculateFee,
  calculateSlippage,
  completeBuyCalculation,
  completeSellCalculation,
  getCurrentPrice,
} from './calculator';

// Export all types
export type {
  PriceResult,
  BuyResult,
  SellResult,
  FeeBreakdown,
} from './calculator';

// Export all constants
export {
  BondingCurveType,
  BASE_PRICE,
  LINEAR_SLOPE,
  EXPONENTIAL_GROWTH_RATE,
  PLATFORM_FEE_PERCENTAGE,
  CREATOR_FEE_PERCENTAGE,
  TOTAL_FEE_PERCENTAGE,
  MIN_BUY_AMOUNT_SOL,
  MIN_SELL_AMOUNT_TOKENS,
  MIN_TOKEN_AMOUNT,
  MAX_SLIPPAGE_TOLERANCE,
  INITIAL_SUPPLY,
  MAX_SUPPLY,
  CALCULATION_PRECISION,
  INTEGRATION_STEPS,
  LAMPORTS_PER_SOL,
  DEFAULT_TOKEN_DECIMALS,
} from './constants';
