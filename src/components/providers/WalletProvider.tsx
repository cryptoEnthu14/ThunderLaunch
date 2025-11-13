'use client';

/**
 * Solana Wallet Provider
 *
 * Sets up wallet integration for the application with support for:
 * - Phantom Wallet
 * - Solflare Wallet
 * - Connection/disconnection handling
 * - Wallet preference persistence
 * - Connection modal UI
 * - Network switching (devnet/mainnet)
 * - Error handling
 */

import React, { FC, ReactNode, useMemo, useCallback } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { clusterApiUrl } from '@solana/web3.js';
import { env } from '@/config/env';

// Import wallet adapter CSS (required for modal UI)
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Wallet Provider Component
 *
 * Wraps the application with Solana wallet functionality.
 * Automatically configures the network based on environment settings.
 */
export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Determine the network based on environment configuration
  const network = useMemo(() => {
    switch (env.solana.network) {
      case 'mainnet-beta':
        return WalletAdapterNetwork.Mainnet;
      case 'testnet':
        return WalletAdapterNetwork.Testnet;
      case 'devnet':
      default:
        return WalletAdapterNetwork.Devnet;
    }
  }, []);

  // Configure RPC endpoint
  // Use custom RPC if provided, otherwise fall back to public endpoints
  const endpoint = useMemo(() => {
    if (env.solana.rpcEndpoint) {
      return env.solana.rpcEndpoint;
    }
    return clusterApiUrl(network);
  }, [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      /**
       * Phantom Wallet
       * Most popular Solana wallet with excellent mobile support
       */
      new PhantomWalletAdapter(),

      /**
       * Solflare Wallet
       * Feature-rich wallet with hardware wallet support
       */
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  // Error handler for wallet connection errors
  const onError = useCallback((error: Error) => {
    console.error('[Wallet Error]', error);

    // User-friendly error messages
    let errorMessage = error.message;

    if (error.message.includes('User rejected')) {
      errorMessage = 'Wallet connection was rejected by user';
    } else if (error.message.includes('not found')) {
      errorMessage = 'Wallet not found. Please install Phantom or Solflare wallet extension.';
    } else if (error.message.includes('already pending')) {
      errorMessage = 'A wallet connection is already in progress';
    } else if (error.message.includes('disconnected')) {
      errorMessage = 'Wallet disconnected. Please reconnect.';
    }

    // You can integrate this with a toast notification system
    if (typeof window !== 'undefined') {
      console.warn(errorMessage);
    }
  }, []);

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        commitment: env.solana.commitment,
        wsEndpoint: env.solana.wsEndpoint || undefined,
      }}
    >
      <SolanaWalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect // Required so selecting a wallet in the modal actually triggers adapter.connect()
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

/**
 * Export default for convenience
 */
export default WalletProvider;
