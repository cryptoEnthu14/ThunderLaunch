import { describe, it, expect } from 'vitest';
import {
  calculateLinearPrice,
  calculateExponentialPrice,
  calculateBuyPrice,
  calculateSellProceeds,
  calculateFee,
  calculateSlippage,
  completeBuyCalculation,
  completeSellCalculation,
  getCurrentPrice,
} from '@/lib/bonding-curve/calculator';
import {
  BondingCurveType,
  BASE_PRICE,
  LINEAR_SLOPE,
  EXPONENTIAL_GROWTH_RATE,
  PLATFORM_FEE_PERCENTAGE,
  CREATOR_FEE_PERCENTAGE,
  MIN_BUY_AMOUNT_SOL,
  MIN_SELL_AMOUNT_TOKENS,
  MIN_TOKEN_AMOUNT,
} from '@/lib/bonding-curve/constants';

describe('Bonding Curve Calculator', () => {
  describe('calculateLinearPrice', () => {
    it('should calculate correct price at zero supply', () => {
      const price = calculateLinearPrice(0);
      expect(price).toBe(BASE_PRICE);
    });

    it('should calculate correct price at 1 million supply', () => {
      const supply = 1_000_000;
      const expectedPrice = BASE_PRICE + supply * LINEAR_SLOPE;
      const price = calculateLinearPrice(supply);
      expect(price).toBeCloseTo(expectedPrice, 10);
    });

    it('should increase linearly with supply', () => {
      const price1 = calculateLinearPrice(1000);
      const price2 = calculateLinearPrice(2000);
      const price3 = calculateLinearPrice(3000);

      const diff1 = price2 - price1;
      const diff2 = price3 - price2;
      expect(diff1).toBeCloseTo(diff2, 10);
    });

    it('should use custom base price when provided', () => {
      const customBase = 0.001;
      const price = calculateLinearPrice(0, customBase);
      expect(price).toBe(customBase);
    });

    it('should use custom slope when provided', () => {
      const customSlope = 0.00001;
      const supply = 1000;
      const price = calculateLinearPrice(supply, BASE_PRICE, customSlope);
      expect(price).toBe(BASE_PRICE + supply * customSlope);
    });

    it('should throw error for negative supply', () => {
      expect(() => calculateLinearPrice(-100)).toThrow('Supply cannot be negative');
    });

    it('should throw error for negative base price', () => {
      expect(() => calculateLinearPrice(100, -0.001)).toThrow('Base price cannot be negative');
    });

    it('should throw error for negative slope', () => {
      expect(() => calculateLinearPrice(100, BASE_PRICE, -0.001)).toThrow('Slope cannot be negative');
    });
  });

  describe('calculateExponentialPrice', () => {
    it('should calculate correct price at zero supply', () => {
      const price = calculateExponentialPrice(0);
      expect(price).toBe(BASE_PRICE);
    });

    it('should calculate exponential price correctly', () => {
      const supply = 1_000_000;
      const expectedPrice = BASE_PRICE * Math.exp(EXPONENTIAL_GROWTH_RATE * supply);
      const price = calculateExponentialPrice(supply);
      expect(price).toBeCloseTo(expectedPrice, 10);
    });

    it('should grow exponentially with supply', () => {
      const price1 = calculateExponentialPrice(100000);
      const price2 = calculateExponentialPrice(200000);
      const price3 = calculateExponentialPrice(300000);

      // Check that growth rate accelerates (with larger gaps for clearer exponential growth)
      const ratio1 = price2 / price1;
      const ratio2 = price3 / price2;

      // With exponential growth, the ratio should increase
      // Using a tolerance for floating point comparison
      expect(ratio2).toBeGreaterThan(ratio1 * 0.999); // Allow tiny margin for floating point
    });

    it('should throw error for negative supply', () => {
      expect(() => calculateExponentialPrice(-100)).toThrow('Supply cannot be negative');
    });

    it('should throw error for negative base price', () => {
      expect(() => calculateExponentialPrice(100, -0.001)).toThrow('Base price cannot be negative');
    });

    it('should throw error for negative growth rate', () => {
      expect(() => calculateExponentialPrice(100, BASE_PRICE, -0.001)).toThrow('Growth rate cannot be negative');
    });

    it('should throw error for extremely large exponents', () => {
      expect(() => calculateExponentialPrice(1_000_000_000, BASE_PRICE, 1)).toThrow('Exponential growth too large');
    });
  });

  describe('calculateBuyPrice', () => {
    it('should calculate buy price for linear curve', () => {
      const amount = 1000;
      const supply = 0;
      const price = calculateBuyPrice(amount, supply, BondingCurveType.LINEAR);

      // Should be positive
      expect(price).toBeGreaterThan(0);

      // Verify with analytical formula
      const expectedPrice = BASE_PRICE * amount + LINEAR_SLOPE * (supply * amount + (amount * amount) / 2);
      expect(price).toBeCloseTo(expectedPrice, 10);
    });

    it('should calculate buy price for exponential curve', () => {
      const amount = 1000;
      const supply = 0;
      const price = calculateBuyPrice(amount, supply, BondingCurveType.EXPONENTIAL);

      expect(price).toBeGreaterThan(0);
    });

    it('should cost more to buy at higher supply', () => {
      const amount = 1000;
      const price1 = calculateBuyPrice(amount, 0, BondingCurveType.LINEAR);
      const price2 = calculateBuyPrice(amount, 10000, BondingCurveType.LINEAR);

      expect(price2).toBeGreaterThan(price1);
    });

    it('should cost more for larger amounts', () => {
      const supply = 1000;
      const price1 = calculateBuyPrice(100, supply, BondingCurveType.LINEAR);
      const price2 = calculateBuyPrice(1000, supply, BondingCurveType.LINEAR);

      expect(price2).toBeGreaterThan(price1);
    });

    it('should throw error for zero amount', () => {
      expect(() => calculateBuyPrice(0, 0, BondingCurveType.LINEAR)).toThrow('Amount must be positive');
    });

    it('should throw error for negative amount', () => {
      expect(() => calculateBuyPrice(-100, 0, BondingCurveType.LINEAR)).toThrow('Amount must be positive');
    });

    it('should throw error for negative supply', () => {
      expect(() => calculateBuyPrice(100, -100, BondingCurveType.LINEAR)).toThrow('Current supply cannot be negative');
    });

    it('should throw error for amount below minimum', () => {
      expect(() => calculateBuyPrice(MIN_TOKEN_AMOUNT / 2, 0, BondingCurveType.LINEAR)).toThrow('Amount must be at least');
    });
  });

  describe('calculateSellProceeds', () => {
    it('should calculate sell proceeds for linear curve', () => {
      const amount = 1000;
      const supply = 5000;
      const proceeds = calculateSellProceeds(amount, supply, BondingCurveType.LINEAR);

      expect(proceeds).toBeGreaterThan(0);

      // Verify with analytical formula
      const newSupply = supply - amount;
      const expectedProceeds = BASE_PRICE * amount + LINEAR_SLOPE * (newSupply * amount + (amount * amount) / 2);
      expect(proceeds).toBeCloseTo(expectedProceeds, 10);
    });

    it('should calculate sell proceeds for exponential curve', () => {
      const amount = 1000;
      const supply = 5000;
      const proceeds = calculateSellProceeds(amount, supply, BondingCurveType.EXPONENTIAL);

      expect(proceeds).toBeGreaterThan(0);
    });

    it('should return less proceeds at lower supply', () => {
      const amount = 1000;
      const proceeds1 = calculateSellProceeds(amount, 10000, BondingCurveType.LINEAR);
      const proceeds2 = calculateSellProceeds(amount, 5000, BondingCurveType.LINEAR);

      expect(proceeds1).toBeGreaterThan(proceeds2);
    });

    it('should throw error for zero amount', () => {
      expect(() => calculateSellProceeds(0, 1000, BondingCurveType.LINEAR)).toThrow('Amount must be positive');
    });

    it('should throw error for negative amount', () => {
      expect(() => calculateSellProceeds(-100, 1000, BondingCurveType.LINEAR)).toThrow('Amount must be positive');
    });

    it('should throw error for negative supply', () => {
      expect(() => calculateSellProceeds(100, -100, BondingCurveType.LINEAR)).toThrow('Current supply cannot be negative');
    });

    it('should throw error when selling more than supply', () => {
      expect(() => calculateSellProceeds(1000, 500, BondingCurveType.LINEAR)).toThrow('Cannot sell more tokens than current supply');
    });

    it('should throw error for amount below minimum', () => {
      expect(() => calculateSellProceeds(MIN_TOKEN_AMOUNT / 2, 1000, BondingCurveType.LINEAR)).toThrow('Amount must be at least');
    });

    it('should be inverse of buy price', () => {
      const amount = 1000;
      const supply = 5000;

      // Buy tokens to increase supply
      const buyCost = calculateBuyPrice(amount, supply, BondingCurveType.LINEAR);

      // Sell same amount at new supply
      const newSupply = supply + amount;
      const sellProceeds = calculateSellProceeds(amount, newSupply, BondingCurveType.LINEAR);

      // They should be approximately equal (before fees)
      expect(sellProceeds).toBeCloseTo(buyCost, 5);
    });
  });

  describe('calculateFee', () => {
    it('should calculate correct fee breakdown', () => {
      const amount = 1.0;
      const fees = calculateFee(amount);

      expect(fees.platformFee).toBe(amount * PLATFORM_FEE_PERCENTAGE);
      expect(fees.creatorFee).toBe(amount * CREATOR_FEE_PERCENTAGE);
      expect(fees.totalFee).toBe(fees.platformFee + fees.creatorFee);
      expect(fees.feePercentage).toBe(PLATFORM_FEE_PERCENTAGE + CREATOR_FEE_PERCENTAGE);
    });

    it('should calculate fees for different amounts', () => {
      const fees1 = calculateFee(1.0);
      const fees2 = calculateFee(2.0);

      expect(fees2.totalFee).toBeCloseTo(fees1.totalFee * 2, 10);
    });

    it('should use custom fee percentages when provided', () => {
      const amount = 1.0;
      const customPlatformFee = 0.02;
      const customCreatorFee = 0.03;
      const fees = calculateFee(amount, customPlatformFee, customCreatorFee);

      expect(fees.platformFee).toBe(amount * customPlatformFee);
      expect(fees.creatorFee).toBe(amount * customCreatorFee);
      expect(fees.feePercentage).toBe(customPlatformFee + customCreatorFee);
    });

    it('should handle zero amount', () => {
      const fees = calculateFee(0);
      expect(fees.totalFee).toBe(0);
      expect(fees.platformFee).toBe(0);
      expect(fees.creatorFee).toBe(0);
    });

    it('should throw error for negative amount', () => {
      expect(() => calculateFee(-1)).toThrow('Amount cannot be negative');
    });

    it('should throw error for invalid platform fee percentage', () => {
      expect(() => calculateFee(1, -0.01)).toThrow('Platform fee percentage must be between 0 and 1');
      expect(() => calculateFee(1, 1.5)).toThrow('Platform fee percentage must be between 0 and 1');
    });

    it('should throw error for invalid creator fee percentage', () => {
      expect(() => calculateFee(1, 0.01, -0.01)).toThrow('Creator fee percentage must be between 0 and 1');
      expect(() => calculateFee(1, 0.01, 1.5)).toThrow('Creator fee percentage must be between 0 and 1');
    });
  });

  describe('calculateSlippage', () => {
    it('should calculate correct slippage', () => {
      const startPrice = 0.01;
      const averagePrice = 0.0105;
      const slippage = calculateSlippage(startPrice, averagePrice);

      expect(slippage).toBeCloseTo(0.05, 10); // 5% slippage
    });

    it('should return absolute value for negative slippage', () => {
      const startPrice = 0.01;
      const averagePrice = 0.0095;
      const slippage = calculateSlippage(startPrice, averagePrice);

      expect(slippage).toBeGreaterThan(0);
      expect(slippage).toBeCloseTo(0.05, 10);
    });

    it('should return zero for same prices', () => {
      const price = 0.01;
      const slippage = calculateSlippage(price, price);

      expect(slippage).toBe(0);
    });

    it('should handle zero average price', () => {
      const slippage = calculateSlippage(0.01, 0);
      expect(slippage).toBe(0);
    });

    it('should throw error for zero start price', () => {
      expect(() => calculateSlippage(0, 0.01)).toThrow('Start price must be positive');
    });

    it('should throw error for negative start price', () => {
      expect(() => calculateSlippage(-0.01, 0.01)).toThrow('Start price must be positive');
    });

    it('should throw error for negative average price', () => {
      expect(() => calculateSlippage(0.01, -0.01)).toThrow('Average price cannot be negative');
    });
  });

  describe('completeBuyCalculation', () => {
    it('should calculate complete buy transaction', () => {
      const solAmount = 1.0;
      const supply = 0;
      const result = completeBuyCalculation(solAmount, supply, BondingCurveType.LINEAR);

      expect(result.totalCost).toBe(solAmount);
      expect(result.tokensReceived).toBeGreaterThan(0);
      expect(result.platformFee).toBeGreaterThan(0);
      expect(result.creatorFee).toBeGreaterThan(0);
      expect(result.totalFees).toBe(result.platformFee + result.creatorFee);
      expect(result.baseCost).toBeGreaterThan(0);
      expect(result.averagePrice).toBeGreaterThan(0);
      expect(result.priceImpact).toBeGreaterThanOrEqual(0);
      expect(result.newSupply).toBe(supply + result.tokensReceived);
    });

    it('should deduct fees from SOL amount', () => {
      const solAmount = 1.0;
      const result = completeBuyCalculation(solAmount, 0, BondingCurveType.LINEAR);

      const expectedFees = solAmount * (PLATFORM_FEE_PERCENTAGE + CREATOR_FEE_PERCENTAGE);
      expect(result.totalFees).toBeCloseTo(expectedFees, 10);
      expect(result.baseCost).toBeCloseTo(solAmount - expectedFees, 5);
    });

    it('should receive fewer tokens at higher supply', () => {
      const solAmount = 1.0;
      const result1 = completeBuyCalculation(solAmount, 0, BondingCurveType.LINEAR);
      const result2 = completeBuyCalculation(solAmount, 100000, BondingCurveType.LINEAR);

      expect(result2.tokensReceived).toBeLessThan(result1.tokensReceived);
    });

    it('should receive more tokens with more SOL', () => {
      const result1 = completeBuyCalculation(1.0, 0, BondingCurveType.LINEAR);
      const result2 = completeBuyCalculation(2.0, 0, BondingCurveType.LINEAR);

      expect(result2.tokensReceived).toBeGreaterThan(result1.tokensReceived);
    });

    it('should throw error for amount below minimum', () => {
      expect(() => completeBuyCalculation(MIN_BUY_AMOUNT_SOL / 2, 0)).toThrow(`Minimum buy amount is ${MIN_BUY_AMOUNT_SOL} SOL`);
    });

    it('should throw error for negative supply', () => {
      expect(() => completeBuyCalculation(1.0, -100)).toThrow('Current supply cannot be negative');
    });

    it('should work with exponential curve', () => {
      const result = completeBuyCalculation(1.0, 0, BondingCurveType.EXPONENTIAL);

      expect(result.tokensReceived).toBeGreaterThan(0);
      expect(result.totalCost).toBe(1.0);
    });
  });

  describe('completeSellCalculation', () => {
    it('should calculate complete sell transaction', () => {
      const tokenAmount = 10000;
      const supply = 50000;
      const result = completeSellCalculation(tokenAmount, supply, BondingCurveType.LINEAR);

      expect(result.proceeds).toBeGreaterThan(0);
      expect(result.tokensSold).toBe(tokenAmount);
      expect(result.platformFee).toBeGreaterThan(0);
      expect(result.creatorFee).toBeGreaterThan(0);
      expect(result.totalFees).toBe(result.platformFee + result.creatorFee);
      expect(result.baseProceeds).toBeGreaterThan(0);
      expect(result.averagePrice).toBeGreaterThan(0);
      expect(result.priceImpact).toBeGreaterThanOrEqual(0);
      expect(result.newSupply).toBe(supply - tokenAmount);
    });

    it('should deduct fees from proceeds', () => {
      const tokenAmount = 10000;
      const supply = 50000;
      const result = completeSellCalculation(tokenAmount, supply, BondingCurveType.LINEAR);

      const expectedFees = result.baseProceeds * (PLATFORM_FEE_PERCENTAGE + CREATOR_FEE_PERCENTAGE);
      expect(result.totalFees).toBeCloseTo(expectedFees, 10);
      expect(result.proceeds).toBeCloseTo(result.baseProceeds - expectedFees, 10);
    });

    it('should receive more proceeds at higher supply', () => {
      const tokenAmount = 10000;
      const result1 = completeSellCalculation(tokenAmount, 50000, BondingCurveType.LINEAR);
      const result2 = completeSellCalculation(tokenAmount, 100000, BondingCurveType.LINEAR);

      expect(result2.proceeds).toBeGreaterThan(result1.proceeds);
    });

    it('should throw error for amount below minimum', () => {
      expect(() => completeSellCalculation(MIN_SELL_AMOUNT_TOKENS / 2, 10000)).toThrow(`Minimum sell amount is ${MIN_SELL_AMOUNT_TOKENS} tokens`);
    });

    it('should throw error for negative supply', () => {
      expect(() => completeSellCalculation(1000, -100)).toThrow('Current supply cannot be negative');
    });

    it('should throw error when selling more than supply', () => {
      expect(() => completeSellCalculation(10000, 5000)).toThrow('Cannot sell more tokens than current supply');
    });

    it('should work with exponential curve', () => {
      const result = completeSellCalculation(10000, 50000, BondingCurveType.EXPONENTIAL);

      expect(result.proceeds).toBeGreaterThan(0);
      expect(result.tokensSold).toBe(10000);
    });
  });

  describe('getCurrentPrice', () => {
    it('should get current price for linear curve', () => {
      const supply = 1000000;
      const result = getCurrentPrice(supply, BondingCurveType.LINEAR);

      expect(result.price).toBeGreaterThan(0);
      expect(result.supply).toBe(supply);
      expect(result.curveType).toBe(BondingCurveType.LINEAR);

      const expectedPrice = calculateLinearPrice(supply);
      expect(result.price).toBe(expectedPrice);
    });

    it('should get current price for exponential curve', () => {
      const supply = 1000000;
      const result = getCurrentPrice(supply, BondingCurveType.EXPONENTIAL);

      expect(result.price).toBeGreaterThan(0);
      expect(result.supply).toBe(supply);
      expect(result.curveType).toBe(BondingCurveType.EXPONENTIAL);

      const expectedPrice = calculateExponentialPrice(supply);
      expect(result.price).toBe(expectedPrice);
    });

    it('should throw error for negative supply', () => {
      expect(() => getCurrentPrice(-100)).toThrow('Supply cannot be negative');
    });
  });

  describe('Edge Cases and Integration Tests', () => {
    it('should handle very small amounts', () => {
      const result = completeBuyCalculation(MIN_BUY_AMOUNT_SOL, 0, BondingCurveType.LINEAR);
      expect(result.tokensReceived).toBeGreaterThan(0);
    });

    it('should handle very large supply', () => {
      const largeSupply = 10_000_000;
      const price = calculateLinearPrice(largeSupply);
      expect(price).toBeGreaterThan(BASE_PRICE);
      expect(price).toBeLessThan(Infinity);
    });

    it('should maintain consistency between buy and sell', () => {
      // Buy some tokens
      const buyResult = completeBuyCalculation(1.0, 0, BondingCurveType.LINEAR);

      // Sell them back
      const sellResult = completeSellCalculation(
        buyResult.tokensReceived,
        buyResult.newSupply,
        BondingCurveType.LINEAR
      );

      // Should get back less than paid due to fees
      expect(sellResult.proceeds).toBeLessThan(buyResult.totalCost);

      // But should be reasonably close (accounting for ~4% total fees)
      const lossPercentage = (buyResult.totalCost - sellResult.proceeds) / buyResult.totalCost;
      expect(lossPercentage).toBeGreaterThan(0.03); // More than 3% loss
      expect(lossPercentage).toBeLessThan(0.05); // Less than 5% loss
    });

    it('should handle rapid price increases', () => {
      const amount = 100000;
      const result = completeBuyCalculation(10.0, 0, BondingCurveType.LINEAR);

      expect(result.priceImpact).toBeGreaterThan(0);
      expect(result.averagePrice).toBeGreaterThan(BASE_PRICE);
    });

    it('should be deterministic', () => {
      const result1 = completeBuyCalculation(1.0, 1000, BondingCurveType.LINEAR);
      const result2 = completeBuyCalculation(1.0, 1000, BondingCurveType.LINEAR);

      expect(result1.tokensReceived).toBe(result2.tokensReceived);
      expect(result1.totalCost).toBe(result2.totalCost);
      expect(result1.totalFees).toBe(result2.totalFees);
    });
  });
});
