/**
 * useNotifications Hook
 *
 * Hook for managing notification preferences and state.
 * Features:
 * - Store user notification preferences
 * - Control notification display
 * - Persist preferences to localStorage
 * - Subscribe to toast changes
 *
 * @example
 * ```tsx
 * const {
 *   preferences,
 *   updatePreferences,
 *   toasts,
 *   canShowNotification
 * } = useNotifications();
 *
 * if (canShowNotification('trade')) {
 *   toast.success('Trade confirmed!');
 * }
 * ```
 */

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { toastManager, type ToastData } from '@/lib/notifications/toast';

// =============================================================================
// TYPES
// =============================================================================

export type NotificationType =
  | 'trade'
  | 'token'
  | 'security'
  | 'system'
  | 'price'
  | 'all';

export interface NotificationPreferences {
  /** Enable all notifications */
  enabled: boolean;
  /** Enable trade notifications */
  tradeNotifications: boolean;
  /** Enable token launch notifications */
  tokenNotifications: boolean;
  /** Enable security alert notifications */
  securityNotifications: boolean;
  /** Enable system notifications */
  systemNotifications: boolean;
  /** Enable price alert notifications */
  priceNotifications: boolean;
  /** Enable browser notifications (requires permission) */
  browserNotifications: boolean;
  /** Enable toast notifications */
  toastNotifications: boolean;
  /** Sound enabled */
  soundEnabled: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = 'thunderlaunch_notification_preferences';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  tradeNotifications: true,
  tokenNotifications: true,
  securityNotifications: true,
  systemNotifications: true,
  priceNotifications: true,
  browserNotifications: false,
  toastNotifications: true,
  soundEnabled: false,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Load preferences from localStorage
 */
function loadPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('[useNotifications] Error loading preferences:', error);
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save preferences to localStorage
 */
function savePreferences(preferences: NotificationPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('[useNotifications] Error saving preferences:', error);
  }
}

/**
 * Request browser notification permission
 */
async function requestBrowserPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[useNotifications] Browser notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('[useNotifications] Error requesting permission:', error);
    return false;
  }
}

// =============================================================================
// HOOK
// =============================================================================

const EMPTY_TOASTS: ReadonlyArray<ToastData> = [];

const subscribeToToasts = (callback: () => void) => toastManager.subscribe(callback);
const getServerSnapshot = () => EMPTY_TOASTS;

/**
 * useNotifications Hook
 */
export function useNotifications() {
  // State
  const [preferences, setPreferences] = useState<NotificationPreferences>(loadPreferences);

  const getSnapshot = useCallback(
    () => toastManager.getToasts(),
    []
  );

  // Subscribe to toast manager
  const toasts = useSyncExternalStore<ReadonlyArray<ToastData>>(
    subscribeToToasts,
    getSnapshot,
    getServerSnapshot
  );

  /**
   * Update preferences
   */
  const updatePreferences = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      setPreferences((prev) => {
        const newPreferences = { ...prev, ...updates };
        savePreferences(newPreferences);
        return newPreferences;
      });
    },
    []
  );

  /**
   * Enable browser notifications
   */
  const enableBrowserNotifications = useCallback(async () => {
    const granted = await requestBrowserPermission();
    updatePreferences({ browserNotifications: granted });
    return granted;
  }, [updatePreferences]);

  /**
   * Check if a notification type can be shown
   */
  const canShowNotification = useCallback(
    (type: NotificationType): boolean => {
      if (!preferences.enabled) {
        return false;
      }

      if (type === 'all') {
        return preferences.toastNotifications;
      }

      const typeMap: Record<NotificationType, keyof NotificationPreferences> = {
        trade: 'tradeNotifications',
        token: 'tokenNotifications',
        security: 'securityNotifications',
        system: 'systemNotifications',
        price: 'priceNotifications',
        all: 'enabled',
      };

      const prefKey = typeMap[type];
      return preferences.toastNotifications && preferences[prefKey] === true;
    },
    [preferences]
  );

  /**
   * Show browser notification (if enabled)
   */
  const showBrowserNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!preferences.browserNotifications) {
        return;
      }

      if (!('Notification' in window)) {
        return;
      }

      if (Notification.permission !== 'granted') {
        return;
      }

      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } catch (error) {
        console.error('[useNotifications] Error showing notification:', error);
      }
    },
    [preferences.browserNotifications]
  );

  /**
   * Play notification sound
   */
  const playSound = useCallback(() => {
    if (!preferences.soundEnabled) {
      return;
    }

    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.error('[useNotifications] Error playing sound:', error);
      });
    } catch (error) {
      console.error('[useNotifications] Error creating audio:', error);
    }
  }, [preferences.soundEnabled]);

  /**
   * Toggle notification type
   */
  const toggleNotificationType = useCallback(
    (type: keyof NotificationPreferences) => {
      updatePreferences({ [type]: !preferences[type] });
    },
    [preferences, updatePreferences]
  );

  /**
   * Reset to default preferences
   */
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  }, []);

  return {
    // State
    preferences,
    toasts,

    // Actions
    updatePreferences,
    enableBrowserNotifications,
    toggleNotificationType,
    resetPreferences,

    // Helpers
    canShowNotification,
    showBrowserNotification,
    playSound,
  };
}

/**
 * Export default for convenience
 */
export default useNotifications;
