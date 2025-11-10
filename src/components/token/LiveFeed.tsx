/**
 * LiveFeed Component
 *
 * Displays live token activity feed with real-time updates.
 * Features:
 * - Real-time token launches
 * - Recent trade activity
 * - Animated entry transitions
 * - Auto-scroll or manual control
 * - Filter by activity type
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';
import { useRealtimeTrades } from '@/hooks/useRealtimeTrades';
import type { Token } from '@/types/token';
import type { Trade } from '@/types/trade';

// =============================================================================
// TYPES
// =============================================================================

export type ActivityType = 'all' | 'launches' | 'trades';

export interface LiveFeedProps {
  /** Filter by activity type */
  activityType?: ActivityType;
  /** Maximum items to display */
  maxItems?: number;
  /** Enable auto-scroll */
  autoScroll?: boolean;
  /** Show controls */
  showControls?: boolean;
  /** Height of the feed container */
  height?: string;
  /** Custom className */
  className?: string;
  /** Callback when token is clicked */
  onTokenClick?: (token: Token) => void;
  /** Callback when trade is clicked */
  onTradeClick?: (trade: Trade) => void;
}

interface ActivityItem {
  id: string;
  type: 'launch' | 'trade';
  timestamp: string;
  data: Token | Trade;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LiveFeed({
  activityType = 'all',
  maxItems = 50,
  autoScroll: initialAutoScroll = true,
  showControls = true,
  height = '600px',
  className = '',
  onTokenClick,
  onTradeClick,
}: LiveFeedProps) {
  // State
  const [autoScroll, setAutoScroll] = useState(initialAutoScroll);
  const [isPaused, setIsPaused] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Real-time hooks
  const {
    newTokens,
    isConnected: tokensConnected,
    isLoading: tokensLoading,
  } = useRealtimeTokens({
    maxUpdates: maxItems,
    onNewToken: (token) => {
      console.log('[LiveFeed] New token:', token.name);
    },
  });

  const {
    recentTrades,
    isConnected: tradesConnected,
    isLoading: tradesLoading,
  } = useRealtimeTrades({
    maxRecentTrades: maxItems,
    onTradeConfirmed: (trade) => {
      console.log('[LiveFeed] Trade confirmed:', trade.id);
    },
  });

  // Combine and sort activities
  const activities = React.useMemo(() => {
    const items: ActivityItem[] = [];

    // Add token launches
    if (activityType === 'all' || activityType === 'launches') {
      newTokens.forEach((token) => {
        items.push({
          id: `token-${token.id}`,
          type: 'launch',
          timestamp: token.created_at,
          data: token,
        });
      });
    }

    // Add trades
    if (activityType === 'all' || activityType === 'trades') {
      recentTrades.forEach((trade) => {
        items.push({
          id: `trade-${trade.id}`,
          type: 'trade',
          timestamp: trade.created_at,
          data: trade,
        });
      });
    }

    // Sort by timestamp (most recent first)
    return items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxItems);
  }, [newTokens, recentTrades, activityType, maxItems]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && !isPaused && feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [activities, autoScroll, isPaused]);

  // Connection status
  const isConnected = tokensConnected && tradesConnected;
  const isLoading = tokensLoading || tradesLoading;

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  // Render token launch item
  const renderTokenLaunch = (token: Token) => (
    <div
      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-l-4 border-green-500"
      onClick={() => onTokenClick?.(token)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <span className="text-xl">🚀</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {token.name}
            </h4>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
              NEW LAUNCH
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-mono">{token.symbol}</span>
            <span>•</span>
            <span>${token.current_price.toFixed(6)}</span>
            <span>•</span>
            <span className="text-xs">{formatTimeAgo(token.created_at)}</span>
          </div>
          {token.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {token.description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            ${(token.market_cap / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-gray-500">MCap</div>
        </div>
      </div>
    </div>
  );

  // Render trade item
  const renderTrade = (trade: Trade) => {
    const isBuy = trade.trade_type === 'buy';
    const borderColor = isBuy ? 'border-blue-500' : 'border-orange-500';
    const bgColor = isBuy
      ? 'bg-blue-100 dark:bg-blue-900'
      : 'bg-orange-100 dark:bg-orange-900';
    const textColor = isBuy
      ? 'text-blue-800 dark:text-blue-100'
      : 'text-orange-800 dark:text-orange-100';

    return (
      <div
        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-l-4 ${borderColor}`}
        onClick={() => onTradeClick?.(trade)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}
          >
            <span className="text-xl">{isBuy ? '💰' : '💸'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {isBuy ? 'BUY' : 'SELL'}
              </h4>
              <span className={`px-2 py-0.5 text-xs font-medium ${bgColor} ${textColor} rounded`}>
                {trade.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>{parseFloat(trade.token_amount).toFixed(2)} tokens</span>
              <span>•</span>
              <span>${trade.usd_amount.toFixed(2)}</span>
              <span>•</span>
              <span className="text-xs">{formatTimeAgo(trade.created_at)}</span>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 font-mono">
              {trade.wallet_address.slice(0, 6)}...{trade.wallet_address.slice(-4)}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              ${trade.price_usd.toFixed(6)}
            </div>
            <div className="text-xs text-gray-500">Price</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Live Activity Feed
            </h3>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isLoading ? 'Connecting...' : isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </div>

          {showControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  autoScroll
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {autoScroll ? '📌 Auto-scroll ON' : '📌 Auto-scroll OFF'}
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Launches:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{newTokens.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Trades:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {recentTrades.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Total:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {activities.length}
            </span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto"
        style={{ height }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">👀</div>
              <p className="text-sm">Waiting for activity...</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="animate-fade-in-down"
                style={{
                  animationDuration: '0.3s',
                  animationFillMode: 'both',
                }}
              >
                {activity.type === 'launch'
                  ? renderTokenLaunch(activity.data as Token)
                  : renderTrade(activity.data as Trade)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Export default for convenience
 */
export default LiveFeed;
