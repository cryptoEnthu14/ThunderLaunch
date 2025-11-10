'use client';

/**
 * Card Component
 *
 * A flexible container component with optional header and footer sections.
 * Perfect for grouping related content with consistent styling.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <h2>Card Title</h2>
 *   </CardHeader>
 *   <CardBody>
 *     Card content goes here
 *   </CardBody>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */

import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Apply hover effect */
  hoverable?: boolean;
  /** Apply clickable cursor */
  clickable?: boolean;
  /** Card variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
}

/**
 * Card Component
 *
 * Main card container with shadow and border
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      hoverable = false,
      clickable = false,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'bg-gray-800 border border-gray-700',
      elevated: 'bg-gray-800 border border-gray-700 shadow-xl',
      outlined: 'bg-transparent border-2 border-gray-700',
      ghost: 'bg-gray-900/50 border border-gray-800',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg overflow-hidden transition-all duration-200',
          variantStyles[variant],
          hoverable && 'hover:shadow-2xl hover:border-gray-600',
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Add bottom border */
  bordered?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, bordered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4',
          bordered && 'border-b border-gray-700',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Body Component
 */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Remove default padding */
  noPadding?: boolean;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, noPadding = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(!noPadding && 'px-6 py-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

/**
 * Card Footer Component
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Add top border */
  bordered?: boolean;
  /** Align content */
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  (
    { children, className, bordered = false, align = 'right', ...props },
    ref
  ) => {
    const alignStyles = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4 flex items-center gap-3',
          bordered && 'border-t border-gray-700',
          alignStyles[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

/**
 * Card Title Component
 */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Title size */
  size?: 'sm' | 'md' | 'lg';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, size = 'md', ...props }, ref) => {
    const sizeStyles = {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
    };

    return (
      <h3
        ref={ref}
        className={cn(
          'font-semibold text-white',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

/**
 * Card Description Component
 */
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-gray-400 mt-1', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export default Card;
