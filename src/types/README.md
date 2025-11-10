# Types

This directory contains TypeScript type definitions and interfaces.

## Structure

- Define shared types and interfaces
- Use PascalCase for type names
- Group related types in the same file

## Example

```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export type UserRole = 'admin' | 'user' | 'guest';
```
