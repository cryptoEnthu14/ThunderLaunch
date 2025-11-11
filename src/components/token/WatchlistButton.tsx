'use client';

/**
 * WatchlistButton Component
 *
 * Button for adding/removing tokens from watchlist with heart icon animation.
 */

import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { toast } from '@/lib/notifications/toast';

// =============================================================================
// TYPES
// =============================================================================

export interface WatchlistButtonProps {
  /** Token ID */
  tokenId: string;
  /** Token address */
  tokenAddress: string;
  /** Token name (for display) */
  tokenName?: string;
  /** Button variant */
  variant?: 'default' | 'icon' | 'compact';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Show label text */
  showLabel?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when watchlist state changes */
  onWatchlistChange?: (isInWatchlist: boolean) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * WatchlistButton - Toggle button for adding/removing tokens from watchlist
 *
 * @example
 * ```tsx
 * // Icon only
 * <WatchlistButton
 *   tokenId="token-123"
 *   tokenAddress="abc...xyz"
 *   variant="icon"
 * />
 *
 * // With label
 * <WatchlistButton
 *   tokenId="token-123"
 *   tokenAddress="abc...xyz"
 *   tokenName="My Token"
 *   showLabel={true}
 * />
 * ```
 */
export function WatchlistButton({
  tokenId,
  tokenAddress,
  tokenName,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className,
  onWatchlistChange,
}: WatchlistButtonProps) {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const {
    isInWatchlist: checkIsInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
  } = useWatchlist(walletAddress, { autoLoad: true });

  const [isProcessing, setIsProcessing] = useState(false);

  const isInWatchlist = checkIsInWatchlist(tokenId);

  /**
   * Handle watchlist toggle
   */
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if wallet is connected
    if (!walletAddress) {
      toast.error('Connect wallet', 'Please connect your wallet to use the watchlist');
      return;
    }

    setIsProcessing(true);

    try {
      let success = false;

      if (isInWatchlist) {
        // Remove from watchlist
        success = await removeFromWatchlist(tokenId);
      } else {
        // Add to watchlist
        success = await addToWatchlist(tokenId, tokenAddress);
      }

      if (success) {
        onWatchlistChange?.(!isInWatchlist);
      }
    } catch (error) {
      console.error('[WatchlistButton] Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Variant styles
  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2',
    'rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  );

  const variantClasses = {
    default: cn(
      'px-4 py-2 bg-gray-800 border border-gray-700',
      'hover:bg-gray-700 hover:border-gray-600',
      isInWatchlist && 'bg-pink-500/20 border-pink-500/50 hover:bg-pink-500/30'
    ),
    icon: cn(
      sizeClasses[size],
      'bg-transparent hover:bg-gray-800/50',
      isInWatchlist && 'text-pink-500 hover:bg-pink-500/10'
    ),
    compact: cn(
      'px-3 py-1.5 text-sm bg-gray-800/50 border border-gray-700',
      'hover:bg-gray-800 hover:border-gray-600',
      isInWatchlist && 'bg-pink-500/20 border-pink-500/50 hover:bg-pink-500/30'
    ),
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isProcessing || !walletAddress}
      title={
        !walletAddress
          ? 'Connect wallet to use watchlist'
          : isInWatchlist
          ? `Remove ${tokenName || 'token'} from watchlist`
          : `Add ${tokenName || 'token'} to watchlist`
      }
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {isProcessing ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin text-gray-400')} />
      ) : (
        <Heart
          className={cn(
            iconSizes[size],
            'transition-all duration-200',
            isInWatchlist
              ? 'fill-pink-500 text-pink-500 scale-110'
              : 'text-gray-400 hover:text-pink-400 hover:scale-105'
          )}
        />
      )}

      {showLabel && (
        <span
          className={cn(
            'font-medium',
            isInWatchlist ? 'text-pink-400' : 'text-gray-300'
          )}
        >
          {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </span>
      )}
    </button>
  );
}

export default WatchlistButton;
