'use client';

/**
 * Watchlist Page
 *
 * Displays user's watchlisted tokens with sorting and filtering options.
 */

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Heart, Loader2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { WatchlistButton } from '@/components/token/WatchlistButton';
import { useWatchlist } from '@/hooks/useWatchlist';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type SortOption = 'created_at' | 'name' | 'market_cap' | 'volume_24h';

// =============================================================================
// COMPONENT
// =============================================================================

export default function WatchlistPage() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  // State
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load watchlist
  const { watchlist, count, isLoading, error, reload } = useWatchlist(
    walletAddress,
    {
      autoLoad: true,
      sortBy,
      sortOrder,
      limit: 100,
    }
  );

  /**
   * Handle sort change
   */
  const handleSort = (field: SortOption) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default desc order
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Not connected state
  if (!walletAddress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
            <p className="text-gray-400">
              Track your favorite tokens and monitor their performance
            </p>
          </div>

          <Card>
            <CardBody className="p-12">
              <EmptyState
                icon={<Heart className="w-12 h-12 text-gray-600" />}
                title="Connect your wallet"
                description="Please connect your wallet to view your watchlist"
              />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
          </div>

          <Card>
            <CardBody className="p-12">
              <EmptyState
                title="Failed to load watchlist"
                description={error}
                action={
                  <Button onClick={reload} variant="primary">
                    Try Again
                  </Button>
                }
              />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Empty state
  if (watchlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
            <p className="text-gray-400">
              Track your favorite tokens and monitor their performance
            </p>
          </div>

          <Card>
            <CardBody className="p-12">
              <EmptyState
                icon={<Heart className="w-12 h-12 text-gray-600" />}
                title="Your watchlist is empty"
                description="Start adding tokens to your watchlist to track their performance"
                action={
                  <Link href="/">
                    <Button variant="primary">Browse Tokens</Button>
                  </Link>
                }
              />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
              <span>{count} {count === 1 ? 'token' : 'tokens'}</span>
            </div>
          </div>
          <p className="text-gray-400">
            Track your favorite tokens and monitor their performance
          </p>
        </div>

        {/* Sort Options */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400 mr-2">Sort by:</span>
            <Button
              variant={sortBy === 'created_at' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleSort('created_at')}
            >
              Date Added
              {sortBy === 'created_at' && (
                sortOrder === 'desc' ? ' ↓' : ' ↑'
              )}
            </Button>
            <Button
              variant={sortBy === 'name' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleSort('name')}
            >
              Name
              {sortBy === 'name' && (
                sortOrder === 'desc' ? ' ↓' : ' ↑'
              )}
            </Button>
            <Button
              variant={sortBy === 'market_cap' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleSort('market_cap')}
            >
              Market Cap
              {sortBy === 'market_cap' && (
                sortOrder === 'desc' ? ' ↓' : ' ↑'
              )}
            </Button>
            <Button
              variant={sortBy === 'volume_24h' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleSort('volume_24h')}
            >
              Volume
              {sortBy === 'volume_24h' && (
                sortOrder === 'desc' ? ' ↓' : ' ↑'
              )}
            </Button>
          </div>
        </div>

        {/* Watchlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => {
            const token = item.token;
            if (!token) return null;

            const priceChange = token.price_change_24h || 0;
            const isPriceUp = priceChange >= 0;

            return (
              <Card key={item.id} className="hover:border-gray-600 transition-colors">
                <CardBody className="p-4">
                  <Link href={`/token/${token.mint_address}`}>
                    <div className="space-y-4">
                      {/* Token Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Token Image */}
                          <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden">
                            {token.image_url ? (
                              <Image
                                src={token.image_url}
                                alt={token.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg font-bold">
                                {token.symbol.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Token Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">
                              {token.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              ${token.symbol}
                            </p>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <WatchlistButton
                          tokenId={item.token_id}
                          tokenAddress={item.token_address}
                          tokenName={token.name}
                          variant="icon"
                          size="sm"
                        />
                      </div>

                      {/* Token Stats */}
                      <div className="space-y-2">
                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Price</span>
                          <div className="text-right">
                            <div className="font-semibold text-white">
                              {formatCurrency(token.current_price)}
                            </div>
                            <div
                              className={cn(
                                'text-xs flex items-center justify-end gap-1',
                                isPriceUp ? 'text-green-500' : 'text-red-500'
                              )}
                            >
                              {isPriceUp ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(priceChange).toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        {/* Market Cap */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Market Cap</span>
                          <span className="text-sm font-medium text-white">
                            {formatCurrency(token.market_cap)}
                          </span>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">24h Volume</span>
                          <span className="text-sm font-medium text-white">
                            {formatCurrency(token.volume_24h)}
                          </span>
                        </div>
                      </div>

                      {/* Added Date */}
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
