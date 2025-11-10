# Configuration

This directory contains application configuration files.

## Purpose

- Environment variables
- Feature flags
- API endpoints
- Application constants

## Files

### env.ts

Centralized environment variable access with type safety and validation.

**Usage:**
```typescript
import { env } from '@/config/env';

// Access environment variables
const supabaseUrl = env.supabase.url;
const solanaNetwork = env.solana.network;

// Use helper functions
import { isDevelopment, getExplorerUrl } from '@/config/env';

if (isDevelopment) {
  console.log('Running in development mode');
}

const explorerLink = getExplorerUrl('transaction-signature', 'tx');
```

**Features:**
- Type-safe environment variable access
- Automatic validation of required variables
- Helper functions for common checks
- Network-specific URLs (Explorer, Solscan)

### constants.ts (example)

Application-wide constants.

```typescript
// src/config/constants.ts
export const THEME_COLORS = {
  thunderBlue: '#0066FF',
  lightningYellow: '#FFD700',
  thunderPurple: '#8B5CF6',
  safetyGreen: '#10B981',
  warningOrange: '#F59E0B',
  dangerRed: '#EF4444',
} as const;

export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const SYSTEM_PROGRAM_ID = '11111111111111111111111111111111';
```

## Best Practices

1. **Always use `env.ts`** for accessing environment variables
2. **Don't access `process.env` directly** in application code
3. **Add validation** for new required environment variables
4. **Use TypeScript** for type safety
5. **Document** new configuration options

## See Also

- [ENVIRONMENT.md](../../ENVIRONMENT.md) - Environment variables setup guide
- [.env.local.example](../../.env.local.example) - Example environment file
