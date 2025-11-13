# Environment Variables Setup Guide

This guide explains how to set up environment variables for the ThunderLaunch platform.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Never commit `.env.local` to version control (it's already in `.gitignore`)

## Required Variables

### Supabase Configuration

ThunderLaunch uses Supabase for database, authentication, and real-time features.

#### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Navigate to **Settings** → **API**
4. Copy the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Notes:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose (protected by Row Level Security)
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - **NEVER** expose to client-side code
- Keep service role key only in server-side code

### Solana Configuration

Configure Solana network and RPC endpoint.

#### Development (Devnet)

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS_ENDPOINT=wss://api.devnet.solana.com
```

#### Production (Mainnet)

For production, use a dedicated RPC provider for better reliability:

**QuickNode:**
```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://your-endpoint.quiknode.pro/your-key/
NEXT_PUBLIC_SOLANA_WS_ENDPOINT=wss://your-endpoint.quiknode.pro/your-key/
```

**Helius:**
```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=your-key
```

**Alchemy:**
```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://solana-mainnet.g.alchemy.com/v2/your-key
```

**Why use dedicated RPC?**
- Public RPCs have rate limits
- Dedicated RPCs offer better performance
- Production apps need reliability

### Wallet Configuration

Set up wallet addresses for receiving fees and treasury:

```env
NEXT_PUBLIC_FEE_WALLET_ADDRESS=YourSolanaWalletAddressHere...
NEXT_PUBLIC_TREASURY_WALLET_ADDRESS=YourTreasuryWalletAddressHere...
```

**How to generate wallet addresses:**

Using Solana CLI:
```bash
solana-keygen new --outfile ~/.config/solana/fee-wallet.json
solana address -k ~/.config/solana/fee-wallet.json
```

Using Phantom or Solflare:
1. Open wallet
2. Copy wallet address
3. Add to `.env.local`

**Important:** Store private keys securely! Never commit them to git.

## Optional Variables

### Feature Flags

Enable/disable features:

```env
NEXT_PUBLIC_ENABLE_TESTNET=true          # Allow testnet usage
NEXT_PUBLIC_ENABLE_MAINNET=false         # Allow mainnet usage
NEXT_PUBLIC_ENABLE_ANALYTICS=false       # Google Analytics
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true    # Toast notifications
NEXT_PUBLIC_ENABLE_REFERRALS=false       # Referral system
```

### Liquidity & Graduation

Configure the default DEX where liquidity migrates after graduation:

```env
NEXT_PUBLIC_GRADUATION_DEX=raydium   # raydium | orca | jupiter
```

### Platform Configuration

```env
NEXT_PUBLIC_FEE_PERCENTAGE=1.0           # Platform fee (1.0 = 1%)
NEXT_PUBLIC_MIN_LIQUIDITY=1000           # Minimum liquidity in SOL
NEXT_PUBLIC_MAX_TOKEN_SUPPLY=1000000000  # Maximum token supply
NEXT_PUBLIC_MIN_TOKEN_SUPPLY=1000        # Minimum token supply
```

### API & JWT Secrets

These values secure every server-to-server workflow (token creation, trade ingestion, security scans, cron jobs, etc.). **They are required for any protected API route.**

```env
API_SECRET_KEY=your-long-random-server-key
JWT_SECRET=another-long-random-secret
```

- Generate both with `openssl rand -hex 32` (or any secure random generator).
- Keep them server-side only (no `NEXT_PUBLIC_` prefix).
- Every request to protected endpoints must send `X-API-Key: $API_SECRET_KEY` (or `Authorization: Bearer $API_SECRET_KEY`).
- JWT support will reuse `JWT_SECRET` once user authentication is added—set it now to avoid breaking future releases.

> **Reminder:** When you add new API routes or background jobs, decide whether they need the shared API key and/or JWT auth, and update the implementation accordingly.

### Analytics (Optional)

**Google Analytics:**
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Get from: [Google Analytics](https://analytics.google.com)

**Sentry Error Tracking:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your-auth-token
```

Get from: [Sentry Dashboard](https://sentry.io)

### IPFS/Arweave (Optional)

For storing token metadata:

**Pinata (IPFS):**
```env
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
PINATA_API_KEY=your-api-key
PINATA_SECRET_KEY=your-secret-key
```

Get from: [Pinata](https://pinata.cloud)

## Environment-Specific Files

Different files for different environments:

- `.env.local` - Local development (gitignored)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Testing environment

Priority (highest to lowest):
1. `.env.local`
2. `.env.[mode].local`
3. `.env.[mode]`
4. `.env`

## Security Best Practices

### ✅ DO

- Keep `.env.local` in `.gitignore`
- Use different credentials for dev/staging/production
- Rotate keys regularly
- Use environment-specific RPC endpoints
- Store private keys in secure vaults (not in env files)
- Use `NEXT_PUBLIC_` prefix only for client-safe variables

### ❌ DON'T

- Never commit `.env.local` or any file with secrets
- Never share service role keys
- Never put private keys in environment variables
- Never expose server-side keys to client (no `NEXT_PUBLIC_` prefix)
- Never use the same credentials across environments

## Verifying Setup

Check if environment variables are loaded correctly:

```typescript
// src/lib/env.ts
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  solana: {
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
    rpcEndpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT,
  },
} as const;

// Validate on app startup
if (!env.supabase.url || !env.supabase.anonKey) {
  throw new Error('Missing required Supabase environment variables');
}

if (!env.solana.rpcEndpoint) {
  throw new Error('Missing Solana RPC endpoint');
}
```

## Common Issues

### Issue: Environment variables not loading

**Solution:**
1. Restart development server: `npm run dev`
2. Check variable names (case-sensitive)
3. Ensure no quotes in `.env.local` file
4. Clear Next.js cache: `rm -rf .next`

### Issue: CORS errors with Supabase

**Solution:**
1. Check Supabase project URL is correct
2. Verify anon key matches your project
3. Check Row Level Security policies

### Issue: Solana RPC rate limiting

**Solution:**
1. Use dedicated RPC provider
2. Implement request caching
3. Add retry logic with exponential backoff

## Development vs Production

### Development Setup

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_ENABLE_MAINNET=false
DEBUG=true
```

### Production Setup

```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_APP_URL=https://thunderlaunch.app
NEXT_PUBLIC_ENABLE_TESTNET=false
NEXT_PUBLIC_ENABLE_MAINNET=true
DEBUG=false
```

## Deployment Platforms

### Vercel

1. Go to Project Settings → Environment Variables
2. Add all `NEXT_PUBLIC_*` variables
3. Add server-side variables separately
4. Set different values for Preview vs Production

### Netlify

1. Site Settings → Build & Deploy → Environment
2. Add environment variables
3. Deploy

### Docker

Create `.env.production`:
```dockerfile
# Dockerfile
ENV NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
ENV NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://...
```

Or use docker-compose:
```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env.production
```

## Testing Environment Variables

Create a test file:

```typescript
// scripts/test-env.ts
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Solana Network:', process.env.NEXT_PUBLIC_SOLANA_NETWORK);
console.log('RPC Endpoint:', process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT);
console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);
```

Run: `npx tsx scripts/test-env.ts`

## Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
- [Solana RPC Endpoints](https://docs.solana.com/cluster/rpc-endpoints)
- [QuickNode](https://www.quicknode.com/)
- [Helius](https://www.helius.dev/)
- [Alchemy](https://www.alchemy.com/)

## Support

If you encounter issues with environment setup:
1. Check this documentation
2. Review `.env.local.example`
3. Verify all required variables are set
4. Restart development server
5. Clear Next.js cache

## Checklist

Before deploying to production:

- [ ] All environment variables are set
- [ ] Using dedicated Solana RPC endpoint
- [ ] Service role key is secure (server-side only)
- [ ] Wallet addresses are correct
- [ ] Feature flags are configured properly
- [ ] Analytics tracking is set up (if enabled)
- [ ] Error monitoring is configured
- [ ] Different credentials for production vs development
- [ ] `.env.local` is in `.gitignore`
- [ ] Environment variables are set in deployment platform
