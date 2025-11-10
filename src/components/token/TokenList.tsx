'use client';

/**
 * Token List Component
 *
 * Displays a list or grid of tokens using TokenCard component.
 * Features:
 * - Grid or list layout modes
 * - Filtering and sorting options
 * - Loading states with skeleton loaders
 * - Empty state with helpful message
 * - Pagination support
 *
 * @example
 * ```tsx
 * <TokenList
 *   tokens={tokens}
 *   layout="grid"
 *   showSecurityBadge={true}
 *   isLoading={false}
 * />
 * ```
 */

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid3x3, List, TrendingUp, TrendingDown } from 'lucide-react';
import { TokenCard, TokenCardSkeleton } from './TokenCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Token } from '@/types/token';

export interface TokenListProps {
  /** List of tokens to display */
  tokens: Token[];
  /** Loading state */
  isLoading?: boolean;
  /** Layout mode */
  layout?: 'grid' | 'list';
  /** Show security badges */
  showSecurityBadge?: boolean;
  /** Show security warnings */
  showSecurityWarning?: boolean;
  /** Enable search */
  enableSearch?: boolean;
  /** Enable sorting */
  enableSort?: boolean;
  /** Enable layout toggle */
  enableLayoutToggle?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Custom className */
  className?: string;
  /** Maximum number of tokens to display (for pagination) */
  limit?: number;
}

type SortOption = 'name' | 'price' | 'market_cap' | 'price_change' | 'newest';

/**
 * TokenList Component
 *
 * Displays a filterable, sortable list of tokens
 */
export function TokenList({
  tokens,
  isLoading = false,
  layout: initialLayout = 'grid',
  showSecurityBadge = true,
  showSecurityWarning = true,
  enableSearch = true,
  enableSort = true,
  enableLayoutToggle = true,
  emptyMessage = 'No tokens found',
  className,
  limit,
}: TokenListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('market_cap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [layout, setLayout] = useState(initialLayout);

  /**
   * Filter and sort tokens
   */
  const filteredAndSortedTokens = useMemo(() => {
    let result = [...tokens];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (token) =>
          token.name.toLowerCase().includes(query) ||
          token.symbol.toLowerCase().includes(query) ||
          token.mint_address.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = (a.current_price || 0) - (b.current_price || 0);
          break;
        case 'market_cap':
          comparison = (a.market_cap || 0) - (b.market_cap || 0);
          break;
        case 'price_change':
          comparison = (a.price_change_24h || 0) - (b.price_change_24h || 0);
          break;
        case 'newest':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Apply limit
    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }, [tokens, searchQuery, sortBy, sortDirection, limit]);

  /**
   * Toggle sort direction for a column
   */
  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className={className}>
        {/* Controls */}
        {(enableSearch || enableSort || enableLayoutToggle) && (
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <div className="h-10 bg-gray-800 rounded-lg animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-10 w-20 bg-gray-800 rounded-lg animate-pulse" />
            </div>
          </div>
        )}

        {/* Grid/List */}
        <div
          className={cn(
            layout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <TokenCardSkeleton key={i} variant={layout === 'list' ? 'compact' : 'default'} />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (tokens.length === 0 || filteredAndSortedTokens.length === 0) {
    return (
      <div className={className}>
        {/* Controls */}
        {(enableSearch || enableSort || enableLayoutToggle) && tokens.length > 0 && (
          <div className="flex items-center justify-between gap-4 mb-6">
            {enableSearch && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tokens..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-thunder-blue focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {tokens.length === 0 ? 'No Tokens Yet' : 'No Matching Tokens'}
          </h3>
          <p className="text-gray-400 text-center max-w-md">
            {tokens.length === 0
              ? emptyMessage
              : 'Try adjusting your search or filters to find what you\'re looking for.'}
          </p>
          {tokens.length === 0 && (
            <Button variant="primary" className="mt-6" onClick={() => window.location.href = '/launch'}>
              Launch Your Token
            </Button>
          )}
        </div>
      </div>
    );
  }

  /**
   * Render token list
   */
  return (
    <div className={className}>
      {/* Controls */}
      {(enableSearch || enableSort || enableLayoutToggle) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Search */}
          {enableSearch && (
            <div className="flex-1 max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, symbol, or address..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-thunder-blue focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* Sort and Layout Controls */}
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            {enableSort && (
              <div className="relative">
                <select
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [option, direction] = e.target.value.split('-') as [SortOption, 'asc' | 'desc'];
                    setSortBy(option);
                    setSortDirection(direction);
                  }}
                  className="appearance-none pl-9 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-thunder-blue focus:border-transparent cursor-pointer"
                >
                  <option value="market_cap-desc">Market Cap (High to Low)</option>
                  <option value="market_cap-asc">Market Cap (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price_change-desc">Price Change (High to Low)</option>
                  <option value="price_change-asc">Price Change (Low to High)</option>
                  <option value="name-asc">Name (A to Z)</option>
                  <option value="name-desc">Name (Z to A)</option>
                  <option value="newest-desc">Newest First</option>
                  <option value="newest-asc">Oldest First</option>
                </select>
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}

            {/* Layout Toggle */}
            {enableLayoutToggle && (
              <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setLayout('grid')}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    layout === 'grid'
                      ? 'bg-thunder-blue text-white'
                      : 'text-gray-400 hover:text-white'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    layout === 'list'
                      ? 'bg-thunder-blue text-white'
                      : 'text-gray-400 hover:text-white'
                  )}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredAndSortedTokens.length} {filteredAndSortedTokens.length === 1 ? 'token' : 'tokens'}
      </div>

      {/* Token Grid/List */}
      <div
        className={cn(
          layout === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}
      >
        {filteredAndSortedTokens.map((token) => (
          <TokenCard
            key={token.id}
            token={token}
            variant={layout === 'list' ? 'compact' : 'default'}
            showSecurityBadge={showSecurityBadge}
            showSecurityWarning={showSecurityWarning}
          />
        ))}
      </div>
    </div>
  );
}

export default TokenList;
