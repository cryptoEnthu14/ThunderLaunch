/**
 * Bonding Curve Examples
 *
 * Demonstrates usage of all bonding curve functions with real-world scenarios.
 * These examples can be used as a reference or for testing purposes.
 */

/**
 * Helper function to create padding string
 */
function createPadding(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ' ';
  }
  return result;
}

import {
  BondingCurveType,
  calculateLinearPrice,
  calculateExponentialPrice,
  calculateBuyPrice,
  calculateSellProceeds,
  calculateFee,
  calculateSlippage,
  completeBuyCalculation,
  completeSellCalculation,
  getCurrentPrice,
} from './index';

/**
 * Example 1: Calculate prices at different supply levels
 */
export function examplePriceCalculations() {
  console.log('=== Example 1: Price Calculations ===\n');

  // Linear curve prices
  console.log('Linear Bonding Curve Prices:');
  const supplies = [0, 1_000, 10_000, 100_000, 1_000_000, 10_000_000];

  supplies.forEach((supply) => {
    const price = calculateLinearPrice(supply);
    console.log(`Supply: ${supply.toLocaleString()} tokens -> Price: ${price.toFixed(8)} SOL`);
  });

  console.log('\nExponential Bonding Curve Prices:');
  supplies.forEach((supply) => {
    const price = calculateExponentialPrice(supply);
    console.log(`Supply: ${supply.toLocaleString()} tokens -> Price: ${price.toFixed(8)} SOL`);
  });

  console.log('\n');
}

/**
 * Example 2: Complete buy transaction
 */
export function exampleBuyTransaction() {
  console.log('=== Example 2: Buy Transaction ===\n');

  // User wants to buy tokens with 1 SOL
  const solAmount = 1.0;
  const currentSupply = 0; // Starting from zero supply

  console.log(`Buying tokens with ${solAmount} SOL at supply ${currentSupply}\n`);

  // Linear curve
  const linearResult = completeBuyCalculation(solAmount, currentSupply, BondingCurveType.LINEAR);

  console.log('Linear Curve Results:');
  console.log(`- Tokens Received: ${linearResult.tokensReceived.toLocaleString()}`);
  console.log(`- Average Price: ${linearResult.averagePrice.toFixed(8)} SOL per token`);
  console.log(`- Base Cost: ${linearResult.baseCost.toFixed(6)} SOL`);
  console.log(`- Platform Fee: ${linearResult.platformFee.toFixed(6)} SOL (1%)`);
  console.log(`- Creator Fee: ${linearResult.creatorFee.toFixed(6)} SOL (1%)`);
  console.log(`- Total Fees: ${linearResult.totalFees.toFixed(6)} SOL (2%)`);
  console.log(`- Price Impact: ${(linearResult.priceImpact * 100).toFixed(2)}%`);
  console.log(`- New Supply: ${linearResult.newSupply.toLocaleString()}`);

  // Exponential curve
  const expResult = completeBuyCalculation(solAmount, currentSupply, BondingCurveType.EXPONENTIAL);

  console.log('\nExponential Curve Results:');
  console.log(`- Tokens Received: ${expResult.tokensReceived.toLocaleString()}`);
  console.log(`- Average Price: ${expResult.averagePrice.toFixed(8)} SOL per token`);
  console.log(`- Base Cost: ${expResult.baseCost.toFixed(6)} SOL`);
  console.log(`- Total Fees: ${expResult.totalFees.toFixed(6)} SOL (2%)`);
  console.log(`- Price Impact: ${(expResult.priceImpact * 100).toFixed(2)}%`);

  console.log('\n');
}

/**
 * Example 3: Complete sell transaction
 */
export function exampleSellTransaction() {
  console.log('=== Example 3: Sell Transaction ===\n');

  // User wants to sell 10,000 tokens when supply is 50,000
  const tokenAmount = 10_000;
  const currentSupply = 50_000;

  console.log(`Selling ${tokenAmount.toLocaleString()} tokens at supply ${currentSupply.toLocaleString()}\n`);

  // Linear curve
  const linearResult = completeSellCalculation(tokenAmount, currentSupply, BondingCurveType.LINEAR);

  console.log('Linear Curve Results:');
  console.log(`- Tokens Sold: ${linearResult.tokensSold.toLocaleString()}`);
  console.log(`- Average Price: ${linearResult.averagePrice.toFixed(8)} SOL per token`);
  console.log(`- Base Proceeds: ${linearResult.baseProceeds.toFixed(6)} SOL`);
  console.log(`- Platform Fee: ${linearResult.platformFee.toFixed(6)} SOL (1%)`);
  console.log(`- Creator Fee: ${linearResult.creatorFee.toFixed(6)} SOL (1%)`);
  console.log(`- Total Fees: ${linearResult.totalFees.toFixed(6)} SOL (2%)`);
  console.log(`- Net Proceeds: ${linearResult.proceeds.toFixed(6)} SOL`);
  console.log(`- Price Impact: ${(linearResult.priceImpact * 100).toFixed(2)}%`);
  console.log(`- New Supply: ${linearResult.newSupply.toLocaleString()}`);

  console.log('\n');
}

/**
 * Example 4: Price impact at different trade sizes
 */
export function examplePriceImpact() {
  console.log('=== Example 4: Price Impact Analysis ===\n');

  const currentSupply = 100_000;
  const tradeSizes = [100, 1_000, 10_000, 50_000];

  console.log(`Current Supply: ${currentSupply.toLocaleString()} tokens\n`);

  tradeSizes.forEach((amount) => {
    const cost = calculateBuyPrice(amount, currentSupply, BondingCurveType.LINEAR);
    const averagePrice = cost / amount;
    const startPrice = calculateLinearPrice(currentSupply);
    const impact = calculateSlippage(startPrice, averagePrice);

    console.log(`Buy ${amount.toLocaleString()} tokens:`);
    console.log(`  - Start Price: ${startPrice.toFixed(8)} SOL`);
    console.log(`  - Average Price: ${averagePrice.toFixed(8)} SOL`);
    console.log(`  - Price Impact: ${(impact * 100).toFixed(2)}%`);
    console.log(`  - Total Cost: ${cost.toFixed(6)} SOL\n`);
  });
}

/**
 * Example 5: Fee calculations
 */
export function exampleFeeCalculations() {
  console.log('=== Example 5: Fee Calculations ===\n');

  const amounts = [0.1, 1.0, 10.0, 100.0];

  amounts.forEach((amount) => {
    const fees = calculateFee(amount);

    console.log(`Transaction Amount: ${amount.toFixed(2)} SOL`);
    console.log(`  - Platform Fee (1%): ${fees.platformFee.toFixed(4)} SOL`);
    console.log(`  - Creator Fee (1%): ${fees.creatorFee.toFixed(4)} SOL`);
    console.log(`  - Total Fee (2%): ${fees.totalFee.toFixed(4)} SOL`);
    console.log(`  - Net Amount: ${(amount - fees.totalFee).toFixed(4)} SOL\n`);
  });
}

/**
 * Example 6: Comparing linear vs exponential curves
 */
export function exampleCurveComparison() {
  console.log('=== Example 6: Linear vs Exponential Comparison ===\n');

  const supplies = [0, 10_000, 50_000, 100_000, 500_000, 1_000_000];

  console.log('Supply\t\tLinear Price\tExponential Price\tRatio');
  console.log('----------------------------------------------------------------------');

  supplies.forEach((supply) => {
    const linearPrice = calculateLinearPrice(supply);
    const expPrice = calculateExponentialPrice(supply);
    const ratio = expPrice / linearPrice;

    const supplyStr = supply.toLocaleString();
    const padding = createPadding(Math.max(0, 12 - supplyStr.length));
    console.log(
      `${supplyStr}${padding}\t${linearPrice.toFixed(8)}\t${expPrice.toFixed(8)}\t\t${ratio.toFixed(2)}x`
    );
  });

  console.log('\n');
}

/**
 * Example 7: Edge cases and error handling
 */
export function exampleEdgeCases() {
  console.log('=== Example 7: Edge Cases ===\n');

  // Test zero supply
  console.log('1. Zero Supply:');
  const zeroSupplyPrice = calculateLinearPrice(0);
  console.log(`   Price at 0 supply: ${zeroSupplyPrice.toFixed(8)} SOL (base price)\n`);

  // Test very small buy
  console.log('2. Minimum Buy Amount:');
  try {
    const minBuy = completeBuyCalculation(0.001, 0, BondingCurveType.LINEAR);
    console.log(`   Buying with 0.001 SOL: ${minBuy.tokensReceived.toFixed(2)} tokens\n`);
  } catch (error) {
    console.log(`   Error: ${(error as Error).message}\n`);
  }

  // Test invalid negative supply
  console.log('3. Negative Supply (Should Error):');
  try {
    calculateLinearPrice(-100);
  } catch (error) {
    console.log(`   ✓ Correctly caught error: ${(error as Error).message}\n`);
  }

  // Test selling more than supply
  console.log('4. Overselling (Should Error):');
  try {
    completeSellCalculation(1000, 500, BondingCurveType.LINEAR);
  } catch (error) {
    console.log(`   ✓ Correctly caught error: ${(error as Error).message}\n`);
  }

  // Test buy at high supply
  console.log('5. Buy at High Supply:');
  const highSupply = 10_000_000;
  const buyResult = completeBuyCalculation(1.0, highSupply, BondingCurveType.LINEAR);
  console.log(`   Supply: ${highSupply.toLocaleString()}`);
  console.log(`   Tokens for 1 SOL: ${buyResult.tokensReceived.toFixed(2)}`);
  console.log(`   Average Price: ${buyResult.averagePrice.toFixed(8)} SOL\n`);
}

/**
 * Example 8: Real-world scenario - Token launch lifecycle
 */
export function exampleTokenLaunchLifecycle() {
  console.log('=== Example 8: Token Launch Lifecycle ===\n');

  let currentSupply = 0;

  // Initial buyers
  console.log('Phase 1: Early Buyers');
  const buyer1 = completeBuyCalculation(0.1, currentSupply, BondingCurveType.LINEAR);
  currentSupply = buyer1.newSupply;
  console.log(`Buyer 1: 0.1 SOL -> ${buyer1.tokensReceived.toFixed(0)} tokens (supply: ${currentSupply.toFixed(0)})`);

  const buyer2 = completeBuyCalculation(0.5, currentSupply, BondingCurveType.LINEAR);
  currentSupply = buyer2.newSupply;
  console.log(`Buyer 2: 0.5 SOL -> ${buyer2.tokensReceived.toFixed(0)} tokens (supply: ${currentSupply.toFixed(0)})`);

  const buyer3 = completeBuyCalculation(1.0, currentSupply, BondingCurveType.LINEAR);
  currentSupply = buyer3.newSupply;
  console.log(`Buyer 3: 1.0 SOL -> ${buyer3.tokensReceived.toFixed(0)} tokens (supply: ${currentSupply.toFixed(0)})`);

  // Check current price
  const currentPrice = getCurrentPrice(currentSupply, BondingCurveType.LINEAR);
  console.log(`\nCurrent Price: ${currentPrice.price.toFixed(8)} SOL per token`);

  // Someone sells
  console.log('\nPhase 2: First Sell');
  const seller1 = completeSellCalculation(5000, currentSupply, BondingCurveType.LINEAR);
  currentSupply = seller1.newSupply;
  console.log(`Seller 1: 5000 tokens -> ${seller1.proceeds.toFixed(4)} SOL (supply: ${currentSupply.toFixed(0)})`);

  // More buyers join
  console.log('\nPhase 3: Growth Phase');
  const buyer4 = completeBuyCalculation(5.0, currentSupply, BondingCurveType.LINEAR);
  currentSupply = buyer4.newSupply;
  console.log(`Buyer 4: 5.0 SOL -> ${buyer4.tokensReceived.toFixed(0)} tokens (supply: ${currentSupply.toFixed(0)})`);

  const finalPrice = getCurrentPrice(currentSupply, BondingCurveType.LINEAR);
  console.log(`\nFinal Price: ${finalPrice.price.toFixed(8)} SOL per token`);
  console.log(`Price Increase: ${((finalPrice.price / BASE_PRICE - 1) * 100).toFixed(2)}%`);
  console.log(`Total Supply: ${currentSupply.toLocaleString()} tokens`);

  console.log('\n');
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         BONDING CURVE CALCULATOR - EXAMPLES               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  examplePriceCalculations();
  exampleBuyTransaction();
  exampleSellTransaction();
  examplePriceImpact();
  exampleFeeCalculations();
  exampleCurveComparison();
  exampleEdgeCases();
  exampleTokenLaunchLifecycle();

  console.log('All examples completed successfully! ✓\n');
}

// Import BASE_PRICE for the last example
import { BASE_PRICE } from './constants';

// Uncomment to run examples directly in Node.js:
// runAllExamples();
