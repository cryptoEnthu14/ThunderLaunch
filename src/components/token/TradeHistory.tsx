'use client';

/**
 * Trade History Component
 *
 * Displays a list of recent trades for a token.
 * Features:
 * - Real-time trade updates
 * - Pagination support
 * - Trade type indicators (buy/sell)
 * - User address display
 * - Time and amount information
 * - Responsive table/card layout
 * - Transaction link to explorer
 *
 * @example
 * ```tsx
 * <TradeHistory
 *   tokenAddress="So11111..."
 *   trades={tradesData}
 *   onLoadMore={() => {}}
 * />
 * ```
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Trade, TradeType } from '@/types/trade';

export interface TradeHistoryProps {
  /** Token address */
  tokenAddress: string;
  /** Token symbol */
  tokenSymbol?: string;
  /** List of trades */
  trades: Trade[];
  /** Total number of trades */
  totalTrades?: number;
  /** Current page */
  currentPage?: number;
  /** Items per page */
  itemsPerPage?: number;
  /** On page change callback */
  onPageChange?: (page: number) => void;
  /** On refresh callback */
  onRefresh?: () => void;
  /** Is loading */
  isLoading?: boolean;
  /** Show pagination */
  showPagination?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Format wallet address for display
 */
function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Format number with appropriate decimals
 */
function formatNumber(value: number, decimals: number = 2): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * Get Solana explorer URL for transaction
 */
function getExplorerUrl(signature: string, cluster: string = 'mainnet-beta'): string {
  return `https://solscan.io/tx/${signature}${cluster !== 'mainnet-beta' ? `?cluster=${cluster}` : ''}`;
}

/**
 * Trade Row Component for desktop view
 */
interface TradeRowProps {
  trade: Trade;
  tokenSymbol: string;
}

function TradeRow({ trade, tokenSymbol }: TradeRowProps) {
  const isBuy = trade.trade_type === 'buy';

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
      {/* Trade Type */}
      <td className="px-4 py-3">
        <Badge variant={isBuy ? 'success' : 'error'} className="font-semibold">
          <div className="flex items-center gap-1">
            {isBuy ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isBuy ? 'Buy' : 'Sell'}
          </div>
        </Badge>
      </td>

      {/* User */}
      <td className="px-4 py-3">
        <a
          href={getExplorerUrl(trade.wallet_address)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-purple hover:text-accent-purple-light font-mono text-sm transition-colors"
        >
          {formatAddress(trade.wallet_address)}
        </a>
      </td>

      {/* Token Amount */}
      <td className="px-4 py-3">
        <div className="text-white font-medium">
          {formatNumber(parseFloat(trade.token_amount), 2)} {tokenSymbol}
        </div>
      </td>

      {/* SOL Amount */}
      <td className="px-4 py-3">
        <div className="text-white font-medium">
          {trade.native_amount.toFixed(4)} SOL
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        <div className="text-gray-300">
          ${trade.price_usd.toFixed(6)}
        </div>
      </td>

      {/* USD Value */}
      <td className="px-4 py-3">
        <div className="text-white font-medium">
          ${formatNumber(trade.usd_amount, 2)}
        </div>
      </td>

      {/* Time */}
      <td className="px-4 py-3">
        <div className="text-gray-400 text-sm">
          {formatDistanceToNow(parseISO(trade.created_at), { addSuffix: true })}
        </div>
      </td>

      {/* Transaction */}
      <td className="px-4 py-3">
        {trade.transaction_signature && (
          <a
            href={getExplorerUrl(trade.transaction_signature)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </td>
    </tr>
  );
}

/**
 * Trade Card Component for mobile view
 */
function TradeCard({ trade, tokenSymbol }: TradeRowProps) {
  const isBuy = trade.trade_type === 'buy';

  return (
    <Card variant="ghost" className="mb-3">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={isBuy ? 'success' : 'error'} className="font-semibold">
              <div className="flex items-center gap-1">
                {isBuy ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isBuy ? 'Buy' : 'Sell'}
              </div>
            </Badge>
            <a
              href={getExplorerUrl(trade.wallet_address)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-purple hover:text-accent-purple-light font-mono text-sm transition-colors"
            >
              {formatAddress(trade.wallet_address)}
            </a>
          </div>
          <div className="text-xs text-gray-400">
            {formatDistanceToNow(parseISO(trade.created_at), { addSuffix: true })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Amount</p>
            <p className="text-sm font-semibold text-white">
              {formatNumber(parseFloat(trade.token_amount), 2)} {tokenSymbol}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">SOL</p>
            <p className="text-sm font-semibold text-white">
              {trade.native_amount.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Price</p>
            <p className="text-sm font-semibold text-white">
              ${trade.price_usd.toFixed(6)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">USD Value</p>
            <p className="text-sm font-semibold text-white">
              ${formatNumber(trade.usd_amount, 2)}
            </p>
          </div>
        </div>

        {trade.transaction_signature && (
          <a
            href={getExplorerUrl(trade.transaction_signature)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-purple-light transition-colors"
          >
            View Transaction
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * TradeHistory Component
 */
export function TradeHistory({
  tokenAddress,
  tokenSymbol = 'TOKEN',
  trades,
  totalTrades,
  currentPage = 1,
  itemsPerPage = 20,
  onPageChange,
  onRefresh,
  isLoading = false,
  showPagination = true,
  className,
}: TradeHistoryProps) {
  const totalPages = totalTrades ? Math.ceil(totalTrades / itemsPerPage) : 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <Card variant="elevated" className={cn('overflow-hidden', className)}>
      <CardBody className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Trades</h3>
              {totalTrades !== undefined && (
                <p className="text-sm text-gray-400 mt-1">
                  {totalTrades.toLocaleString()} total trades
                </p>
              )}
            </div>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn('w-4 h-4', isLoading && 'animate-spin')}
                />
              </Button>
            )}
          </div>
        </div>

        {/* Trade List */}
        {trades.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">No trades yet</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                      SOL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                      USD Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                      Tx
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <TradeRow
                      key={trade.id}
                      trade={trade}
                      tokenSymbol={tokenSymbol}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden p-4">
              {trades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  tokenSymbol={tokenSymbol}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={!hasPrevPage || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={!hasNextPage || isLoading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * Trade History Skeleton Loader
 */
export function TradeHistorySkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card variant="elevated" className="animate-pulse">
      <CardBody className="p-0">
        <div className="p-4 border-b border-gray-700">
          <div className="h-6 bg-gray-700 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-700 rounded w-24" />
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-6 bg-gray-700 rounded w-16" />
                  <div className="h-4 bg-gray-700 rounded w-24" />
                  <div className="h-4 bg-gray-700 rounded w-20" />
                </div>
                <div className="h-4 bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default TradeHistory;
