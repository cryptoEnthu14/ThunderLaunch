'use client';

/**
 * WalletBalance Component
 *
 * Displays the SOL balance of the connected wallet with:
 * - Real-time balance updates
 * - Proper number formatting
 * - Loading and error states
 * - Responsive design
 * - Refresh capability
 */

import React, { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletBalance } from '@/hooks/useWalletBalance';

export interface WalletBalanceProps {
  /** Show refresh button */
  showRefresh?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Show full balance or abbreviated */
  abbreviated?: boolean;
  /** Number of decimal places to show */
  decimals?: number;
}

/**
 * Format balance with proper decimal places and localization
 */
function formatBalance(balance: number | null, decimals: number = 4, abbreviated: boolean = false): string {
  if (balance === null) {
    return '0.0000';
  }

  if (abbreviated && balance >= 1000) {
    // Format as K, M, B for large numbers
    if (balance >= 1_000_000_000) {
      return `${(balance / 1_000_000_000).toFixed(2)}B`;
    }
    if (balance >= 1_000_000) {
      return `${(balance / 1_000_000).toFixed(2)}M`;
    }
    return `${(balance / 1000).toFixed(2)}K`;
  }

  return balance.toFixed(decimals);
}

/**
 * WalletBalance Component
 *
 * Displays the current SOL balance of the connected wallet
 */
export const WalletBalance: FC<WalletBalanceProps> = ({
  showRefresh = false,
  className = '',
  abbreviated = false,
  decimals = 4,
}) => {
  const { connected } = useWallet();
  const { balance, isLoading, error, refresh } = useWalletBalance();

  // Don't render if wallet is not connected
  if (!connected) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-500 ${className}`}>
        <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span>Error loading balance</span>
        {showRefresh && (
          <button
            onClick={refresh}
            className="ml-1 text-xs underline hover:no-underline"
            aria-label="Retry loading balance"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading && balance === null) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-400 ${className}`}>
        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        {/* SOL Icon/Indicator */}
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />

        {/* Balance Display */}
        <span className="font-mono text-sm font-medium">
          {formatBalance(balance, decimals, abbreviated)} SOL
        </span>
      </div>

      {/* Optional Refresh Button */}
      {showRefresh && (
        <button
          onClick={refresh}
          disabled={isLoading}
          className="p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh balance"
          title="Refresh balance"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Export default for convenience
 */
export default WalletBalance;
