'use client';

/**
 * Security Warning Component
 *
 * Prominent warning banner for high-risk and critical-risk tokens.
 * Requires users to acknowledge risks before proceeding with actions.
 *
 * Features:
 * - Bold visual warning with icon
 * - Lists critical security issues
 * - "I understand the risks" checkbox
 * - Prevents actions until acknowledged
 *
 * @example
 * ```tsx
 * <SecurityWarning
 *   riskLevel="high"
 *   criticalIssues={[
 *     'Liquidity is not locked',
 *     'Mint authority not renounced'
 *   ]}
 *   onAcknowledge={handleAcknowledge}
 * />
 * ```
 */

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, XCircle, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { RiskLevel } from '@/types/token';

export interface SecurityWarningProps {
  /** Risk level of the token */
  riskLevel: RiskLevel;
  /** Risk score (0-100) */
  riskScore: number;
  /** List of critical security issues */
  criticalIssues: string[];
  /** List of warnings */
  warnings?: string[];
  /** Callback when user acknowledges risks */
  onAcknowledge?: (acknowledged: boolean) => void;
  /** Initial acknowledged state */
  initialAcknowledged?: boolean;
  /** Show the warning (can be controlled externally) */
  show?: boolean;
  /** Allow dismissing the warning */
  dismissible?: boolean;
  /** Callback when warning is dismissed */
  onDismiss?: () => void;
  /** Custom action buttons */
  actions?: React.ReactNode;
}

/**
 * Get warning configuration based on risk level
 */
function getWarningConfig(riskLevel: RiskLevel) {
  const configs = {
    low: {
      show: false,
      title: 'Low Risk Detected',
      icon: Info,
      bg: 'bg-blue-950/50',
      border: 'border-blue-900/50',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-300',
    },
    medium: {
      show: true,
      title: 'Medium Risk Detected',
      icon: AlertTriangle,
      bg: 'bg-yellow-950/50',
      border: 'border-yellow-500/50',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-300',
    },
    high: {
      show: true,
      title: '⚠️ High Risk Warning',
      icon: AlertTriangle,
      bg: 'bg-orange-950/50',
      border: 'border-warning-orange/50',
      iconColor: 'text-warning-orange',
      titleColor: 'text-warning-orange',
    },
    critical: {
      show: true,
      title: '🚨 CRITICAL RISK WARNING',
      icon: ShieldAlert,
      bg: 'bg-red-950/50',
      border: 'border-danger-red/50',
      iconColor: 'text-danger-red',
      titleColor: 'text-danger-red',
    },
  };

  return configs[riskLevel];
}

/**
 * SecurityWarning Component
 *
 * Displays prominent security warnings for risky tokens
 */
export function SecurityWarning({
  riskLevel,
  riskScore,
  criticalIssues,
  warnings = [],
  onAcknowledge,
  initialAcknowledged = false,
  show = true,
  dismissible = false,
  onDismiss,
  actions,
}: SecurityWarningProps) {
  const [acknowledged, setAcknowledged] = useState(initialAcknowledged);
  const [dismissed, setDismissed] = useState(false);

  const config = getWarningConfig(riskLevel);
  const IconComponent = config.icon;

  // Don't show for low risk or if dismissed
  if (!show || dismissed || (riskLevel === 'low' && criticalIssues.length === 0)) {
    return null;
  }

  const handleAcknowledgeChange = (checked: boolean) => {
    setAcknowledged(checked);
    onAcknowledge?.(checked);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-6',
        config.bg,
        config.border,
        'animate-in fade-in slide-in-from-top-2 duration-500'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn('p-2 rounded-full', config.bg, 'ring-2', config.border)}>
            <IconComponent className={cn('w-6 h-6', config.iconColor)} />
          </div>
          <div className="flex-1">
            <h3 className={cn('text-xl font-bold', config.titleColor)}>
              {config.title}
            </h3>
            <p className="text-sm text-gray-300 mt-1">
              This token has been flagged with a risk score of {riskScore}/100.
              Please review the issues below carefully before proceeding.
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            aria-label="Dismiss warning"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
            Critical Issues:
          </h4>
          <ul className="space-y-2">
            {criticalIssues.map((issue, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-200 bg-gray-900/50 p-3 rounded border border-gray-700"
              >
                <XCircle className={cn('w-4 h-4 flex-shrink-0 mt-0.5', config.iconColor)} />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
            Additional Warnings:
          </h4>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-200 bg-gray-900/50 p-3 rounded border border-gray-700"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-400" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Investment Warning */}
      <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 mb-4">
        <p className="text-sm text-gray-300">
          <strong className="text-white">Investment Warning:</strong> High-risk tokens may result in
          complete loss of funds. Common risks include rug pulls, honeypots, and price manipulation.
          Only invest what you can afford to lose.
        </p>
      </div>

      {/* Acknowledgment Checkbox */}
      {onAcknowledge && (
        <div className="mb-4">
          <label
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
              acknowledged
                ? 'bg-gray-900/80 border-gray-600'
                : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
            )}
          >
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => handleAcknowledgeChange(e.target.checked)}
              className={cn(
                'w-5 h-5 rounded border-2 mt-0.5 flex-shrink-0',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
                config.border.replace('border-', 'focus:ring-'),
                'cursor-pointer'
              )}
            />
            <span className="text-sm text-gray-200 select-none">
              <strong className="text-white">I understand the risks</strong> associated with this
              token and acknowledge that I may lose my entire investment. I have read and understood
              all security warnings and critical issues listed above.
            </span>
          </label>
        </div>
      )}

      {/* Action Buttons */}
      {actions ? (
        <div className="flex items-center gap-3">{actions}</div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <a
            href="/docs/security"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-thunder-blue hover:text-blue-400 transition-colors"
          >
            Learn about token security
            <ExternalLink className="w-4 h-4" />
          </a>

          {onAcknowledge && (
            <Button
              variant="outline"
              disabled={!acknowledged}
              className={cn(
                !acknowledged && 'opacity-50 cursor-not-allowed'
              )}
            >
              {acknowledged ? 'Proceed with Caution' : 'Acknowledge Risks to Continue'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact security warning for inline use
 */
export function SecurityWarningCompact({
  riskLevel,
  riskScore,
  message,
  onViewDetails,
}: {
  riskLevel: RiskLevel;
  riskScore: number;
  message: string;
  onViewDetails?: () => void;
}) {
  if (riskLevel === 'low') return null;

  const config = getWarningConfig(riskLevel);
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
        config.bg,
        config.border
      )}
    >
      <IconComponent className={cn('w-4 h-4', config.iconColor)} />
      <span className="text-gray-200">{message}</span>
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className={cn('font-medium hover:underline', config.titleColor)}
        >
          View Details
        </button>
      )}
    </div>
  );
}

export default SecurityWarning;
