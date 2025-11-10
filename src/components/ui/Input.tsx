'use client';

/**
 * Input Component
 *
 * A comprehensive form input component with label, error states, and helper text.
 * Fully accessible with proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   helperText="We'll never share your email"
 *   required
 * />
 *
 * <Input
 *   label="Username"
 *   error="Username is required"
 *   leftIcon={<UserIcon />}
 * />
 * ```
 */

import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** Icon to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Full width input */
  fullWidth?: boolean;
  /** Input container className */
  containerClassName?: string;
}

/**
 * Input Component
 *
 * Form input with label, validation, and accessibility features
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      containerClassName,
      className,
      id: providedId,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for accessibility
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasError = Boolean(error);

    return (
      <div
        className={cn(
          'flex flex-col gap-1.5',
          fullWidth && 'w-full',
          containerClassName
        )}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium text-gray-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
            {required && (
              <span className="text-red-400 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={cn(
              hasError && errorId,
              helperText && !hasError && helperId
            )}
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-gray-900 px-4 py-2.5 text-sm text-white placeholder:text-gray-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',

              // Border and ring colors
              !hasError && 'border-gray-700 focus:border-blue-500 focus:ring-blue-500',
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',

              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed bg-gray-800',

              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',

              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}

          {/* Error Icon */}
          {hasError && !rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <p
            id={errorId}
            className="text-sm text-red-400 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !hasError && (
          <p
            id={helperId}
            className="text-sm text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea Component
 *
 * Similar to Input but for multi-line text
 */
export interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Number of rows */
  rows?: number;
  /** Full width */
  fullWidth?: boolean;
  /** Container className */
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      rows = 4,
      fullWidth = false,
      containerClassName,
      className,
      id: providedId,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasError = Boolean(error);

    return (
      <div
        className={cn(
          'flex flex-col gap-1.5',
          fullWidth && 'w-full',
          containerClassName
        )}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium text-gray-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
            {required && (
              <span className="text-red-400 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={cn(
            hasError && errorId,
            helperText && !hasError && helperId
          )}
          className={cn(
            // Base styles
            'w-full rounded-lg border bg-gray-900 px-4 py-2.5 text-sm text-white placeholder:text-gray-500',
            'transition-all duration-200 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',

            // Border and ring colors
            !hasError && 'border-gray-700 focus:border-blue-500 focus:ring-blue-500',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',

            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed bg-gray-800',

            className
          )}
          {...props}
        />

        {/* Error Message */}
        {hasError && (
          <p
            id={errorId}
            className="text-sm text-red-400 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !hasError && (
          <p
            id={helperId}
            className="text-sm text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
