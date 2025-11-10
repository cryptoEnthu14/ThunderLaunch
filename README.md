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

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)