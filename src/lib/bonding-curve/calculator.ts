/**
 * Bonding Curve Calculator
 *
 * Pure mathematical functions for calculating token prices using bonding curves.
 * All functions are pure (no side effects) and handle edge cases.
 *
 * Key Concepts:
 * - Linear Curve: price = basePrice + (supply * slope)
 * - Exponential Curve: price = basePrice * e^(growthRate * supply)
 * - Integration: Used to calculate total cost over a range of supply
 */

import {
  BASE_PRICE,
  LINEAR_SLOPE,
  EXPONENTIAL_GROWTH_RATE,
  PLATFORM_FEE_PERCENTAGE,
  CREATOR_FEE_PERCENTAGE,
  TOTAL_FEE_PERCENTAGE,
  MIN_BUY_AMOUNT_SOL,
  MIN_SELL_AMOUNT_TOKENS,
  MIN_TOKEN_AMOUNT,
  INTEGRATION_STEPS,
  BondingCurveType,
} from './constants';

/**
 * Result of a price calculation
 */
export interface PriceResult {
  /** Price per token at the current supply */
  price: number;
  /** Current supply level */
  supply: number;
  /** Curve type used */
  curveType: BondingCurveType;
}

/**
 * Result of a buy calculation
 */
export interface BuyResult {
  /** Total cost in SOL (including fees) */
  totalCost: number;
  /** Number of tokens received */
  tokensReceived: number;
  /** Platform fee in SOL */
  platformFee: number;
  /** Creator fee in SOL */
  creatorFee: number;
  /** Total fees in SOL */
  totalFees: number;
  /** Base cost before fees */
  baseCost: number;
  /** Average price per token */
  averagePrice: number;
  /** Price impact / slippage percentage */
  priceImpact: number;
  /** New supply after purchase */
  newSupply: number;
}

/**
 * Result of a sell calculation
 */
export interface SellResult {
  /** Proceeds in SOL (after fees) */
  proceeds: number;
  /** Number of tokens sold */
  tokensSold: number;
  /** Platform fee in SOL */
  platformFee: number;
  /** Creator fee in SOL */
  creatorFee: number;
  /** Total fees in SOL */
  totalFees: number;
  /** Base proceeds before fees */
  baseProceeds: number;
  /** Average price per token */
  averagePrice: number;
  /** Price impact / slippage percentage */
  priceImpact: number;
  /** New supply after sale */
  newSupply: number;
}

/**
 * Fee breakdown for a transaction
 */
export interface FeeBreakdown {
  /** Platform fee amount */
  platformFee: number;
  /** Creator fee amount */
  creatorFee: number;
  /** Total fee amount */
  totalFee: number;
  /** Fee percentage applied */
  feePercentage: number;
}

/**
 * Calculate price using linear bonding curve
 *
 * Formula: price = basePrice + (supply * slope)
 *
 * @param supply - Current token supply
 * @param basePrice - Starting price at zero supply (default: BASE_PRICE)
 * @param slope - Rate of price increase per token (default: LINEAR_SLOPE)
 * @returns The price per token at the given supply
 *
 * @example
 * ```typescript
 * const price = calculateLinearPrice(1000000);
 * // Returns: 0.0001 + (1000000 * 0.00000001) = 0.0101 SOL per token
 * ```
 */
export function calculateLinearPrice(
  supply: number,
  basePrice: number = BASE_PRICE,
  slope: number = LINEAR_SLOPE
): number {
  // Edge case: negative supply
  if (supply < 0) {
    throw new Error('Supply cannot be negative');
  }

  // Edge case: invalid parameters
  if (basePrice < 0) {
    throw new Error('Base price cannot be negative');
  }

  if (slope < 0) {
    throw new Error('Slope cannot be negative');
  }

  // Linear formula: price = basePrice + (supply * slope)
  return basePrice + supply * slope;
}

/**
 * Calculate price using exponential bonding curve
 *
 * Formula: price = basePrice * e^(growthRate * supply)
 *
 * @param supply - Current token supply
 * @param basePrice - Starting price at zero supply (default: BASE_PRICE)
 * @param growthRate - Exponential growth coefficient (default: EXPONENTIAL_GROWTH_RATE)
 * @returns The price per token at the given supply
 *
 * @example
 * ```typescript
 * const price = calculateExponentialPrice(1000000);
 * // Returns: 0.0001 * e^(0.0000001 * 1000000) ≈ 0.0001 * e^0.1 ≈ 0.000110517 SOL
 * ```
 */
export function calculateExponentialPrice(
  supply: number,
  basePrice: number = BASE_PRICE,
  growthRate: number = EXPONENTIAL_GROWTH_RATE
): number {
  // Edge case: negative supply
  if (supply < 0) {
    throw new Error('Supply cannot be negative');
  }

  // Edge case: invalid parameters
  if (basePrice < 0) {
    throw new Error('Base price cannot be negative');
  }

  if (growthRate < 0) {
    throw new Error('Growth rate cannot be negative');
  }

  // Exponential formula: price = basePrice * e^(growthRate * supply)
  const exponent = growthRate * supply;

  // Edge case: prevent overflow for very large exponents
  if (exponent > 100) {
    throw new Error('Exponential growth too large - supply exceeds safe limits');
  }

  return basePrice * Math.exp(exponent);
}

/**
 * Calculate the total cost to buy tokens using numerical integration
 *
 * Integrates the price curve from currentSupply to (currentSupply + amount)
 * For linear: integral = basePrice * amount + slope * (supply * amount + amount^2 / 2)
 * For exponential: Uses numerical integration (Riemann sum)
 *
 * @param amount - Number of tokens to buy
 * @param currentSupply - Current token supply before purchase
 * @param curveType - Type of bonding curve to use
 * @param basePrice - Starting price (default: BASE_PRICE)
 * @param slopeOrGrowth - Slope for linear or growth rate for exponential
 * @returns Total cost in SOL before fees
 *
 * @example
 * ```typescript
 * const cost = calculateBuyPrice(1000, 0, BondingCurveType.LINEAR);
 * // Calculates cost to buy first 1000 tokens on linear curve
 * ```
 */
export function calculateBuyPrice(
  amount: number,
  currentSupply: number,
  curveType: BondingCurveType = BondingCurveType.LINEAR,
  basePrice: number = BASE_PRICE,
  slopeOrGrowth?: number
): number {
  // Edge cases
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  if (currentSupply < 0) {
    throw new Error('Current supply cannot be negative');
  }

  if (amount < MIN_TOKEN_AMOUNT) {
    throw new Error(`Amount must be at least ${MIN_TOKEN_AMOUNT}`);
  }

  const slope = slopeOrGrowth ?? LINEAR_SLOPE;
  const growthRate = slopeOrGrowth ?? EXPONENTIAL_GROWTH_RATE;

  if (curveType === BondingCurveType.LINEAR) {
    // Analytical solution for linear curve
    // Integral of (basePrice + slope * x) from currentSupply to (currentSupply + amount)
    // = basePrice * amount + slope * (currentSupply * amount + amount^2 / 2)

    const baseCost = basePrice * amount;
    const variableCost = slope * (currentSupply * amount + (amount * amount) / 2);

    return baseCost + variableCost;
  } else {
    // Numerical integration for exponential curve using trapezoidal rule
    // More accurate than simple Riemann sum

    const step = amount / INTEGRATION_STEPS;
    let totalCost = 0;

    for (let i = 0; i < INTEGRATION_STEPS; i++) {
      const supply1 = currentSupply + i * step;
      const supply2 = currentSupply + (i + 1) * step;

      const price1 = calculateExponentialPrice(supply1, basePrice, growthRate);
      const price2 = calculateExponentialPrice(supply2, basePrice, growthRate);

      // Trapezoidal rule: average of two prices * step width
      totalCost += ((price1 + price2) / 2) * step;
    }

    return totalCost;
  }
}

/**
 * Calculate the proceeds from selling tokens using numerical integration
 *
 * Integrates the price curve backwards from currentSupply to (currentSupply - amount)
 *
 * @param amount - Number of tokens to sell
 * @param currentSupply - Current token supply before sale
 * @param curveType - Type of bonding curve to use
 * @param basePrice - Starting price (default: BASE_PRICE)
 * @param slopeOrGrowth - Slope for linear or growth rate for exponential
 * @returns Total proceeds in SOL before fees
 *
 * @example
 * ```typescript
 * const proceeds = calculateSellProceeds(1000, 5000, BondingCurveType.LINEAR);
 * // Calculates proceeds from selling 1000 tokens when supply is 5000
 * ```
 */
export function calculateSellProceeds(
  amount: number,
  currentSupply: number,
  curveType: BondingCurveType = BondingCurveType.LINEAR,
  basePrice: number = BASE_PRICE,
  slopeOrGrowth?: number
): number {
  // Edge cases
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  if (currentSupply < 0) {
    throw new Error('Current supply cannot be negative');
  }

  if (amount > currentSupply) {
    throw new Error('Cannot sell more tokens than current supply');
  }

  if (amount < MIN_TOKEN_AMOUNT) {
    throw new Error(`Amount must be at least ${MIN_TOKEN_AMOUNT}`);
  }

  const slope = slopeOrGrowth ?? LINEAR_SLOPE;
  const growthRate = slopeOrGrowth ?? EXPONENTIAL_GROWTH_RATE;

  const newSupply = currentSupply - amount;

  if (curveType === BondingCurveType.LINEAR) {
    // Analytical solution for linear curve
    // Integral from newSupply to currentSupply is same as buy price from newSupply

    const baseProceeds = basePrice * amount;
    const variableProceeds = slope * (newSupply * amount + (amount * amount) / 2);

    return baseProceeds + variableProceeds;
  } else {
    // Numerical integration for exponential curve
    const step = amount / INTEGRATION_STEPS;
    let totalProceeds = 0;

    for (let i = 0; i < INTEGRATION_STEPS; i++) {
      const supply1 = currentSupply - i * step;
      const supply2 = currentSupply - (i + 1) * step;

      const price1 = calculateExponentialPrice(supply1, basePrice, growthRate);
      const price2 = calculateExponentialPrice(supply2, basePrice, growthRate);

      // Trapezoidal rule
      totalProceeds += ((price1 + price2) / 2) * step;
    }

    return totalProceeds;
  }
}

/**
 * Calculate fee breakdown for a transaction
 *
 * @param amount - Transaction amount in SOL
 * @param platformFeePercentage - Platform fee percentage (default: PLATFORM_FEE_PERCENTAGE)
 * @param creatorFeePercentage - Creator fee percentage (default: CREATOR_FEE_PERCENTAGE)
 * @returns Fee breakdown with platform, creator, and total fees
 *
 * @example
 * ```typescript
 * const fees = calculateFee(1.0);
 * // Returns: { platformFee: 0.01, creatorFee: 0.02, totalFee: 0.03, feePercentage: 0.03 }
 * ```
 */
export function calculateFee(
  amount: number,
  platformFeePercentage: number = PLATFORM_FEE_PERCENTAGE,
  creatorFeePercentage: number = CREATOR_FEE_PERCENTAGE
): FeeBreakdown {
  // Edge cases
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }

  if (platformFeePercentage < 0 || platformFeePercentage > 1) {
    throw new Error('Platform fee percentage must be between 0 and 1');
  }

  if (creatorFeePercentage < 0 || creatorFeePercentage > 1) {
    throw new Error('Creator fee percentage must be between 0 and 1');
  }

  const platformFee = amount * platformFeePercentage;
  const creatorFee = amount * creatorFeePercentage;
  const totalFee = platformFee + creatorFee;
  const feePercentage = platformFeePercentage + creatorFeePercentage;

  return {
    platformFee,
    creatorFee,
    totalFee,
    feePercentage,
  };
}

/**
 * Calculate price impact (slippage) for a trade
 *
 * Slippage = (averagePrice - startPrice) / startPrice
 *
 * @param startPrice - Price at current supply
 * @param averagePrice - Average price over the trade
 * @returns Slippage as a decimal (0.05 = 5% slippage)
 *
 * @example
 * ```typescript
 * const slippage = calculateSlippage(0.01, 0.0105);
 * // Returns: 0.05 (5% slippage)
 * ```
 */
export function calculateSlippage(startPrice: number, averagePrice: number): number {
  // Edge cases
  if (startPrice <= 0) {
    throw new Error('Start price must be positive');
  }

  if (averagePrice < 0) {
    throw new Error('Average price cannot be negative');
  }

  // Handle zero average price (shouldn't happen in practice)
  if (averagePrice === 0) {
    return 0;
  }

  // Calculate slippage as percentage change
  const slippage = (averagePrice - startPrice) / startPrice;

  // Return absolute value for sells (where averagePrice might be less than startPrice)
  return Math.abs(slippage);
}

/**
 * Calculate complete buy transaction with fees
 *
 * @param solAmount - Amount of SOL to spend (including fees)
 * @param currentSupply - Current token supply
 * @param curveType - Bonding curve type (default: LINEAR)
 * @returns Complete buy result with tokens received and fee breakdown
 *
 * @example
 * ```typescript
 * const result = completeBuyCalculation(1.0, 0);
 * // Returns full breakdown of buying tokens with 1 SOL
 * ```
 */
export function completeBuyCalculation(
  solAmount: number,
  currentSupply: number,
  curveType: BondingCurveType = BondingCurveType.LINEAR
): BuyResult {
  // Edge cases
  if (solAmount < MIN_BUY_AMOUNT_SOL) {
    throw new Error(`Minimum buy amount is ${MIN_BUY_AMOUNT_SOL} SOL`);
  }

  if (currentSupply < 0) {
    throw new Error('Current supply cannot be negative');
  }

  // Calculate fees on the input amount
  const fees = calculateFee(solAmount);
  const amountAfterFees = solAmount - fees.totalFee;

  // Binary search to find how many tokens can be bought with amountAfterFees
  // We need to solve: calculateBuyPrice(tokens) = amountAfterFees

  let low = 0;
  let high = 1_000_000_000; // Start with reasonable upper bound
  let tokensReceived = 0;
  let iterations = 0;
  const maxIterations = 100;
  const tolerance = 0.000001; // 1 millionth of a SOL

  while (iterations < maxIterations && high - low > MIN_TOKEN_AMOUNT) {
    const mid = (low + high) / 2;
    const cost = calculateBuyPrice(mid, currentSupply, curveType);

    if (Math.abs(cost - amountAfterFees) < tolerance) {
      tokensReceived = mid;
      break;
    }

    if (cost < amountAfterFees) {
      low = mid;
      tokensReceived = mid; // Keep the last valid amount
    } else {
      high = mid;
    }

    iterations++;
  }

  // Ensure we found a valid amount
  if (tokensReceived === 0) {
    throw new Error('Unable to calculate token amount for given SOL amount');
  }

  // Calculate final metrics
  const baseCost = calculateBuyPrice(tokensReceived, currentSupply, curveType);
  const averagePrice = baseCost / tokensReceived;
  const startPrice =
    curveType === BondingCurveType.LINEAR
      ? calculateLinearPrice(currentSupply)
      : calculateExponentialPrice(currentSupply);
  const priceImpact = calculateSlippage(startPrice, averagePrice);
  const newSupply = currentSupply + tokensReceived;

  return {
    totalCost: solAmount,
    tokensReceived,
    platformFee: fees.platformFee,
    creatorFee: fees.creatorFee,
    totalFees: fees.totalFee,
    baseCost,
    averagePrice,
    priceImpact,
    newSupply,
  };
}

/**
 * Calculate complete sell transaction with fees
 *
 * @param tokenAmount - Number of tokens to sell
 * @param currentSupply - Current token supply
 * @param curveType - Bonding curve type (default: LINEAR)
 * @returns Complete sell result with proceeds and fee breakdown
 *
 * @example
 * ```typescript
 * const result = completeSellCalculation(1000, 5000);
 * // Returns full breakdown of selling 1000 tokens when supply is 5000
 * ```
 */
export function completeSellCalculation(
  tokenAmount: number,
  currentSupply: number,
  curveType: BondingCurveType = BondingCurveType.LINEAR
): SellResult {
  // Edge cases
  if (tokenAmount < MIN_SELL_AMOUNT_TOKENS) {
    throw new Error(`Minimum sell amount is ${MIN_SELL_AMOUNT_TOKENS} tokens`);
  }

  if (currentSupply < 0) {
    throw new Error('Current supply cannot be negative');
  }

  if (tokenAmount > currentSupply) {
    throw new Error('Cannot sell more tokens than current supply');
  }

  // Calculate base proceeds before fees
  const baseProceeds = calculateSellProceeds(tokenAmount, currentSupply, curveType);

  // Calculate fees on the proceeds
  const fees = calculateFee(baseProceeds);
  const proceedsAfterFees = baseProceeds - fees.totalFee;

  // Calculate metrics
  const averagePrice = baseProceeds / tokenAmount;
  const startPrice =
    curveType === BondingCurveType.LINEAR
      ? calculateLinearPrice(currentSupply)
      : calculateExponentialPrice(currentSupply);
  const priceImpact = calculateSlippage(startPrice, averagePrice);
  const newSupply = currentSupply - tokenAmount;

  return {
    proceeds: proceedsAfterFees,
    tokensSold: tokenAmount,
    platformFee: fees.platformFee,
    creatorFee: fees.creatorFee,
    totalFees: fees.totalFee,
    baseProceeds,
    averagePrice,
    priceImpact,
    newSupply,
  };
}

/**
 * Get current price for a given supply and curve type
 *
 * @param supply - Current token supply
 * @param curveType - Bonding curve type
 * @returns Price result with current price information
 */
export function getCurrentPrice(
  supply: number,
  curveType: BondingCurveType = BondingCurveType.LINEAR
): PriceResult {
  if (supply < 0) {
    throw new Error('Supply cannot be negative');
  }

  const price =
    curveType === BondingCurveType.LINEAR
      ? calculateLinearPrice(supply)
      : calculateExponentialPrice(supply);

  return {
    price,
    supply,
    curveType,
  };
}
