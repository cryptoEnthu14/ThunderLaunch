'use client';

/**
 * WalletButton Component
 *
 * Main wallet interaction button with:
 * - "Connect Wallet" state when disconnected
 * - Shortened wallet address when connected
 * - Balance display
 * - Dropdown menu for disconnect and copy address
 * - Loading states
 * - Responsive design
 * - Brand-themed styling
 */

import React, { FC, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './WalletBalance';

export interface WalletButtonProps {
  /** Custom className for styling */
  className?: string;
  /** Show balance in the button */
  showBalance?: boolean;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Shorten wallet address for display
 * @param address - Full wallet address
 * @param chars - Number of characters to show on each side
 */
function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * WalletButton Component
 *
 * Primary wallet connection and interaction button
 */
export const WalletButton: FC<WalletButtonProps> = ({
  className = '',
  showBalance = true,
  variant = 'primary',
  size = 'md',
}) => {
  const { publicKey, disconnect, connecting, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Reset copy success message after delay
  useEffect(() => {
    if (copySuccess) {
      const timeout = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copySuccess]);

  /**
   * Handle connect wallet click
   */
  const handleConnect = () => {
    setVisible(true);
  };

  /**
   * Handle disconnect
   */
  const handleDisconnect = async () => {
    setIsDropdownOpen(false);
    await disconnect();
  };

  /**
   * Handle copy address
   */
  const handleCopyAddress = async () => {
    if (publicKey) {
      const success = await copyToClipboard(publicKey.toBase58());
      if (success) {
        setCopySuccess(true);
      }
    }
  };

  /**
   * Toggle dropdown
   */
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700',
    outline: 'bg-transparent hover:bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900';

  // Disconnected state - show connect button
  if (!connected) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${
          connecting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {connecting ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Connecting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Connect Wallet
          </span>
        )}
      </button>
    );
  }

  // Connected state - show wallet info with dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={toggleDropdown}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} flex items-center gap-3`}
      >
        {/* Wallet Icon */}
        {wallet?.adapter.icon && (
          <Image
            src={wallet.adapter.icon}
            alt={wallet.adapter.name}
            width={20}
            height={20}
            className="w-5 h-5 rounded"
            unoptimized
          />
        )}

        <div className="flex flex-col items-start gap-0.5">
          {/* Wallet Address */}
          <span className="font-mono text-xs sm:text-sm font-semibold">
            {publicKey && shortenAddress(publicKey.toBase58())}
          </span>

          {/* Balance */}
          {showBalance && (
            <span className="text-xs opacity-80">
              <WalletBalance abbreviated decimals={2} />
            </span>
          )}
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Wallet Info */}
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-2">
                {wallet?.adapter.icon && (
                  <Image
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded"
                    unoptimized
                  />
                )}
              <span className="text-sm font-semibold text-white">{wallet?.adapter.name}</span>
            </div>
            <p className="font-mono text-xs text-gray-400 break-all">
              {publicKey?.toBase58()}
            </p>
            {showBalance && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <WalletBalance showRefresh decimals={4} className="text-white" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="py-1">
            {/* Copy Address */}
            <button
              onClick={handleCopyAddress}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copySuccess ? 'Copied!' : 'Copy Address'}
            </button>

            {/* Change Wallet */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                handleConnect();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Change Wallet
            </button>

            {/* Disconnect */}
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Export default for convenience
 */
export default WalletButton;
