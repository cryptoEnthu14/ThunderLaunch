'use client';

/**
 * Container Component
 *
 * A responsive container component that centers content and applies
 * consistent max-width and padding across the application.
 *
 * @example
 * ```tsx
 * <Container>
 *   <h1>Page Content</h1>
 * </Container>
 *
 * <Container size="sm">
 *   <p>Narrow content</p>
 * </Container>
 * ```
 */

import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Container size (max-width) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Remove horizontal padding */
  noPadding?: boolean;
  /** Center content vertically */
  centerY?: boolean;
}

/**
 * Container Component
 *
 * Centers content with responsive padding and configurable max-width
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      className,
      size = 'xl',
      noPadding = false,
      centerY = false,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          sizeStyles[size],
          !noPadding && 'px-4 sm:px-6 lg:px-8',
          centerY && 'flex items-center min-h-screen',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;
