'use client';

/**
 * Trading Panel Component
 *
 * Comprehensive trading interface for buying and selling tokens.
 * Features:
 * - Buy/Sell toggle tabs
 * - Amount input with real-time calculations
 * - Slippage settings
 * - Transaction confirmation modal
 * - Fee breakdown display
 * - Price impact warnings
 *
 * @example
 * ```tsx
 * <TradingPanel
 *   tokenAddress="So11111..."
 *   tokenSymbol="THDR"
 *   currentPrice={0.05}
 *   currentSupply={1000000}
 * />
 * ```
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownUp, Settings, AlertTriangle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  completeBuyCalculation,
  completeSellCalculation,
  getCurrentPrice,
  BondingCurveType,
} from '@/lib/bonding-curve';
import type { TradeType } from '@/types/trade';

export interface TradingPanelProps {
  /** Token address */
  tokenAddress: string;
  /** Token symbol */
  tokenSymbol: string;
  /** Token name */
  tokenName?: string;
  /** Current token price in SOL */
  currentPrice: number;
  /** Current token supply */
  currentSupply: number;
  /** Bonding curve type */
  curveType?: BondingCurveType;
  /** User's SOL balance */
  solBalance?: number;
  /** User's token balance */
  tokenBalance?: number;
  /** On trade executed callback */
  onTradeExecuted?: (tradeType: TradeType, amount: number) => void;
  /** Custom className */
  className?: string;
}

interface SlippageSettings {
  tolerance: number;
  custom: boolean;
}

/**
 * TradingPanel Component
 */
export function TradingPanel({
  tokenAddress,
  tokenSymbol,
  tokenName,
  currentPrice,
  currentSupply,
  curveType = BondingCurveType.LINEAR,
  solBalance = 0,
  tokenBalance = 0,
  onTradeExecuted,
  className,
}: TradingPanelProps) {
  // Trade state
  const [tradeType, setTradeType] = useState<TradeType>('buy');
  const [inputAmount, setInputAmount] = useState('');
  const [slippage, setSlippage] = useState<SlippageSettings>({
    tolerance: 1,
    custom: false,
  });

  // UI state
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate trade details in real-time
  const tradeCalculation = useMemo(() => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return null;

    try {
      const amount = parseFloat(inputAmount);

      if (tradeType === 'buy') {
        return completeBuyCalculation(amount, currentSupply, curveType);
      } else {
        return completeSellCalculation(amount, currentSupply, curveType);
      }
    } catch (error) {
      console.error('Trade calculation error:', error);
      return null;
    }
  }, [inputAmount, tradeType, currentSupply, curveType]);

  // Calculate new price after trade
  const newPriceAfterTrade = useMemo(() => {
    if (!tradeCalculation) return null;

    try {
      const newSupply =
        'newSupply' in tradeCalculation ? tradeCalculation.newSupply : currentSupply;
      return getCurrentPrice(newSupply, curveType);
    } catch (error) {
      return null;
    }
  }, [tradeCalculation, currentSupply, curveType]);

  // Validate trade
  const tradeError = useMemo(() => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return null;

    const amount = parseFloat(inputAmount);

    if (tradeType === 'buy') {
      if (amount > solBalance) {
        return 'Insufficient SOL balance';
      }
      if (amount < 0.001) {
        return 'Minimum buy amount is 0.001 SOL';
      }
    } else {
      if (amount > tokenBalance) {
        return 'Insufficient token balance';
      }
      if (amount < 1) {
        return 'Minimum sell amount is 1 token';
      }
    }

    // Check slippage
    if (tradeCalculation && tradeCalculation.priceImpact > slippage.tolerance / 100) {
      return `Price impact (${(tradeCalculation.priceImpact * 100).toFixed(2)}%) exceeds slippage tolerance`;
    }

    return null;
  }, [inputAmount, tradeType, solBalance, tokenBalance, tradeCalculation, slippage]);

  // Handle max button click
  const handleMaxClick = () => {
    if (tradeType === 'buy') {
      // Leave some SOL for transaction fees
      const maxBuy = Math.max(0, solBalance - 0.01);
      setInputAmount(maxBuy.toFixed(4));
    } else {
      setInputAmount(tokenBalance.toString());
    }
  };

  // Handle trade execution
  const handleTrade = async () => {
    if (tradeError || !tradeCalculation) return;

    setIsProcessing(true);
    try {
      // TODO: Implement actual blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate transaction

      const amount = parseFloat(inputAmount);
      onTradeExecuted?.(tradeType, amount);

      // Reset form
      setInputAmount('');
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Trade execution error:', error);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  };

  // Preset slippage values
  const slippagePresets = [0.5, 1, 2, 5];

  return (
    <>
      <Card variant="elevated" className={cn('overflow-hidden', className)}>
        <CardBody className="p-0">
          {/* Trade Type Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setTradeType('buy')}
              className={cn(
                'flex-1 py-4 font-semibold transition-colors relative',
                tradeType === 'buy'
                  ? 'text-safety-green bg-green-950/30'
                  : 'text-gray-400 hover:text-gray-300'
              )}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Buy
              {tradeType === 'buy' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-safety-green" />
              )}
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={cn(
                'flex-1 py-4 font-semibold transition-colors relative',
                tradeType === 'sell'
                  ? 'text-danger-red bg-red-950/30'
                  : 'text-gray-400 hover:text-gray-300'
              )}
            >
              <TrendingDown className="w-4 h-4 inline mr-2" />
              Sell
              {tradeType === 'sell' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-danger-red" />
              )}
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  {tradeType === 'buy' ? 'You Pay' : 'You Sell'}
                </label>
                <button
                  onClick={handleMaxClick}
                  className="text-xs text-accent-purple hover:text-accent-purple-light transition-colors font-medium"
                >
                  MAX
                </button>
              </div>

              <div className="relative">
                <Input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-2xl font-bold pr-20"
                  min="0"
                  step="0.0001"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                  {tradeType === 'buy' ? 'SOL' : tokenSymbol}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                <span>
                  Balance:{' '}
                  {tradeType === 'buy'
                    ? `${solBalance.toFixed(4)} SOL`
                    : `${tokenBalance.toLocaleString()} ${tokenSymbol}`}
                </span>
              </div>
            </div>

            {/* Swap Icon */}
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700">
                <ArrowDownUp className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* You Receive */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                {tradeType === 'buy' ? 'You Receive' : 'You Receive'}
              </label>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-white">
                  {tradeCalculation
                    ? tradeType === 'buy'
                      ? ('tokensReceived' in tradeCalculation
                          ? tradeCalculation.tokensReceived.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })
                          : '0.00')
                      : ('proceeds' in tradeCalculation
                          ? tradeCalculation.proceeds.toFixed(4)
                          : '0.00')
                    : '0.00'}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {tradeType === 'buy' ? tokenSymbol : 'SOL'}
                </div>
              </div>
            </div>

            {/* Trade Details */}
            {tradeCalculation && (
              <div className="space-y-2 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Price</span>
                  <span className="text-white font-medium">
                    {currentPrice.toFixed(6)} SOL
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fee (1%)</span>
                  <span className="text-white font-medium">
                    {tradeCalculation.platformFee.toFixed(4)} SOL
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Creator Fee (1%)</span>
                  <span className="text-white font-medium">
                    {tradeCalculation.creatorFee.toFixed(4)} SOL
                  </span>
                </div>

                <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Total Fees</span>
                  <span className="text-white font-medium">
                    {tradeCalculation.totalFees.toFixed(4)} SOL
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price Impact</span>
                  <span
                    className={cn(
                      'font-medium',
                      tradeCalculation.priceImpact > 0.05
                        ? 'text-danger-red'
                        : tradeCalculation.priceImpact > 0.02
                        ? 'text-warning-yellow'
                        : 'text-safety-green'
                    )}
                  >
                    {(tradeCalculation.priceImpact * 100).toFixed(2)}%
                  </span>
                </div>

                {newPriceAfterTrade && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">New Price</span>
                    <span className="text-white font-medium">
                      {newPriceAfterTrade.price.toFixed(6)} SOL
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Slippage Settings */}
            <button
              onClick={() => setShowSlippageSettings(!showSlippageSettings)}
              className="flex items-center justify-between w-full p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Slippage Tolerance</span>
              </div>
              <Badge variant="secondary">{slippage.tolerance}%</Badge>
            </button>

            {showSlippageSettings && (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                <div className="flex gap-2">
                  {slippagePresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() =>
                        setSlippage({ tolerance: preset, custom: false })
                      }
                      className={cn(
                        'flex-1 py-2 rounded-lg font-medium text-sm transition-colors',
                        slippage.tolerance === preset && !slippage.custom
                          ? 'bg-accent-purple text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      )}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={slippage.custom ? slippage.tolerance : ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setSlippage({ tolerance: value, custom: true });
                    }}
                    placeholder="Custom %"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {tradeError && (
              <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-danger-red flex-shrink-0 mt-0.5" />
                <span className="text-sm text-danger-red">{tradeError}</span>
              </div>
            )}

            {/* High Slippage Warning */}
            {tradeCalculation && tradeCalculation.priceImpact > 0.05 && !tradeError && (
              <div className="flex items-start gap-2 p-3 bg-yellow-950/30 border border-yellow-900/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-warning-yellow flex-shrink-0 mt-0.5" />
                <span className="text-sm text-warning-yellow">
                  High price impact! Consider reducing your trade size.
                </span>
              </div>
            )}

            {/* Trade Button */}
            <Button
              variant={tradeType === 'buy' ? 'success' : 'danger'}
              size="lg"
              fullWidth
              onClick={() => setShowConfirmModal(true)}
              disabled={!tradeCalculation || !!tradeError || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${tokenSymbol}`
              )}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Confirm {tradeType === 'buy' ? 'Buy' : 'Sell'}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {tradeCalculation && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      You {tradeType === 'buy' ? 'pay' : 'sell'}
                    </span>
                    <span className="text-white font-medium">
                      {inputAmount} {tradeType === 'buy' ? 'SOL' : tokenSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">You receive</span>
                    <span className="text-white font-medium">
                      {tradeType === 'buy'
                        ? ('tokensReceived' in tradeCalculation
                            ? `${tradeCalculation.tokensReceived.toLocaleString()} ${tokenSymbol}`
                            : '0')
                        : ('proceeds' in tradeCalculation
                            ? `${tradeCalculation.proceeds.toFixed(4)} SOL`
                            : '0')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Total fees</span>
                    <span className="text-white font-medium">
                      {tradeCalculation.totalFees.toFixed(4)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price impact</span>
                    <span
                      className={cn(
                        'font-medium',
                        tradeCalculation.priceImpact > 0.05
                          ? 'text-danger-red'
                          : 'text-safety-green'
                      )}
                    >
                      {(tradeCalculation.priceImpact * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={tradeType === 'buy' ? 'success' : 'danger'}
                    fullWidth
                    onClick={handleTrade}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default TradingPanel;
