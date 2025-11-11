'use client';

/**
 * User Profile Page
 *
 * Displays comprehensive user profile with tokens, trades, and portfolio.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2, TrendingUp, Coins, Activity } from 'lucide-react';
import { ProfileCard, EditProfile } from '@/components/user';
import { Card, CardBody } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { TokenCard } from '@/components/token/TokenCard';
import { TradeHistory } from '@/components/token/TradeHistory';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getUserProfile,
  getUserTokens,
  getUserTrades,
  getUserStats,
} from '@/lib/supabase/users';
import type { UserProfile, UserStats } from '@/types/user';
import type { Token } from '@/types/token';
import type { Trade } from '@/types/trade';

// =============================================================================
// COMPONENT
// =============================================================================

export default function ProfilePage() {
  const params = useParams();
  const { publicKey } = useWallet();
  const walletAddress = params.wallet as string;

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'trades' | 'portfolio'>('tokens');

  // Check if this is the current user's profile
  const isOwnProfile = publicKey?.toBase58() === walletAddress;

  /**
   * Load profile data
   */
  useEffect(() => {
    async function loadProfileData() {
      setIsLoading(true);
      setError(null);

      try {
        // Load profile
        const { data: profileData, error: profileError } =
          await getUserProfile(walletAddress);

        if (profileError) {
          setError(profileError);
          setIsLoading(false);
          return;
        }

        setProfile(profileData);

        // Load stats, tokens, and trades in parallel
        const [statsResult, tokensResult, tradesResult] = await Promise.all([
          getUserStats(walletAddress),
          getUserTokens(walletAddress, { limit: 10 }),
          getUserTrades(walletAddress, { limit: 10, status: 'confirmed' }),
        ]);

        if (statsResult.data) {
          setStats(statsResult.data);
        }

        if (tokensResult.data) {
          setTokens(tokensResult.data.tokens);
        }

        if (tradesResult.data) {
          setTrades(tradesResult.data.trades);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    }

    if (walletAddress) {
      loadProfileData();
    }
  }, [walletAddress]);

  /**
   * Handle profile update
   */
  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="p-12">
            <EmptyState
              title="Profile not found"
              description={error || 'The requested profile could not be found'}
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Card */}
        <ProfileCard
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEdit={() => setShowEditModal(true)}
        />

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Portfolio Value</p>
                    <p className="text-lg font-bold text-white">
                      ${(stats.portfolio_value_usd / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total P&L</p>
                    <p
                      className={`text-lg font-bold ${
                        stats.total_pnl_usd >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      ${Math.abs(stats.total_pnl_usd).toFixed(0)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Win Rate</p>
                    <p className="text-lg font-bold text-white">
                      {stats.win_rate.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Coins className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Trades</p>
                    <p className="text-lg font-bold text-white">
                      {stats.total_trades}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Content Tabs */}
        <Card>
          <CardBody className="p-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <div className="border-b border-gray-700">
                <TabsList className="w-full justify-start p-0">
                  <TabsTrigger value="tokens" className="flex-1 sm:flex-none">
                    Created Tokens ({tokens.length})
                  </TabsTrigger>
                  <TabsTrigger value="trades" className="flex-1 sm:flex-none">
                    Trading History ({trades.length})
                  </TabsTrigger>
                  <TabsTrigger value="portfolio" className="flex-1 sm:flex-none">
                    Portfolio
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Created Tokens */}
              <TabsContent value="tokens" className="p-6">
                {tokens.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokens.map((token) => (
                      <TokenCard key={token.id} token={token} variant="compact" />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No tokens created"
                    description="This user hasn't created any tokens yet"
                  />
                )}
              </TabsContent>

              {/* Trading History */}
              <TabsContent value="trades" className="p-6">
                {trades.length > 0 ? (
                  <TradeHistory trades={trades} />
                ) : (
                  <EmptyState
                    title="No trades yet"
                    description="This user hasn't made any trades yet"
                  />
                )}
              </TabsContent>

              {/* Portfolio */}
              <TabsContent value="portfolio" className="p-6">
                <EmptyState
                  title="Portfolio coming soon"
                  description="Portfolio tracking is currently under development"
                />
              </TabsContent>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfile
          open={showEditModal}
          onOpenChange={setShowEditModal}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}
