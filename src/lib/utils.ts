import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 *
 * @param inputs - Array of class values to merge
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * cn('px-4 py-2', 'px-6') // Returns: 'py-2 px-6'
 * cn('text-red-500', condition && 'text-blue-500') // Conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
