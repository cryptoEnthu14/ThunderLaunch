# Configuration

This directory contains application configuration files.

## Purpose

- Environment variables
- Feature flags
- API endpoints
- Application constants

## Example

```typescript
// src/config/constants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const THEME_COLORS = {
  thunderBlue: '#0066FF',
  lightningYellow: '#FFD700',
  thunderPurple: '#8B5CF6',
  safetyGreen: '#10B981',
  warningOrange: '#F59E0B',
  dangerRed: '#EF4444',
} as const;
```
