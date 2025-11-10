/**
 * Trading Formatting Utilities
 *
 * Helper functions for formatting numbers, prices, and addresses
 */

/**
 * Format a wallet address for display
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format a number with appropriate suffix (K, M, B)
 */
export function formatNumberCompact(
  value: number,
  decimals: number = 2
): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * Format price with appropriate decimals based on value
 */
export function formatPrice(value: number): string {
  if (value === 0) return '$0.00';
  if (value < 0.000001) return `$${value.toExponential(2)}`;
  if (value < 0.01) return `$${value.toFixed(6)}`;
  if (value < 1) return `$${value.toFixed(4)}`;
  if (value < 1000) return `$${value.toFixed(2)}`;
  return `$${formatNumberCompact(value)}`;
}

/**
 * Format SOL amount with appropriate decimals
 */
export function formatSOL(value: number, decimals: number = 4): string {
  return `${value.toFixed(decimals)} SOL`;
}

/**
 * Format token amount with locale formatting
 */
export function formatTokenAmount(
  value: number | string,
  decimals: number = 2
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage with sign
 */
export function formatPercentage(
  value: number,
  decimals: number = 2,
  includeSign: boolean = true
): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format USD value
 */
export function formatUSD(
  value: number,
  compact: boolean = false,
  decimals: number = 2
): string {
  if (compact && value >= 1_000) {
    return `$${formatNumberCompact(value, decimals)}`;
  }
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Parse input amount safely
 */
export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate amount input
 */
export function validateAmount(
  input: string,
  min: number = 0,
  max?: number
): { valid: boolean; error?: string } {
  const amount = parseAmount(input);

  if (amount === 0 || isNaN(amount)) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (amount < min) {
    return { valid: false, error: `Minimum amount is ${min}` };
  }

  if (max !== undefined && amount > max) {
    return { valid: false, error: `Maximum amount is ${max}` };
  }

  return { valid: true };
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Get color class based on value (positive/negative)
 */
export function getChangeColor(
  value: number
): 'text-safety-green' | 'text-danger-red' | 'text-gray-400' {
  if (value > 0) return 'text-safety-green';
  if (value < 0) return 'text-danger-red';
  return 'text-gray-400';
}

/**
 * Get price impact severity
 */
export function getPriceImpactSeverity(
  impact: number
): 'low' | 'medium' | 'high' {
  if (impact < 0.01) return 'low';
  if (impact < 0.05) return 'medium';
  return 'high';
}

/**
 * Get price impact color
 */
export function getPriceImpactColor(
  impact: number
): 'text-safety-green' | 'text-warning-yellow' | 'text-danger-red' {
  if (impact < 0.01) return 'text-safety-green';
  if (impact < 0.05) return 'text-warning-yellow';
  return 'text-danger-red';
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/**
 * Truncate string to max length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}
