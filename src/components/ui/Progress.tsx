'use client';

/**
 * Progress Component
 *
 * A simple progress bar component for displaying completion percentage.
 *
 * @example
 * ```tsx
 * <Progress value={75} className="h-2" />
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  /** Progress value (0-100) */
  value: number;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the indicator */
  indicatorClassName?: string;
}

/**
 * Progress Component
 */
export function Progress({ value, className, indicatorClassName }: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn('w-full bg-gray-700 rounded-full overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full bg-accent-purple transition-all duration-300 ease-out',
          indicatorClassName
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

export default Progress;
