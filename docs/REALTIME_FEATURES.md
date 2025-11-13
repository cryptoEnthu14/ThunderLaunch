# Real-Time Features Documentation

This document describes the real-time data update features implemented in ThunderLaunch using Supabase real-time subscriptions.

## Overview

ThunderLaunch now supports real-time updates for:
- Token price changes
- New token launches
- Trade events and confirmations
- Live activity feed
- Automatic data refresh with smooth animations

## Components & Hooks

### 1. useRealtimeTokens Hook

**Location:** `src/hooks/useRealtimeTokens.ts`

Custom hook to subscribe to real-time token updates from Supabase.

#### Features:
- Subscribe to token price changes
- Listen for new token launches
- Auto-update token data
- Handle reconnection gracefully
- Automatic cleanup on unmount

#### Usage Example:
```tsx
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';

function MyComponent() {
  const { newTokens, updatedTokens, isConnected } = useRealtimeTokens({
    maxUpdates: 50,
    onNewToken: (token) => {
      toast.success(`New token launched: ${token.name}`);
    },
    onTokenUpdate: (token) => {
      console.log('Token updated:', token);
    },
  });

  return (
    <div>
      {isConnected && <span>🟢 Live</span>}
      <h2>New Tokens: {newTokens.length}</h2>
    </div>
  );
}
```

#### Options:
- `maxUpdates` - Maximum number of updates to keep in memory (default: 100)
- `chain` - Filter by blockchain (solana, base, bnb)
- `status` - Filter by token status (default: 'active')
- `autoReconnect` - Enable auto-reconnection (default: true)
- `reconnectInterval` - Reconnection interval in ms (default: 5000)
- `onNewToken` - Callback when new token is created
- `onTokenUpdate` - Callback when token is updated
- `onTokenDelete` - Callback when token is deleted
- `onConnectionChange` - Callback when connection status changes

---

### 2. useRealtimeTrades Hook

**Location:** `src/hooks/useRealtimeTrades.ts`

Custom hook to subscribe to real-time trade events from Supabase.

#### Features:
- Subscribe to trade events
- Update trade history in real-time
- Update token metrics based on trades
- Show browser notifications for trades
- Handle reconnection gracefully

#### Usage Example:
```tsx
import { useRealtimeTrades } from '@/hooks/useRealtimeTrades';

function TradingComponent() {
  const { recentTrades, metrics, isConnected } = useRealtimeTrades({
    tokenId: 'abc-123',
    enableNotifications: true,
    onTradeConfirmed: (trade) => {
      toast.success(`Trade confirmed: $${trade.usd_amount}`);
    },
  });

  return (
    <div>
      <p>Total Volume: ${metrics.totalVolume}</p>
      <p>Recent Trades: {recentTrades.length}</p>
    </div>
  );
}
```

#### Options:
- `tokenId` - Filter by token ID
- `walletAddress` - Filter by wallet address
- `tradeType` - Filter by trade type (buy/sell)
- `maxUpdates` - Maximum number of updates (default: 100)
- `maxRecentTrades` - Maximum recent trades (default: 50)
- `enableNotifications` - Enable browser notifications (default: false)
- `autoReconnect` - Enable auto-reconnection (default: true)
- `onNewTrade` - Callback when new trade is created
- `onTradeUpdate` - Callback when trade status changes
- `onTradeConfirmed` - Callback when trade is confirmed
- `onTradeFailed` - Callback when trade fails

#### Trade Metrics:
- `totalTrades` - Total number of trades
- `totalBuys` - Total buy trades
- `totalSells` - Total sell trades
- `totalVolume` - Total volume in USD
- `last24hVolume` - Volume in last 24 hours
- `last24hTrades` - Trades in last 24 hours

---

### 3. LiveFeed Component

**Location:** `src/components/token/LiveFeed.tsx`

Displays live token activity feed with real-time updates.

#### Features:
- Real-time token launches
- Recent trade activity
- Animated entry transitions
- Auto-scroll or manual control
- Filter by activity type
- Connection status indicator
- Pause/resume functionality

#### Usage Example:
```tsx
import { LiveFeed } from '@/components/token/LiveFeed';

function DashboardPage() {
  return (
    <LiveFeed
      activityType="all"
      maxItems={50}
      autoScroll={true}
      showControls={true}
      height="600px"
      onTokenClick={(token) => router.push(`/token/${token.mint_address}`)}
      onTradeClick={(trade) => console.log('Trade clicked:', trade)}
    />
  );
}
```

#### Props:
- `activityType` - Filter by type: 'all' | 'launches' | 'trades' (default: 'all')
- `maxItems` - Maximum items to display (default: 50)
- `autoScroll` - Enable auto-scroll (default: true)
- `showControls` - Show pause/auto-scroll controls (default: true)
- `height` - Height of feed container (default: '600px')
- `onTokenClick` - Callback when token is clicked
- `onTradeClick` - Callback when trade is clicked

---

### 4. TradingPanel Updates

**Location:** `src/components/token/TradingPanel.tsx`

The TradingPanel now includes real-time price updates:

#### New Features:
- Live price indicator (WiFi icon)
- Real-time price change detection
- 24h price change percentage
- Connection status display
- Animated price updates (blue highlight)

#### Visual Indicators:
- 🟢 Green WiFi icon - Connected to live prices
- ⚪ Gray WiFi icon - Disconnected
- 💙 Blue text - Price just updated
- Percentage badges show 24h changes

---

### 5. TokenCard Updates

**Location:** `src/components/token/TokenCard.tsx`

The TokenCard now includes real-time metrics updates:

#### New Features:
- Live price updates
- Live market cap updates
- Live volume updates
- Visual update indicators
- Connection status badge

#### Visual Indicators:
- 🟢 Small WiFi icon - Live data indicator
- 💙 Blue highlight - Data just updated (2s duration)
- Smooth transitions between values

---

## Real-Time Architecture

### Supabase Integration

The real-time features use Supabase's built-in PostgreSQL change data capture (CDC) functionality:

1. **Subscription Setup**
   ```typescript
   const subscription = subscribeToTable('tokens', handleChange, 'status=eq.active');
   subscription.subscribe();
   ```

2. **Event Types**
   - `INSERT` - New record created
   - `UPDATE` - Record modified
   - `DELETE` - Record removed

3. **Connection Management**
   - Auto-reconnect on disconnect
   - Exponential backoff
   - Connection status tracking
   - Graceful cleanup on unmount

### Performance Considerations

1. **Memory Management**
   - Limited update history (configurable via `maxUpdates`)
   - Automatic cleanup of old entries
   - Efficient state updates using React hooks

2. **Network Efficiency**
   - Single WebSocket connection per subscription
   - Filtered subscriptions reduce data transfer
   - Automatic reconnection with backoff

3. **User Experience**
   - Smooth animations (CSS transitions)
   - Non-blocking updates
   - Optional notifications
   - Pause/resume controls

---

## Browser Notifications

### Setup

1. **Request Permission**
   ```typescript
   if ('Notification' in window) {
     await Notification.requestPermission();
   }
   ```

2. **Enable in Hook**
   ```typescript
   useRealtimeTrades({
     enableNotifications: true,
   });
   ```

### Notification Types

- 🔔 **New Trade** - When trade is created
- ✅ **Trade Confirmed** - When trade is confirmed on-chain
- ❌ **Trade Failed** - When trade fails

---

## Reconnection Handling

All real-time hooks implement graceful reconnection:

1. **Automatic Detection**
   - Monitors WebSocket connection
   - Detects disconnections
   - Tracks connection status

2. **Reconnection Strategy**
   - Auto-reconnect enabled by default
   - Configurable interval (default: 5 seconds)
   - Exponential backoff (future enhancement)

3. **User Feedback**
   - Connection status indicators
   - Visual feedback on reconnection
   - Error state handling

---

## CSS Animations

**Location:** `src/app/globals.css`

### Fade In Down Animation
```css
@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Used for:
- Live feed item entries
- New token appearances
- Trade activity items

---

## Testing

### Manual Testing

1. **Token Updates**
   ```sql
   -- In Supabase SQL Editor
   UPDATE tokens
   SET current_price = current_price * 1.1
   WHERE id = 'your-token-id';
   ```

2. **New Token**
   ```sql
   INSERT INTO tokens (name, symbol, current_price, ...)
   VALUES ('Test Token', 'TEST', 0.01, ...);
   ```

3. **Trade Events**
   ```sql
   INSERT INTO trades (token_id, trade_type, status, ...)
   VALUES ('token-id', 'buy', 'confirmed', ...);
   ```

### Integration Testing

- Test reconnection by temporarily disabling network
- Test notification permissions in different browsers
- Test multiple simultaneous subscriptions
- Test cleanup on component unmount

---

## Troubleshooting

### Connection Issues

1. **Check Supabase Configuration**
   - Verify `NEXT_PUBLIC_SUPABASE_URL`
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check Supabase dashboard for service status

2. **Enable Realtime in Supabase**
   - Go to Database → Replication
   - Enable replication for `tokens` and `trades` tables
   - Check publication settings

3. **Browser Console**
   - Check for WebSocket errors
   - Verify subscription confirmations
   - Monitor connection state changes

### No Updates Appearing

1. **Check Filters**
   - Verify filter syntax matches Supabase PostgREST format
   - Example: `status=eq.active` or `chain=eq.solana`

2. **Check RLS Policies**
   - Ensure Row Level Security allows SELECT
   - Check policies for public access if using anon key

3. **Verify Data Changes**
   - Ensure changes are actually happening in database
   - Check that event types match expectations

---

## Future Enhancements

1. **Performance**
   - Implement virtual scrolling for large feeds
   - Add pagination for trade history
   - Optimize re-render performance

2. **Features**
   - Price alerts
   - Custom notification sounds
   - Export feed data
   - Feed filters and search

3. **Reliability**
   - Exponential backoff for reconnections
   - Offline queue for updates
   - Sync on reconnect
   - Health check endpoints

---

## API Reference

### useRealtimeTokens Return Value

```typescript
interface RealtimeTokensState {
  updates: TokenUpdate[];          // All updates
  newTokens: Token[];              // New token launches
  updatedTokens: Token[];          // Updated tokens
  isConnected: boolean;            // Connection status
  isLoading: boolean;              // Loading state
  error: Error | null;             // Error state
  clearUpdates: () => void;        // Clear all updates
  reconnect: () => void;           // Manual reconnect
}
```

### useRealtimeTrades Return Value

```typescript
interface RealtimeTradesState {
  updates: TradeUpdate[];          // All updates
  recentTrades: Trade[];           // Recent confirmed trades
  pendingTrades: Trade[];          // Pending trades
  metrics: TradeMetrics;           // Trade metrics
  isConnected: boolean;            // Connection status
  isLoading: boolean;              // Loading state
  error: Error | null;             // Error state
  clearUpdates: () => void;        // Clear all updates
  reconnect: () => void;           // Manual reconnect
}
```

---

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs/guides/realtime
- Review TypeScript types in hook files
- Check browser console for errors
- Verify database permissions and RLS policies
