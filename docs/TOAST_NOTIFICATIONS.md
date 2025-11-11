# Toast Notification System

This document describes the toast notification system implemented in ThunderLaunch using Radix UI Toast.

## Overview

ThunderLaunch includes a comprehensive toast notification system with:
- Multiple variants (success, error, warning, info)
- Auto-dismiss after configurable delay
- Queue multiple toasts
- Click to dismiss
- Swipe to dismiss on mobile
- User preferences management
- Promise-based loading states

## Components

### Toast Component

**Location:** `src/components/ui/Toast.tsx`

The base toast component built with Radix UI primitives.

```tsx
import { Toast } from '@/components/ui/Toast';

<Toast
  variant="success"
  title="Success!"
  description="Your action completed successfully"
  action={{
    label: 'View',
    onClick: () => router.push('/details')
  }}
/>
```

#### Variants

- `success` - Green toast with checkmark icon
- `error` - Red toast with X icon
- `warning` - Yellow toast with warning icon
- `info` - Blue toast with info icon
- `default` - Gray toast with info icon

### Toaster Component

**Location:** `src/components/ui/Toaster.tsx`

Renders all active toasts from the toast manager. Already integrated in the app layout.

```tsx
import { Toaster } from '@/components/ui/Toaster';

// In layout.tsx
<body>
  {children}
  <Toaster />
</body>
```

## Toast Helper Functions

**Location:** `src/lib/notifications/toast.ts`

### Basic Usage

```tsx
import { toast } from '@/lib/notifications/toast';

// Success toast
toast.success('Token created!');

// Error toast
toast.error('Transaction failed');

// Warning toast
toast.warning('High risk detected');

// Info toast
toast.info('New feature available');
```

### With Description

```tsx
toast.success(
  'Trade successful!',
  'Received 1,000 THDR tokens'
);

toast.error(
  'Transaction failed',
  'Insufficient SOL balance'
);
```

### With Action Button

```tsx
toast.info(
  'Update available',
  'Click to learn more',
  {
    action: {
      label: 'View',
      onClick: () => router.push('/updates')
    }
  }
);
```

### Custom Duration

```tsx
// Show for 2 seconds
toast.success('Saved!', undefined, { duration: 2000 });

// Show indefinitely
toast.info('Important message', undefined, { duration: Infinity });
```

### Loading States

```tsx
// Show loading toast
const loadingId = toast.loading('Processing...', 'Please wait');

// Later, dismiss it
toast.dismiss(loadingId);

// Or update it to success
toast.update(loadingId, {
  variant: 'success',
  title: 'Complete!',
  duration: 3000
});
```

### Promise-based Toasts

```tsx
await toast.promise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data'
  }
);

// With dynamic messages
await toast.promise(
  createToken(data),
  {
    loading: 'Creating token...',
    success: (token) => `Created ${token.name}!`,
    error: (error) => `Failed: ${error.message}`
  }
);
```

## useNotifications Hook

**Location:** `src/hooks/useNotifications.ts`

Manage notification preferences and control display.

### Basic Usage

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function SettingsPage() {
  const {
    preferences,
    updatePreferences,
    canShowNotification,
    enableBrowserNotifications
  } = useNotifications();

  return (
    <div>
      <button onClick={() => enableBrowserNotifications()}>
        Enable Browser Notifications
      </button>

      <label>
        <input
          type="checkbox"
          checked={preferences.tradeNotifications}
          onChange={() => updatePreferences({
            tradeNotifications: !preferences.tradeNotifications
          })}
        />
        Trade Notifications
      </label>
    </div>
  );
}
```

### Check Before Showing

```tsx
function TradeComponent() {
  const { canShowNotification } = useNotifications();

  const handleTrade = () => {
    // Only show if enabled in preferences
    if (canShowNotification('trade')) {
      toast.success('Trade confirmed!');
    }
  };
}
```

### Notification Types

- `trade` - Trade-related notifications
- `token` - Token launch notifications
- `security` - Security alert notifications
- `system` - System notifications
- `price` - Price alert notifications
- `all` - General notifications

### Preferences

```typescript
interface NotificationPreferences {
  enabled: boolean;                    // Master switch
  tradeNotifications: boolean;         // Trade updates
  tokenNotifications: boolean;         // New tokens
  securityNotifications: boolean;      // Security alerts
  systemNotifications: boolean;        // System messages
  priceNotifications: boolean;         // Price changes
  browserNotifications: boolean;       // Browser notifications
  toastNotifications: boolean;         // Toast popups
  soundEnabled: boolean;               // Notification sounds
}
```

## Integration Examples

### Trading Panel

```tsx
import { toast } from '@/lib/notifications/toast';

const handleTrade = async () => {
  const loadingId = toast.loading(
    'Processing trade...',
    'Please wait while your transaction is being processed'
  );

  try {
    await executeTrade();

    toast.dismiss(loadingId);
    toast.success(
      'Trade successful!',
      `Received ${amount} ${symbol}`
    );
  } catch (error) {
    toast.dismiss(loadingId);
    toast.error(
      'Transaction failed',
      error.message
    );
  }
};
```

### Token Creation

```tsx
const handleCreateToken = async (data) => {
  await toast.promise(
    createToken(data),
    {
      loading: 'Creating token...',
      success: (token) => `${token.name} created successfully!`,
      error: 'Failed to create token'
    }
  );
};
```

### Security Alerts

```tsx
import { useNotifications } from '@/hooks/useNotifications';

const { canShowNotification } = useNotifications();

const checkSecurity = (token) => {
  if (token.riskLevel === 'critical' && canShowNotification('security')) {
    toast.warning(
      'Critical security risk detected!',
      'This token has multiple security issues',
      {
        action: {
          label: 'View Report',
          onClick: () => openSecurityReport(token)
        },
        duration: 10000 // Show for 10 seconds
      }
    );
  }
};
```

### Real-time Updates

```tsx
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';

useRealtimeTokens({
  onNewToken: (token) => {
    if (canShowNotification('token')) {
      toast.info(
        'New token launched!',
        `${token.name} (${token.symbol})`,
        {
          action: {
            label: 'View',
            onClick: () => router.push(`/token/${token.mint_address}`)
          }
        }
      );
    }
  }
});
```

## Styling

Toasts use the same design system as the rest of the app:
- Dark theme with gray background
- Color-coded variants (green/red/yellow/blue)
- Smooth animations
- Responsive design
- Mobile swipe gestures

### Custom Styling

```tsx
<Toast
  className="custom-class"
  variant="success"
  title="Custom styled toast"
/>
```

## Browser Notifications

Enable browser notifications for important alerts:

```tsx
const { enableBrowserNotifications, showBrowserNotification } = useNotifications();

// Request permission
const granted = await enableBrowserNotifications();

if (granted) {
  // Show browser notification
  showBrowserNotification('Trade Confirmed', {
    body: 'Your trade was executed successfully',
    icon: '/icon.png',
    badge: '/badge.png'
  });
}
```

## Best Practices

### 1. Use Appropriate Variants

```tsx
// ✅ Good
toast.success('Token created!');
toast.error('Transaction failed');
toast.warning('High risk detected');
toast.info('New feature available');

// ❌ Avoid
toast.info('Token created!');  // Should be success
toast.success('Transaction failed');  // Should be error
```

### 2. Keep Messages Concise

```tsx
// ✅ Good
toast.success('Trade complete!', 'Received 1,000 THDR');

// ❌ Too verbose
toast.success(
  'Your trade has been successfully completed',
  'You have received 1,000 THDR tokens in your wallet'
);
```

### 3. Respect User Preferences

```tsx
// ✅ Good
if (canShowNotification('trade')) {
  toast.success('Trade confirmed!');
}

// ❌ Always showing
toast.success('Trade confirmed!');
```

### 4. Use Loading States for Async Operations

```tsx
// ✅ Good
await toast.promise(
  executeTrade(),
  {
    loading: 'Processing...',
    success: 'Trade complete!',
    error: 'Trade failed'
  }
);

// ❌ No loading feedback
try {
  await executeTrade();
  toast.success('Trade complete!');
} catch {
  toast.error('Trade failed');
}
```

### 5. Provide Actions When Helpful

```tsx
// ✅ Good - actionable
toast.info('New token launched!', undefined, {
  action: {
    label: 'View',
    onClick: () => router.push('/token/abc')
  }
});

// ❌ Missing helpful action
toast.info('New token launched!');
```

## API Reference

### toast.success(title, description?, options?)

Show a success toast.

**Parameters:**
- `title` (string) - Toast title
- `description` (string, optional) - Toast description
- `options` (ToastOptions, optional) - Additional options

**Returns:** `string` - Toast ID

### toast.error(title, description?, options?)

Show an error toast.

### toast.warning(title, description?, options?)

Show a warning toast.

### toast.info(title, description?, options?)

Show an info toast.

### toast.loading(title, description?, options?)

Show a loading toast that doesn't auto-dismiss.

### toast.promise(promise, messages, options?)

Show a toast that updates based on promise state.

**Parameters:**
- `promise` (Promise) - Promise to track
- `messages` (object) - Messages for each state
  - `loading` (string) - Loading message
  - `success` (string | function) - Success message
  - `error` (string | function) - Error message
- `options` (ToastOptions, optional) - Additional options

### toast.dismiss(id)

Dismiss a specific toast.

**Parameters:**
- `id` (string) - Toast ID to dismiss

### toast.dismissAll()

Dismiss all active toasts.

### toast.update(id, updates)

Update an existing toast.

**Parameters:**
- `id` (string) - Toast ID to update
- `updates` (object) - Properties to update

## ToastOptions

```typescript
interface ToastOptions {
  duration?: number;           // Duration in ms (default: 5000)
  action?: {                   // Action button
    label: string;
    onClick: () => void;
  };
  showClose?: boolean;         // Show close button (default: true)
  icon?: React.ReactNode;      // Custom icon
  id?: string;                 // Custom toast ID
}
```

## Troubleshooting

### Toasts Not Appearing

1. **Check Toaster is in layout**
   ```tsx
   // In app/layout.tsx
   import { Toaster } from '@/components/ui/Toaster';

   <body>
     {children}
     <Toaster />
   </body>
   ```

2. **Check user preferences**
   ```tsx
   const { preferences } = useNotifications();
   console.log(preferences.toastNotifications); // Should be true
   ```

3. **Check z-index**
   - Toasts have `z-index: 100`
   - Ensure no elements overlap

### Toasts Not Dismissing

- Check that duration is set (not Infinity)
- Ensure toast.dismiss() is called for loading toasts
- Verify onOpenChange handler is not preventing dismissal

### Performance Issues

- Limit the number of concurrent toasts (max 5-10 recommended)
- Use `toast.dismissAll()` before showing batch notifications
- Consider debouncing frequent notifications

## Future Enhancements

1. **Notification Center**
   - History of past notifications
   - Mark as read
   - Filter by type

2. **Custom Sounds**
   - Per-variant sounds
   - User-uploaded sounds
   - Volume control

3. **Notification Groups**
   - Stack similar notifications
   - Expandable groups
   - Summary view

4. **Advanced Positioning**
   - Choose corner (top-right, bottom-right, etc.)
   - Multiple viewports
   - Custom positioning

## Support

For issues or questions about the toast system:
- Check the code in `src/components/ui/Toast.tsx`
- Review examples in this documentation
- Check Radix UI Toast documentation: https://www.radix-ui.com/docs/primitives/components/toast
