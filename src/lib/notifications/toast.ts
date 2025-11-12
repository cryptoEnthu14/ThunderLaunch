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

type ToastListener = () => void;

class ToastManager {
  private toasts: ToastData[] = [];
  private listeners: Set<ToastListener> = new Set();
  private counter = 0;

  /**
   * Set the next toast snapshot and notify listeners when it changed.
   */
  private setToasts(next: ToastData[]) {
    if (this.toasts === next) {
      return;
    }

    this.toasts = next;
    this.notify();
  }

  /**
   * Update helper that receives the current snapshot and must return the next one.
   */
  private updateToasts(updater: (current: ToastData[]) => ToastData[]) {
    this.setToasts(updater(this.toasts));
  }

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
    this.listeners.forEach((listener) => listener());
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

    this.updateToasts((toasts) => [...toasts, newToast]);

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
    let scheduledRemoval = false;

    this.updateToasts((toasts) => {
      let found = false;
      const next = toasts.map((toast) => {
        if (toast.id === id && toast.open) {
          found = true;
          return { ...toast, open: false };
        }
        return toast;
      });

      if (found) {
        scheduledRemoval = true;
        return next;
      }

      return toasts;
    });

    if (!scheduledRemoval) {
      return;
    }

    // Remove from array after animation
    setTimeout(() => {
      this.updateToasts((toasts) => {
        const next = toasts.filter((toast) => toast.id !== id);
        return next.length === toasts.length ? toasts : next;
      });
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    if (!this.toasts.length) {
      return;
    }

    const dismissedIds = new Set(this.toasts.map((toast) => toast.id));

    this.updateToasts((toasts) =>
      toasts.map((toast) =>
        dismissedIds.has(toast.id) ? { ...toast, open: false } : toast
      )
    );

    // Remove all after animation
    setTimeout(() => {
      this.updateToasts((toasts) => {
        const next = toasts.filter((toast) => !dismissedIds.has(toast.id));
        return next.length === toasts.length ? toasts : next;
      });
    }, 300);
  }

  /**
   * Get all toasts
   */
  getToasts(): ReadonlyArray<ToastData> {
    return this.toasts;
  }

  /**
   * Update a toast
   */
  update(id: string, updates: Partial<Omit<ToastData, 'id' | 'createdAt'>>) {
    this.updateToasts((toasts) => {
      let updated = false;
      const next = toasts.map((toast) => {
        if (toast.id === id) {
          updated = true;
          return { ...toast, ...updates };
        }
        return toast;
      });

      return updated ? next : toasts;
    });
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
