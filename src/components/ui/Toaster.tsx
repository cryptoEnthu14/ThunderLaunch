'use client';

/**
 * Toaster Component
 *
 * Renders all active toasts from the toast manager.
 * Must be placed in the app layout to display toasts globally.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import { Toaster } from '@/components/ui/Toaster';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Toast, ToastProvider, ToastViewport } from './Toast';
import { toastManager } from '@/lib/notifications/toast';

// =============================================================================
// COMPONENT
// =============================================================================

export function Toaster() {
  const { toasts } = useNotifications();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          description={toast.description}
          action={toast.action}
          showClose={toast.showClose}
          icon={toast.icon}
          open={toast.open}
          onOpenChange={(open) => {
            if (!open) {
              toastManager.dismiss(toast.id);
            }
          }}
          duration={toast.duration}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export default Toaster;
