/**
 * useWalletBalance Hook
 *
 * Custom hook to fetch and manage Solana wallet balance.
 * Features:
 * - Auto-refresh on block changes
 * - Real-time balance updates
 * - Loading and error states
 * - Automatic cleanup on unmount
 */

import { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface WalletBalanceState {
  balance: number | null;
  balanceLamports: number | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to get and monitor wallet balance
 *
 * @returns {WalletBalanceState} Balance state with loading and error handling
 *
 * @example
 * ```tsx
 * const { balance, isLoading, error, refresh } = useWalletBalance();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * if (balance) return <div>{balance} SOL</div>;
 * ```
 */
export function useWalletBalance(): WalletBalanceState {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLamports, setBalanceLamports] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch wallet balance from the blockchain
   */
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(null);
      setBalanceLamports(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const lamports = await connection.getBalance(publicKey);
      setBalanceLamports(lamports);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch balance');
      console.error('[useWalletBalance] Error fetching balance:', error);
      setError(error);
      setBalance(null);
      setBalanceLamports(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, connection]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchBalance();
  }, [fetchBalance]);

  /**
   * Initial balance fetch on wallet connection
   */
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
      setBalanceLamports(null);
      setIsLoading(false);
      setError(null);
    }
  }, [connected, publicKey, fetchBalance]);

  /**
   * Subscribe to account changes for real-time balance updates
   */
  useEffect(() => {
    if (!publicKey || !connected) {
      return;
    }

    let subscriptionId: number | null = null;

    const subscribe = async () => {
      try {
        // Subscribe to account changes
        subscriptionId = connection.onAccountChange(
          publicKey,
          (accountInfo) => {
            const lamports = accountInfo.lamports;
            setBalanceLamports(lamports);
            setBalance(lamports / LAMPORTS_PER_SOL);
          },
          'confirmed'
        );
      } catch (err) {
        console.error('[useWalletBalance] Error subscribing to account changes:', err);
      }
    };

    subscribe();

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionId !== null) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [publicKey, connected, connection]);

  return {
    balance,
    balanceLamports,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Export default for convenience
 */
export default useWalletBalance;
