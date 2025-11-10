'use client';

/**
 * TokenHeader Component
 *
 * Displays token branding, key metrics, and action buttons.
 * Features:
 * - Large token image
 * - Name, symbol, chain badge
 * - Creator information with link to Solscan
 * - Social links (Twitter, Telegram, Discord, Website)
 * - Action buttons (Share, Watchlist, Report)
 * - Key metrics (Price, Market Cap, 24h Change, Liquidity)
 * - Security badge integration
 *
 * @example
 * ```tsx
 * <TokenHeader
 *   token={tokenData}
 *   securityCheck={securityCheckData}
 * />
 * ```
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ExternalLink,
  Twitter,
  Send,
  MessageCircle,
  Globe,
  Share2,
  Star,
  Flag,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SecurityBadge } from '@/components/security';
import { cn } from '@/lib/utils';
import type { Token, Chain } from '@/types/token';
import type { SecurityCheck } from '@/types/security';

export interface TokenHeaderProps {
  /** Token data */
  token: Token;
  /** Security check data */
  securityCheck?: SecurityCheck;
  /** Loading state */
  isLoading?: boolean;
  /** Callback when share is clicked */
  onShare?: () => void;
  /** Callback when watchlist is clicked */
  onWatchlist?: () => void;
  /** Callback when report is clicked */
  onReport?: () => void;
}

/**
 * Get chain configuration
 */
function getChainConfig(chain: Chain): { label: string; className: string; explorer: string } {
  const configs = {
    solana: {
      label: 'SOLANA',
      className: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      explorer: 'https://solscan.io',
    },
    base: {
      label: 'BASE',
      className: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      explorer: 'https://basescan.org',
    },
    bnb: {
      label: 'BNB CHAIN',
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      explorer: 'https://bscscan.com',
    },
  };
  return configs[chain];
}

/**
 * Format large numbers
 */
function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format price
 */
function formatPrice(value: number): string {
  if (value < 0.000001) {
    return `$${value.toFixed(9)}`;
  }
  if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  }
  if (value < 1) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format address for display
 */
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * TokenHeader Component
 */
export function TokenHeader({
  token,
  securityCheck,
  isLoading = false,
  onShare,
  onWatchlist,
  onReport,
}: TokenHeaderProps) {
  const [copied, setCopied] = useState(false);

  const chainConfig = getChainConfig(token.chain);

  /**
   * Copy address to clipboard
   */
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.mint_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Branding & Actions */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Token Branding */}
        <div className="flex gap-4">
          {/* Token Image */}
          <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-gray-700 flex-shrink-0">
            {token.image_url ? (
              <Image
                src={token.image_url}
                alt={token.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl lg:text-5xl font-bold">
                {token.symbol.charAt(0)}
              </div>
            )}
          </div>

          {/* Token Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                {token.name}
              </h1>
              <span
                className={cn(
                  'px-3 py-1 text-sm font-semibold rounded-lg border uppercase',
                  chainConfig.className
                )}
              >
                {chainConfig.label}
              </span>
              {securityCheck && (
                <SecurityBadge
                  riskLevel={securityCheck.risk_level}
                  riskScore={securityCheck.risk_score}
                  size="lg"
                />
              )}
            </div>

            <div className="flex items-center gap-3 text-lg text-gray-400 mb-3">
              <span className="font-mono font-semibold text-white">
                ${token.symbol}
              </span>
              <span className="text-gray-600">•</span>
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 hover:text-white transition-colors group"
              >
                <span className="font-mono text-sm">
                  {formatAddress(token.mint_address)}
                </span>
                {copied ? (
                  <Check className="w-4 h-4 text-safety-green" />
                ) : (
                  <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              <Link
                href={`${chainConfig.explorer}/token/${token.mint_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-purple hover:text-accent-purple-light transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Creator */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <span>Created by</span>
              <Link
                href={`${chainConfig.explorer}/account/${token.creator_wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-accent-purple hover:text-accent-purple-light transition-colors"
              >
                {formatAddress(token.creator_wallet)}
              </Link>
            </div>

            {/* Social Links */}
            {(token.website_url ||
              token.twitter_handle ||
              token.telegram_url ||
              token.discord_url) && (
              <div className="flex items-center gap-2 flex-wrap">
                {token.website_url && (
                  <Link
                    href={token.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Website"
                  >
                    <Globe className="w-4 h-4 text-gray-300" />
                  </Link>
                )}
                {token.twitter_handle && (
                  <Link
                    href={`https://twitter.com/${token.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Twitter"
                  >
                    <Twitter className="w-4 h-4 text-gray-300" />
                  </Link>
                )}
                {token.telegram_url && (
                  <Link
                    href={token.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Telegram"
                  >
                    <Send className="w-4 h-4 text-gray-300" />
                  </Link>
                )}
                {token.discord_url && (
                  <Link
                    href={token.discord_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Discord"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-300" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex lg:flex-col gap-2 lg:ml-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={onShare}
            className="flex-1 lg:flex-initial"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onWatchlist}
            className="flex-1 lg:flex-initial"
          >
            <Star className="w-4 h-4 mr-2" />
            Watchlist
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={onReport}
            className="flex-1 lg:flex-initial text-gray-400 hover:text-danger-red"
          >
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Price */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Price</div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatPrice(token.current_price)}
          </div>
          {token.price_change_24h !== undefined && token.price_change_24h !== null && (
            <div
              className={cn(
                'text-sm flex items-center gap-1',
                token.price_change_24h >= 0 ? 'text-safety-green' : 'text-danger-red'
              )}
            >
              {token.price_change_24h >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(token.price_change_24h).toFixed(2)}% (24h)
            </div>
          )}
        </div>

        {/* Market Cap */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Market Cap</div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(token.market_cap)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            FDV: {formatNumber(token.market_cap)}
          </div>
        </div>

        {/* Liquidity */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Liquidity</div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(token.liquidity)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((token.liquidity / token.market_cap) * 100).toFixed(1)}% of MC
          </div>
        </div>

        {/* Volume 24h */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Volume (24h)</div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(token.volume_24h || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {token.trades_count || 0} trades
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokenHeader;
