-- =============================================================================
-- ThunderLaunch Database Schema
-- =============================================================================
--
-- This schema defines the complete database structure for the ThunderLaunch
-- multi-chain token launch platform.
--
-- INSTRUCTIONS:
-- 1. Open your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Execute the query
-- 6. Verify all tables, indexes, and policies are created
--
-- NOTES:
-- - All tables use UUID primary keys
-- - Timestamps use timestamptz for timezone awareness
-- - RLS (Row Level Security) is enabled on all tables
-- - Indexes are created for common query patterns
-- - Triggers automatically update timestamps and aggregates
--
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Chain types
CREATE TYPE chain AS ENUM ('solana', 'base', 'bnb');

-- Verification tiers
CREATE TYPE verification_tier AS ENUM ('free', 'verified', 'premium');

-- Risk levels
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Token status
CREATE TYPE token_status AS ENUM (
  'draft',
  'pending',
  'active',
  'paused',
  'delisted',
  'flagged'
);

-- Trade types
CREATE TYPE trade_type AS ENUM ('buy', 'sell');

-- Trade status
CREATE TYPE trade_status AS ENUM (
  'pending',
  'processing',
  'submitted',
  'confirmed',
  'failed',
  'cancelled',
  'expired'
);

-- Order types
CREATE TYPE order_type AS ENUM ('market', 'limit', 'stop_loss', 'take_profit');

-- User roles
CREATE TYPE user_role AS ENUM ('user', 'creator', 'admin', 'moderator');

-- User status
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'deleted');

-- Verification status
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- Security check status
CREATE TYPE security_check_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- USERS TABLE
-- -----------------------------------------------------------------------------
-- Stores user account information and wallet connections
CREATE TABLE users (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Wallet information
  wallet_address TEXT NOT NULL UNIQUE,

  -- Profile information
  email TEXT,
  email_verified BOOLEAN DEFAULT false,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Role and status
  role user_role DEFAULT 'user' NOT NULL,
  status user_status DEFAULT 'active' NOT NULL,
  verification_status verification_status DEFAULT 'unverified' NOT NULL,

  -- Subscription
  subscription_tier TEXT DEFAULT 'free' NOT NULL,

  -- Creator stats
  is_creator BOOLEAN DEFAULT false,
  tokens_created INTEGER DEFAULT 0,

  -- Trading stats
  trades_count INTEGER DEFAULT 0,
  total_volume_usd DECIMAL(20, 2) DEFAULT 0,
  total_pnl_usd DECIMAL(20, 2) DEFAULT 0,

  -- Referral system
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  referrals_count INTEGER DEFAULT 0,

  -- Activity tracking
  last_login_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT valid_username CHECK (username ~* '^[a-zA-Z0-9_-]{3,20}$')
);

-- Indexes for users table
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX idx_users_referred_by ON users(referred_by) WHERE referred_by IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Comments
COMMENT ON TABLE users IS 'User accounts and wallet connections';
COMMENT ON COLUMN users.wallet_address IS 'Blockchain wallet address (Solana or EVM)';
COMMENT ON COLUMN users.verification_status IS 'KYC/verification status';
COMMENT ON COLUMN users.subscription_tier IS 'Subscription tier: free, verified, premium';

-- -----------------------------------------------------------------------------
-- TOKENS TABLE
-- -----------------------------------------------------------------------------
-- Stores token information for all launched tokens
CREATE TABLE tokens (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Token identifiers
  mint_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  image_url TEXT,

  -- Creator information
  creator_wallet TEXT NOT NULL,

  -- Token economics
  total_supply NUMERIC(78, 0) NOT NULL, -- Large number for token amounts
  current_price DECIMAL(20, 10) DEFAULT 0,
  market_cap DECIMAL(20, 2) DEFAULT 0,
  liquidity DECIMAL(20, 2) DEFAULT 0,
  holders_count INTEGER DEFAULT 0,

  -- Risk and verification
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level risk_level DEFAULT 'low' NOT NULL,
  verification_tier verification_tier DEFAULT 'free' NOT NULL,

  -- Chain information
  chain chain NOT NULL,
  token_standard TEXT DEFAULT 'SPL' NOT NULL, -- SPL, ERC20, BEP20
  status token_status DEFAULT 'draft' NOT NULL,
  decimals INTEGER DEFAULT 9 NOT NULL CHECK (decimals >= 0 AND decimals <= 18),

  -- Social links
  website_url TEXT,
  twitter_handle TEXT,
  telegram_url TEXT,
  discord_url TEXT,
  whitepaper_url TEXT,

  -- Metadata
  metadata_uri TEXT,

  -- Token properties
  is_tradable BOOLEAN DEFAULT true,
  is_burnable BOOLEAN DEFAULT false,
  is_mintable BOOLEAN DEFAULT false,

  -- Fees
  fee_paid DECIMAL(20, 10) DEFAULT 0,
  creation_tx_signature TEXT,

  -- Market stats
  price_change_24h DECIMAL(10, 2) DEFAULT 0,
  volume_24h DECIMAL(20, 2) DEFAULT 0,
  total_volume DECIMAL(20, 2) DEFAULT 0,
  trades_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_symbol CHECK (symbol ~* '^[A-Z0-9]{1,10}$'),
  CONSTRAINT valid_name_length CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 32),
  CONSTRAINT positive_supply CHECK (total_supply > 0),
  CONSTRAINT positive_price CHECK (current_price >= 0),
  CONSTRAINT valid_url_website CHECK (website_url IS NULL OR website_url ~* '^https?://'),
  CONSTRAINT valid_url_telegram CHECK (telegram_url IS NULL OR telegram_url ~* '^https?://'),
  CONSTRAINT valid_url_discord CHECK (discord_url IS NULL OR discord_url ~* '^https?://')
);

-- Indexes for tokens table
CREATE INDEX idx_tokens_mint_address ON tokens(mint_address);
CREATE INDEX idx_tokens_creator_wallet ON tokens(creator_wallet);
CREATE INDEX idx_tokens_chain ON tokens(chain);
CREATE INDEX idx_tokens_status ON tokens(status);
CREATE INDEX idx_tokens_verification_tier ON tokens(verification_tier);
CREATE INDEX idx_tokens_risk_level ON tokens(risk_level);
CREATE INDEX idx_tokens_market_cap ON tokens(market_cap DESC);
CREATE INDEX idx_tokens_volume_24h ON tokens(volume_24h DESC);
CREATE INDEX idx_tokens_created_at ON tokens(created_at DESC);
CREATE INDEX idx_tokens_updated_at ON tokens(updated_at DESC);
CREATE INDEX idx_tokens_name_trgm ON tokens USING gin(name gin_trgm_ops);
CREATE INDEX idx_tokens_symbol_trgm ON tokens USING gin(symbol gin_trgm_ops);

-- Comments
COMMENT ON TABLE tokens IS 'Token information for all launched tokens';
COMMENT ON COLUMN tokens.mint_address IS 'On-chain token address/mint';
COMMENT ON COLUMN tokens.total_supply IS 'Total token supply (supports very large numbers)';
COMMENT ON COLUMN tokens.risk_score IS 'Security risk score from 0 (safe) to 100 (dangerous)';

-- -----------------------------------------------------------------------------
-- SECURITY_CHECKS TABLE
-- -----------------------------------------------------------------------------
-- Stores security check results for tokens
CREATE TABLE security_checks (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Token reference
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,

  -- Risk assessment
  risk_level risk_level NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  status security_check_status DEFAULT 'pending' NOT NULL,

  -- Check results
  findings JSONB DEFAULT '[]'::jsonb,
  passed_checks INTEGER DEFAULT 0,
  failed_checks INTEGER DEFAULT 0,
  warning_checks INTEGER DEFAULT 0,
  total_checks INTEGER DEFAULT 0,
  security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),

  -- Contract verification
  is_contract_verified BOOLEAN DEFAULT false,

  -- Audit information
  is_audited BOOLEAN DEFAULT false,
  audit_report_url TEXT,
  audit_firm TEXT,
  audit_date TIMESTAMPTZ,

  -- Additional metadata
  metadata JSONB,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_audit_url CHECK (audit_report_url IS NULL OR audit_report_url ~* '^https?://')
);

-- Indexes for security_checks table
CREATE INDEX idx_security_checks_token_id ON security_checks(token_id);
CREATE INDEX idx_security_checks_token_address ON security_checks(token_address);
CREATE INDEX idx_security_checks_risk_level ON security_checks(risk_level);
CREATE INDEX idx_security_checks_status ON security_checks(status);
CREATE INDEX idx_security_checks_created_at ON security_checks(created_at DESC);
CREATE INDEX idx_security_checks_findings ON security_checks USING gin(findings);

-- Comments
COMMENT ON TABLE security_checks IS 'Security audit results for tokens';
COMMENT ON COLUMN security_checks.findings IS 'Detailed security findings in JSON format';
COMMENT ON COLUMN security_checks.security_score IS 'Overall security score from 0 (dangerous) to 100 (safe)';

-- -----------------------------------------------------------------------------
-- TRADES TABLE
-- -----------------------------------------------------------------------------
-- Stores trade transactions
CREATE TABLE trades (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Token reference
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,

  -- Trader information
  wallet_address TEXT NOT NULL,
  user_id UUID REFERENCES users(id),

  -- Trade details
  trade_type trade_type NOT NULL,
  order_type order_type DEFAULT 'market' NOT NULL,
  status trade_status DEFAULT 'pending' NOT NULL,

  -- Amounts
  token_amount NUMERIC(78, 0) NOT NULL,
  native_amount DECIMAL(20, 10) NOT NULL,
  usd_amount DECIMAL(20, 2) NOT NULL,

  -- Prices
  price_native DECIMAL(20, 10) NOT NULL,
  price_usd DECIMAL(20, 10) NOT NULL,

  -- Slippage
  slippage_tolerance DECIMAL(5, 2) DEFAULT 1.0,
  actual_slippage DECIMAL(5, 2),

  -- Fees
  transaction_fee DECIMAL(20, 10) DEFAULT 0,
  platform_fee DECIMAL(20, 10) DEFAULT 0,
  total_fee DECIMAL(20, 10) DEFAULT 0,

  -- Transaction info
  transaction_signature TEXT,
  block_number BIGINT,
  chain chain NOT NULL,
  dex TEXT, -- DEX used for the trade
  pool_address TEXT,

  -- Priority
  priority TEXT DEFAULT 'medium',
  estimated_completion TIMESTAMPTZ,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Additional metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT positive_token_amount CHECK (token_amount > 0),
  CONSTRAINT positive_native_amount CHECK (native_amount > 0),
  CONSTRAINT positive_usd_amount CHECK (usd_amount > 0),
  CONSTRAINT valid_slippage CHECK (slippage_tolerance >= 0 AND slippage_tolerance <= 50)
);

-- Indexes for trades table
CREATE INDEX idx_trades_token_id ON trades(token_id);
CREATE INDEX idx_trades_token_address ON trades(token_address);
CREATE INDEX idx_trades_wallet_address ON trades(wallet_address);
CREATE INDEX idx_trades_user_id ON trades(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_trades_trade_type ON trades(trade_type);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_chain ON trades(chain);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trades_confirmed_at ON trades(confirmed_at DESC) WHERE confirmed_at IS NOT NULL;
CREATE INDEX idx_trades_transaction_signature ON trades(transaction_signature) WHERE transaction_signature IS NOT NULL;

-- Comments
COMMENT ON TABLE trades IS 'Buy and sell trade transactions';
COMMENT ON COLUMN trades.token_amount IS 'Amount of tokens traded';
COMMENT ON COLUMN trades.native_amount IS 'Amount in native currency (SOL, ETH, BNB)';
COMMENT ON COLUMN trades.slippage_tolerance IS 'Maximum acceptable slippage percentage';

-- -----------------------------------------------------------------------------
-- WATCHLIST TABLE
-- -----------------------------------------------------------------------------
-- Stores user's favorite/watched tokens
CREATE TABLE watchlist (
  -- Composite primary key
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,

  -- Settings
  price_alert_enabled BOOLEAN DEFAULT false,
  price_alert_target DECIMAL(20, 10),
  notifications_enabled BOOLEAN DEFAULT true,

  -- Notes
  notes TEXT,
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Primary key constraint
  PRIMARY KEY (user_id, token_id)
);

-- Indexes for watchlist table
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_watchlist_token_id ON watchlist(token_id);
CREATE INDEX idx_watchlist_created_at ON watchlist(created_at DESC);
CREATE INDEX idx_watchlist_tags ON watchlist USING gin(tags);

-- Comments
COMMENT ON TABLE watchlist IS 'User watchlists for tracking favorite tokens';
COMMENT ON COLUMN watchlist.price_alert_target IS 'Target price for price alerts';

-- -----------------------------------------------------------------------------
-- COMMENTS TABLE
-- -----------------------------------------------------------------------------
-- Stores user comments on tokens
CREATE TABLE comments (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Token reference
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,

  -- Author
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,

  -- Comment content
  content TEXT NOT NULL,

  -- Threading
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Moderation
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,

  -- Engagement
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_content_length CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 10000)
);

-- Indexes for comments table
CREATE INDEX idx_comments_token_id ON comments(token_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_upvotes ON comments(upvotes DESC);

-- Comments
COMMENT ON TABLE comments IS 'User comments and discussions on tokens';
COMMENT ON COLUMN comments.parent_id IS 'Reference to parent comment for threading';

-- -----------------------------------------------------------------------------
-- PRICE_HISTORY TABLE
-- -----------------------------------------------------------------------------
-- Stores historical price data for charts
CREATE TABLE price_history (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Token reference
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,

  -- Price data
  price_native DECIMAL(20, 10) NOT NULL,
  price_usd DECIMAL(20, 10) NOT NULL,

  -- Volume data
  volume_native DECIMAL(20, 10) DEFAULT 0,
  volume_usd DECIMAL(20, 2) DEFAULT 0,

  -- Market data
  market_cap DECIMAL(20, 2) DEFAULT 0,
  liquidity DECIMAL(20, 2) DEFAULT 0,

  -- Trading metrics
  trades_count INTEGER DEFAULT 0,
  buyers_count INTEGER DEFAULT 0,
  sellers_count INTEGER DEFAULT 0,

  -- Timestamp (minute precision for efficient storage)
  timestamp TIMESTAMPTZ NOT NULL,

  -- Created at
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT positive_price_native CHECK (price_native >= 0),
  CONSTRAINT positive_price_usd CHECK (price_usd >= 0),
  CONSTRAINT unique_token_timestamp UNIQUE (token_id, timestamp)
);

-- Indexes for price_history table
CREATE INDEX idx_price_history_token_id ON price_history(token_id);
CREATE INDEX idx_price_history_token_address ON price_history(token_address);
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp DESC);
CREATE INDEX idx_price_history_token_timestamp ON price_history(token_id, timestamp DESC);

-- Comments
COMMENT ON TABLE price_history IS 'Historical price and volume data for charting';
COMMENT ON COLUMN price_history.timestamp IS 'Time of price snapshot (minute precision)';

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- USERS POLICIES
-- -----------------------------------------------------------------------------

-- Users can read all public user profiles
CREATE POLICY "Public user profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- -----------------------------------------------------------------------------
-- TOKENS POLICIES
-- -----------------------------------------------------------------------------

-- Anyone can view active tokens
CREATE POLICY "Active tokens are viewable by everyone"
  ON tokens FOR SELECT
  USING (status = 'active' OR status = 'paused');

-- Token creators can view their own tokens (including drafts)
CREATE POLICY "Creators can view their own tokens"
  ON tokens FOR SELECT
  USING (creator_wallet = auth.jwt()->>'wallet_address');

-- Token creators can insert new tokens
CREATE POLICY "Authenticated users can create tokens"
  ON tokens FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Token creators can update their own tokens
CREATE POLICY "Creators can update their own tokens"
  ON tokens FOR UPDATE
  USING (creator_wallet = auth.jwt()->>'wallet_address');

-- Admins can manage all tokens
CREATE POLICY "Admins can manage all tokens"
  ON tokens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- SECURITY_CHECKS POLICIES
-- -----------------------------------------------------------------------------

-- Anyone can view security checks for active tokens
CREATE POLICY "Security checks are viewable by everyone"
  ON security_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tokens
      WHERE tokens.id = security_checks.token_id
      AND (tokens.status = 'active' OR tokens.status = 'paused')
    )
  );

-- System can create security checks
CREATE POLICY "System can create security checks"
  ON security_checks FOR INSERT
  WITH CHECK (true);

-- System can update security checks
CREATE POLICY "System can update security checks"
  ON security_checks FOR UPDATE
  USING (true);

-- -----------------------------------------------------------------------------
-- TRADES POLICIES
-- -----------------------------------------------------------------------------

-- Users can view all trades
CREATE POLICY "Trades are viewable by everyone"
  ON trades FOR SELECT
  USING (true);

-- Users can insert their own trades
CREATE POLICY "Users can create trades"
  ON trades FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND wallet_address = auth.jwt()->>'wallet_address'
  );

-- Users can view their own trades
CREATE POLICY "Users can view their own trades"
  ON trades FOR SELECT
  USING (wallet_address = auth.jwt()->>'wallet_address');

-- System can update trades
CREATE POLICY "System can update trades"
  ON trades FOR UPDATE
  USING (true);

-- -----------------------------------------------------------------------------
-- WATCHLIST POLICIES
-- -----------------------------------------------------------------------------

-- Users can only view their own watchlist
CREATE POLICY "Users can view their own watchlist"
  ON watchlist FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- Users can insert to their own watchlist
CREATE POLICY "Users can add to their own watchlist"
  ON watchlist FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- Users can update their own watchlist
CREATE POLICY "Users can update their own watchlist"
  ON watchlist FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- Users can delete from their own watchlist
CREATE POLICY "Users can delete from their own watchlist"
  ON watchlist FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- COMMENTS POLICIES
-- -----------------------------------------------------------------------------

-- Anyone can view non-deleted comments
CREATE POLICY "Non-deleted comments are viewable by everyone"
  ON comments FOR SELECT
  USING (NOT is_deleted);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id::text = auth.uid()::text
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- Moderators can manage all comments
CREATE POLICY "Moderators can manage all comments"
  ON comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND (role = 'moderator' OR role = 'admin')
    )
  );

-- -----------------------------------------------------------------------------
-- PRICE_HISTORY POLICIES
-- -----------------------------------------------------------------------------

-- Anyone can view price history
CREATE POLICY "Price history is viewable by everyone"
  ON price_history FOR SELECT
  USING (true);

-- System can insert price history
CREATE POLICY "System can insert price history"
  ON price_history FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- UPDATED_AT TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
-- Automatically update updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tokens_updated_at BEFORE UPDATE ON tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_checks_updated_at BEFORE UPDATE ON security_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlist_updated_at BEFORE UPDATE ON watchlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- USER STATS UPDATE TRIGGER
-- -----------------------------------------------------------------------------
-- Update user statistics when trades are confirmed

CREATE OR REPLACE FUNCTION update_user_trade_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE users
    SET
      trades_count = trades_count + 1,
      total_volume_usd = total_volume_usd + NEW.usd_amount,
      last_activity_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_on_trade AFTER INSERT OR UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_user_trade_stats();

-- -----------------------------------------------------------------------------
-- TOKEN STATS UPDATE TRIGGER
-- -----------------------------------------------------------------------------
-- Update token statistics when trades are confirmed

CREATE OR REPLACE FUNCTION update_token_trade_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE tokens
    SET
      trades_count = trades_count + 1,
      volume_24h = volume_24h + NEW.usd_amount,
      total_volume = total_volume + NEW.usd_amount
    WHERE id = NEW.token_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_token_stats_on_trade AFTER INSERT OR UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_token_trade_stats();

-- -----------------------------------------------------------------------------
-- CREATOR COUNT UPDATE TRIGGER
-- -----------------------------------------------------------------------------
-- Update user creator status and token count when tokens are created

CREATE OR REPLACE FUNCTION update_creator_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    is_creator = true,
    tokens_created = tokens_created + 1
  WHERE wallet_address = NEW.creator_wallet;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creator_stats_on_token AFTER INSERT ON tokens
  FOR EACH ROW EXECUTE FUNCTION update_creator_stats();

-- -----------------------------------------------------------------------------
-- REFERRAL COUNT UPDATE TRIGGER
-- -----------------------------------------------------------------------------
-- Update referral count when a new user is referred

CREATE OR REPLACE FUNCTION update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE users
    SET referrals_count = referrals_count + 1
    WHERE id = NEW.referred_by;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referral_count_on_user AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION update_referral_count();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- GET TOP TOKENS BY VOLUME
-- -----------------------------------------------------------------------------
-- Get tokens ordered by 24h volume

CREATE OR REPLACE FUNCTION get_top_tokens_by_volume(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  symbol TEXT,
  volume_24h DECIMAL,
  price_usd DECIMAL,
  price_change_24h DECIMAL,
  market_cap DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.symbol,
    t.volume_24h,
    t.current_price,
    t.price_change_24h,
    t.market_cap
  FROM tokens t
  WHERE t.status = 'active'
  ORDER BY t.volume_24h DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- GET USER PORTFOLIO
-- -----------------------------------------------------------------------------
-- Get user's token portfolio with current values

CREATE OR REPLACE FUNCTION get_user_portfolio(user_wallet TEXT)
RETURNS TABLE (
  token_id UUID,
  token_name TEXT,
  token_symbol TEXT,
  token_address TEXT,
  total_bought NUMERIC,
  total_sold NUMERIC,
  current_balance NUMERIC,
  avg_buy_price DECIMAL,
  current_price DECIMAL,
  total_invested DECIMAL,
  current_value DECIMAL,
  pnl DECIMAL,
  pnl_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH buys AS (
    SELECT
      t.token_id,
      SUM(t.token_amount) as total_bought,
      SUM(t.usd_amount) as total_invested
    FROM trades t
    WHERE t.wallet_address = user_wallet
      AND t.trade_type = 'buy'
      AND t.status = 'confirmed'
    GROUP BY t.token_id
  ),
  sells AS (
    SELECT
      t.token_id,
      SUM(t.token_amount) as total_sold
    FROM trades t
    WHERE t.wallet_address = user_wallet
      AND t.trade_type = 'sell'
      AND t.status = 'confirmed'
    GROUP BY t.token_id
  )
  SELECT
    tk.id,
    tk.name,
    tk.symbol,
    tk.mint_address,
    COALESCE(b.total_bought, 0),
    COALESCE(s.total_sold, 0),
    COALESCE(b.total_bought, 0) - COALESCE(s.total_sold, 0) as current_balance,
    CASE
      WHEN COALESCE(b.total_bought, 0) > 0
      THEN (b.total_invested / b.total_bought::decimal)::decimal(20, 10)
      ELSE 0
    END as avg_buy_price,
    tk.current_price,
    COALESCE(b.total_invested, 0),
    ((COALESCE(b.total_bought, 0) - COALESCE(s.total_sold, 0)) * tk.current_price)::decimal(20, 2),
    (
      ((COALESCE(b.total_bought, 0) - COALESCE(s.total_sold, 0)) * tk.current_price)
      - COALESCE(b.total_invested, 0)
    )::decimal(20, 2) as pnl,
    CASE
      WHEN COALESCE(b.total_invested, 0) > 0
      THEN (
        (
          ((COALESCE(b.total_bought, 0) - COALESCE(s.total_sold, 0)) * tk.current_price)
          - COALESCE(b.total_invested, 0)
        ) / b.total_invested * 100
      )::decimal(10, 2)
      ELSE 0
    END as pnl_percentage
  FROM tokens tk
  LEFT JOIN buys b ON tk.id = b.token_id
  LEFT JOIN sells s ON tk.id = s.token_id
  WHERE COALESCE(b.total_bought, 0) - COALESCE(s.total_sold, 0) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Additional composite indexes for common queries

-- Token filtering and sorting
CREATE INDEX idx_tokens_chain_status_volume ON tokens(chain, status, volume_24h DESC);
CREATE INDEX idx_tokens_chain_status_market_cap ON tokens(chain, status, market_cap DESC);
CREATE INDEX idx_tokens_verification_market_cap ON tokens(verification_tier, market_cap DESC);
CREATE INDEX idx_tokens_risk_volume ON tokens(risk_level, volume_24h DESC);

-- Trade queries
CREATE INDEX idx_trades_user_created ON trades(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_trades_token_created ON trades(token_id, created_at DESC);
CREATE INDEX idx_trades_wallet_created ON trades(wallet_address, created_at DESC);

-- Price history queries
CREATE INDEX idx_price_history_token_range ON price_history(token_id, timestamp DESC);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON DATABASE postgres IS 'ThunderLaunch multi-chain token launch platform database';

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================

-- Verify setup
DO $$
BEGIN
  RAISE NOTICE 'ThunderLaunch database schema created successfully!';
  RAISE NOTICE 'Tables created: users, tokens, security_checks, trades, watchlist, comments, price_history';
  RAISE NOTICE 'RLS policies enabled on all tables';
  RAISE NOTICE 'Triggers created for automatic timestamp updates and aggregate calculations';
  RAISE NOTICE 'Helper functions created for common queries';
END $$;
