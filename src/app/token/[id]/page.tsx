'use client';

/**
 * Token Detail Page
 *
 * Comprehensive view of a single token with all information and trading capabilities.
 * Features:
 * - Token header with branding and metrics
 * - Description
 * - Security report
 * - Price chart
 * - Trading panel
 * - Trade history
 * - Detailed statistics
 * - Share, watchlist, and report functionality
 *
 * Route: /token/[id]
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Container } from '@/components/layout';
import {
  TokenHeader,
  TokenStats,
  PriceChart,
  TradingPanel,
  TradeHistory,
} from '@/components/token';
import { SecurityReport } from '@/components/security/SecurityReport';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useSecurityCheck } from '@/hooks/useSecurityCheck';
import { useWallet } from '@solana/wallet-adapter-react';
import { BondingCurveType } from '@/lib/bonding-curve/constants';
import type { Token, TokenPriceHistory } from '@/types/token';
import type { Trade } from '@/types/trade';

/**
 * Token Detail Page Component
 */
export default function TokenDetailPage() {
  const params = useParams();
  const tokenId = params.id as string;
  const { publicKey } = useWallet();

  // State
  const [token, setToken] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSecurityReport, setShowSecurityReport] = useState(false);
  const [priceHistory, setPriceHistory] = useState<TokenPriceHistory[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [totalTrades, setTotalTrades] = useState(0);

  // Fetch security check
  const { securityCheck, securityData, isLoading: isLoadingSecurityCheck } = useSecurityCheck({
    tokenAddress: token?.mint_address || '',
    tokenId: token?.id || '',
    marketCap: token?.market_cap || 0,
    tokenName: token?.name || '',
    tokenSymbol: token?.symbol || '',
    enabled: !!token,
  });

  // Fetch token data
  useEffect(() => {
    fetchToken();
  }, [tokenId]);

  // Fetch trades when token is loaded
  useEffect(() => {
    if (token) {
      fetchTrades();
    }
  }, [token]);

  /**
   * Fetch token from API or database
   */
  async function fetchToken() {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // For now, this is a placeholder
      const response = await fetch(`/api/tokens/${tokenId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }

      const data = await response.json();

      if (data.success) {
        setToken(data.data);
        // Generate mock price history (replace with actual data)
        setPriceHistory(generateMockPriceHistory(data.data.current_price));
      } else {
        setError(data.error || 'Failed to load token');
      }
    } catch (err) {
      console.error('Error fetching token:', err);
      setError('Failed to load token details');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Fetch trades for this token
   */
  async function fetchTrades() {
    if (!token) return;

    try {
      const response = await fetch(
        `/api/trades?token_address=${token.mint_address}&limit=20`
      );
      const data = await response.json();

      if (data.success) {
        setTrades(data.data || []);
        setTotalTrades(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching trades:', err);
    }
  }

  /**
   * Generate mock price history
   */
  function generateMockPriceHistory(currentPrice: number): TokenPriceHistory[] {
    const points: TokenPriceHistory[] = [];
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    let price = currentPrice * 0.8; // Start lower

    for (let i = 24; i >= 0; i--) {
      const variance = (Math.random() - 0.5) * 0.1;
      price = price * (1 + variance);
      const volume = Math.random() * 10000;
      const marketCap = price * (token?.total_supply ? parseFloat(token.total_supply) : 1000000);

      points.push({
        token_id: token?.id || '',
        timestamp: new Date(now - i * hourInMs).toISOString(),
        price_usd: price,
        price_native: price / 100, // Assuming 1 SOL = $100
        volume,
        market_cap: marketCap,
        liquidity: marketCap * 0.1,
      });
    }

    return points;
  }

  /**
   * Handle share
   */
  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${token?.name} (${token?.symbol}) on ThunderLaunch!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: token?.name, text, url });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        // TODO: Show toast notification
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  /**
   * Handle report
   */
  const handleReport = () => {
    // TODO: Implement report functionality
    alert('Report feature coming soon!');
  };

  /**
   * Handle trade executed
   */
  const handleTradeExecuted = () => {
    // Refresh token data and trades
    fetchToken();
    fetchTrades();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !token) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Container className="py-12">
          <ErrorMessage
            title="Failed to load token"
            message={error || 'Token not found'}
            onRetry={fetchToken}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Container className="py-8">
        {/* Token Header */}
        <TokenHeader
          token={token}
          securityCheck={securityCheck || undefined}
          onShare={handleShare}
          onReport={handleReport}
        />

        {/* Description */}
        {token.description && (
          <Card variant="elevated" className="mt-6">
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold text-white mb-3">About</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {token.description}
              </p>
            </CardBody>
          </Card>
        )}

        {/* Main Content with Tabs */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trade">Trade</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Chart */}
                <div className="lg:col-span-2">
                  <Card variant="elevated">
                    <CardBody className="p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Price Chart
                      </h2>
                      <PriceChart
                        tokenAddress={token.mint_address}
                        tokenSymbol={token.symbol}
                        priceHistory={priceHistory}
                        showVolume={true}
                      />
                    </CardBody>
                  </Card>

                  {/* Trade History */}
                  <Card variant="elevated" className="mt-6">
                    <CardBody className="p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Recent Trades
                      </h2>
                      <TradeHistory
                        tokenAddress={token.mint_address}
                        tokenSymbol={token.symbol}
                        trades={trades}
                        totalTrades={totalTrades}
                        onRefresh={fetchTrades}
                      />
                    </CardBody>
                  </Card>
                </div>

                {/* Right Column: Quick Trade */}
                <div>
                  <Card variant="elevated">
                    <CardBody className="p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Quick Trade
                      </h2>
                      <TradingPanel
                        tokenAddress={token.mint_address}
                        tokenSymbol={token.symbol}
                        currentPrice={token.current_price}
                        currentSupply={parseFloat(token.total_supply)}
                        curveType={BondingCurveType.LINEAR}
                        onTradeExecuted={handleTradeExecuted}
                      />
                    </CardBody>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Trade Tab */}
            <TabsContent value="trade">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Chart */}
                <div className="lg:col-span-2">
                  <Card variant="elevated">
                    <CardBody className="p-6">
                      <PriceChart
                        tokenAddress={token.mint_address}
                        tokenSymbol={token.symbol}
                        priceHistory={priceHistory}
                        showVolume={true}
                      />
                    </CardBody>
                  </Card>
                </div>

                {/* Right: Trading Panel */}
                <div>
                  <TradingPanel
                    tokenAddress={token.mint_address}
                    tokenSymbol={token.symbol}
                    currentPrice={token.current_price}
                    currentSupply={parseFloat(token.total_supply)}
                    curveType={BondingCurveType.LINEAR}
                    onTradeExecuted={handleTradeExecuted}
                  />
                </div>
              </div>

              {/* Trade History Below */}
              <Card variant="elevated" className="mt-6">
                <CardBody className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    All Trades
                  </h2>
                  <TradeHistory
                    tokenAddress={token.mint_address}
                    tokenSymbol={token.symbol}
                    trades={trades}
                    totalTrades={totalTrades}
                    onRefresh={fetchTrades}
                  />
                </CardBody>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              {isLoadingSecurityCheck ? (
                <Card variant="elevated">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="md" />
                    </div>
                  </CardBody>
                </Card>
              ) : securityCheck && securityData ? (
                <div>
                  <Card variant="elevated">
                    <CardBody className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-4">
                        Security Analysis
                      </h2>
                      <p className="text-gray-400 mb-6">
                        Comprehensive security analysis for {token.name} ({token.symbol})
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => setShowSecurityReport(true)}
                      >
                        View Full Security Report
                      </Button>
                    </CardBody>
                  </Card>

                  {/* Security Report Modal */}
                  <SecurityReport
                    open={showSecurityReport}
                    onOpenChange={setShowSecurityReport}
                    securityCheck={securityCheck}
                    tokenName={token.name}
                    tokenSymbol={token.symbol}
                    tokenAddress={token.mint_address}
                  />
                </div>
              ) : (
                <Card variant="elevated">
                  <CardBody className="p-6">
                    <div className="text-center py-12">
                      <p className="text-gray-400">
                        Security check not available
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                        className="mt-4"
                      >
                        Retry
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats">
              <TokenStats
                token={token}
                bondingCurveProgress={50}
                graduationTarget={69000}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}
