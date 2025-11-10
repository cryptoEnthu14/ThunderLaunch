'use client';

/**
 * LoadingSpinner Component
 *
 * Animated loading spinner with different sizes and optional text.
 * Can be used inline or as a full-screen overlay.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" text="Loading..." />
 * <LoadingSpinner size="lg" fullScreen />
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  /** Spinner size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Optional loading text */
  text?: string;
  /** Show as full-screen overlay */
  fullScreen?: boolean;
  /** Custom className */
  className?: string;
  /** Spinner color */
  variant?: 'primary' | 'secondary' | 'white';
}

/**
 * LoadingSpinner Component
 *
 * Displays an animated circular loading spinner
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  className,
  variant = 'primary',
}) => {
  const sizeStyles = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const variantStyles = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-purple-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  const textSizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const spinner = (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center gap-3',
        fullScreen && 'fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text || 'Loading'}
    >
      <div
        className={cn(
          'rounded-full animate-spin',
          sizeStyles[size],
          variantStyles[variant]
        )}
      />
      {text && (
        <p className={cn('text-gray-300 font-medium', textSizeStyles[size])}>
          {text}
        </p>
      )}
    </div>
  );

  return spinner;
};

/**
 * ThunderSpinner Component
 *
 * Custom animated ThunderLaunch-themed spinner
 */
export interface ThunderSpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';
  /** Optional loading text */
  text?: string;
  /** Show as full-screen overlay */
  fullScreen?: boolean;
  /** Custom className */
  className?: string;
}

export const ThunderSpinner: React.FC<ThunderSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  className,
}) => {
  const sizeStyles = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center gap-4',
        fullScreen && 'fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text || 'Loading'}
    >
      {/* Animated Lightning Emoji */}
      <div
        className={cn(
          'animate-pulse',
          sizeStyles[size]
        )}
        style={{
          animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite, bounce 1s ease-in-out infinite',
        }}
      >
        ⚡
      </div>

      {/* Loading Text */}
      {text && (
        <p
          className={cn(
            'text-gray-300 font-medium bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent',
            textSizeStyles[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * Dots Loading Indicator
 *
 * Three animated dots for inline loading states
 */
export interface DotsLoaderProps {
  /** Dot size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const gapStyles = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  };

  return (
    <div
      className={cn('inline-flex items-center', gapStyles[size], className)}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-blue-500 animate-bounce',
            sizeStyles[size]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
