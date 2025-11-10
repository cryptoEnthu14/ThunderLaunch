# Types

This directory contains comprehensive TypeScript type definitions and interfaces for the ThunderLaunch platform.

## Overview

The type system is organized into logical modules:
- **token.ts** - Token-related types
- **security.ts** - Security checks and audit types
- **trade.ts** - Trading and transaction types
- **user.ts** - User account and profile types
- **index.ts** - Central export point for all types

## Type Modules

### token.ts

Token-related types including creation, metrics, and filters.

**Key Types:**
- `Token` - Main token interface with all properties
- `TokenCreationInput` - Input for creating new tokens
- `TokenMetrics` - Token statistics and performance metrics
- `TokenHolder` - Token holder information
- `Chain` - Supported blockchains (`'solana' | 'base' | 'bnb'`)
- `VerificationTier` - Verification levels (`'free' | 'verified' | 'premium'`)
- `RiskLevel` - Risk assessment (`'low' | 'medium' | 'high' | 'critical'`)

**Example:**
```typescript
import { Token, TokenCreationInput, Chain } from '@/types';

const newToken: TokenCreationInput = {
  name: 'My Token',
  symbol: 'MTK',
  total_supply: '1000000',
  decimals: 9,
  chain: 'solana',
  initial_liquidity: 1000,
};
```

### security.ts

Security analysis, checks, and audit types.

**Key Types:**
- `SecurityCheck` - Complete security audit results
- `SecurityFinding` - Individual security issue
- `OwnershipAnalysis` - Token ownership analysis
- `LiquidityAnalysis` - Liquidity lock and pool analysis
- `HoneypotCheck` - Honeypot detection results
- `SecurityReport` - Comprehensive security report

**Example:**
```typescript
import { SecurityCheck, SecuritySeverity } from '@/types';

const check: SecurityCheck = {
  id: '...',
  token_id: '...',
  risk_level: 'low',
  risk_score: 15,
  findings: [],
  // ... other properties
};
```

### trade.ts

Trading operations, orders, and portfolio types.

**Key Types:**
- `Trade` - Trade transaction record
- `TradeInput` - Input for creating trades
- `TradeQuote` - Price quote for trades
- `TradingStats` - User trading statistics
- `PortfolioPosition` - User's token position
- `TradeType` - Trade direction (`'buy' | 'sell'`)
- `TradeStatus` - Trade execution status

**Example:**
```typescript
import { Trade, TradeType, TradeStatus } from '@/types';

const trade: Trade = {
  id: '...',
  trade_type: 'buy',
  status: 'confirmed',
  token_amount: '1000',
  native_amount: 10,
  // ... other properties
};
```

### user.ts

User accounts, profiles, and settings.

**Key Types:**
- `User` - Complete user account
- `UserProfile` - Public user profile
- `UserSettings` - User preferences and settings
- `UserStats` - User statistics and metrics
- `UserRole` - User permission level (`'user' | 'creator' | 'admin' | 'moderator'`)
- `SubscriptionTier` - Subscription level

**Example:**
```typescript
import { User, UserRole, UserSettings } from '@/types';

const user: User = {
  id: '...',
  wallet_address: '...',
  role: 'creator',
  status: 'active',
  // ... other properties
};
```

## Usage

### Import Specific Types

```typescript
import { Token, User, Trade, SecurityCheck } from '@/types';
```

### Import All Types from a Module

```typescript
import type * as TokenTypes from '@/types/token';
import type * as UserTypes from '@/types/user';
```

### Import Helper Functions

```typescript
import {
  isChain,
  formatWalletAddress,
  calculatePnL,
  getSeverityColor
} from '@/types';
```

## Type Guards

Type guards are provided for runtime type checking:

```typescript
import { isChain, isTradeType, isUserRole } from '@/types';

if (isChain(value)) {
  // value is type Chain
  console.log('Valid chain:', value);
}

if (isTradeType(action)) {
  // action is type TradeType
  executeTrade(action);
}
```

## Helper Functions

Utility functions for working with types:

```typescript
import {
  getUserDisplayName,
  formatWalletAddress,
  calculatePnL,
  getSeverityColor
} from '@/types';

// Format wallet address
const formatted = formatWalletAddress('So11111...base58', 6);
// Returns: "So1111...base58"

// Get user display name
const displayName = getUserDisplayName(user);

// Calculate profit/loss
const { pnl, pnlPercentage } = calculatePnL('buy', 10, 15, 100);

// Get severity color
const color = getSeverityColor('high');
```

## Common Types

The index file also exports common utility types:

```typescript
import {
  ApiResponse,
  PaginatedResponse,
  TimePeriod,
  LoadingState
} from '@/types';

// API response wrapper
type TokenResponse = ApiResponse<Token>;

// Paginated list
type TokenList = PaginatedResponse<Token>;

// Time period
const period: TimePeriod = '24h';

// Loading state
const [state, setState] = useState<LoadingState>('idle');
```

## Type Utilities

Advanced TypeScript utility types:

```typescript
import {
  DeepPartial,
  PartialBy,
  RequiredBy,
  KeysOfType
} from '@/types';

// Make all properties optional recursively
type PartialToken = DeepPartial<Token>;

// Make specific properties optional
type PartialUser = PartialBy<User, 'email' | 'bio'>;

// Make specific properties required
type RequiredSettings = RequiredBy<UserSettings, 'user_id'>;

// Extract keys of specific type
type StringKeys = KeysOfType<Token, string>;
```

## Best Practices

### 1. Always Use Types

```typescript
// ✅ Good
import { Token } from '@/types';
const token: Token = { /* ... */ };

// ❌ Bad
const token = { /* ... */ }; // No type checking
```

### 2. Use Type Guards

```typescript
// ✅ Good
import { isChain } from '@/types';
if (isChain(value)) {
  // TypeScript knows value is Chain type
}

// ❌ Bad
if (value === 'solana' || value === 'base' || value === 'bnb') {
  // No type narrowing
}
```

### 3. Import from Index

```typescript
// ✅ Good
import { Token, User, Trade } from '@/types';

// ❌ Avoid
import { Token } from '@/types/token';
import { User } from '@/types/user';
```

### 4. Use Strict Types

```typescript
// ✅ Good
type Status = 'active' | 'inactive';

// ❌ Avoid
type Status = string; // Too loose
```

### 5. Document Complex Types

```typescript
/**
 * Represents a token with all its properties
 * @example
 * const token: Token = { ... }
 */
export interface Token {
  // ...
}
```

## Type Organization

- **Enums & Literal Types** - At the top of each file
- **Interfaces** - Main type definitions
- **Type Guards** - Runtime type checking functions
- **Helper Functions** - Utility functions for the types

## Adding New Types

When adding new types:

1. Choose the appropriate module or create a new one
2. Define types with JSDoc comments
3. Add type guards if needed
4. Add helper functions if useful
5. Export from index.ts
6. Update this README

## See Also

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
