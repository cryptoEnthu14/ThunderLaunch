# User Profile System

This document describes the user profile system implemented in ThunderLaunch.

## Overview

ThunderLaunch includes a comprehensive user profile system with:
- Public user profiles
- Profile editing with avatar upload
- User statistics and analytics
- Created tokens display
- Trading history
- Portfolio tracking (coming soon)

## Components

### 1. ProfileCard Component

**Location:** `src/components/user/ProfileCard.tsx`

Displays user profile information with avatar, stats, and verification badge.

#### Features
- User avatar with fallback
- Display name and username
- Wallet address with copy button
- Verification badge (verified, pending, unverified)
- Creator badge
- Bio/description
- Statistics (tokens created, trades, volume)
- Social links (Twitter, Telegram, Website)
- Member since date
- Edit button (for own profile)

#### Usage
```tsx
import { ProfileCard } from '@/components/user';

<ProfileCard
  profile={userProfile}
  isOwnProfile={true}
  onEdit={() => setShowEditModal(true)}
/>
```

#### Props
- `profile` (UserProfile) - User profile data
- `isOwnProfile` (boolean) - Whether this is the current user's profile
- `onEdit` (function) - Callback when edit button is clicked
- `className` (string) - Custom CSS class

---

### 2. EditProfile Component

**Location:** `src/components/user/EditProfile.tsx`

Modal for editing user profile information.

#### Features
- Avatar upload with preview
- Username validation and availability check
- Display name
- Bio (max 500 characters)
- Social links (Twitter, Telegram, Discord, Website)
- Real-time validation
- Loading states
- Error handling

#### Usage
```tsx
import { EditProfile } from '@/components/user';

<EditProfile
  open={showEditModal}
  onOpenChange={setShowEditModal}
  profile={userProfile}
  onProfileUpdated={(updatedProfile) => {
    console.log('Profile updated:', updatedProfile);
  }}
/>
```

#### Props
- `open` (boolean) - Whether modal is open
- `onOpenChange` (function) - Callback when modal state changes
- `profile` (UserProfile) - Current user profile
- `onProfileUpdated` (function) - Callback when profile is successfully updated

#### Validation Rules
- **Username:**
  - 3-20 characters
  - Alphanumeric and underscores only
  - Must be unique
  - Optional

- **Avatar:**
  - Image files only
  - Max 5MB
  - Uploaded to Supabase storage

- **Bio:**
  - Max 500 characters
  - Optional

- **Social Links:**
  - Valid URLs (for Telegram, Website)
  - Twitter: @username format
  - All optional

---

### 3. Profile Page

**Location:** `src/app/profile/[wallet]/page.tsx`

Dynamic route for user profile pages.

#### Features
- Profile card display
- Statistics dashboard
- Tabbed content:
  - Created Tokens
  - Trading History
  - Portfolio (coming soon)
- Edit profile (for own profile only)
- Loading states
- Error handling
- Empty states

#### Route
```
/profile/[wallet_address]
```

#### Example
```
/profile/So11111111111111111111111111111111111111112
```

#### Statistics Cards
- **Portfolio Value** - Total portfolio value in USD
- **Total P&L** - Profit/Loss with color coding
- **Win Rate** - Percentage of successful trades
- **Total Trades** - Number of confirmed trades

#### Tabs
1. **Created Tokens** - Grid of tokens created by the user
2. **Trading History** - List of confirmed trades
3. **Portfolio** - Token holdings (coming soon)

---

## Database Functions

**Location:** `src/lib/supabase/users.ts`

### getUserProfile(walletAddress)

Get user profile by wallet address.

```tsx
const { data, error } = await getUserProfile(walletAddress);
```

**Returns:** `QueryResult<UserProfile>`

---

### getUserProfileById(userId)

Get user profile by user ID.

```tsx
const { data, error } = await getUserProfileById(userId);
```

**Returns:** `QueryResult<UserProfile>`

---

### upsertUserProfile(walletAddress, profileData?)

Create or update user profile.

```tsx
const { data, error } = await upsertUserProfile(
  walletAddress,
  {
    username: 'john_doe',
    display_name: 'John Doe',
    bio: 'Crypto enthusiast'
  }
);
```

**Returns:** `QueryResult<User>`

---

### updateUserProfile(walletAddress, updates)

Update user profile.

```tsx
const { data, error } = await updateUserProfile(walletAddress, {
  display_name: 'New Name',
  bio: 'Updated bio',
  social_links: {
    twitter: '@username',
    website: 'https://example.com'
  }
});
```

**Returns:** `QueryResult<UserProfile>`

---

### getUserTokens(walletAddress, options?)

Get tokens created by user.

```tsx
const { data, error } = await getUserTokens(walletAddress, {
  page: 1,
  limit: 20,
  sortBy: 'created_at',
  sortOrder: 'desc'
});
```

**Options:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)
- `sortBy` ('created_at' | 'market_cap' | 'volume_24h') - Sort field
- `sortOrder` ('asc' | 'desc') - Sort order

**Returns:** `QueryResult<{ tokens: Token[], total: number }>`

---

### getUserTrades(walletAddress, options?)

Get user trading history.

```tsx
const { data, error } = await getUserTrades(walletAddress, {
  page: 1,
  limit: 20,
  status: 'confirmed',
  sortBy: 'created_at',
  sortOrder: 'desc'
});
```

**Options:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `status` ('confirmed' | 'pending' | 'failed') - Filter by status
- `sortBy` ('created_at' | 'usd_amount') - Sort field
- `sortOrder` ('asc' | 'desc') - Sort order

**Returns:** `QueryResult<{ trades: Trade[], total: number }>`

---

### getUserStats(walletAddress)

Get user statistics.

```tsx
const { data, error } = await getUserStats(walletAddress);
```

**Returns:** `QueryResult<UserStats>`

**Stats Include:**
- Portfolio value
- Total invested
- Total P&L
- P&L percentage
- Win rate
- Total trades
- Successful/failed trades
- Total volume
- Total fees paid
- Tokens created
- Referral earnings

---

### isUsernameAvailable(username, currentWalletAddress?)

Check if username is available.

```tsx
const { data: isAvailable, error } = await isUsernameAvailable(
  'john_doe',
  currentWalletAddress
);
```

**Returns:** `QueryResult<boolean>`

---

### uploadAvatar(walletAddress, file)

Upload user avatar to Supabase storage.

```tsx
const { data: avatarUrl, error } = await uploadAvatar(
  walletAddress,
  avatarFile
);
```

**Returns:** `QueryResult<string>` - Public URL of uploaded avatar

**Validation:**
- Max file size: 5MB
- Allowed types: Images only
- Stored in: `user-assets/avatars/`

---

## User Types

### UserProfile

```typescript
interface UserProfile {
  id: string;
  wallet_address: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  verification_status: VerificationStatus;
  is_creator: boolean;
  tokens_created: number;
  trades_count: number;
  total_volume_usd: number;
  social_links?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };
  joined_at: string;
}
```

### UserStats

```typescript
interface UserStats {
  user_id: string;
  portfolio_value_usd: number;
  total_invested_usd: number;
  total_pnl_usd: number;
  total_pnl_percentage: number;
  win_rate: number;
  total_trades: number;
  successful_trades: number;
  failed_trades: number;
  total_volume_usd: number;
  total_fees_paid_usd: number;
  tokens_created: number;
  active_positions: number;
  total_tokens_held: number;
  referral_earnings_usd: number;
  updated_at: string;
}
```

---

## Usage Examples

### Viewing a Profile

```tsx
// In any component
import Link from 'next/link';

<Link href={`/profile/${walletAddress}`}>
  View Profile
</Link>
```

### Editing Own Profile

```tsx
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ProfileCard, EditProfile } from '@/components/user';
import { getUserProfile } from '@/lib/supabase/users';

function MyProfile() {
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (publicKey) {
      getUserProfile(publicKey.toBase58()).then(({ data }) => {
        setProfile(data);
      });
    }
  }, [publicKey]);

  return (
    <>
      <ProfileCard
        profile={profile}
        isOwnProfile={true}
        onEdit={() => setShowEdit(true)}
      />

      <EditProfile
        open={showEdit}
        onOpenChange={setShowEdit}
        profile={profile}
        onProfileUpdated={setProfile}
      />
    </>
  );
}
```

### Loading User Tokens

```tsx
import { useEffect, useState } from 'react';
import { getUserTokens } from '@/lib/supabase/users';
import { TokenCard } from '@/components/token/TokenCard';

function UserTokens({ walletAddress }) {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    getUserTokens(walletAddress, { limit: 10 }).then(({ data }) => {
      setTokens(data?.tokens || []);
    });
  }, [walletAddress]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
```

### Displaying User Stats

```tsx
import { getUserStats } from '@/lib/supabase/users';

function UserStatsDisplay({ walletAddress }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getUserStats(walletAddress).then(({ data }) => {
      setStats(data);
    });
  }, [walletAddress]);

  if (!stats) return <LoadingSpinner />;

  return (
    <div>
      <div>Portfolio: ${stats.portfolio_value_usd}</div>
      <div>P&L: ${stats.total_pnl_usd}</div>
      <div>Win Rate: {stats.win_rate}%</div>
      <div>Total Trades: {stats.total_trades}</div>
    </div>
  );
}
```

---

## Integration with Other Features

### Linking to User Profiles

```tsx
// From token page - show creator
<Link href={`/profile/${token.creator_wallet}`}>
  View Creator Profile
</Link>

// From trade history - show trader
<Link href={`/profile/${trade.wallet_address}`}>
  View Trader
</Link>
```

### User Verification Badge

```tsx
// Show verification status anywhere
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2 } from 'lucide-react';

{user.verification_status === 'verified' && (
  <Badge className="bg-blue-500/20 text-blue-300">
    <CheckCircle2 className="w-4 h-4 mr-1" />
    Verified
  </Badge>
)}
```

### Creator Badge

```tsx
// Show creator status
import { Shield } from 'lucide-react';

{user.is_creator && (
  <Badge className="bg-purple-500/20 text-purple-300">
    <Shield className="w-4 h-4 mr-1" />
    Creator
  </Badge>
)}
```

---

## Supabase Storage

### Avatar Storage

Avatars are stored in Supabase storage:
- **Bucket:** `user-assets`
- **Path:** `avatars/{wallet_address}-{timestamp}.{ext}`
- **Access:** Public read
- **Max Size:** 5MB
- **Allowed Types:** Images (PNG, JPG, GIF, WebP)

### Setting Up Storage

1. Create `user-assets` bucket in Supabase
2. Set bucket to public
3. Configure RLS policies for uploads

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-assets' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Allow public read access
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-assets');
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  email_verified BOOLEAN DEFAULT false,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  verification_status TEXT DEFAULT 'unverified',
  subscription_tier TEXT DEFAULT 'free',
  is_creator BOOLEAN DEFAULT false,
  tokens_created INTEGER DEFAULT 0,
  trades_count INTEGER DEFAULT 0,
  total_volume_usd NUMERIC DEFAULT 0,
  total_pnl_usd NUMERIC DEFAULT 0,
  referral_code TEXT,
  referred_by UUID,
  referrals_count INTEGER DEFAULT 0,
  social_links JSONB,
  last_login_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_referral_code ON users(referral_code);
```

---

## Security Considerations

### Profile Privacy

- **Public Data:**
  - Username
  - Display name
  - Avatar
  - Bio
  - Social links
  - Verification status
  - Creator status
  - Tokens created count
  - Trades count
  - Total volume

- **Private Data:**
  - Email
  - Referral earnings
  - Detailed P&L
  - Wallet balances

### Authentication

- Profile viewing is public
- Profile editing requires wallet connection
- Username changes are rate-limited
- Avatar uploads require authentication

---

## Future Enhancements

1. **Portfolio Tracking**
   - Real-time token holdings
   - Position P&L tracking
   - Portfolio charts

2. **Activity Feed**
   - Recent trades
   - Token launches
   - Achievements

3. **Reputation System**
   - Trading reputation score
   - Creator reputation
   - Community ratings

4. **Advanced Stats**
   - Performance charts
   - Trading patterns
   - Best/worst performing tokens

5. **Social Features**
   - Follow/unfollow users
   - Activity notifications
   - Leaderboards

6. **Profile Customization**
   - Cover images
   - Custom themes
   - Achievement badges

---

## Troubleshooting

### Profile Not Loading

1. Check wallet address format
2. Verify user exists in database
3. Check Supabase connection
4. Review browser console for errors

### Avatar Upload Failed

1. Check file size (<5MB)
2. Verify file type (images only)
3. Check Supabase storage configuration
4. Verify storage policies

### Username Not Available

1. Username must be unique
2. Check length (3-20 characters)
3. Only alphanumeric and underscores
4. Case-insensitive matching

### Stats Not Updating

1. Stats are calculated on-demand
2. Check trade confirmations
3. Verify token creation records
4. Clear cache and reload

---

## Support

For issues or questions:
- Check user types in `src/types/user.ts`
- Review database functions in `src/lib/supabase/users.ts`
- Check component implementations
- Review Supabase logs
