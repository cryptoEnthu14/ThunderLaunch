# Libraries

This directory contains utility functions and helper modules.

## Purpose

- Utility functions
- API clients
- Data transformation helpers
- Common business logic

## Example

```typescript
// src/lib/utils.ts
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
```
