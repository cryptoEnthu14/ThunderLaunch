/**
 * Toast Notification System
 *
 * Global toast notification manager with helper functions.
 * Provides a simple API for showing toasts from anywhere in the app.
 *
 * @example
 * ```tsx
 * import { toast } from '@/lib/notifications/toast';
 *
 * // Simple usage
 * toast.success('Token created!');
 * toast.error('Transaction failed');
 *
 * // With description
 * toast.warning('High risk detected', 'This token has critical security issues');
 *
 * // With action
 * toast.info('Update available', 'Click to learn more', {
 *   action: {
 *     label: 'View',
 *     onClick: () => router.push('/updates')
 *   }
 * });
 *
 * // Custom duration
 * toast.success('Saved!', undefined, { duration: 2000 });
 * ```
 */

import type { ToastVariant } from '@/components/ui/Toast';

// =============================================================================
// TYPES
// =============================================================================

export interface ToastOptions {
  /** Duration in milliseconds (default: 5000) */
  duration?: number;
  /** Action button configuration */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Show close button (default: true) */
  showClose?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Toast ID for programmatic control */
  id?: string;
}

export interface ToastData extends ToastOptions {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  open: boolean;
  createdAt: number;
}

// =============================================================================
// GLOBAL STATE
// =============================================================================

type ToastListener = (toasts: ToastData[]) => void;

class ToastManager {
  private toasts: ToastData[] = [];
  private listeners: Set<ToastListener> = new Set();
  private counter = 0;

  /**
   * Subscribe to toast changes
   */
  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  /**
   * Add a new toast
   */
  add(toast: Omit<ToastData, 'id' | 'open' | 'createdAt'> & { id?: string }) {
    const id = toast.id || `toast-${++this.counter}-${Date.now()}`;
    const newToast: ToastData = {
      ...toast,
      id,
      open: true,
      createdAt: Date.now(),
    };

    this.toasts.push(newToast);
    this.notify();

    // Auto-dismiss after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        this.dismiss(id);
      }, toast.duration || 5000);
    }

    return id;
  }

  /**
   * Dismiss a toast by ID
   */
  dismiss(id: string) {
    const toast = this.toasts.find((t) => t.id === id);
    if (toast) {
      toast.open = false;
      this.notify();

      // Remove from array after animation
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
        this.notify();
      }, 300);
    }
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.toasts.forEach((toast) => {
      toast.open = false;
    });
    this.notify();

    // Remove all after animation
    setTimeout(() => {
      this.toasts = [];
      this.notify();
    }, 300);
  }

  /**
   * Get all toasts
   */
  getToasts() {
    return [...this.toasts];
  }

  /**
   * Update a toast
   */
  update(id: string, updates: Partial<Omit<ToastData, 'id' | 'createdAt'>>) {
    const toast = this.toasts.find((t) => t.id === id);
    if (toast) {
      Object.assign(toast, updates);
      this.notify();
    }
  }
}

// Global toast manager instance
export const toastManager = new ToastManager();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Show a toast notification
 */
function showToast(
  variant: ToastVariant,
  title: string,
  description?: string,
  options?: ToastOptions
): string {
  return toastManager.add({
    variant,
    title,
    description,
    duration: options?.duration ?? 5000,
    action: options?.action,
    showClose: options?.showClose ?? true,
    icon: options?.icon,
    id: options?.id,
  });
}

/**
 * Toast helper functions
 */
export const toast = {
  /**
   * Show success toast
   */
  success: (title: string, description?: string, options?: ToastOptions) => {
    return showToast('success', title, description, options);
  },

  /**
   * Show error toast
   */
  error: (title: string, description?: string, options?: ToastOptions) => {
    return showToast('error', title, description, options);
  },

  /**
   * Show warning toast
   */
  warning: (title: string, description?: string, options?: ToastOptions) => {
    return showToast('warning', title, description, options);
  },

  /**
   * Show info toast
   */
  info: (title: string, description?: string, options?: ToastOptions) => {
    return showToast('info', title, description, options);
  },

  /**
   * Show default toast
   */
  default: (title: string, description?: string, options?: ToastOptions) => {
    return showToast('default', title, description, options);
  },

  /**
   * Dismiss a toast by ID
   */
  dismiss: (id: string) => {
    toastManager.dismiss(id);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toastManager.dismissAll();
  },

  /**
   * Update a toast
   */
  update: (id: string, updates: Partial<Omit<ToastData, 'id' | 'createdAt'>>) => {
    toastManager.update(id, updates);
  },

  /**
   * Show a promise toast (for async operations)
   */
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: ToastOptions
  ): Promise<T> => {
    const id = toast.info(messages.loading, undefined, {
      ...options,
      duration: Infinity,
      showClose: false,
    });

    try {
      const data = await promise;
      const successMessage =
        typeof messages.success === 'function'
          ? messages.success(data)
          : messages.success;

      toastManager.update(id, {
        variant: 'success',
        title: successMessage,
        duration: options?.duration ?? 5000,
        showClose: true,
      });

      // Auto-dismiss
      setTimeout(() => toastManager.dismiss(id), options?.duration ?? 5000);

      return data;
    } catch (error) {
      const errorMessage =
        typeof messages.error === 'function'
          ? messages.error(error as Error)
          : messages.error;

      toastManager.update(id, {
        variant: 'error',
        title: errorMessage,
        description: error instanceof Error ? error.message : undefined,
        duration: options?.duration ?? 5000,
        showClose: true,
      });

      // Auto-dismiss
      setTimeout(() => toastManager.dismiss(id), options?.duration ?? 5000);

      throw error;
    }
  },

  /**
   * Show a loading toast
   */
  loading: (title: string, description?: string, options?: ToastOptions) => {
    return showToast('default', title, description, {
      ...options,
      duration: Infinity,
      showClose: false,
    });
  },
};

// =============================================================================
// EXPORTS
// =============================================================================

export default toast;
export type { ToastData, ToastOptions, ToastVariant };
