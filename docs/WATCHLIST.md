# Watchlist Feature

This document describes the watchlist functionality implemented in ThunderLaunch.

## Overview

ThunderLaunch includes a comprehensive watchlist system that allows users to:
- Add/remove tokens from their personal watchlist
- View all watchlisted tokens in one place
- Sort watchlist by various criteria
- Quick access from token cards and detail pages
- Real-time updates with optimistic UI

## Components

### 1. WatchlistButton Component

**Location:** `src/components/token/WatchlistButton.tsx`

A toggle button for adding/removing tokens from the watchlist with heart icon animation.

#### Features
- Heart icon that fills when token is in watchlist
- Animated transitions and hover effects
- Loading state during operations
- Multiple variants (default, icon, compact)
- Multiple sizes (sm, md, lg)
- Optional label text
- Integrated toast notifications
- Wallet connection check

#### Usage
```tsx
import { WatchlistButton } from '@/components/token/WatchlistButton';

// Icon only variant
<WatchlistButton
  tokenId="token-123"
  tokenAddress="So11111..."
  tokenName="Example Token"
  variant="icon"
  size="sm"
/>

// With label
<WatchlistButton
  tokenId="token-123"
  tokenAddress="So11111..."
  tokenName="Example Token"
  variant="default"
  size="md"
  showLabel={true}
/>

// Compact variant
<WatchlistButton
  tokenId="token-123"
  tokenAddress="So11111..."
  tokenName="Example Token"
  variant="compact"
  onWatchlistChange={(isInWatchlist) => {
    console.log('Watchlist state:', isInWatchlist);
  }}
/>
```

#### Props
- `tokenId` (string, required) - Token ID
- `tokenAddress` (string, required) - Token address
- `tokenName` (string, optional) - Token name for display
- `variant` ('default' | 'icon' | 'compact') - Button variant
- `size` ('sm' | 'md' | 'lg') - Button size
- `showLabel` (boolean) - Show label text
- `className` (string) - Custom CSS class
- `onWatchlistChange` (function) - Callback when watchlist state changes

#### Variants
- **default**: Standard button with background and border
- **icon**: Icon-only button with transparent background
- **compact**: Smaller button with compact padding

---

### 2. Watchlist Page

**Location:** `src/app/watchlist/page.tsx`

Dedicated page for displaying user's watchlisted tokens.

#### Features
- Token grid layout with responsive design
- Sort by date added, name, market cap, volume
- Empty state when no tokens
- Wallet connection requirement
- Loading and error states
- Direct links to token details
- Remove buttons on each token card
- Token statistics and price changes

#### Route
```
/watchlist
```

#### Access
Users can navigate to the watchlist page via:
- Direct URL
- Navigation menu (if added)
- Profile page (if integrated)

#### States
1. **Not Connected**: Prompts user to connect wallet
2. **Loading**: Shows loading spinner
3. **Error**: Displays error message with retry button
4. **Empty**: Shows empty state with link to browse tokens
5. **Loaded**: Displays grid of watchlisted tokens

---

## Hooks

### useWatchlist Hook

**Location:** `src/hooks/useWatchlist.ts`

Custom hook for managing user watchlist with optimistic updates.

#### Features
- Auto-load watchlist on mount
- Optimistic UI updates
- Local state management
- Add/remove/toggle operations
- Check if token is in watchlist
- Pagination support
- Sort and filter options
- Toast notifications
- Error handling with rollback

#### Usage
```tsx
import { useWatchlist } from '@/hooks/useWatchlist';
import { useWallet } from '@solana/wallet-adapter-react';

function MyComponent() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const {
    watchlist,
    count,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    reload,
    isLoading,
    error,
  } = useWatchlist(walletAddress, {
    autoLoad: true,
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  return (
    <div>
      <h2>My Watchlist ({count})</h2>
      {watchlist.map((item) => (
        <div key={item.id}>
          {item.token.name}
          <button onClick={() => removeFromWatchlist(item.token_id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### API

**Parameters:**
- `walletAddress` (string | null | undefined) - User's wallet address
- `options` (UseWatchlistOptions) - Configuration options
  - `autoLoad` (boolean) - Auto-load on mount (default: true)
  - `page` (number) - Page number (default: 1)
  - `limit` (number) - Items per page (default: 100)
  - `sortBy` ('created_at' | 'name' | 'market_cap' | 'volume_24h') - Sort field
  - `sortOrder` ('asc' | 'desc') - Sort order (default: 'desc')

**Returns:**
- `watchlist` (WatchlistItemWithToken[]) - Array of watchlist items with token data
- `count` (number) - Total count of watchlist items
- `isInWatchlist` (function) - Check if token is in watchlist
- `addToWatchlist` (function) - Add token to watchlist
- `removeFromWatchlist` (function) - Remove token from watchlist
- `toggleWatchlist` (function) - Toggle token in watchlist
- `reload` (function) - Reload watchlist from database
- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message

---

## Database Functions

**Location:** `src/lib/supabase/watchlist.ts`

### addToWatchlist(walletAddress, tokenId, tokenAddress)

Add token to user's watchlist.

```tsx
const { data, error } = await addToWatchlist(
  walletAddress,
  'token-123',
  'So11111...'
);
```

**Returns:** `QueryResult<WatchlistItem>`

**Checks:**
- Duplicate prevention - returns error if already in watchlist

---

### removeFromWatchlist(walletAddress, tokenId)

Remove token from user's watchlist.

```tsx
const { data, error } = await removeFromWatchlist(
  walletAddress,
  'token-123'
);
```

**Returns:** `QueryResult<boolean>`

---

### isInWatchlist(walletAddress, tokenId)

Check if token is in user's watchlist.

```tsx
const { data: inWatchlist, error } = await isInWatchlist(
  walletAddress,
  'token-123'
);
```

**Returns:** `QueryResult<boolean>`

---

### getWatchlist(walletAddress, options?)

Get user's watchlist with pagination and sorting.

```tsx
const { data, error } = await getWatchlist(walletAddress, {
  page: 1,
  limit: 20,
  sortBy: 'created_at',
  sortOrder: 'desc',
});
```

**Options:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)
- `sortBy` ('created_at' | 'name' | 'market_cap' | 'volume_24h') - Sort field
- `sortOrder` ('asc' | 'desc') - Sort order

**Returns:** `QueryResult<{ items: WatchlistItemWithToken[], total: number }>`

---

### getWatchlistCount(walletAddress)

Get total count of watchlisted tokens for user.

```tsx
const { data: count, error } = await getWatchlistCount(walletAddress);
```

**Returns:** `QueryResult<number>`

---

### toggleWatchlist(walletAddress, tokenId, tokenAddress)

Toggle token in watchlist (add if not present, remove if present).

```tsx
const { data, error } = await toggleWatchlist(
  walletAddress,
  'token-123',
  'So11111...'
);
```

**Returns:** `QueryResult<{ isInWatchlist: boolean }>`

---

## Types

### WatchlistItem

```typescript
interface WatchlistItem {
  id: string;
  user_id: string;
  wallet_address: string;
  token_id: string;
  token_address: string;
  created_at: string;
}
```

### WatchlistItemWithToken

```typescript
interface WatchlistItemWithToken extends WatchlistItem {
  token: Token;
}
```

### QueryResult

```typescript
interface QueryResult<T> {
  data: T | null;
  error: string | null;
}
```

---

## Integration with Other Features

### Token Cards

**Location:** `src/components/token/TokenCard.tsx`

WatchlistButton is integrated into TokenCard component:
- Compact variant: Icon button next to price
- Default variant: Icon button in actions section

```tsx
<TokenCard
  token={tokenData}
  showSecurityBadge={true}
/>
// Automatically includes WatchlistButton
```

---

### Token Details Page

**Location:** `src/app/token/[id]/page.tsx`

WatchlistButton appears in TokenHeader component:
- Positioned between Share and Report buttons
- Shows label text
- Full-size button variant

```tsx
<TokenHeader
  token={tokenData}
  securityCheck={securityCheckData}
/>
// Automatically includes WatchlistButton
```

---

## Usage Examples

### Basic Usage in Custom Component

```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { WatchlistButton } from '@/components/token/WatchlistButton';

function CustomTokenDisplay({ token }) {
  return (
    <div className="token-card">
      <h3>{token.name}</h3>
      <WatchlistButton
        tokenId={token.id}
        tokenAddress={token.mint_address}
        tokenName={token.name}
        variant="icon"
      />
    </div>
  );
}
```

---

### Checking Watchlist Status

```tsx
import { useWatchlist } from '@/hooks/useWatchlist';
import { useWallet } from '@solana/wallet-adapter-react';

function TokenInfo({ token }) {
  const { publicKey } = useWallet();
  const { isInWatchlist } = useWatchlist(publicKey?.toBase58());

  return (
    <div>
      <h3>{token.name}</h3>
      {isInWatchlist(token.id) && (
        <span className="badge">In Watchlist</span>
      )}
    </div>
  );
}
```

---

### Custom Watchlist Display

```tsx
import { useWatchlist } from '@/hooks/useWatchlist';
import { useWallet } from '@solana/wallet-adapter-react';
import { TokenCard } from '@/components/token/TokenCard';

function MyWatchlist() {
  const { publicKey } = useWallet();
  const { watchlist, isLoading, error, removeFromWatchlist } = useWatchlist(
    publicKey?.toBase58()
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="watchlist-grid">
      {watchlist.map((item) => (
        <div key={item.id} className="relative">
          <TokenCard token={item.token} variant="compact" />
          <button
            onClick={() => removeFromWatchlist(item.token_id)}
            className="absolute top-2 right-2"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### Programmatic Toggle

```tsx
import { useWatchlist } from '@/hooks/useWatchlist';
import { useWallet } from '@solana/wallet-adapter-react';

function TokenActions({ token }) {
  const { publicKey } = useWallet();
  const { toggleWatchlist, isInWatchlist } = useWatchlist(
    publicKey?.toBase58()
  );

  const handleToggle = async () => {
    const success = await toggleWatchlist(token.id, token.mint_address);
    if (success) {
      console.log('Watchlist toggled!');
    }
  };

  return (
    <button onClick={handleToggle}>
      {isInWatchlist(token.id) ? 'Remove from' : 'Add to'} Watchlist
    </button>
  );
}
```

---

## Database Schema

### Watchlist Table

```sql
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  wallet_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  token_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, token_id)
);

-- Indexes
CREATE INDEX idx_watchlist_wallet ON watchlist(wallet_address);
CREATE INDEX idx_watchlist_token ON watchlist(token_id);
CREATE INDEX idx_watchlist_created ON watchlist(created_at);
```

---

## Best Practices

### 1. Optimistic Updates

The useWatchlist hook implements optimistic updates:
- UI updates immediately
- Changes rollback on error
- User gets instant feedback

### 2. Toast Notifications

All watchlist operations show toast notifications:
- Success: "Added to watchlist" / "Removed from watchlist"
- Error: Specific error messages
- Info: "Already in watchlist"

### 3. Wallet Connection

Always check wallet connection before operations:
```tsx
if (!walletAddress) {
  toast.error('Connect wallet', 'Please connect your wallet');
  return;
}
```

### 4. Loading States

Show loading indicators during operations:
```tsx
{isLoading && <Loader2 className="animate-spin" />}
```

### 5. Error Handling

Handle errors gracefully:
```tsx
if (error) {
  return (
    <EmptyState
      title="Failed to load watchlist"
      description={error}
      action={<Button onClick={reload}>Try Again</Button>}
    />
  );
}
```

---

## Troubleshooting

### Watchlist Not Loading

1. Check wallet connection
2. Verify Supabase connection
3. Check browser console for errors
4. Verify database table exists

### Button Not Working

1. Check if wallet is connected
2. Verify token ID and address are valid
3. Check browser console for errors
4. Ensure Supabase queries are working

### Duplicate Entries

The database has a unique constraint on `(wallet_address, token_id)`:
- Prevents duplicate entries
- Returns error if duplicate detected
- Error message: "Token is already in watchlist"

### State Not Updating

1. Ensure `autoLoad` is set to true
2. Call `reload()` after external changes
3. Check if optimistic update rollback occurred
4. Verify WebSocket connection for real-time updates (if implemented)

---

## Future Enhancements

1. **Real-time Updates**
   - WebSocket subscriptions for live watchlist changes
   - Sync across multiple devices/tabs
   - Collaborative watchlists

2. **Advanced Features**
   - Watchlist folders/categories
   - Shared watchlists
   - Watchlist notes and tags
   - Price alerts for watchlisted tokens

3. **Analytics**
   - Watchlist performance tracking
   - Historical price data for watchlisted tokens
   - Portfolio value calculations

4. **Export/Import**
   - Export watchlist to CSV/JSON
   - Import watchlist from file
   - Share watchlist via link

5. **Mobile App**
   - Native mobile watchlist support
   - Push notifications for watchlist tokens
   - Offline access

---

## Support

For issues or questions:
- Check database functions in `src/lib/supabase/watchlist.ts`
- Review hook implementation in `src/hooks/useWatchlist.ts`
- Check component code in `src/components/token/WatchlistButton.tsx`
- Review Supabase logs for database errors
