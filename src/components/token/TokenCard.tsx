'use client';

/**
 * Token Card Component
 *
 * Displays token information with integrated security badge and report.
 * Features:
 * - Token image, name, symbol, price, market cap
 * - Integrated SecurityBadge showing risk level
 * - "View Security Report" button with modal
 * - SecurityWarning for high-risk tokens
 * - Responsive design with hover effects
 *
 * @example
 * ```tsx
 * <TokenCard
 *   token={{
 *     id: '123',
 *     mint_address: 'So11111...',
 *     name: 'Example Token',
 *     symbol: 'EXPL',
 *     image_url: 'https://...',
 *     current_price: 0.05,
 *     market_cap: 1000000,
 *     price_change_24h: 5.2,
 *   }}
 *   showSecurityBadge={true}
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, TrendingUp, TrendingDown, Shield, AlertTriangle, Wifi } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SecurityBadge, SecurityWarning } from '@/components/security';
import { SecurityReport } from '@/components/security/SecurityReport';
import { useSecurityCheck } from '@/hooks/useSecurityCheck';
import { useRealtimeTokens } from '@/hooks/useRealtimeTokens';
import { cn } from '@/lib/utils';
import type { Token, Chain } from '@/types/token';

export interface TokenCardProps {
  /** Token data */
  token: Token;
  /** Show security badge */
  showSecurityBadge?: boolean;
  /** Show security warning for high-risk tokens */
  showSecurityWarning?: boolean;
  /** Card variant */
  variant?: 'default' | 'compact';
  /** Custom className */
  className?: string;
  /** Click handler for card */
  onClick?: () => void;
}

/**
 * Format large numbers with K, M, B suffixes
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
 * Format price with appropriate decimal places
 */
function formatPrice(value: number): string {
  if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  }
  if (value < 1) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Get chain badge configuration
 */
function getChainConfig(chain: Chain): { label: string; className: string } {
  const configs = {
    solana: {
      label: 'SOL',
      className: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    base: {
      label: 'BASE',
      className: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    bnb: {
      label: 'BNB',
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    },
  };
  return configs[chain];
}

/**
 * TokenCard Component
 *
 * Displays token information with security badge and report functionality
 */
export function TokenCard({
  token: initialToken,
  showSecurityBadge = true,
  showSecurityWarning = true,
  variant = 'default',
  className,
  onClick,
}: TokenCardProps) {
  const [showSecurityReport, setShowSecurityReport] = useState(false);
  const [securityAcknowledged, setSecurityAcknowledged] = useState(false);
  const [token, setToken] = useState(initialToken);
  const [showLiveIndicator, setShowLiveIndicator] = useState(false);

  // Real-time token updates
  const { updatedTokens, isConnected } = useRealtimeTokens({
    maxUpdates: 1,
    onTokenUpdate: (updatedToken: Token) => {
      // Only update if it's the same token
      if (updatedToken.id === initialToken.id || updatedToken.mint_address === initialToken.mint_address) {
        setToken(updatedToken);
        // Show live indicator briefly
        setShowLiveIndicator(true);
        setTimeout(() => setShowLiveIndicator(false), 2000);
      }
    },
  });

  // Update token when initialToken changes
  useEffect(() => {
    setToken(initialToken);
  }, [initialToken]);

  // Fetch security check data
  const { securityData, securityCheck, isLoading: isLoadingSecurityCheck } = useSecurityCheck({
    tokenAddress: token.mint_address,
    tokenId: token.id,
    marketCap: token.market_cap || 0,
    tokenName: token.name,
    tokenSymbol: token.symbol,
    enabled: showSecurityBadge,
  });

  const isHighRisk = securityCheck && (securityCheck.risk_level === 'high' || securityCheck.risk_level === 'critical');
  const shouldShowWarning = showSecurityWarning && isHighRisk && !securityAcknowledged;

  /**
   * Render compact variant
   */
  if (variant === 'compact') {
    return (
      <>
        <Card
          variant="ghost"
          hoverable
          className={cn('cursor-pointer transition-all duration-200', className)}
          onClick={onClick}
        >
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              {/* Token Image */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                {token.image_url ? (
                  <Image
                    src={token.image_url}
                    alt={token.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                    {token.symbol.charAt(0)}
                  </div>
                )}
              </div>

              {/* Token Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-white truncate">
                    {token.name}
                  </h3>
                  {showSecurityBadge && securityCheck && !isLoadingSecurityCheck && (
                    <SecurityBadge
                      riskLevel={securityCheck.risk_level}
                      riskScore={securityCheck.risk_score}
                      size="sm"
                      showLabel={false}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="font-mono">{token.symbol}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-[10px] font-semibold rounded border uppercase',
                      getChainConfig(token.chain).className
                    )}
                  >
                    {getChainConfig(token.chain).label}
                  </span>
                  {token.price_change_24h !== undefined && token.price_change_24h !== null && (
                    <span
                      className={cn(
                        'flex items-center gap-1',
                        token.price_change_24h >= 0 ? 'text-safety-green' : 'text-danger-red'
                      )}
                    >
                      {token.price_change_24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(token.price_change_24h).toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <div className={cn(
                    "text-base font-semibold text-white transition-colors",
                    showLiveIndicator && "text-blue-400"
                  )}>
                    {formatPrice(token.current_price || 0)}
                  </div>
                  {isConnected && (
                    <Wifi className="w-3 h-3 text-green-500" title="Live prices" />
                  )}
                </div>
                {token.market_cap !== undefined && token.market_cap !== null && (
                  <div className="text-xs text-gray-400">
                    {formatNumber(token.market_cap)}
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Security Report Modal */}
        {securityCheck && securityData && (
          <SecurityReport
            open={showSecurityReport}
            onOpenChange={setShowSecurityReport}
            securityCheck={securityCheck}
            tokenName={token.name}
            tokenSymbol={token.symbol}
            tokenAddress={token.mint_address}
          />
        )}
      </>
    );
  }

  /**
   * Render default variant
   */
  return (
    <>
      <Card
        variant="elevated"
        hoverable
        className={cn('overflow-hidden transition-all duration-200', className)}
      >
        <CardBody className="p-0">
          {/* Security Warning Banner */}
          {shouldShowWarning && securityCheck && (
            <div className="p-4 bg-red-950/20 border-b border-red-900/30">
              <SecurityWarning
                riskLevel={securityCheck.risk_level}
                riskScore={securityCheck.risk_score}
                criticalIssues={securityCheck.findings?.filter(f => f.severity === 'critical').map(f => f.title) || []}
                warnings={securityCheck.findings?.filter(f => f.result === 'warning').map(f => f.title) || []}
                onAcknowledge={() => setSecurityAcknowledged(true)}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              {/* Token Image */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                {token.image_url ? (
                  <Image
                    src={token.image_url}
                    alt={token.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                    {token.symbol.charAt(0)}
                  </div>
                )}
              </div>

              {/* Token Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white truncate">
                    {token.name}
                  </h3>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-semibold rounded border uppercase flex-shrink-0',
                      getChainConfig(token.chain).className
                    )}
                  >
                    {getChainConfig(token.chain).label}
                  </span>
                  {showSecurityBadge && securityCheck && !isLoadingSecurityCheck && (
                    <SecurityBadge
                      riskLevel={securityCheck.risk_level}
                      riskScore={securityCheck.risk_score}
                      size="md"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="font-mono font-semibold">{token.symbol}</span>
                  <span className="text-gray-600">•</span>
                  <span className="font-mono text-xs truncate">
                    {token.mint_address.slice(0, 4)}...{token.mint_address.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {token.description && (
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {token.description}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Price */}
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  Price
                  {isConnected && (
                    <Wifi className="w-2.5 h-2.5 text-green-500" title="Live prices" />
                  )}
                </div>
                <div className={cn(
                  "text-lg font-bold text-white transition-colors",
                  showLiveIndicator && "text-blue-400"
                )}>
                  {formatPrice(token.current_price || 0)}
                </div>
                {token.price_change_24h !== undefined && token.price_change_24h !== null && (
                  <div
                    className={cn(
                      'text-xs flex items-center gap-1 mt-1',
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
              <div>
                <div className="text-xs text-gray-500 mb-1">Market Cap</div>
                <div className={cn(
                  "text-lg font-bold text-white transition-colors",
                  showLiveIndicator && "text-blue-400"
                )}>
                  {formatNumber(token.market_cap || 0)}
                </div>
              </div>

              {/* Volume */}
              {token.volume_24h !== undefined && token.volume_24h !== null && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Volume (24h)</div>
                  <div className={cn(
                    "text-lg font-bold text-white transition-colors",
                    showLiveIndicator && "text-blue-400"
                  )}>
                    {formatNumber(token.volume_24h)}
                  </div>
                </div>
              )}

              {/* Supply */}
              {token.total_supply && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Supply</div>
                  <div className="text-lg font-bold text-white">
                    {formatNumber(parseInt(token.total_supply))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
              <Link href={`/token/${token.mint_address}`} className="flex-1">
                <Button variant="primary" fullWidth size="md">
                  View Details
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              {showSecurityBadge && securityCheck && !isLoadingSecurityCheck && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSecurityReport(true);
                  }}
                  className="flex-shrink-0"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Security Report Modal */}
      {securityCheck && securityData && (
        <SecurityReport
          open={showSecurityReport}
          onOpenChange={setShowSecurityReport}
          securityCheck={securityCheck}
          tokenName={token.name}
          tokenSymbol={token.symbol}
          tokenAddress={token.mint_address}
        />
      )}
    </>
  );
}

/**
 * Token Card Skeleton Loader
 */
export function TokenCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Card variant="ghost" className="animate-pulse">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-16" />
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-700 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-12" />
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="animate-pulse">
      <CardBody className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-700" />
          <div className="flex-1">
            <div className="h-6 bg-gray-700 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-700 rounded w-24" />
          </div>
        </div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-16 bg-gray-700 rounded" />
          <div className="h-16 bg-gray-700 rounded" />
        </div>
        <div className="h-10 bg-gray-700 rounded" />
      </CardBody>
    </Card>
  );
}

export default TokenCard;
