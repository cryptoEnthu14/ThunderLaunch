# Hooks

This directory contains custom React hooks.

## Structure

- Name hooks with `use` prefix (e.g., `useAuth.ts`, `useLocalStorage.ts`)
- Keep hooks focused on a single responsibility
- Document hook parameters and return values

## Example

```typescript
// src/hooks/useToggle.ts
import { useState } from 'react';

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(v => !v);
  return [value, toggle] as const;
}
```
