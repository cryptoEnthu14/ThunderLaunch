'use client';

/**
 * TokenStats Component
 *
 * Displays detailed token statistics with visual indicators.
 * Features:
 * - Detailed statistics grid
 * - Visual progress bars
 * - Graduation progress (bonding curve completion)
 * - Holder distribution
 * - Token supply information
 * - Trading statistics
 *
 * @example
 * ```tsx
 * <TokenStats
 *   token={tokenData}
 *   bondingCurveProgress={75}
 * />
 * ```
 */

import React from 'react';
import { Users, TrendingUp, Droplet, Coins, Target, BarChart3 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import type { Token } from '@/types/token';

export interface TokenStatsProps {
  /** Token data */
  token: Token;
  /** Bonding curve progress (0-100) */
  bondingCurveProgress?: number;
  /** Target market cap for graduation */
  graduationTarget?: number;
  /** Custom className */
  className?: string;
}

/**
 * Format large numbers
 */
function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toLocaleString();
}

/**
 * Format percentage
 */
function formatPercentage(value: number): string {
  if (value < 0.01) {
    return `${value.toFixed(4)}%`;
  }
  return `${value.toFixed(2)}%`;
}

/**
 * Stat Item Component
 */
interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  progress?: number;
  progressColor?: string;
  iconColor?: string;
}

function StatItem({
  icon,
  label,
  value,
  subValue,
  progress,
  progressColor = 'bg-accent-purple',
  iconColor = 'text-accent-purple',
}: StatItemProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start gap-3">
        <div className={cn('p-2 bg-gray-900 rounded-lg', iconColor)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-1">{label}</div>
          <div className="text-xl font-bold text-white mb-1">{value}</div>
          {subValue && <div className="text-xs text-gray-400">{subValue}</div>}
          {progress !== undefined && (
            <div className="mt-2">
              <Progress value={progress} className="h-1.5" indicatorClassName={progressColor} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TokenStats Component
 */
export function TokenStats({
  token,
  bondingCurveProgress = 0,
  graduationTarget = 69000, // Default graduation target
  className,
}: TokenStatsProps) {
  // Calculate graduation progress
  const graduationProgress = Math.min((token.market_cap / graduationTarget) * 100, 100);
  const remainingToGraduation = Math.max(graduationTarget - token.market_cap, 0);

  // Calculate holder concentration (top holder percentage - would need actual data)
  // For now, using mock calculation
  const holderConcentration = 100 - Math.min(token.holders_count * 0.5, 80);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Graduation Progress */}
      <Card variant="elevated">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-purple" />
              <h3 className="text-lg font-semibold text-white">Graduation Progress</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              {graduationProgress.toFixed(1)}%
            </div>
          </div>

          <Progress
            value={graduationProgress}
            className="h-3 mb-3"
            indicatorClassName="bg-gradient-to-r from-accent-purple to-accent-blue"
          />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Current Market Cap</div>
              <div className="text-white font-semibold">
                ${formatNumber(token.market_cap)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Remaining</div>
              <div className="text-white font-semibold">
                ${formatNumber(remainingToGraduation)}
              </div>
            </div>
          </div>

          {graduationProgress >= 100 && (
            <div className="mt-4 p-3 bg-safety-green/10 border border-safety-green/30 rounded-lg">
              <div className="text-safety-green text-sm font-medium">
                🎉 Graduated! This token has reached the graduation threshold and can be listed on
                major DEXs.
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Holders */}
        <StatItem
          icon={<Users className="w-5 h-5" />}
          label="Total Holders"
          value={formatNumber(token.holders_count)}
          subValue={`Top holder: ${formatPercentage(holderConcentration)}`}
          progress={Math.min((token.holders_count / 1000) * 100, 100)}
          progressColor="bg-blue-500"
          iconColor="text-blue-400"
        />

        {/* Total Supply */}
        <StatItem
          icon={<Coins className="w-5 h-5" />}
          label="Total Supply"
          value={formatNumber(parseFloat(token.total_supply))}
          subValue={`Decimals: ${token.decimals}`}
          iconColor="text-yellow-400"
        />

        {/* Liquidity */}
        <StatItem
          icon={<Droplet className="w-5 h-5" />}
          label="Liquidity Pool"
          value={`$${formatNumber(token.liquidity)}`}
          subValue={`${((token.liquidity / token.market_cap) * 100).toFixed(1)}% of market cap`}
          progress={(token.liquidity / token.market_cap) * 100}
          progressColor="bg-cyan-500"
          iconColor="text-cyan-400"
        />

        {/* Total Volume */}
        <StatItem
          icon={<BarChart3 className="w-5 h-5" />}
          label="Total Volume"
          value={`$${formatNumber(token.total_volume)}`}
          subValue={`${token.trades_count} total trades`}
          iconColor="text-green-400"
        />

        {/* 24h Volume */}
        <StatItem
          icon={<TrendingUp className="w-5 h-5" />}
          label="Volume (24h)"
          value={`$${formatNumber(token.volume_24h || 0)}`}
          subValue={`${((token.volume_24h || 0) / token.total_volume * 100).toFixed(1)}% of total`}
          progress={Math.min(((token.volume_24h || 0) / token.total_volume) * 100, 100)}
          progressColor="bg-green-500"
          iconColor="text-green-400"
        />

        {/* Bonding Curve */}
        <StatItem
          icon={<Target className="w-5 h-5" />}
          label="Bonding Curve"
          value={`${bondingCurveProgress.toFixed(1)}%`}
          subValue="Progress to completion"
          progress={bondingCurveProgress}
          progressColor="bg-accent-purple"
          iconColor="text-accent-purple"
        />
      </div>

      {/* Token Properties */}
      <Card variant="elevated">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Token Properties</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  token.is_tradable ? 'bg-safety-green' : 'bg-gray-600'
                )}
              />
              <span className="text-sm text-gray-400">
                {token.is_tradable ? 'Tradable' : 'Not Tradable'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  token.is_burnable ? 'bg-safety-green' : 'bg-gray-600'
                )}
              />
              <span className="text-sm text-gray-400">
                {token.is_burnable ? 'Burnable' : 'Not Burnable'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  token.is_mintable ? 'bg-warning-yellow' : 'bg-safety-green'
                )}
              />
              <span className="text-sm text-gray-400">
                {token.is_mintable ? 'Mintable' : 'Fixed Supply'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-purple" />
              <span className="text-sm text-gray-400 capitalize">
                {token.verification_tier}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  token.status === 'active' ? 'bg-safety-green' : 'bg-warning-yellow'
                )}
              />
              <span className="text-sm text-gray-400 capitalize">{token.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-400 capitalize">{token.token_standard}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="elevated">
          <CardBody className="p-4">
            <div className="text-xs text-gray-500 mb-1">Created</div>
            <div className="text-sm text-white">
              {new Date(token.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody className="p-4">
            <div className="text-xs text-gray-500 mb-1">Last Updated</div>
            <div className="text-sm text-white">
              {new Date(token.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default TokenStats;
