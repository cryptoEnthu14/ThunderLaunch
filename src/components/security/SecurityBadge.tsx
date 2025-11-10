'use client';

/**
 * Security Badge Component
 *
 * Visual badge displaying token risk level with color coding and tooltips.
 * Shows risk score and provides quick visual feedback about token safety.
 *
 * Color scheme:
 * - Low (0-24): Green
 * - Medium (25-49): Yellow
 * - High (50-74): Orange
 * - Critical (75-100): Red
 *
 * @example
 * ```tsx
 * <SecurityBadge
 *   riskLevel="low"
 *   riskScore={15}
 *   size="md"
 *   showScore={true}
 * />
 * ```
 */

import React from 'react';
import { Shield, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types/token';

export interface SecurityBadgeProps {
  /** Risk level of the token */
  riskLevel: RiskLevel;
  /** Risk score (0-100) */
  riskScore: number;
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Show risk score number */
  showScore?: boolean;
  /** Show label text */
  showLabel?: boolean;
  /** Custom className */
  className?: string;
  /** Show tooltip on hover */
  showTooltip?: boolean;
}

/**
 * Get color classes for risk level
 */
function getRiskColors(riskLevel: RiskLevel): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  const colors = {
    low: {
      bg: 'bg-green-950/50',
      border: 'border-safety-green/30',
      text: 'text-safety-green',
      icon: 'text-safety-green',
    },
    medium: {
      bg: 'bg-yellow-950/50',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: 'text-yellow-400',
    },
    high: {
      bg: 'bg-orange-950/50',
      border: 'border-warning-orange/30',
      text: 'text-warning-orange',
      icon: 'text-warning-orange',
    },
    critical: {
      bg: 'bg-red-950/50',
      border: 'border-danger-red/30',
      text: 'text-danger-red',
      icon: 'text-danger-red',
    },
  };

  return colors[riskLevel];
}

/**
 * Get icon for risk level
 */
function getRiskIcon(riskLevel: RiskLevel, size: number) {
  const iconProps = { className: `w-${size} h-${size}` };

  const icons = {
    low: <Shield {...iconProps} />,
    medium: <AlertCircle {...iconProps} />,
    high: <AlertTriangle {...iconProps} />,
    critical: <ShieldAlert {...iconProps} />,
  };

  return icons[riskLevel];
}

/**
 * Get risk level label
 */
function getRiskLabel(riskLevel: RiskLevel): string {
  const labels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };

  return labels[riskLevel];
}

/**
 * SecurityBadge Component
 *
 * Displays a color-coded badge indicating token security risk level
 */
export function SecurityBadge({
  riskLevel,
  riskScore,
  size = 'md',
  showScore = true,
  showLabel = true,
  className,
  showTooltip = true,
}: SecurityBadgeProps) {
  const colors = getRiskColors(riskLevel);
  const label = getRiskLabel(riskLevel);

  const sizes = {
    sm: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      icon: 3,
      gap: 'gap-1',
    },
    md: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 4,
      gap: 'gap-1.5',
    },
    lg: {
      padding: 'px-4 py-2',
      text: 'text-base',
      icon: 5,
      gap: 'gap-2',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border',
        sizeConfig.padding,
        sizeConfig.gap,
        colors.bg,
        colors.border,
        'transition-all duration-200',
        'hover:scale-105',
        'group relative',
        className
      )}
      role="status"
      aria-label={`Security: ${label} (Score: ${riskScore})`}
    >
      {/* Icon */}
      <span className={colors.icon}>
        {getRiskIcon(riskLevel, sizeConfig.icon)}
      </span>

      {/* Label */}
      {showLabel && (
        <span className={cn('font-semibold', colors.text, sizeConfig.text)}>
          {label}
        </span>
      )}

      {/* Score */}
      {showScore && (
        <span
          className={cn(
            'font-mono font-medium',
            colors.text,
            sizeConfig.text,
            'opacity-75'
          )}
        >
          {riskScore}/100
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Risk Level:</span>
              <span className={cn('font-semibold', colors.text)}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Risk Score:</span>
              <span className="text-white font-mono">{riskScore}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Safety:</span>
              <span className="text-white">{100 - riskScore}/100</span>
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

/**
 * Mini security badge for compact displays
 */
export function SecurityBadgeMini({
  riskLevel,
  riskScore,
  className,
}: Omit<SecurityBadgeProps, 'size' | 'showScore' | 'showLabel'>) {
  const colors = getRiskColors(riskLevel);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded-full border',
        colors.bg,
        colors.border,
        'group relative',
        className
      )}
      role="status"
      aria-label={`Risk: ${riskScore}/100`}
    >
      <span className={cn('text-xs font-bold', colors.text)}>
        {riskScore}
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap text-xs text-white">
        Risk: {riskScore}/100
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

/**
 * Inline security indicator (for tables/lists)
 */
export function SecurityIndicator({
  riskLevel,
  riskScore,
  compact = false,
}: {
  riskLevel: RiskLevel;
  riskScore: number;
  compact?: boolean;
}) {
  const colors = getRiskColors(riskLevel);
  const label = getRiskLabel(riskLevel);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full', colors.bg, colors.border, 'border')} />
        <span className={cn('text-xs font-medium', colors.text)}>{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-3 h-3 rounded-full', colors.bg, colors.border, 'border-2')} />
      <div className="flex flex-col">
        <span className={cn('text-sm font-semibold', colors.text)}>{label}</span>
        <span className="text-xs text-gray-500">{riskScore}/100</span>
      </div>
    </div>
  );
}

export default SecurityBadge;
