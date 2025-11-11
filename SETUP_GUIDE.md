# ThunderLaunch Local Setup Guide

Complete step-by-step guide to run ThunderLaunch on your local environment.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** (to clone/manage the repository)
- **Supabase Account** - [Sign up](https://app.supabase.com)
- **Solana Wallet** (Phantom or Solflare) - For testing

---

## Step 1: Install Dependencies

Navigate to the project directory and install all required packages:

```bash
cd /path/to/ThunderLaunch
npm install
```

This will install:
- Next.js 14 with App Router
- Solana Web3.js and Wallet Adapter
- Supabase Client
- UI components (Radix UI)
- Forms (React Hook Form + Zod)
- Charts (Recharts)
- And more (see DEPENDENCIES.md for details)

**Expected time**: 2-5 minutes depending on your internet connection.

---

## Step 2: Set Up Environment Variables

### 2.1 Copy the Example File

```bash
cp .env.local.example .env.local
```

### 2.2 Configure Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (or select an existing one)
3. Navigate to **Settings** → **API**
4. Copy the following values into your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Note**: The service role key bypasses Row Level Security. NEVER expose it to client-side code!

### 2.3 Configure Solana

For local development, use Solana Devnet:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS_ENDPOINT=wss://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_COMMITMENT=confirmed
```

**For better performance**, consider using a dedicated RPC provider:
- [QuickNode](https://www.quicknode.com/) (Recommended)
- [Helius](https://www.helius.dev/)
- [Alchemy](https://www.alchemy.com/)

### 2.4 Configure Wallet Addresses

You need to set up wallet addresses for receiving platform fees:

```env
NEXT_PUBLIC_FEE_WALLET_ADDRESS=YourSolanaWalletAddressHere
NEXT_PUBLIC_TREASURY_WALLET_ADDRESS=YourTreasuryWalletAddressHere
```

**How to get a wallet address**:
- Open Phantom or Solflare wallet
- Copy your wallet address
- Paste it into `.env.local`

For development, you can use the same wallet address for both.

### 2.5 Application Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# Platform settings
NEXT_PUBLIC_FEE_PERCENTAGE=1.0
NEXT_PUBLIC_MIN_LIQUIDITY=1000
NEXT_PUBLIC_MAX_TOKEN_SUPPLY=1000000000
NEXT_PUBLIC_MIN_TOKEN_SUPPLY=1000
NEXT_PUBLIC_ESTIMATED_TX_FEE=0.001
```

### 2.6 Feature Flags (Optional)

```env
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_ENABLE_MAINNET=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_REFERRALS=false
```

### 2.7 Verify Your Setup

Your complete `.env.local` should look like this:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS_ENDPOINT=wss://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_COMMITMENT=confirmed

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# Wallets
NEXT_PUBLIC_FEE_WALLET_ADDRESS=YourSolanaWalletAddressHere
NEXT_PUBLIC_TREASURY_WALLET_ADDRESS=YourTreasuryWalletAddressHere

# Platform
NEXT_PUBLIC_FEE_PERCENTAGE=1.0
NEXT_PUBLIC_MIN_LIQUIDITY=1000
NEXT_PUBLIC_MAX_TOKEN_SUPPLY=1000000000
NEXT_PUBLIC_MIN_TOKEN_SUPPLY=1000

# Features
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_ENABLE_MAINNET=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

See [ENVIRONMENT.md](./ENVIRONMENT.md) for detailed explanations of all variables.

---

## Step 3: Set Up Database Schema in Supabase

ThunderLaunch requires a PostgreSQL database with specific tables, indexes, and Row Level Security policies.

### 3.1 Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### 3.2 Execute Database Schema

1. Open the file `sql/schema.sql` in your code editor
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`

### 3.3 Verify Setup

After execution, you should see a success message. The schema creates:

**Tables**:
- `users` - User accounts and wallet connections
- `tokens` - Token information for all launched tokens
- `security_checks` - Security audit results
- `trades` - Buy and sell transactions
- `watchlist` - User favorite tokens
- `comments` - User comments and discussions
- `price_history` - Historical price data for charts

**Enums**:
- `chain`, `verification_tier`, `risk_level`, `token_status`, `trade_type`, `trade_status`, etc.

**Features**:
- Row Level Security (RLS) policies on all tables
- Automatic timestamp updates via triggers
- User/token statistics auto-update triggers
- Helper functions for common queries
- Optimized indexes for performance

### 3.4 Verify Tables Were Created

In Supabase:
1. Go to **Database** → **Tables**
2. You should see all 7 tables listed
3. Click on each table to verify columns

---

## Step 4: Run the Development Server

Now you're ready to start the application!

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

You should see output like:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully
```

---

## Step 5: Verify Everything Works

### 5.1 Open the Application

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### 5.2 Connect Your Wallet

1. Click **Connect Wallet** button
2. Select Phantom or Solflare
3. Approve the connection
4. Your wallet should now be connected

### 5.3 Test Basic Functionality

**Navigation**:
- Browse tokens
- View token details
- Check user profiles
- Access watchlist

**Database Connection**:
- Check if data loads from Supabase
- Try adding a token to watchlist
- View trading history

---

## Step 6: Run Tests (Optional)

ThunderLaunch includes a comprehensive Vitest test suite:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## Important Notes & Known Issues

### 🚨 CRITICAL: Trading Implementation Bug

**There is a critical P1 bug in the current trading implementation** that prevents trades from executing.

**Location**: `src/lib/solana/trading.ts`

**Issue**: The buy/sell functions attempt to use pool addresses as signers without proper authority delegation. This causes 100% transaction failure.

**Impact**:
- Buy transactions will fail (lines 161-169)
- Sell transactions will fail (lines 311-317)
- Users will lose gas fees on failed transactions

**Documentation**: See [docs/TRADING_IMPLEMENTATION.md](./docs/TRADING_IMPLEMENTATION.md) for:
- Detailed problem explanation
- Three potential solutions:
  1. Deploy Solana Program (Recommended)
  2. Use Centralized Server Signer
  3. Use Program Derived Addresses (PDA)

**Workaround**: For development/testing, you can:
1. Mock the trading functions
2. Test UI/UX without actual trades
3. Focus on other features (profiles, watchlist, security checks)

**Status**: The trading feature needs architectural changes before it can work on-chain.

---

## Troubleshooting

### Issue: Environment variables not loading

**Solution**:
```bash
# Stop the dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```

### Issue: "Cannot connect to Supabase"

**Check**:
1. Supabase URL is correct in `.env.local`
2. Anon key is correct
3. Database schema has been created
4. Your Supabase project is active

### Issue: "Wallet connection failed"

**Check**:
1. Phantom or Solflare wallet extension is installed
2. You're on Devnet in your wallet settings
3. Browser allows pop-ups from localhost

### Issue: Database queries failing

**Check**:
1. Schema was executed successfully
2. RLS policies are enabled
3. Using correct Supabase service role key
4. Tables exist in your database

### Issue: Solana RPC errors or rate limiting

**Solution**:
1. Switch to a dedicated RPC provider (QuickNode, Helius)
2. Add retry logic
3. Implement request caching

---

## Development Workflow

### File Structure

```
ThunderLaunch/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # React components
│   │   ├── layout/      # Layout components
│   │   ├── token/       # Token-related components
│   │   ├── trading/     # Trading components
│   │   └── ui/          # Reusable UI components
│   ├── lib/             # Utility functions
│   │   ├── solana/      # Solana integration
│   │   ├── supabase/    # Database client
│   │   └── bonding-curve/ # Bonding curve math
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   └── config/          # App configuration
├── sql/                 # Database schema
├── docs/                # Documentation
└── tests/               # Vitest tests
```

### Making Changes

1. Edit files in `src/`
2. Changes auto-reload via Hot Module Replacement
3. Check browser console for errors
4. Run tests: `npm test`
5. Lint code: `npm run lint`

### Adding New Features

See documentation in `docs/`:
- [USER_PROFILES.md](./docs/USER_PROFILES.md) - User profile system
- [WATCHLIST.md](./docs/WATCHLIST.md) - Watchlist functionality
- [TOAST_NOTIFICATIONS.md](./docs/TOAST_NOTIFICATIONS.md) - Toast system
- [REALTIME_FEATURES.md](./docs/REALTIME_FEATURES.md) - Real-time updates
- [TRADING_IMPLEMENTATION.md](./docs/TRADING_IMPLEMENTATION.md) - Trading system

---

## Next Steps

Now that your local environment is set up:

### For Development:

1. **Explore the codebase**
   - Read documentation in `docs/`
   - Review component structure
   - Understand data flow

2. **Test existing features**
   - User profiles
   - Token browsing
   - Watchlist
   - Security checks

3. **Fix the trading bug**
   - Review [TRADING_IMPLEMENTATION.md](./docs/TRADING_IMPLEMENTATION.md)
   - Choose implementation approach
   - Implement solution

4. **Add new features**
   - Follow existing patterns
   - Write tests
   - Update documentation

### For Testing:

1. Get Devnet SOL from [Solana Faucet](https://faucet.solana.com/)
2. Test wallet connection
3. Test database operations
4. Run unit tests

### For Deployment:

1. Set up production environment variables
2. Use Mainnet RPC endpoint
3. Deploy to Vercel/Netlify
4. Set up monitoring (Sentry)
5. Enable analytics (optional)

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Testing
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage

# Cleanup
rm -rf .next         # Clear Next.js cache
rm -rf node_modules  # Remove dependencies
npm install          # Reinstall dependencies
```

---

## Resources

### Documentation
- [README.md](./README.md) - Project overview
- [ENVIRONMENT.md](./ENVIRONMENT.md) - Environment variables guide
- [DEPENDENCIES.md](./DEPENDENCIES.md) - Dependency documentation
- [docs/](./docs/) - Feature documentation

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Solana Docs](https://docs.solana.com)
- [Supabase Docs](https://supabase.com/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

### Community
- [Solana Discord](https://discord.gg/solana)
- [Supabase Discord](https://discord.supabase.com)

---

## Checklist

Before you start developing, make sure you've completed:

- [ ] Installed Node.js (v18+)
- [ ] Cloned the repository
- [ ] Ran `npm install`
- [ ] Created `.env.local` from `.env.local.example`
- [ ] Set up Supabase project
- [ ] Added Supabase credentials to `.env.local`
- [ ] Executed database schema in Supabase SQL Editor
- [ ] Configured Solana RPC endpoint
- [ ] Set up wallet addresses
- [ ] Started dev server with `npm run dev`
- [ ] Opened http://localhost:3000 in browser
- [ ] Connected wallet successfully
- [ ] Verified database connection works
- [ ] Read about the critical trading bug
- [ ] Reviewed documentation in `docs/`

---

## Support

If you encounter issues:

1. Check this setup guide
2. Review [ENVIRONMENT.md](./ENVIRONMENT.md)
3. Check [troubleshooting section](#troubleshooting)
4. Review relevant docs in `docs/`
5. Check browser console for errors
6. Verify Supabase dashboard for database issues

---

**You're now ready to develop with ThunderLaunch!** 🚀⚡

Start by exploring the application, testing features, and reviewing the codebase. When you're ready to tackle the trading implementation, refer to [docs/TRADING_IMPLEMENTATION.md](./docs/TRADING_IMPLEMENTATION.md) for detailed guidance.

Happy coding!
