# Trading Interface Components

Complete trading UI components for buying and selling tokens with bonding curve pricing.

## Components

### 1. TradingPanel

The main trading interface with buy/sell functionality.

**Features:**
- Buy/Sell toggle tabs
- Real-time price calculations using bonding curve
- Amount input with MAX button
- Fee breakdown display
- Price impact indicators
- Slippage tolerance settings
- Transaction confirmation modal

**Usage:**

```tsx
import { TradingPanel } from '@/components/token';
import { BondingCurveType } from '@/lib/bonding-curve';

function TokenPage() {
  return (
    <TradingPanel
      tokenAddress="So11111..."
      tokenSymbol="THDR"
      tokenName="Thunder Token"
      currentPrice={0.05}
      currentSupply={1000000}
      curveType={BondingCurveType.LINEAR}
      solBalance={10.5}
      tokenBalance={5000}
      onTradeExecuted={(tradeType, amount) => {
        console.log(`${tradeType} ${amount}`);
      }}
    />
  );
}
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tokenAddress` | `string` | Yes | Token mint address |
| `tokenSymbol` | `string` | Yes | Token symbol (e.g., "THDR") |
| `tokenName` | `string` | No | Token name |
| `currentPrice` | `number` | Yes | Current token price in SOL |
| `currentSupply` | `number` | Yes | Current token supply |
| `curveType` | `BondingCurveType` | No | Bonding curve type (default: LINEAR) |
| `solBalance` | `number` | No | User's SOL balance |
| `tokenBalance` | `number` | No | User's token balance |
| `onTradeExecuted` | `function` | No | Callback when trade is executed |

---

### 2. PriceChart

Interactive price chart with volume display.

**Features:**
- Line chart for price history
- Volume bars
- Time period selector (1H, 24H, 7D, 30D)
- Responsive design
- Custom tooltips with detailed info
- Auto-refresh capability

**Usage:**

```tsx
import { PriceChart } from '@/components/token';
import { generateMockPriceHistory } from '@/lib/trading';

function TokenPage() {
  const priceHistory = generateMockPriceHistory(100);

  return (
    <PriceChart
      tokenAddress="So11111..."
      tokenSymbol="THDR"
      priceHistory={priceHistory}
      showVolume={true}
      onPeriodChange={(period) => {
        console.log(`Period changed to ${period}`);
        // Fetch data for new period
      }}
    />
  );
}
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tokenAddress` | `string` | Yes | Token mint address |
| `tokenSymbol` | `string` | Yes | Token symbol |
| `priceHistory` | `TokenPriceHistory[]` | Yes | Array of price history data |
| `showVolume` | `boolean` | No | Show volume chart (default: true) |
| `autoRefresh` | `number` | No | Auto-refresh interval in ms (0 = disabled) |
| `onPeriodChange` | `function` | No | Callback when period changes |

---

### 3. TradeHistory

Display recent trades with pagination.

**Features:**
- Real-time trade updates
- Pagination support
- Trade type indicators (buy/sell)
- User address with explorer links
- Responsive table/card layout
- Transaction links to Solscan

**Usage:**

```tsx
import { TradeHistory } from '@/components/token';
import { generateMockTrades } from '@/lib/trading';

function TokenPage() {
  const trades = generateMockTrades(20);

  return (
    <TradeHistory
      tokenAddress="So11111..."
      tokenSymbol="THDR"
      trades={trades}
      totalTrades={100}
      currentPage={1}
      itemsPerPage={20}
      onPageChange={(page) => {
        console.log(`Page changed to ${page}`);
        // Fetch data for new page
      }}
      onRefresh={() => {
        console.log('Refreshing trades');
        // Fetch latest trades
      }}
    />
  );
}
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tokenAddress` | `string` | Yes | Token mint address |
| `tokenSymbol` | `string` | No | Token symbol (default: "TOKEN") |
| `trades` | `Trade[]` | Yes | Array of trade data |
| `totalTrades` | `number` | No | Total number of trades |
| `currentPage` | `number` | No | Current page number |
| `itemsPerPage` | `number` | No | Items per page (default: 20) |
| `onPageChange` | `function` | No | Callback when page changes |
| `onRefresh` | `function` | No | Callback to refresh data |
| `isLoading` | `boolean` | No | Loading state |
| `showPagination` | `boolean` | No | Show pagination (default: true) |

---

## Complete Example

Here's a complete example combining all three components:

```tsx
'use client';

import { useState } from 'react';
import {
  TradingPanel,
  PriceChart,
  TradeHistory,
} from '@/components/token';
import { BondingCurveType } from '@/lib/bonding-curve';
import {
  generateMockPriceHistory,
  generateMockTrades,
} from '@/lib/trading';

export default function TokenTradingPage() {
  const [priceHistory] = useState(() => generateMockPriceHistory(100));
  const [trades] = useState(() => generateMockTrades(20));

  const tokenData = {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'THDR',
    name: 'Thunder Token',
    currentPrice: 0.05,
    currentSupply: 1_000_000,
  };

  const userBalances = {
    solBalance: 10.5,
    tokenBalance: 5000,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Trading Panel */}
        <div className="lg:col-span-1">
          <TradingPanel
            tokenAddress={tokenData.address}
            tokenSymbol={tokenData.symbol}
            tokenName={tokenData.name}
            currentPrice={tokenData.currentPrice}
            currentSupply={tokenData.currentSupply}
            curveType={BondingCurveType.LINEAR}
            solBalance={userBalances.solBalance}
            tokenBalance={userBalances.tokenBalance}
            onTradeExecuted={(tradeType, amount) => {
              console.log(`Executed ${tradeType} for ${amount}`);
              // Refresh data after trade
            }}
          />
        </div>

        {/* Right Column - Chart and History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <PriceChart
            tokenAddress={tokenData.address}
            tokenSymbol={tokenData.symbol}
            priceHistory={priceHistory}
            showVolume={true}
            onPeriodChange={(period) => {
              console.log(`Period: ${period}`);
              // Fetch data for selected period
            }}
          />

          {/* Trade History */}
          <TradeHistory
            tokenAddress={tokenData.address}
            tokenSymbol={tokenData.symbol}
            trades={trades}
            totalTrades={100}
            currentPage={1}
            itemsPerPage={20}
            onPageChange={(page) => {
              console.log(`Page: ${page}`);
              // Fetch trades for page
            }}
            onRefresh={() => {
              console.log('Refreshing trades');
              // Fetch latest trades
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Utility Functions

The `@/lib/trading` module provides helpful utilities:

### Formatting Functions

```tsx
import {
  formatAddress,
  formatNumberCompact,
  formatPrice,
  formatSOL,
  formatTokenAmount,
  formatPercentage,
  formatUSD,
} from '@/lib/trading/formatting';

// Format wallet address
formatAddress('So11111111111111111111111111111111111111112');
// => "So11...1112"

// Format large numbers
formatNumberCompact(1500000);
// => "1.50M"

// Format price
formatPrice(0.000123);
// => "$0.000123"

// Format SOL amount
formatSOL(1.5);
// => "1.5000 SOL"

// Format percentage
formatPercentage(5.234, 2, true);
// => "+5.23%"
```

### Mock Data Functions

```tsx
import {
  generateMockPriceHistory,
  generateMockTrades,
} from '@/lib/trading/mockData';

// Generate 100 price history points
const priceHistory = generateMockPriceHistory(100, 0.05, 0.1);

// Generate 20 mock trades
const trades = generateMockTrades(20);
```

---

## Styling

All components use Tailwind CSS and follow the project's design system:

**Colors:**
- Success (Buy): `text-safety-green` / `bg-safety-green`
- Danger (Sell): `text-danger-red` / `bg-danger-red`
- Warning: `text-warning-yellow` / `bg-warning-yellow`
- Accent: `text-accent-purple` / `bg-accent-purple`
- Gray scale: `text-gray-*` / `bg-gray-*`

**Responsive Design:**
- All components are fully responsive
- Mobile: Card layout
- Desktop: Table/grid layout
- Breakpoints: `sm`, `md`, `lg`, `xl`

---

## Integration with Bonding Curve

The TradingPanel uses the bonding curve calculator:

```tsx
import {
  completeBuyCalculation,
  completeSellCalculation,
  BondingCurveType,
} from '@/lib/bonding-curve';

// Calculate buy
const buyResult = completeBuyCalculation(
  1.0, // SOL amount
  1_000_000, // current supply
  BondingCurveType.LINEAR
);

// Calculate sell
const sellResult = completeSellCalculation(
  1000, // token amount
  1_000_000, // current supply
  BondingCurveType.LINEAR
);
```

---

## Type Definitions

All components use TypeScript with comprehensive type definitions:

```tsx
import type { Trade, TradeType } from '@/types/trade';
import type { TokenPriceHistory } from '@/types/token';
import type { TradingPanelProps, PriceChartProps, TradeHistoryProps } from '@/components/token';
```

---

## Testing

Use the provided mock data generators for testing:

```tsx
import { generateMockPriceHistory, generateMockTrades } from '@/lib/trading';

// In your test or development page
const mockPriceHistory = generateMockPriceHistory(100);
const mockTrades = generateMockTrades(20);
```

---

## Notes

- **Real-time Updates**: Components support real-time data updates through props
- **Error Handling**: Components handle edge cases and validation
- **Performance**: Uses React hooks for optimization (useMemo, useCallback)
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Mobile First**: Responsive design with mobile-first approach
