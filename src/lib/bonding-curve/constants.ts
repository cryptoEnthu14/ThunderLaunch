/**
 * Bonding Curve Constants
 *
 * Configuration values for token bonding curve pricing mechanics.
 * These constants define the economic parameters of the token launch system.
 */

/**
 * Bonding curve types supported by the platform
 */
export enum BondingCurveType {
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
}

/**
 * Base price for tokens at zero supply (in SOL)
 * This is the starting price when no tokens have been minted yet
 */
export const BASE_PRICE = 0.0001; // 0.0001 SOL per token

/**
 * Linear bonding curve slope
 * Determines how fast price increases with supply for linear curves
 * price = basePrice + (supply * slope)
 */
export const LINEAR_SLOPE = 0.00000001; // Price increase per token

/**
 * Exponential growth rate
 * Determines the steepness of exponential price growth
 * price = basePrice * e^(growthRate * supply)
 */
export const EXPONENTIAL_GROWTH_RATE = 0.0000001; // Growth coefficient

/**
 * Platform fee percentage (1.0%)
 * Applied to all buy and sell transactions
 */
export const PLATFORM_FEE_PERCENTAGE = 0.01; // 1.0%

/**
 * Creator fee percentage (1.0%)
 * Goes to the token creator on each transaction
 */
export const CREATOR_FEE_PERCENTAGE = 0.01; // 1.0%

/**
 * Total fee percentage
 * Combined platform and creator fees
 */
export const TOTAL_FEE_PERCENTAGE = PLATFORM_FEE_PERCENTAGE + CREATOR_FEE_PERCENTAGE; // 2.0%

/**
 * Minimum trade amounts to prevent dust attacks and ensure meaningful transactions
 */
export const MIN_BUY_AMOUNT_SOL = 0.001; // Minimum 0.001 SOL per buy
export const MIN_SELL_AMOUNT_TOKENS = 1; // Minimum 1 token per sell
export const MIN_TOKEN_AMOUNT = 0.000001; // Minimum token quantity (6 decimals)

/**
 * Maximum slippage tolerance (10%)
 * Transactions exceeding this slippage should be warned about
 */
export const MAX_SLIPPAGE_TOLERANCE = 0.1; // 10%

/**
 * Supply thresholds for different curve behaviors
 */
export const INITIAL_SUPPLY = 0; // Starting supply
export const MAX_SUPPLY = 1_000_000_000; // 1 billion tokens max

/**
 * Precision for calculations
 * Number of decimal places to maintain in intermediate calculations
 */
export const CALCULATION_PRECISION = 18; // 18 decimal places

/**
 * Integration steps for numerical integration
 * Higher values = more accurate but slower calculations
 */
export const INTEGRATION_STEPS = 1000;

/**
 * Lamports per SOL for conversion
 */
export const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Default token decimals for SPL tokens
 */
export const DEFAULT_TOKEN_DECIMALS = 9;
