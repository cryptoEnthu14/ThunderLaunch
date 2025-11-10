# ThunderLaunch Dependencies Documentation

This document provides a comprehensive overview of all dependencies used in the ThunderLaunch project, organized by category.

## Core Framework

### Next.js & React
- **next** (^14.2.33) - React framework for production with App Router, server-side rendering, and static site generation
- **react** (^18.3.1) - JavaScript library for building user interfaces
- **react-dom** (^18.3.1) - DOM-specific methods for React

## Solana Integration

### Core Solana Libraries
- **@solana/web3.js** (^1.95.8)
  - Core Solana JavaScript SDK
  - Provides APIs for interacting with Solana blockchain
  - Used for: transactions, account management, RPC calls, and blockchain queries

- **@solana/spl-token** (^0.4.9)
  - Solana Program Library (SPL) Token program
  - Used for: creating tokens, minting, burning, and transferring SPL tokens
  - Essential for token launch functionality

### Wallet Adapters
- **@solana/wallet-adapter-base** (^0.9.23)
  - Base wallet adapter interface and utilities
  - Foundation for all wallet adapter implementations

- **@solana/wallet-adapter-react** (^0.15.35)
  - React hooks and context providers for wallet adapters
  - Provides: `useWallet`, `useConnection`, `WalletProvider`
  - Simplifies wallet integration in React components

- **@solana/wallet-adapter-react-ui** (^0.9.35)
  - Pre-built React UI components for wallet connection
  - Provides ready-to-use wallet modal and buttons
  - Includes default styling

- **@solana/wallet-adapter-wallets** (^0.19.32)
  - Collection of wallet adapter implementations
  - Supports multiple Solana wallets out of the box

- **@solana/wallet-adapter-phantom** (^0.9.24)
  - Specific adapter for Phantom wallet
  - Most popular Solana wallet extension
  - Provides optimized Phantom wallet integration

- **@solana/wallet-adapter-solflare** (^0.6.28)
  - Specific adapter for Solflare wallet
  - Popular alternative Solana wallet
  - Supports both extension and web wallet

## Database & Backend

### Supabase
- **@supabase/supabase-js** (^2.45.7)
  - Official Supabase JavaScript client
  - Provides: authentication, database (PostgreSQL), real-time subscriptions, storage
  - Used for: storing launch data, user profiles, token metadata
  - Features: Row Level Security (RLS), real-time updates, file storage

## UI Components

### Radix UI Primitives
High-quality, accessible, unstyled UI primitives for building design systems.

- **@radix-ui/react-dialog** (^1.1.2)
  - Accessible modal dialog component
  - Used for: confirmation modals, forms, token creation dialogs
  - Features: focus management, keyboard navigation, ARIA attributes

- **@radix-ui/react-dropdown-menu** (^2.1.2)
  - Accessible dropdown menu component
  - Used for: navigation menus, action menus, user settings
  - Features: keyboard navigation, nested menus, custom triggers

- **@radix-ui/react-tabs** (^1.1.1)
  - Accessible tabs component
  - Used for: organizing content, multi-step forms, dashboard views
  - Features: keyboard navigation, controlled/uncontrolled modes

- **@radix-ui/react-toast** (^1.2.2)
  - Accessible notification component
  - Used for: success/error messages, transaction notifications
  - Features: auto-dismiss, swipe to dismiss, screen reader support

### Icons & Styling Utilities
- **lucide-react** (^0.462.0)
  - Beautiful & consistent icon library
  - Tree-shakeable, modern icons
  - Used for: UI icons, navigation, status indicators
  - 1000+ open-source icons

- **class-variance-authority** (^0.7.1)
  - CVA - Utility for creating component variants
  - Type-safe component styling
  - Used for: button variants, component themes
  - Example: primary/secondary/danger button styles

- **clsx** (^2.1.1)
  - Tiny utility for constructing className strings conditionally
  - Used for: dynamic class names based on state
  - Performance optimized

- **tailwind-merge** (^2.5.5)
  - Utility to merge Tailwind CSS classes without conflicts
  - Automatically resolves class conflicts
  - Used with: cn() utility function
  - Example: merges `p-4 p-2` → `p-2` (last wins)

## Forms & Validation

### React Hook Form
- **react-hook-form** (^7.54.0)
  - Performant form library with easy validation
  - Features: minimal re-renders, built-in validation, dev tools
  - Used for: token creation forms, user settings, launch parameters
  - Uncontrolled components for better performance

### Validation
- **zod** (^3.23.8)
  - TypeScript-first schema validation library
  - Type-safe validation with automatic type inference
  - Used for: form validation, API request/response validation
  - Features: composable schemas, custom error messages

- **@hookform/resolvers** (^3.9.1)
  - Official resolvers for react-hook-form
  - Integrates Zod with react-hook-form
  - Provides validation resolver for Zod schemas

## Data Visualization

### Charts
- **recharts** (^2.14.1)
  - React charting library built on D3
  - Used for: token price charts, volume graphs, analytics
  - Features: responsive, composable, customizable
  - Chart types: line, bar, area, pie, candlestick

## Utilities

### HTTP Client
- **axios** (^1.7.9)
  - Promise-based HTTP client
  - Used for: API requests, external data fetching
  - Features: interceptors, request/response transformation, automatic JSON
  - Better error handling than native fetch

### Date Handling
- **date-fns** (^4.1.0)
  - Modern JavaScript date utility library
  - Used for: date formatting, calculations, timezone handling
  - Features: immutable, tree-shakeable, TypeScript support
  - Functions: format, parse, add, subtract, compare dates

### Cryptography
- **bs58** (^6.0.0)
  - Base58 encoding/decoding
  - Used for: Solana address encoding/decoding
  - Essential for handling Solana public keys and addresses
  - Bitcoin-style base58 encoding

- **tweetnacl** (^1.0.3)
  - Cryptographic library for encryption and signing
  - Used for: message signing, encryption, key generation
  - Features: Ed25519 signatures, Curve25519 encryption
  - High-performance, audited implementation

## Development Dependencies

### TypeScript
- **typescript** (^5)
  - TypeScript language compiler
  - Provides static typing for JavaScript
  - Essential for type safety and better developer experience

### Type Definitions
- **@types/node** (^20)
  - TypeScript definitions for Node.js
  - Enables TypeScript support for Node.js APIs

- **@types/react** (^18)
  - TypeScript definitions for React
  - Type support for React components, hooks, and APIs

- **@types/react-dom** (^18)
  - TypeScript definitions for React DOM
  - Type support for ReactDOM methods

- **@types/bs58** (^4.0.4)
  - TypeScript definitions for bs58 library
  - Type-safe base58 encoding/decoding

### Code Quality
- **eslint** (^8)
  - JavaScript/TypeScript linter
  - Identifies and reports code patterns
  - Enforces code style and best practices

- **eslint-config-next** (^14.2.33)
  - ESLint configuration for Next.js
  - Includes React, TypeScript, and Next.js specific rules
  - Optimized for Next.js best practices

### Styling
- **tailwindcss** (^3.4.1)
  - Utility-first CSS framework
  - Used for all styling in the project
  - Features: JIT compilation, custom theme, responsive design

- **postcss** (^8)
  - CSS transformation tool
  - Required by Tailwind CSS
  - Processes CSS files

- **autoprefixer** (^10.4.20)
  - PostCSS plugin to parse CSS and add vendor prefixes
  - Ensures CSS compatibility across browsers
  - Works with Tailwind CSS

## Package Management Strategy

### Version Pinning
- All packages use caret (^) version ranges
- Allows minor and patch updates automatically
- Prevents breaking changes from major updates

### Security
- Regular `npm audit` checks recommended
- Update dependencies quarterly
- Monitor Solana ecosystem updates

### Bundle Size Considerations
- Tree-shakeable libraries preferred (lucide-react, date-fns)
- Use dynamic imports for heavy components
- Radix UI components are composable and lightweight

## Usage Examples

### Wallet Connection
```typescript
import { useWallet } from '@solana/wallet-adapter-react';

function WalletButton() {
  const { connect, disconnect, connected } = useWallet();
  // ... implementation
}
```

### Form Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  tokenName: z.string().min(1).max(32),
  supply: z.number().positive(),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

### Supabase Integration
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

### Styling Utility
```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Maintenance Notes

- **Solana Packages**: Check for updates monthly (fast-moving ecosystem)
- **UI Libraries**: Stable, update quarterly
- **Security**: Run `npm audit` before each deployment
- **TypeScript**: Keep @types packages in sync with main packages
- **Next.js**: Follow Next.js upgrade guides for major versions

## Related Documentation

- [Solana Documentation](https://docs.solana.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI Documentation](https://www.radix-ui.com)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
