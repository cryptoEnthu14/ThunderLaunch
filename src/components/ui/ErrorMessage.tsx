'use client';

/**
 * ErrorMessage Component
 *
 * Displays error messages with icon, optional retry button, and dismiss functionality.
 * Used for inline errors, form validation, and error boundaries.
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   title="Failed to load data"
 *   message="Unable to connect to the server"
 *   onRetry={handleRetry}
 * />
 * ```
 */

import React, { useState } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ErrorMessageProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Error variant */
  variant?: 'error' | 'warning' | 'info';
  /** Show retry button */
  onRetry?: () => void;
  /** Show dismiss button */
  onDismiss?: () => void;
  /** Custom className */
  className?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * ErrorMessage Component
 *
 * Displays formatted error messages with actions
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  variant = 'error',
  onRetry,
  onDismiss,
  className,
  showIcon = true,
  fullWidth = false,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  const variantStyles = {
    error: {
      container: 'bg-red-900/20 border-red-700 text-red-400',
      icon: 'text-red-400',
      button: 'danger' as const,
    },
    warning: {
      container: 'bg-yellow-900/20 border-yellow-700 text-yellow-400',
      icon: 'text-yellow-400',
      button: 'secondary' as const,
    },
    info: {
      container: 'bg-blue-900/20 border-blue-700 text-blue-400',
      icon: 'text-blue-400',
      button: 'primary' as const,
    },
  };

  const styles = variantStyles[variant];

  const getIcon = () => {
    switch (variant) {
      case 'error':
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        styles.container,
        fullWidth && 'w-full',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {showIcon && <div className={styles.icon}>{getIcon()}</div>}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm">{message}</p>

          {/* Actions */}
          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-2 mt-3">
              {onRetry && (
                <Button
                  size="sm"
                  variant={styles.button}
                  onClick={onRetry}
                  leftIcon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  }
                >
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Inline Error Message
 *
 * Compact error message for forms and inline validation
 */
export interface InlineErrorProps {
  /** Error message */
  message: string;
  /** Custom className */
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  className,
}) => {
  return (
    <div
      className={cn('flex items-center gap-1.5 text-sm text-red-400', className)}
      role="alert"
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};

/**
 * Error Card
 *
 * Full-featured error card with title, description, and actions
 */
export interface ErrorCardProps {
  /** Error title */
  title: string;
  /** Error description */
  description?: string;
  /** Error details (technical) */
  details?: string;
  /** Retry handler */
  onRetry?: () => void;
  /** Go back handler */
  onGoBack?: () => void;
  /** Custom className */
  className?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  description,
  details,
  onRetry,
  onGoBack,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        'bg-gray-800 border border-gray-700 rounded-lg p-8 text-center max-w-md mx-auto',
        className
      )}
    >
      {/* Error Icon */}
      <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>

      {/* Description */}
      {description && <p className="text-gray-400 mb-4">{description}</p>}

      {/* Technical Details */}
      {details && (
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} technical details
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 bg-gray-900 border border-gray-700 rounded text-left text-xs text-gray-400 overflow-auto">
              {details}
            </pre>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        {onGoBack && (
          <Button variant="secondary" onClick={onGoBack}>
            Go Back
          </Button>
        )}
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
