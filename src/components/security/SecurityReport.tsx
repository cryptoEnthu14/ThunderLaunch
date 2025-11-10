'use client';

/**
 * Security Report Component
 *
 * Detailed security report modal displaying all security check results,
 * findings, and recommendations. Provides comprehensive view of token safety.
 *
 * @example
 * ```tsx
 * <SecurityReport
 *   open={showReport}
 *   onOpenChange={setShowReport}
 *   securityCheck={securityData}
 *   tokenName="Thunder Token"
 *   tokenSymbol="THNDR"
 * />
 * ```
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SecurityBadge } from './SecurityBadge';
import { cn } from '@/lib/utils';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import type {
  SecurityCheck,
  SecurityFinding,
  SecurityCheckResult,
  SecuritySeverity,
} from '@/types/security';

export interface SecurityReportProps {
  /** Whether modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Security check data */
  securityCheck: SecurityCheck;
  /** Token name */
  tokenName: string;
  /** Token symbol */
  tokenSymbol: string;
  /** Token address */
  tokenAddress?: string;
}

/**
 * Get icon for check result
 */
function getResultIcon(result: SecurityCheckResult) {
  const icons = {
    passed: <CheckCircle className="w-5 h-5 text-safety-green" />,
    failed: <XCircle className="w-5 h-5 text-danger-red" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning-orange" />,
    not_applicable: <Info className="w-5 h-5 text-gray-500" />,
  };

  return icons[result];
}

/**
 * Get color classes for severity
 */
function getSeverityColors(severity: SecuritySeverity) {
  const colors = {
    info: {
      bg: 'bg-blue-950/30',
      border: 'border-blue-900/30',
      text: 'text-blue-400',
    },
    low: {
      bg: 'bg-green-950/30',
      border: 'border-safety-green/30',
      text: 'text-safety-green',
    },
    medium: {
      bg: 'bg-yellow-950/30',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
    },
    high: {
      bg: 'bg-orange-950/30',
      border: 'border-warning-orange/30',
      text: 'text-warning-orange',
    },
    critical: {
      bg: 'bg-red-950/30',
      border: 'border-danger-red/30',
      text: 'text-danger-red',
    },
  };

  return colors[severity];
}

/**
 * Get human-readable check type label
 */
function getCheckTypeLabel(checkType: string): string {
  const labels: Record<string, string> = {
    honeypot: 'Honeypot Detection',
    mint_function: 'Mint Authority',
    freeze_authority: 'Freeze Authority',
    update_authority: 'Update Authority',
    top_holders_concentration: 'Holder Concentration',
    liquidity_locked: 'Liquidity Lock',
    liquidity_ratio: 'Liquidity Ratio',
    contract_verified: 'Contract Verification',
    audit_completed: 'Audit Status',
    rugpull_risk: 'Rug Pull Risk',
  };

  return labels[checkType] || checkType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Copy to clipboard function
 */
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

/**
 * Finding item component
 */
function FindingItem({ finding }: { finding: SecurityFinding }) {
  const colors = getSeverityColors(finding.severity);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = `${finding.title}\n${finding.description}\n${finding.recommendation || ''}`;
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        colors.bg,
        colors.border,
        'transition-all duration-200 hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Result Icon */}
          <div className="mt-0.5">{getResultIcon(finding.result)}</div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Title and Severity */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-white">{finding.title}</h4>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border',
                  colors.bg,
                  colors.border,
                  colors.text,
                  'font-medium'
                )}
              >
                {finding.severity.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300">{finding.description}</p>

            {/* Recommendation */}
            {finding.recommendation && (
              <div className="text-sm text-gray-400 bg-gray-900/50 p-2 rounded border border-gray-700">
                <span className="font-medium text-gray-300">Recommendation:</span>{' '}
                {finding.recommendation}
              </div>
            )}

            {/* Details */}
            {finding.details && Object.keys(finding.details).length > 0 && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-400">
                  View Technical Details
                </summary>
                <pre className="mt-2 p-2 bg-gray-900 rounded border border-gray-800 overflow-x-auto">
                  {JSON.stringify(finding.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          title="Copy finding"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/**
 * SecurityReport Component
 *
 * Comprehensive security report modal
 */
export function SecurityReport({
  open,
  onOpenChange,
  securityCheck,
  tokenName,
  tokenSymbol,
  tokenAddress,
}: SecurityReportProps) {
  const [copiedAddress, setCopiedAddress] = React.useState(false);

  const handleCopyAddress = () => {
    if (tokenAddress) {
      copyToClipboard(tokenAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  // Group findings by result
  const failedFindings = securityCheck.findings.filter(f => f.result === 'failed');
  const warningFindings = securityCheck.findings.filter(f => f.result === 'warning');
  const passedFindings = securityCheck.findings.filter(f => f.result === 'passed');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl" className="max-h-[90vh] flex flex-col">
        <ModalHeader className="flex-shrink-0">
          <div className="flex items-start justify-between pr-8">
            <div className="space-y-2">
              <ModalTitle size="lg">Security Report</ModalTitle>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{tokenName}</span>
                <span className="text-gray-400">({tokenSymbol})</span>
              </div>
              {tokenAddress && (
                <div className="flex items-center gap-2">
                  <code className="text-xs text-gray-400 font-mono">
                    {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-8)}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                    title="Copy address"
                  >
                    {copiedAddress ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
            <SecurityBadge
              riskLevel={securityCheck.risk_level}
              riskScore={securityCheck.risk_score}
              size="lg"
            />
          </div>
        </ModalHeader>

        <ModalBody className="flex-1 overflow-y-auto" noPadding>
          <div className="px-6 py-4 space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-white">{securityCheck.security_score}</div>
                <div className="text-xs text-gray-400 mt-1">Security Score</div>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-safety-green">{securityCheck.passed_checks}</div>
                <div className="text-xs text-gray-400 mt-1">Passed</div>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-warning-orange">{securityCheck.warning_checks}</div>
                <div className="text-xs text-gray-400 mt-1">Warnings</div>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-danger-red">{securityCheck.failed_checks}</div>
                <div className="text-xs text-gray-400 mt-1">Failed</div>
              </div>
            </div>

            {/* Failed Checks */}
            {failedFindings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-danger-red uppercase tracking-wider flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Critical Issues ({failedFindings.length})
                </h3>
                <div className="space-y-3">
                  {failedFindings.map((finding) => (
                    <FindingItem key={finding.id} finding={finding} />
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {warningFindings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-warning-orange uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings ({warningFindings.length})
                </h3>
                <div className="space-y-3">
                  {warningFindings.map((finding) => (
                    <FindingItem key={finding.id} finding={finding} />
                  ))}
                </div>
              </div>
            )}

            {/* Passed Checks */}
            {passedFindings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-safety-green uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Passed Checks ({passedFindings.length})
                </h3>
                <div className="space-y-3">
                  {passedFindings.map((finding) => (
                    <FindingItem key={finding.id} finding={finding} />
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-thunder-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-300 mb-1">
                    Understanding Security Scores
                  </h4>
                  <p className="text-xs text-gray-400">
                    This security report is generated automatically using on-chain data analysis.
                    Always do your own research (DYOR) before investing in any token.
                  </p>
                  <a
                    href="/docs/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-thunder-blue hover:text-blue-400 mt-2 transition-colors"
                  >
                    Learn more about security checks
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost">Close</Button>
          </ModalClose>
          <Button
            variant="primary"
            onClick={() => window.open(`https://solscan.io/token/${tokenAddress}`, '_blank')}
            rightIcon={<ExternalLink className="w-4 h-4" />}
          >
            View on Solscan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default SecurityReport;
