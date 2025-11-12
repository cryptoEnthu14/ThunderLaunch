'use client';

/**
 * Token Listing Page
 *
 * Browse and discover tokens with filtering, sorting, and search.
 * Features:
 * - Grid layout of token cards
 * - Sort by newest, market cap, volume, risk score
 * - Filter by chain, risk level, verification tier
 * - Search by name/symbol
 * - Pagination with load more
 * - Loading and empty states
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { TokenCard, TokenCardSkeleton } from '@/components/token';
import { Container } from '@/components/layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { Token, Chain, RiskLevel, VerificationTier } from '@/types/token';

/**
 * Sort options
 */
type SortOption = 'newest' | 'market_cap' | 'volume' | 'risk_score' | 'price_change';

interface SortConfig {
  value: SortOption;
  label: string;
  description: string;
}

const SORT_OPTIONS: SortConfig[] = [
  { value: 'newest', label: 'Newest', description: 'Recently created' },
  { value: 'market_cap', label: 'Market Cap', description: 'Highest market cap' },
  { value: 'volume', label: 'Volume', description: 'Highest 24h volume' },
  { value: 'risk_score', label: 'Risk Score', description: 'Lowest risk' },
  { value: 'price_change', label: '24h Change', description: 'Biggest gainers' },
];

/**
 * Filter configuration
 */
interface FilterState {
  chain?: Chain;
  riskLevel?: RiskLevel;
  verificationTier?: VerificationTier;
  minMarketCap?: number;
  search?: string;
}

/**
 * Tokens Page Component
 */
export default function TokensPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters and sorting
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // Fetch tokens
  const fetchTokens = useCallback(async () => {
    setIsLoading(true);

    try {
      // Build query params
      const params = new URLSearchParams();

      // Pagination
      params.append('page', currentPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());

      // Sorting
      const sortField = getSortField(sortBy);
      params.append('sort_by', sortField);
      params.append('sort_order', sortBy === 'risk_score' ? 'asc' : 'desc');

      // Filters
      if (filters.chain) {
        params.append('chain', filters.chain);
      }
      if (filters.riskLevel) {
        params.append('risk_level', filters.riskLevel);
      }
      if (filters.verificationTier) {
        params.append('verification_tier', filters.verificationTier);
      }
      if (filters.minMarketCap) {
        params.append('min_market_cap', filters.minMarketCap.toString());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      // Fetch from API (you'll need to create this endpoint)
      const response = await fetch(`/api/tokens?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        if (currentPage === 1) {
          setTokens(data.data);
        } else {
          setTokens((prev) => [...prev, ...data.data]);
        }
        setTotalTokens(data.pagination.total);
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, filters, currentPage]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  /**
   * Get sort field for API
   */
  function getSortField(sort: SortOption): string {
    const fieldMap: Record<SortOption, string> = {
      newest: 'created_at',
      market_cap: 'market_cap',
      volume: 'volume_24h',
      risk_score: 'risk_score',
      price_change: 'price_change_24h',
    };
    return fieldMap[sort];
  }

  /**
   * Handle search
   */
  function handleSearch(value: string) {
    setSearchQuery(value);
    setFilters((prev) => ({ ...prev, search: value || undefined }));
    setCurrentPage(1);
  }

  /**
   * Handle sort change
   */
  function handleSortChange(option: SortOption) {
    setSortBy(option);
    setCurrentPage(1);
  }

  /**
   * Handle filter change
   */
  function handleFilterChange(key: keyof FilterState, value: any) {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1);
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    setFilters({});
    setSearchQuery('');
    setSortBy('newest');
    setCurrentPage(1);
  }

  /**
   * Load more tokens
   */
  function loadMore() {
    setCurrentPage((prev) => prev + 1);
  }

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-900">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Explore Tokens
          </h1>
          <p className="text-gray-400">
            Discover and trade tokens with bonding curve pricing
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tokens by name or symbol..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Button */}
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="primary"
                  className="ml-2 px-1.5 py-0.5 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 flex-1">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Sort by:</span>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      sortBy === option.value
                        ? 'bg-accent-purple text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 space-y-6">
              {/* Chain Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Chain
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['solana', 'base', 'bnb'] as Chain[]).map((chain) => (
                    <button
                      key={chain}
                      onClick={() =>
                        handleFilterChange(
                          'chain',
                          filters.chain === chain ? undefined : chain
                        )
                      }
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                        filters.chain === chain
                          ? 'bg-accent-purple text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      )}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Risk Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['low', 'medium', 'high', 'critical'] as RiskLevel[]).map(
                    (level) => (
                      <button
                        key={level}
                        onClick={() =>
                          handleFilterChange(
                            'riskLevel',
                            filters.riskLevel === level ? undefined : level
                          )
                        }
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                          filters.riskLevel === level
                            ? 'bg-accent-purple text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        )}
                      >
                        {level}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Verification Tier Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Verification
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['free', 'verified', 'premium'] as VerificationTier[]).map(
                    (tier) => (
                      <button
                        key={tier}
                        onClick={() =>
                          handleFilterChange(
                            'verificationTier',
                            filters.verificationTier === tier ? undefined : tier
                          )
                        }
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                          filters.verificationTier === tier
                            ? 'bg-accent-purple text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        )}
                      >
                        {tier}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Market Cap Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Minimum Market Cap
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '$10K', value: 10000 },
                    { label: '$100K', value: 100000 },
                    { label: '$1M', value: 1000000 },
                    { label: '$10M', value: 10000000 },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleFilterChange(
                          'minMarketCap',
                          filters.minMarketCap === option.value
                            ? undefined
                            : option.value
                        )
                      }
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        filters.minMarketCap === option.value
                          ? 'bg-accent-purple text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      )}
                    >
                      {option.label}+
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6 text-sm text-gray-400">
            Showing {tokens.length} of {totalTokens.toLocaleString()} tokens
          </div>
        )}

        {/* Token Grid */}
        {isLoading && currentPage === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <TokenCardSkeleton key={i} variant="default" />
            ))}
          </div>
        ) : tokens.length === 0 ? (
          <EmptyState
            title="No tokens found"
            description="Try adjusting your filters or search query"
            action={
              activeFiltersCount > 0
                ? {
                    label: 'Clear Filters',
                    onClick: clearFilters,
                    variant: 'primary' as const,
                  }
                : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tokens.map((token) => (
                <TokenCard
                  key={token.id}
                  token={token}
                  showSecurityBadge={true}
                  variant="default"
                  className="transition-transform hover:scale-105"
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
