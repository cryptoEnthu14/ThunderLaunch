'use client';

/**
 * Toast Component
 *
 * Toast notification system built with Radix UI.
 * Features:
 * - Multiple variants (success, error, warning, info)
 * - Auto-dismiss after configurable delay
 * - Queue multiple toasts
 * - Click to dismiss
 * - Swipe to dismiss on mobile
 * - Accessible (ARIA compliant)
 *
 * @example
 * ```tsx
 * import { toast } from '@/lib/notifications/toast';
 *
 * toast.success('Token created successfully!');
 * toast.error('Transaction failed');
 * toast.warning('High risk token detected');
 * toast.info('New feature available');
 * ```
 */

import React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TOAST VARIANTS
// =============================================================================

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default:
          'border-gray-700 bg-gray-800 text-white',
        success:
          'border-green-700 bg-green-950 text-green-100',
        error:
          'border-red-700 bg-red-950 text-red-100',
        warning:
          'border-yellow-700 bg-yellow-950 text-yellow-100',
        info:
          'border-blue-700 bg-blue-950 text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconVariants = cva('h-5 w-5 flex-shrink-0', {
  variants: {
    variant: {
      default: 'text-gray-400',
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
    },
  },
});

// =============================================================================
// TYPES
// =============================================================================

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {
  /** Toast title */
  title?: string;
  /** Toast description */
  description?: string;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Show close button */
  showClose?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
}

// =============================================================================
// ICONS
// =============================================================================

const icons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-5 w-5" />,
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Toast Component
 */
export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(
  (
    {
      className,
      variant = 'default',
      title,
      description,
      action,
      showClose = true,
      icon,
      ...props
    },
    ref
  ) => {
    const variantIcon = icon || icons[variant || 'default'];

    return (
      <ToastPrimitive.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className={cn(iconVariants({ variant }))}>{variantIcon}</div>

          {/* Content */}
          <div className="flex-1 space-y-1">
            {title && (
              <ToastPrimitive.Title className="text-sm font-semibold">
                {title}
              </ToastPrimitive.Title>
            )}
            {description && (
              <ToastPrimitive.Description className="text-sm opacity-90">
                {description}
              </ToastPrimitive.Description>
            )}
          </div>

          {/* Action */}
          {action && (
            <ToastPrimitive.Action
              altText={action.label}
              onClick={action.onClick}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-700 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {action.label}
            </ToastPrimitive.Action>
          )}
        </div>

        {/* Close Button */}
        {showClose && (
          <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100">
            <X className="h-4 w-4" />
          </ToastPrimitive.Close>
        )}
      </ToastPrimitive.Root>
    );
  }
);

Toast.displayName = 'Toast';

/**
 * Toast Viewport
 */
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));

ToastViewport.displayName = 'ToastViewport';

/**
 * Toast Provider
 */
export const ToastProvider = ToastPrimitive.Provider;

// =============================================================================
// EXPORTS
// =============================================================================

export { ToastPrimitive };
