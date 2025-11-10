# Components

This directory contains reusable React components.

## Structure

- Create component files using PascalCase (e.g., `Button.tsx`, `Navigation.tsx`)
- Group related components in subdirectories when needed
- Export components from index files for cleaner imports

## Example

```tsx
// src/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-thunder-blue text-white rounded">
      {children}
    </button>
  );
}
```
