'use client';

/**
 * EmptyState Component
 *
 * Displays empty states for lists, searches, and filters.
 * Includes icon, message, and optional call-to-action button.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<SearchIcon />}
 *   title="No results found"
 *   description="Try adjusting your search"
 *   action={{ label: "Clear filters", onClick: handleClear }}
 * />
 * ```
 */

import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface EmptyStateAction {
  /** Action button label */
  label: string;
  /** Action handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface EmptyStateProps {
  /** Custom icon */
  icon?: React.ReactNode;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Primary action */
  action?: EmptyStateAction;
  /** Secondary action */
  secondaryAction?: EmptyStateAction;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * EmptyState Component
 *
 * Displays empty state with icon, message, and actions
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-lg',
    },
  };

  const styles = sizeStyles[size];

  // Default icon if none provided
  const defaultIcon = (
    <svg
      className={cn(styles.icon, 'text-gray-600')}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.container,
        className
      )}
    >
      {/* Icon */}
      <div className="mb-4">{icon || defaultIcon}</div>

      {/* Title */}
      <h3 className={cn('font-semibold text-white mb-2', styles.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn('text-gray-400 max-w-md mb-6', styles.description)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'outline'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * No Results State
 *
 * Specialized empty state for search results
 */
export interface NoResultsProps {
  /** Search query */
  query?: string;
  /** Clear search handler */
  onClear?: () => void;
  /** Custom className */
  className?: string;
}

export const NoResults: React.FC<NoResultsProps> = ({
  query,
  onClear,
  className,
}) => {
  return (
    <EmptyState
      icon={
        <svg
          className="w-16 h-16 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No results found"
      description={
        query
          ? `No results found for "${query}". Try adjusting your search terms.`
          : 'Try adjusting your search or filter criteria.'
      }
      action={
        onClear
          ? {
              label: 'Clear Search',
              onClick: onClear,
              variant: 'outline',
            }
          : undefined
      }
      className={className}
    />
  );
};

/**
 * No Tokens State
 *
 * Specialized empty state for token lists
 */
export interface NoTokensProps {
  /** Create token handler */
  onCreate?: () => void;
  /** Custom className */
  className?: string;
}

export const NoTokens: React.FC<NoTokensProps> = ({ onCreate, className }) => {
  return (
    <EmptyState
      icon={
        <div className="text-5xl mb-2">⚡</div>
      }
      title="No tokens yet"
      description="Launch your first token on ThunderLaunch and join the ecosystem."
      action={
        onCreate
          ? {
              label: 'Launch Token',
              onClick: onCreate,
              variant: 'primary',
            }
          : undefined
      }
      className={className}
    />
  );
};

/**
 * No Transactions State
 *
 * Specialized empty state for transaction lists
 */
export interface NoTransactionsProps {
  /** Custom className */
  className?: string;
}

export const NoTransactions: React.FC<NoTransactionsProps> = ({
  className,
}) => {
  return (
    <EmptyState
      icon={
        <svg
          className="w-16 h-16 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      }
      title="No transactions"
      description="Your transaction history will appear here once you start trading."
      className={className}
    />
  );
};

/**
 * Connection Required State
 *
 * Specialized empty state for wallet connection
 */
export interface ConnectionRequiredProps {
  /** Connect wallet handler */
  onConnect?: () => void;
  /** Custom className */
  className?: string;
}

export const ConnectionRequired: React.FC<ConnectionRequiredProps> = ({
  onConnect,
  className,
}) => {
  return (
    <EmptyState
      icon={
        <svg
          className="w-16 h-16 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      }
      title="Wallet not connected"
      description="Connect your wallet to view your tokens and start trading."
      action={
        onConnect
          ? {
              label: 'Connect Wallet',
              onClick: onConnect,
              variant: 'primary',
            }
          : undefined
      }
      className={className}
    />
  );
};

export default EmptyState;
