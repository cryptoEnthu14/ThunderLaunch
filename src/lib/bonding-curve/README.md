# Bonding Curve Calculator

A comprehensive TypeScript library for calculating token prices using bonding curves. This module provides pure mathematical functions for linear and exponential bonding curves, with built-in fee handling, slippage calculation, and edge case protection.

## Overview

Bonding curves are mathematical functions that determine token prices based on supply. As more tokens are bought (supply increases), the price increases along the curve. When tokens are sold (supply decreases), the price decreases.

### Supported Curve Types

1. **Linear Bonding Curve**
   - Formula: `price = basePrice + (supply × slope)`
   - Predictable, steady price increase
   - Good for stable, gradual growth

2. **Exponential Bonding Curve**
   - Formula: `price = basePrice × e^(growthRate × supply)`
   - Rapid price increase as supply grows
   - Good for early adopter rewards

## Installation

```typescript
import {
  BondingCurveType,
  completeBuyCalculation,
  completeSellCalculation,
  getCurrentPrice,
  calculateLinearPrice,
  calculateExponentialPrice,
} from '@/lib/bonding-curve';
```

## Core Functions

### Price Calculation

#### `calculateLinearPrice(supply, basePrice?, slope?)`

Calculate price at a given supply using linear curve.

```typescript
const price = calculateLinearPrice(1_000_000);
// Returns: 0.0001 + (1000000 * 0.00000001) = 0.0101 SOL
```

#### `calculateExponentialPrice(supply, basePrice?, growthRate?)`

Calculate price at a given supply using exponential curve.

```typescript
const price = calculateExponentialPrice(1_000_000);
// Returns: 0.0001 * e^(0.0000001 * 1000000) ≈ 0.000110517 SOL
```

### Buy/Sell Calculations

#### `completeBuyCalculation(solAmount, currentSupply, curveType?)`

Calculate complete buy transaction with fees and slippage.

```typescript
const result = completeBuyCalculation(1.0, 0, BondingCurveType.LINEAR);

console.log(result);
// {
//   totalCost: 1.0,
//   tokensReceived: 194174,
//   platformFee: 0.01,
//   creatorFee: 0.02,
//   totalFees: 0.03,
//   baseCost: 0.97,
//   averagePrice: 0.00000499,
//   priceImpact: 0.0497,
//   newSupply: 194174
// }
```

#### `completeSellCalculation(tokenAmount, currentSupply, curveType?)`

Calculate complete sell transaction with fees and slippage.

```typescript
const result = completeSellCalculation(10_000, 50_000, BondingCurveType.LINEAR);

console.log(result);
// {
//   proceeds: 0.004656, // SOL after fees
//   tokensSold: 10000,
//   platformFee: 0.000048,
//   creatorFee: 0.000096,
//   totalFees: 0.000144,
//   baseProceeds: 0.0048,
//   averagePrice: 0.00000048,
//   priceImpact: 0.10,
//   newSupply: 40000
// }
```

### Integration Functions

#### `calculateBuyPrice(amount, currentSupply, curveType?, basePrice?, slopeOrGrowth?)`

Calculate total cost to buy tokens by integrating over the bonding curve.

For linear curves, uses analytical solution:
```
integral = basePrice × amount + slope × (currentSupply × amount + amount² / 2)
```

For exponential curves, uses numerical integration (trapezoidal rule).

```typescript
const cost = calculateBuyPrice(1000, 0, BondingCurveType.LINEAR);
// Returns total SOL cost to buy 1000 tokens starting from 0 supply
```

#### `calculateSellProceeds(amount, currentSupply, curveType?, basePrice?, slopeOrGrowth?)`

Calculate proceeds from selling tokens by integrating backwards.

```typescript
const proceeds = calculateSellProceeds(1000, 5000, BondingCurveType.LINEAR);
// Returns total SOL proceeds from selling 1000 tokens at supply 5000
```

### Fee Calculation

#### `calculateFee(amount, platformFeePercentage?, creatorFeePercentage?)`

Calculate fee breakdown for a transaction.

```typescript
const fees = calculateFee(1.0);
// {
//   platformFee: 0.01,    // 1%
//   creatorFee: 0.02,     // 2%
//   totalFee: 0.03,       // 3%
//   feePercentage: 0.03
// }
```

### Slippage Calculation

#### `calculateSlippage(startPrice, averagePrice)`

Calculate price impact (slippage) for a trade.

```typescript
const slippage = calculateSlippage(0.01, 0.0105);
// Returns: 0.05 (5% slippage)
```

### Current Price

#### `getCurrentPrice(supply, curveType?)`

Get current price at a given supply.

```typescript
const priceInfo = getCurrentPrice(100_000, BondingCurveType.LINEAR);
// {
//   price: 0.0011,
//   supply: 100000,
//   curveType: 'linear'
// }
```

## Constants

### Economic Parameters

```typescript
BASE_PRICE = 0.0001                    // Starting price at 0 supply (SOL)
LINEAR_SLOPE = 0.00000001              // Linear curve slope
EXPONENTIAL_GROWTH_RATE = 0.0000001    // Exponential growth coefficient
```

### Fees

```typescript
PLATFORM_FEE_PERCENTAGE = 0.01         // 1.0%
CREATOR_FEE_PERCENTAGE = 0.02          // 2.0%
TOTAL_FEE_PERCENTAGE = 0.03            // 3.0%
```

### Trade Limits

```typescript
MIN_BUY_AMOUNT_SOL = 0.001             // Minimum 0.001 SOL per buy
MIN_SELL_AMOUNT_TOKENS = 1             // Minimum 1 token per sell
MIN_TOKEN_AMOUNT = 0.000001            // Minimum token quantity
MAX_SLIPPAGE_TOLERANCE = 0.1           // 10% slippage warning threshold
```

### Supply Limits

```typescript
INITIAL_SUPPLY = 0
MAX_SUPPLY = 1_000_000_000             // 1 billion tokens
```

## Type Definitions

### BuyResult

```typescript
interface BuyResult {
  totalCost: number;         // Total SOL spent (including fees)
  tokensReceived: number;    // Tokens received
  platformFee: number;       // Platform fee in SOL
  creatorFee: number;        // Creator fee in SOL
  totalFees: number;         // Total fees in SOL
  baseCost: number;          // Cost before fees
  averagePrice: number;      // Average price per token
  priceImpact: number;       // Slippage percentage
  newSupply: number;         // Supply after purchase
}
```

### SellResult

```typescript
interface SellResult {
  proceeds: number;          // SOL received (after fees)
  tokensSold: number;        // Tokens sold
  platformFee: number;       // Platform fee in SOL
  creatorFee: number;        // Creator fee in SOL
  totalFees: number;         // Total fees in SOL
  baseProceeds: number;      // Proceeds before fees
  averagePrice: number;      // Average price per token
  priceImpact: number;       // Slippage percentage
  newSupply: number;         // Supply after sale
}
```

## Examples

### Basic Buy Transaction

```typescript
import { completeBuyCalculation, BondingCurveType } from '@/lib/bonding-curve';

// User wants to buy with 1 SOL
const buyResult = completeBuyCalculation(
  1.0,                        // SOL amount
  0,                          // Current supply
  BondingCurveType.LINEAR     // Curve type
);

console.log(`You will receive: ${buyResult.tokensReceived} tokens`);
console.log(`Average price: ${buyResult.averagePrice} SOL per token`);
console.log(`Price impact: ${(buyResult.priceImpact * 100).toFixed(2)}%`);
```

### Basic Sell Transaction

```typescript
import { completeSellCalculation, BondingCurveType } from '@/lib/bonding-curve';

// User wants to sell 10,000 tokens
const sellResult = completeSellCalculation(
  10_000,                     // Token amount
  50_000,                     // Current supply
  BondingCurveType.LINEAR     // Curve type
);

console.log(`You will receive: ${sellResult.proceeds} SOL`);
console.log(`After fees: ${sellResult.totalFees} SOL in fees`);
console.log(`Price impact: ${(sellResult.priceImpact * 100).toFixed(2)}%`);
```

### Price Comparison

```typescript
import {
  calculateLinearPrice,
  calculateExponentialPrice
} from '@/lib/bonding-curve';

const supply = 100_000;

const linearPrice = calculateLinearPrice(supply);
const expPrice = calculateExponentialPrice(supply);

console.log(`Linear price at ${supply}: ${linearPrice} SOL`);
console.log(`Exponential price at ${supply}: ${expPrice} SOL`);
```

## Edge Cases and Error Handling

All functions include comprehensive error handling:

### Validation Errors

```typescript
// Negative supply
calculateLinearPrice(-100);
// ❌ Error: Supply cannot be negative

// Overselling
completeSellCalculation(1000, 500);
// ❌ Error: Cannot sell more tokens than current supply

// Below minimum buy
completeBuyCalculation(0.0001, 0);
// ❌ Error: Minimum buy amount is 0.001 SOL

// Exponential overflow
calculateExponentialPrice(10_000_000_000);
// ❌ Error: Exponential growth too large
```

### Safe Defaults

- All functions use safe default values
- Numerical integration prevents precision loss
- Binary search ensures accurate token calculations
- Zero supply is handled gracefully

## Mathematical Formulas

### Linear Curve Integration

Buy price from supply S₁ to S₂:
```
Cost = ∫[S₁ to S₂] (basePrice + slope × x) dx
     = basePrice × (S₂ - S₁) + slope × (S₂² - S₁²) / 2
```

### Exponential Curve Integration

Buy price from supply S₁ to S₂:
```
Cost = ∫[S₁ to S₂] (basePrice × e^(growthRate × x)) dx
     ≈ Σ[trapezoidal rule with 1000 steps]
```

### Fee Calculation

```
Total Cost = Base Cost / (1 - Total Fee Percentage)
Platform Fee = Base Cost × Platform Fee Percentage
Creator Fee = Base Cost × Creator Fee Percentage
```

### Price Impact (Slippage)

```
Price Impact = |Average Price - Start Price| / Start Price
```

## Testing

Run the comprehensive examples:

```bash
npx ts-node src/lib/bonding-curve/examples.ts
```

This will demonstrate:
- Price calculations at various supply levels
- Complete buy/sell transactions
- Fee breakdowns
- Price impact analysis
- Curve comparisons
- Edge case handling
- Real-world token launch lifecycle

## Best Practices

1. **Always check slippage** before executing trades
2. **Use appropriate curve type** for your token economics
3. **Validate user inputs** before calling functions
4. **Handle errors gracefully** with try-catch blocks
5. **Show fee breakdown** to users for transparency
6. **Warn on high slippage** (>10%) to prevent bad trades
7. **Use current supply** from on-chain data for accuracy

## Integration with Solana

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { completeBuyCalculation } from '@/lib/bonding-curve';

async function buyTokens(
  connection: Connection,
  tokenMint: PublicKey,
  solAmount: number
) {
  // Get current supply from chain
  const mintInfo = await connection.getTokenSupply(tokenMint);
  const currentSupply = parseInt(mintInfo.value.amount);

  // Calculate buy amount
  const result = completeBuyCalculation(solAmount, currentSupply);

  // Warn if slippage is high
  if (result.priceImpact > 0.1) {
    console.warn('High slippage detected!');
  }

  // Execute transaction...
  return result;
}
```

## License

MIT
