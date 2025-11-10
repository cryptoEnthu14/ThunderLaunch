# ThunderLaunch

Thunder Launch Platform for multi chain token launch

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom theme colors
- **ESLint** for code quality
- Organized folder structure for scalability

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable React components
├── lib/          # Utility functions and helpers
├── hooks/        # Custom React hooks
├── types/        # TypeScript type definitions
└── config/       # Application configuration
```

## Custom Theme Colors

The project includes a custom color palette:

- **Thunder Blue**: `#0066FF` - Primary brand color
- **Lightning Yellow**: `#FFD700` - Accent color
- **Thunder Purple**: `#8B5CF6` - Secondary accent
- **Safety Green**: `#10B981` - Success states
- **Warning Orange**: `#F59E0B` - Warning states
- **Danger Red**: `#EF4444` - Error states

Usage in Tailwind:
```tsx
<div className="text-thunder-blue bg-lightning-yellow border-thunder-purple">
  Styled with custom colors
</div>
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your configuration:
- Supabase credentials (get from [Supabase Dashboard](https://app.supabase.com))
- Solana RPC endpoint
- Other configuration values

See [ENVIRONMENT.md](./ENVIRONMENT.md) for detailed setup instructions.

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Dependencies

This project uses a comprehensive stack for building a multi-chain token launch platform:

- **Solana Integration**: Full wallet adapter support with Phantom & Solflare
- **Database**: Supabase for PostgreSQL, authentication, and real-time updates
- **UI Components**: Radix UI primitives for accessible, customizable components
- **Forms**: React Hook Form + Zod for performant, type-safe form handling
- **Charts**: Recharts for data visualization
- **Utilities**: Axios, date-fns, cryptographic libraries

For detailed documentation about each dependency and usage examples, see [DEPENDENCIES.md](./DEPENDENCIES.md).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Solana Documentation](https://docs.solana.com)
- [Supabase Documentation](https://supabase.com/docs)