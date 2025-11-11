'use client';

/**
 * ProfileCard Component
 *
 * Displays user profile information with avatar, stats, and verification badge.
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Shield,
  CheckCircle2,
  Twitter,
  Send,
  Globe,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types/user';
import { formatWalletAddress } from '@/types/user';

// =============================================================================
// TYPES
// =============================================================================

export interface ProfileCardProps {
  /** User profile data */
  profile: UserProfile;
  /** Is this the current user's profile */
  isOwnProfile?: boolean;
  /** Callback when edit button is clicked */
  onEdit?: () => void;
  /** Custom className */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProfileCard({
  profile,
  isOwnProfile = false,
  onEdit,
  className,
}: ProfileCardProps) {
  const [copied, setCopied] = React.useState(false);

  /**
   * Copy wallet address to clipboard
   */
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(profile.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Get verification badge config
   */
  const getVerificationBadge = () => {
    const configs = {
      verified: {
        icon: <CheckCircle2 className="w-5 h-5" />,
        label: 'Verified',
        className: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      },
      pending: {
        icon: <Shield className="w-5 h-5" />,
        label: 'Pending',
        className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      },
      unverified: {
        icon: <Shield className="w-5 h-5" />,
        label: 'Unverified',
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      },
      rejected: {
        icon: <Shield className="w-5 h-5" />,
        label: 'Rejected',
        className: 'bg-red-500/20 text-red-300 border-red-500/30',
      },
    };

    return configs[profile.verification_status];
  };

  const verificationBadge = getVerificationBadge();

  return (
    <Card variant="elevated" className={cn('overflow-hidden', className)}>
      <CardBody className="p-0">
        {/* Cover Banner */}
        <div className="h-32 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600" />

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 left-6">
            <div className="relative w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-800 overflow-hidden">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username || 'User avatar'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User className="w-16 h-16" />
                </div>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {isOwnProfile && onEdit && (
            <div className="pt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit Profile
              </Button>
            </div>
          )}

          {/* User Info */}
          <div className="mt-20">
            {/* Name & Username */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">
                {profile.display_name || profile.username || 'Anonymous User'}
              </h2>
              {verificationBadge && (
                <Badge className={cn('border', verificationBadge.className)}>
                  {verificationBadge.icon}
                  <span className="ml-1">{verificationBadge.label}</span>
                </Badge>
              )}
              {profile.is_creator && (
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Shield className="w-4 h-4 mr-1" />
                  Creator
                </Badge>
              )}
            </div>

            {/* Username (if different from display name) */}
            {profile.username && profile.display_name && (
              <p className="text-gray-400 mb-2">@{profile.username}</p>
            )}

            {/* Wallet Address */}
            <div className="flex items-center gap-2 mb-4">
              <code className="text-sm text-gray-400 font-mono">
                {formatWalletAddress(profile.wallet_address, 6)}
              </code>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
                aria-label="Copy wallet address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-300 mb-6 leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {profile.tokens_created}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Tokens Created
                </div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {profile.trades_count}
                </div>
                <div className="text-xs text-gray-400 mt-1">Trades</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  ${(profile.total_volume_usd / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-gray-400 mt-1">Volume</div>
              </div>
            </div>

            {/* Social Links */}
            {profile.social_links && (
              <div className="flex items-center gap-3">
                {profile.social_links.twitter && (
                  <Link
                    href={`https://twitter.com/${profile.social_links.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-800 rounded transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                  </Link>
                )}
                {profile.social_links.telegram && (
                  <Link
                    href={profile.social_links.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-800 rounded transition-colors"
                  >
                    <Send className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                  </Link>
                )}
                {profile.social_links.website && (
                  <Link
                    href={profile.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-800 rounded transition-colors"
                  >
                    <Globe className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                  </Link>
                )}
              </div>
            )}

            {/* Member Since */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Member since {new Date(profile.joined_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default ProfileCard;
