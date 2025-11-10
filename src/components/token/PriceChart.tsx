'use client';

/**
 * Price Chart Component
 *
 * Interactive price chart using Recharts library.
 * Features:
 * - Line chart for price history
 * - Volume bars
 * - Time period selector (1H, 24H, 7D, 30D)
 * - Responsive design
 * - Tooltips with detailed information
 * - Auto-refresh capability
 *
 * @example
 * ```tsx
 * <PriceChart
 *   tokenAddress="So11111..."
 *   tokenSymbol="THDR"
 *   priceHistory={historyData}
 * />
 * ```
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import type { TokenPriceHistory } from '@/types/token';

export interface PriceChartProps {
  /** Token address */
  tokenAddress: string;
  /** Token symbol */
  tokenSymbol: string;
  /** Price history data */
  priceHistory: TokenPriceHistory[];
  /** Show volume chart */
  showVolume?: boolean;
  /** Auto-refresh interval in ms (0 = disabled) */
  autoRefresh?: number;
  /** On period change callback */
  onPeriodChange?: (period: TimePeriod) => void;
  /** Custom className */
  className?: string;
}

export type TimePeriod = '1H' | '24H' | '7D' | '30D';

interface ChartDataPoint {
  timestamp: string;
  price: number;
  volume: number;
  marketCap: number;
  liquidity: number;
  formattedTime: string;
}

/**
 * Custom tooltip component for the chart
 */
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as ChartDataPoint;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-xs text-gray-400 mb-2">{data.formattedTime}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">Price:</span>
          <span className="text-sm font-semibold text-white">
            ${data.price.toFixed(6)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">Volume:</span>
          <span className="text-sm font-semibold text-white">
            ${data.volume.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">Market Cap:</span>
          <span className="text-sm font-semibold text-white">
            ${data.marketCap.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">Liquidity:</span>
          <span className="text-sm font-semibold text-white">
            ${data.liquidity.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Format timestamp based on selected period
 */
function formatTimeByPeriod(timestamp: string, period: TimePeriod): string {
  const date = parseISO(timestamp);

  switch (period) {
    case '1H':
      return format(date, 'HH:mm');
    case '24H':
      return format(date, 'HH:mm');
    case '7D':
      return format(date, 'MMM dd');
    case '30D':
      return format(date, 'MMM dd');
    default:
      return format(date, 'MMM dd, HH:mm');
  }
}

/**
 * Format timestamp for tooltip
 */
function formatTimeForTooltip(timestamp: string): string {
  const date = parseISO(timestamp);
  return format(date, 'MMM dd, yyyy HH:mm:ss');
}

/**
 * PriceChart Component
 */
export function PriceChart({
  tokenAddress,
  tokenSymbol,
  priceHistory,
  showVolume = true,
  autoRefresh = 0,
  onPeriodChange,
  className,
}: PriceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('24H');

  // Time period options
  const periods: TimePeriod[] = ['1H', '24H', '7D', '30D'];

  // Prepare chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return priceHistory.map((point) => ({
      timestamp: point.timestamp,
      price: point.price_usd,
      volume: point.volume,
      marketCap: point.market_cap,
      liquidity: point.liquidity,
      formattedTime: formatTimeForTooltip(point.timestamp),
    }));
  }, [priceHistory]);

  // Calculate price change
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { value: 0, percentage: 0 };

    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    const value = lastPrice - firstPrice;
    const percentage = (value / firstPrice) * 100;

    return { value, percentage };
  }, [chartData]);

  // Determine chart color based on price change
  const chartColor = priceChange.percentage >= 0 ? '#10B981' : '#EF4444';
  const isPositive = priceChange.percentage >= 0;

  // Handle period change
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  // Calculate Y-axis domain with padding
  const priceDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 1];

    const prices = chartData.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * 0.1;

    return [
      Math.max(0, minPrice - padding),
      maxPrice + padding,
    ];
  }, [chartData]);

  // Calculate volume domain
  const volumeDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 1];

    const volumes = chartData.map((d) => d.volume);
    const maxVolume = Math.max(...volumes);

    return [0, maxVolume * 1.1];
  }, [chartData]);

  // Auto-refresh effect
  React.useEffect(() => {
    if (autoRefresh > 0) {
      const interval = setInterval(() => {
        onPeriodChange?.(selectedPeriod);
      }, autoRefresh);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedPeriod, onPeriodChange]);

  return (
    <Card variant="elevated" className={cn('overflow-hidden', className)}>
      <CardBody className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {tokenSymbol} Price Chart
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  $
                  {chartData.length > 0
                    ? chartData[chartData.length - 1].price.toFixed(6)
                    : '0.000000'}
                </span>
                {chartData.length > 1 && (
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      isPositive ? 'text-safety-green' : 'text-danger-red'
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">
                      {isPositive ? '+' : ''}
                      {priceChange.percentage.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Time Period Selector */}
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    selectedPeriod === period
                      ? 'bg-accent-purple text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="p-4">
          {chartData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-400">
              No price data available
            </div>
          ) : (
            <div className="space-y-6">
              {/* Price Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={chartColor}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={chartColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) =>
                        formatTimeByPeriod(timestamp, selectedPeriod)
                      }
                      stroke="#6B7280"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={priceDomain}
                      tickFormatter={(value) => `$${value.toFixed(4)}`}
                      stroke="#6B7280"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={chartColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: chartColor }}
                      fill="url(#priceGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Volume Chart */}
              {showVolume && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">
                    Volume
                  </h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(timestamp) =>
                            formatTimeByPeriod(timestamp, selectedPeriod)
                          }
                          stroke="#6B7280"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={volumeDomain}
                          tickFormatter={(value) => {
                            if (value >= 1_000_000) {
                              return `$${(value / 1_000_000).toFixed(1)}M`;
                            }
                            if (value >= 1_000) {
                              return `$${(value / 1_000).toFixed(1)}K`;
                            }
                            return `$${value}`;
                          }}
                          stroke="#6B7280"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickLine={false}
                          width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="volume"
                          fill="#8B5CF6"
                          opacity={0.6}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {chartData.length > 0 && (
          <div className="p-4 bg-gray-800/50 border-t border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                <p className="text-sm font-semibold text-white">
                  $
                  {chartData[chartData.length - 1].marketCap.toLocaleString(
                    undefined,
                    { maximumFractionDigits: 0 }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                <p className="text-sm font-semibold text-white">
                  $
                  {chartData[chartData.length - 1].volume.toLocaleString(
                    undefined,
                    { maximumFractionDigits: 0 }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Liquidity</p>
                <p className="text-sm font-semibold text-white">
                  $
                  {chartData[chartData.length - 1].liquidity.toLocaleString(
                    undefined,
                    { maximumFractionDigits: 0 }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Data Points</p>
                <p className="text-sm font-semibold text-white">
                  {chartData.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * Price Chart Skeleton Loader
 */
export function PriceChartSkeleton() {
  return (
    <Card variant="elevated" className="animate-pulse">
      <CardBody className="p-0">
        <div className="p-4 border-b border-gray-700">
          <div className="h-6 bg-gray-700 rounded w-32 mb-2" />
          <div className="h-8 bg-gray-700 rounded w-48" />
        </div>
        <div className="p-4">
          <div className="h-80 bg-gray-800 rounded" />
        </div>
        <div className="p-4 bg-gray-800/50 border-t border-gray-700">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-3 bg-gray-700 rounded w-16 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default PriceChart;
