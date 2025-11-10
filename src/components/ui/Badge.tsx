'use client';

/**
 * Badge Component
 *
 * A compact component for displaying status, labels, or risk levels.
 * Color-coded variants for different risk levels and states.
 *
 * @example
 * ```tsx
 * <Badge variant="low">Low Risk</Badge>
 * <Badge variant="critical" size="lg">Critical Risk</Badge>
 * <Badge variant="success" dot>Verified</Badge>
 * ```
 */

import React, { forwardRef, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge variants using class-variance-authority
 */
const badgeVariants = cva(
  // Base styles
  'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors',
  {
    variants: {
      variant: {
        // Risk level variants
        low: 'bg-green-500/10 text-green-400 border border-green-500/20',
        medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
        critical: 'bg-red-500/10 text-red-400 border border-red-500/20',

        // Status variants
        success: 'bg-green-500/10 text-green-400 border border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        error: 'bg-red-500/10 text-red-400 border border-red-500/20',
        info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',

        // UI variants
        default: 'bg-gray-700/50 text-gray-300 border border-gray-600/50',
        primary: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
        secondary: 'bg-purple-600/20 text-purple-400 border border-purple-500/30',
        outline: 'bg-transparent text-gray-400 border border-gray-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Show a dot indicator */
  dot?: boolean;
  /** Icon to display before text */
  icon?: React.ReactNode;
}

/**
 * Badge Component
 *
 * Displays status indicators, labels, or risk levels
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant,
      size,
      dot = false,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    // Dot color based on variant
    const getDotColor = () => {
      switch (variant) {
        case 'low':
        case 'success':
          return 'bg-green-400';
        case 'medium':
        case 'warning':
          return 'bg-yellow-400';
        case 'high':
          return 'bg-orange-400';
        case 'critical':
        case 'error':
          return 'bg-red-400';
        case 'info':
          return 'bg-blue-400';
        case 'primary':
          return 'bg-blue-400';
        case 'secondary':
          return 'bg-purple-400';
        default:
          return 'bg-gray-400';
      }
    };

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {/* Dot Indicator */}
        {dot && (
          <span
            className={cn('w-1.5 h-1.5 rounded-full', getDotColor())}
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        {icon && <span className="inline-flex">{icon}</span>}

        {/* Badge Text */}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Risk Badge - Specialized badge for risk levels
 */
export interface RiskBadgeProps extends Omit<BadgeProps, 'variant'> {
  /** Risk level */
  level: 'low' | 'medium' | 'high' | 'critical';
  /** Show risk score */
  score?: number;
}

export const RiskBadge = forwardRef<HTMLSpanElement, RiskBadgeProps>(
  ({ level, score, dot = true, ...props }, ref) => {
    const labels = {
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk',
      critical: 'Critical Risk',
    };

    return (
      <Badge
        ref={ref}
        variant={level}
        dot={dot}
        {...props}
      >
        {labels[level]}
        {score !== undefined && ` (${score})`}
      </Badge>
    );
  }
);

RiskBadge.displayName = 'RiskBadge';

/**
 * Status Badge - Specialized badge for status indicators
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  /** Status type */
  status: 'success' | 'warning' | 'error' | 'info';
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, dot = true, children, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant={status}
        dot={dot}
        {...props}
      >
        {children}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export default Badge;
