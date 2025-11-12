/**
 * useSecurityCheck Hook
 *
 * Custom React hook for fetching and managing token security check data.
 * Provides automatic caching, loading states, and error handling.
 *
 * @example
 * ```tsx
 * const { securityData, isLoading, error, refetch } = useSecurityCheck({
 *   tokenAddress: 'So11111...',
 *   tokenId: 'uuid',
 *   enabled: true,
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import type { SecurityScanResult } from '@/lib/security';
import type { SecurityCheck } from '@/types/security';

export interface UseSecurityCheckOptions {
  /** Token mint address */
  tokenAddress?: string;
  /** Token ID (for database lookup) */
  tokenId?: string;
  /** Token market cap (for liquidity ratio calculation) */
  marketCap?: number;
  /** Token name */
  tokenName?: string;
  /** Token symbol */
  tokenSymbol?: string;
  /** Enable the query (default: true) */
  enabled?: boolean;
  /** Force refresh (skip cache) */
  forceRefresh?: boolean;
  /** Refetch interval in milliseconds (0 = no auto-refetch) */
  refetchInterval?: number;
  /** Callback when data is fetched */
  onSuccess?: (data: SecurityScanResult) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export interface UseSecurityCheckReturn {
  /** Security scan result data */
  securityData: SecurityScanResult | null;
  /** Security check summary (for quick access) */
  securityCheck: SecurityCheck | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether data was loaded from cache */
  isCached: boolean;
  /** Refetch the security check */
  refetch: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Fetch security check from API
 */
async function fetchSecurityCheck(
  options: UseSecurityCheckOptions
): Promise<{ data: SecurityScanResult; cached: boolean }> {
  const {
    tokenAddress,
    tokenId,
    marketCap,
    tokenName,
    tokenSymbol,
    forceRefresh,
  } = options;

  if (!tokenAddress && !tokenId) {
    throw new Error('Either tokenAddress or tokenId is required');
  }

  // Try GET first (for cached results)
  if (!forceRefresh && tokenAddress) {
    try {
      const queryParams = new URLSearchParams();
      if (tokenAddress) queryParams.set('tokenAddress', tokenAddress);
      if (tokenId) queryParams.set('tokenId', tokenId);

      const getResponse = await fetch(
        `/api/security/check?${queryParams.toString()}`
      );

      if (getResponse.ok) {
        const result = await getResponse.json();
        if (result.success) {
          return {
            data: result.data,
            cached: true,
          };
        }
      }
    } catch (error) {
      // Continue to POST if GET fails
      console.log('Cache miss, fetching fresh data...');
    }
  }

  // POST to run fresh check
  const response = await fetch('/api/security/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tokenAddress,
      tokenId,
      marketCap,
      tokenName,
      tokenSymbol,
      forceRefresh,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch security check');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Security check failed');
  }

  return {
    data: result.data,
    cached: result.cached || false,
  };
}

/**
 * useSecurityCheck Hook
 *
 * Fetches and manages security check data for a token
 */
export function useSecurityCheck(
  options: UseSecurityCheckOptions = {}
): UseSecurityCheckReturn {
  const {
    enabled = true,
    refetchInterval = 0,
    onSuccess,
    onError,
    tokenAddress,
    tokenId,
    marketCap,
    tokenName,
    tokenSymbol,
    forceRefresh,
  } = options;

  const [securityData, setSecurityData] = useState<SecurityScanResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchInProgress = useRef(false);
  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch security check data
   */
  const fetchData = useCallback(async () => {
    if (fetchInProgress.current) {
      return;
    }

    if (!tokenAddress && !tokenId) {
      return;
    }

    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchSecurityCheck({
        tokenAddress,
        tokenId,
        marketCap,
        tokenName,
        tokenSymbol,
        forceRefresh,
      });
      setSecurityData(result.data);
      setIsCached(result.cached);
      onSuccess?.(result.data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [
    tokenAddress,
    tokenId,
    marketCap,
    tokenName,
    tokenSymbol,
    forceRefresh,
    onSuccess,
    onError,
  ]);

  /**
   * Refetch data manually
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Initial fetch
   */
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  /**
   * Auto-refetch interval
   */
  useEffect(() => {
    if (refetchInterval > 0 && enabled) {
      refetchIntervalRef.current = setInterval(() => {
        fetchData();
      }, refetchInterval);

      return () => {
        if (refetchIntervalRef.current) {
          clearInterval(refetchIntervalRef.current);
        }
      };
    }
  }, [refetchInterval, enabled, fetchData]);

  return {
    securityData,
    securityCheck: securityData?.securityCheck || null,
    isLoading,
    error,
    isCached,
    refetch,
    clearError,
  };
}

/**
 * Hook for checking if security check is needed
 *
 * Returns true if security check should be run (not cached or expired)
 */
export function useSecurityCheckNeeded(
  tokenAddress?: string
): boolean {
  const [isNeeded, setIsNeeded] = useState(false);

  useEffect(() => {
    if (!tokenAddress) {
      startTransition(() => setIsNeeded(false));
      return;
    }

    let isActive = true;

    // Check if we have cached results
    fetch(`/api/security/check?tokenAddress=${tokenAddress}`)
      .then((response) => {
        if (!isActive) return;
        startTransition(() => setIsNeeded(!response.ok));
      })
      .catch(() => {
        if (!isActive) return;
        startTransition(() => setIsNeeded(true));
      });

    return () => {
      isActive = false;
    };
  }, [tokenAddress]);

  return isNeeded;
}

export default useSecurityCheck;
