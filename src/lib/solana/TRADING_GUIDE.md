# Trading Execution Guide

Comprehensive guide for executing trades on Solana using bonding curve pricing.

## Table of Contents

- [Overview](#overview)
- [Trading Functions](#trading-functions)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Overview

The trading module provides functions to execute buy and sell trades for tokens using bonding curve pricing. It handles:

- ✅ Transaction building and signing
- ✅ Slippage protection
- ✅ Fee calculation (Platform 1% + Creator 1%)
- ✅ Balance validation
- ✅ Progress tracking
- ✅ Error recovery
- ✅ Transaction confirmation

---

## Trading Functions

### executeBuy()

Execute a buy trade (SOL → Tokens)

**Parameters:**
```typescript
{
  tokenMint: PublicKey;        // Token mint address
  userWallet: PublicKey;       // User's wallet
  poolAddress: PublicKey;      // Liquidity pool address
  currentSupply: number;       // Current token supply
  solAmount: number;           // SOL to spend
  curveType?: BondingCurveType;  // LINEAR or EXPONENTIAL
  slippageTolerance?: number;  // 0-1 (default: 0.01 = 1%)
  onProgress?: (step, progress) => void;
}
```

**Returns:**
```typescript
{
  signature: string;           // Transaction signature
  tradeType: 'buy';
  tokenAmount: number;         // Tokens received
  solAmount: number;           // SOL spent
  price: number;               // Average price per token
  platformFee: number;         // Platform fee paid
  creatorFee: number;          // Creator fee paid
  totalFees: number;           // Total fees
  actualSlippage: number;      // Actual slippage %
  newSupply: number;           // New token supply
  timestamp: number;           // Unix timestamp
}
```

**Example:**
```typescript
import { executeBuy } from '@/lib/solana/trading';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const { publicKey, signTransaction } = useWallet();

const result = await executeBuy(
  {
    tokenMint: new PublicKey('So11111...'),
    userWallet: publicKey,
    poolAddress: new PublicKey('Pool111...'),
    currentSupply: 1_000_000,
    solAmount: 1.5,
    slippageTolerance: 0.01, // 1%
    onProgress: (step, progress) => {
      console.log(`[${progress}%] ${step}`);
    },
  },
  signTransaction
);

console.log('Bought', result.tokenAmount, 'tokens');
console.log('Tx:', result.signature);
```

---

### executeSell()

Execute a sell trade (Tokens → SOL)

**Parameters:**
```typescript
{
  tokenMint: PublicKey;        // Token mint address
  userWallet: PublicKey;       // User's wallet
  poolAddress: PublicKey;      // Liquidity pool address
  currentSupply: number;       // Current token supply
  tokenAmount: number;         // Tokens to sell
  curveType?: BondingCurveType;
  slippageTolerance?: number;
  onProgress?: (step, progress) => void;
}
```

**Returns:**
```typescript
{
  signature: string;
  tradeType: 'sell';
  tokenAmount: number;         // Tokens sold
  solAmount: number;           // SOL received
  price: number;
  platformFee: number;
  creatorFee: number;
  totalFees: number;
  actualSlippage: number;
  newSupply: number;
  timestamp: number;
}
```

**Example:**
```typescript
const result = await executeSell(
  {
    tokenMint: new PublicKey('So11111...'),
    userWallet: publicKey,
    poolAddress: new PublicKey('Pool111...'),
    currentSupply: 1_000_000,
    tokenAmount: 1000,
    slippageTolerance: 0.02, // 2%
  },
  signTransaction
);
```

---

### getTokenPrice()

Get current token price

**Parameters:**
```typescript
getTokenPrice(
  tokenMint: PublicKey,
  currentSupply: number,
  curveType?: BondingCurveType
): Promise<TokenPriceInfo>
```

**Returns:**
```typescript
{
  priceInSol: number;          // Price per token in SOL
  priceInUsd?: number;         // Price per token in USD
  supply: number;              // Current supply
  marketCapSol: number;        // Market cap in SOL
  marketCapUsd?: number;       // Market cap in USD
  timestamp: number;
}
```

---

### getPoolLiquidity()

Get pool liquidity information

**Parameters:**
```typescript
getPoolLiquidity(
  poolAddress: PublicKey,
  tokenMint: PublicKey,
  currentSupply: number,
  curveType?: BondingCurveType
): Promise<PoolLiquidityInfo>
```

**Returns:**
```typescript
{
  poolAddress: PublicKey;
  tokenMint: PublicKey;
  solReserves: number;         // SOL in pool
  tokenReserves: number;       // Tokens in pool
  totalLiquiditySol: number;
  totalLiquidityUsd?: number;
  currentSupply: number;
  curveType: BondingCurveType;
}
```

---

### estimateBuyAmount()

Preview buy trade (no transaction)

**Parameters:**
```typescript
estimateBuyAmount(
  solAmount: number,
  currentSupply: number,
  curveType?: BondingCurveType,
  slippageTolerance?: number
): TradePreview
```

**Returns:**
```typescript
{
  expectedOutput: number;      // Expected tokens
  price: number;               // Average price
  priceImpact: number;         // Price impact %
  platformFee: number;
  creatorFee: number;
  totalFees: number;
  minimumOutput: number;       // Min tokens with slippage
  newSupply: number;
}
```

**Example:**
```typescript
import { estimateBuyAmount, BondingCurveType } from '@/lib/solana';

const preview = estimateBuyAmount(
  1.5,                         // 1.5 SOL
  1_000_000,                   // Current supply
  BondingCurveType.LINEAR,
  0.01                         // 1% slippage
);

console.log('You will receive:', preview.expectedOutput, 'tokens');
console.log('Price impact:', (preview.priceImpact * 100).toFixed(2), '%');
console.log('Total fees:', preview.totalFees, 'SOL');
```

---

### estimateSellProceeds()

Preview sell trade (no transaction)

**Parameters:**
```typescript
estimateSellProceeds(
  tokenAmount: number,
  currentSupply: number,
  curveType?: BondingCurveType,
  slippageTolerance?: number
): TradePreview
```

**Returns:**
```typescript
{
  expectedOutput: number;      // Expected SOL
  price: number;
  priceImpact: number;
  platformFee: number;
  creatorFee: number;
  totalFees: number;
  minimumOutput: number;       // Min SOL with slippage
  newSupply: number;
}
```

---

### monitorTransaction()

Monitor transaction confirmation

**Parameters:**
```typescript
monitorTransaction(
  signature: string,
  options?: {
    timeout?: number;          // Max wait time (default: 60000ms)
    pollingInterval?: number;  // Check interval (default: 2000ms)
    maxRetries?: number;       // Max retries (default: 30)
    onStatusChange?: (status) => void;
  }
): Promise<void>
```

**Example:**
```typescript
await monitorTransaction(
  'signature123...',
  {
    timeout: 90000,
    onStatusChange: (status) => {
      console.log('Status:', status);
      // SUBMITTED → CONFIRMING → CONFIRMED
    },
  }
);
```

---

## API Endpoints

### POST /api/trades

Record a completed trade

**Request:**
```json
{
  "token_address": "So11111...",
  "wallet_address": "User111...",
  "trade_type": "buy",
  "token_amount": "1000",
  "native_amount": 1.5,
  "price_usd": 0.0015,
  "price_native": 0.000015,
  "transaction_signature": "sig123...",
  "slippage_tolerance": 0.01,
  "actual_slippage": 0.005,
  "platform_fee": 0.015,
  "total_fee": 0.030
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "token_id": "token-uuid",
    "created_at": "2024-01-01T00:00:00Z",
    ...
  }
}
```

**Example:**
```typescript
const response = await fetch('/api/trades', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token_address: 'So11111...',
    wallet_address: publicKey.toBase58(),
    trade_type: 'buy',
    token_amount: result.tokenAmount.toString(),
    native_amount: result.solAmount,
    price_native: result.price,
    price_usd: result.price * 100,
    transaction_signature: result.signature,
    slippage_tolerance: 0.01,
    platform_fee: result.platformFee,
    total_fee: result.totalFees,
  }),
});

const data = await response.json();
```

---

### GET /api/trades

Fetch trades with filters

**Query Parameters:**
- `token_address` - Filter by token
- `wallet_address` - Filter by user
- `trade_type` - Filter by type (`buy` or `sell`)
- `limit` - Results per page (max: 100, default: 20)
- `offset` - Skip results (for pagination)
- `sort` - Sort order (`asc` or `desc`, default: `desc`)

**Example:**
```typescript
// Get recent trades for a token
const response = await fetch(
  `/api/trades?token_address=So11111...&limit=50`
);
const { data, pagination } = await response.json();

console.log('Trades:', data);
console.log('Total:', pagination.total);
console.log('Has more:', pagination.hasMore);
```

---

## Error Handling

### Trade Errors

```typescript
import { TradeError, TradeErrorType } from '@/lib/solana';

try {
  const result = await executeBuy(config, signTransaction);
} catch (error) {
  if (error instanceof TradeError) {
    switch (error.type) {
      case TradeErrorType.INSUFFICIENT_SOL:
        console.error('Not enough SOL');
        break;
      case TradeErrorType.INSUFFICIENT_TOKENS:
        console.error('Not enough tokens');
        break;
      case TradeErrorType.SLIPPAGE_EXCEEDED:
        console.error('Price moved too much');
        break;
      case TradeErrorType.TRANSACTION_FAILED:
        console.error('Transaction failed:', error.message);
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

### Error Types

- `INSUFFICIENT_SOL` - Not enough SOL balance
- `INSUFFICIENT_TOKENS` - Not enough token balance
- `SLIPPAGE_EXCEEDED` - Price impact > tolerance
- `POOL_NOT_FOUND` - Liquidity pool doesn't exist
- `INVALID_AMOUNT` - Amount below minimum
- `TRANSACTION_FAILED` - Blockchain transaction failed
- `NETWORK_ERROR` - RPC connection error
- `UNKNOWN_ERROR` - Unexpected error

---

## Best Practices

### 1. Always Preview Trades

```typescript
// Preview before executing
const preview = estimateBuyAmount(solAmount, currentSupply);

if (preview.priceImpact > 0.05) {
  // Warn user about high price impact
  console.warn('High price impact:', preview.priceImpact * 100, '%');
}

// Then execute
const result = await executeBuy(config, signTransaction);
```

### 2. Set Appropriate Slippage

```typescript
// Low liquidity = higher slippage needed
const slippage = liquidity < 100 ? 0.05 : 0.01;

const result = await executeBuy({
  ...config,
  slippageTolerance: slippage,
}, signTransaction);
```

### 3. Show Progress to Users

```typescript
const [progress, setProgress] = useState({ step: '', percent: 0 });

await executeBuy({
  ...config,
  onProgress: (step, percent) => {
    setProgress({ step, percent });
  },
}, signTransaction);
```

### 4. Record Trades in Database

```typescript
// Execute trade
const result = await executeBuy(config, signTransaction);

// Record in database
await fetch('/api/trades', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token_address: tokenMint.toBase58(),
    wallet_address: userWallet.toBase58(),
    trade_type: result.tradeType,
    token_amount: result.tokenAmount.toString(),
    native_amount: result.solAmount,
    price_native: result.price,
    transaction_signature: result.signature,
    platform_fee: result.platformFee,
    total_fee: result.totalFees,
  }),
});
```

### 5. Handle Wallet Disconnection

```typescript
if (!publicKey || !signTransaction) {
  throw new Error('Wallet not connected');
}

try {
  const result = await executeBuy(config, signTransaction);
} catch (error) {
  if (error.message.includes('User rejected')) {
    console.log('User cancelled transaction');
  } else {
    console.error('Trade failed:', error);
  }
}
```

### 6. Validate Inputs

```typescript
// Check minimum amounts
if (solAmount < MIN_BUY_AMOUNT_SOL) {
  throw new Error(`Minimum buy is ${MIN_BUY_AMOUNT_SOL} SOL`);
}

// Check balance
const balance = await getBalance(userWallet);
if (balance < solAmount) {
  throw new Error('Insufficient balance');
}

// Execute trade
const result = await executeBuy(config, signTransaction);
```

### 7. Monitor Transaction Status

```typescript
const [status, setStatus] = useState('pending');

const result = await executeBuy(
  {
    ...config,
    onProgress: (step, progress) => {
      setStatus(step);
    },
  },
  signTransaction
);

// Additional monitoring
await monitorTransaction(result.signature, {
  onStatusChange: (status) => {
    setStatus(status);
  },
});
```

---

## Complete Example

```typescript
'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  executeBuy,
  estimateBuyAmount,
  getBalance,
  BondingCurveType,
  TradeError,
  TradeErrorType,
} from '@/lib/solana';

export function TradingComponent() {
  const { publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState('1.0');
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState(null);

  // Preview trade
  const handlePreview = () => {
    const preview = estimateBuyAmount(
      parseFloat(amount),
      1_000_000,
      BondingCurveType.LINEAR,
      0.01
    );
    setPreview(preview);
  };

  // Execute trade
  const handleBuy = async () => {
    if (!publicKey || !signTransaction) {
      alert('Please connect wallet');
      return;
    }

    try {
      setStatus('Checking balance...');
      const balance = await getBalance(publicKey);

      if (balance < parseFloat(amount)) {
        throw new Error('Insufficient balance');
      }

      setStatus('Executing trade...');
      const result = await executeBuy(
        {
          tokenMint: new PublicKey('So11111...'),
          userWallet: publicKey,
          poolAddress: new PublicKey('Pool111...'),
          currentSupply: 1_000_000,
          solAmount: parseFloat(amount),
          slippageTolerance: 0.01,
          onProgress: (step, progress) => {
            setStatus(`${step} (${progress}%)`);
          },
        },
        signTransaction
      );

      // Record trade
      await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_address: 'So11111...',
          wallet_address: publicKey.toBase58(),
          trade_type: 'buy',
          token_amount: result.tokenAmount.toString(),
          native_amount: result.solAmount,
          price_native: result.price,
          transaction_signature: result.signature,
          platform_fee: result.platformFee,
          total_fee: result.totalFees,
        }),
      });

      setStatus(`Success! Bought ${result.tokenAmount} tokens`);
    } catch (error) {
      if (error instanceof TradeError) {
        switch (error.type) {
          case TradeErrorType.SLIPPAGE_EXCEEDED:
            setStatus('Error: Price moved too much. Increase slippage tolerance.');
            break;
          case TradeErrorType.INSUFFICIENT_SOL:
            setStatus('Error: Insufficient SOL balance');
            break;
          default:
            setStatus(`Error: ${error.message}`);
        }
      } else {
        setStatus(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="SOL amount"
      />
      <button onClick={handlePreview}>Preview</button>
      <button onClick={handleBuy}>Buy</button>

      {preview && (
        <div>
          <p>You will receive: {preview.expectedOutput} tokens</p>
          <p>Price impact: {(preview.priceImpact * 100).toFixed(2)}%</p>
          <p>Total fees: {preview.totalFees} SOL</p>
        </div>
      )}

      {status && <p>Status: {status}</p>}
    </div>
  );
}
```

---

## Integration Checklist

- [ ] Install Solana wallet adapter
- [ ] Configure RPC endpoint
- [ ] Set up Supabase for trade recording
- [ ] Implement wallet connection
- [ ] Add trade preview before execution
- [ ] Show progress during trades
- [ ] Handle errors gracefully
- [ ] Record trades in database
- [ ] Update token statistics
- [ ] Monitor transaction status
- [ ] Test on devnet first
- [ ] Add slippage warnings
- [ ] Validate all inputs
- [ ] Check balances before trading

---

## Notes

- **Fees**: Platform (1%) + Creator (1%) = 2% total
- **Minimum**: 0.001 SOL for buys, 1 token for sells
- **Slippage**: Default 1%, max recommended 5%
- **Confirmation**: Typically 2-4 seconds on Solana
- **Devnet**: Always test on devnet before mainnet
- **Security**: Never expose private keys
- **RPC**: Use reliable RPC providers (Alchemy, QuickNode)

For more details, see the [bonding curve documentation](../bonding-curve/README.md).
