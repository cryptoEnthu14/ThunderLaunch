/**
 * Solana Connection Configuration
 *
 * This module provides a configured Solana connection instance and helper functions
 * for interacting with the Solana blockchain.
 */

import {
  Connection,
  ConnectionConfig,
  Commitment,
  PublicKey,
  Transaction,
  TransactionSignature,
  SendOptions,
  Keypair,
} from '@solana/web3.js';
import { TokenError, TokenErrorType, ConfirmationConfig } from './types';

export interface WalletTransactionSender {
  publicKey: PublicKey;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: SendOptions
  ) => Promise<TransactionSignature>;
}

/**
 * Default commitment level for transactions
 */
const DEFAULT_COMMITMENT: Commitment =
  (process.env.NEXT_PUBLIC_SOLANA_COMMITMENT as Commitment) || 'confirmed';

/**
 * Get the RPC endpoint from environment variables
 * Falls back to devnet if not specified
 */
function getRpcEndpoint(): string {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;

  if (!endpoint) {
    console.warn(
      'NEXT_PUBLIC_SOLANA_RPC_ENDPOINT not set, using default devnet endpoint'
    );
    return 'https://api.devnet.solana.com';
  }

  return endpoint;
}

/**
 * Get the WebSocket endpoint from environment variables
 */
function getWsEndpoint(): string | undefined {
  return process.env.NEXT_PUBLIC_SOLANA_WS_ENDPOINT;
}

/**
 * Connection configuration
 */
const connectionConfig: ConnectionConfig = {
  commitment: DEFAULT_COMMITMENT,
  wsEndpoint: getWsEndpoint(),
  // Disable rate limiting for better performance
  disableRetryOnRateLimit: false,
  // Enable confirmTransaction optimization
  confirmTransactionInitialTimeout: 60000,
};

/**
 * Configured Solana connection instance
 * Use this throughout the application for consistency
 */
export const connection = new Connection(getRpcEndpoint(), connectionConfig);

/**
 * Get the current network being used
 */
export function getNetwork(): 'mainnet-beta' | 'devnet' | 'testnet' | 'custom' {
  const endpoint = getRpcEndpoint().toLowerCase();

  if (endpoint.includes('mainnet')) {
    return 'mainnet-beta';
  } else if (endpoint.includes('devnet')) {
    return 'devnet';
  } else if (endpoint.includes('testnet')) {
    return 'testnet';
  }

  return 'custom';
}

/**
 * Check if we're on devnet (useful for testing)
 */
export function isDevnet(): boolean {
  return getNetwork() === 'devnet';
}

/**
 * Check if we're on mainnet
 */
export function isMainnet(): boolean {
  return getNetwork() === 'mainnet-beta';
}

/**
 * Get the current commitment level
 */
export function getCommitment(): Commitment {
  return DEFAULT_COMMITMENT;
}

/**
 * Create a new connection with custom configuration
 * Useful for specific operations that need different settings
 */
export function createConnection(
  endpoint?: string,
  config?: ConnectionConfig
): Connection {
  return new Connection(
    endpoint || getRpcEndpoint(),
    config || connectionConfig
  );
}

/**
 * Wait for transaction confirmation with retries and timeout
 *
 * @param signature - Transaction signature to confirm
 * @param config - Confirmation configuration
 * @returns Promise that resolves when transaction is confirmed
 */
export async function confirmTransaction(
  signature: TransactionSignature,
  config: ConfirmationConfig = {}
): Promise<void> {
  const {
    maxRetries = 30,
    timeout = 60000,
  } = config;

  const startTime = Date.now();
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Check if we've exceeded the timeout
      if (Date.now() - startTime > timeout) {
        throw new TokenError(
          TokenErrorType.TRANSACTION_FAILED,
          `Transaction confirmation timeout after ${timeout}ms`
        );
      }

      // Check transaction status
      const status = await connection.getSignatureStatus(signature);

      if (status?.value?.confirmationStatus === 'confirmed' ||
          status?.value?.confirmationStatus === 'finalized') {
        // Check for errors
        if (status.value.err) {
          throw new TokenError(
            TokenErrorType.TRANSACTION_FAILED,
            `Transaction failed: ${JSON.stringify(status.value.err)}`
          );
        }
        return;
      }

      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries++;
    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }

      // On network errors, retry
      if (retries >= maxRetries - 1) {
        throw new TokenError(
          TokenErrorType.NETWORK_ERROR,
          `Failed to confirm transaction after ${maxRetries} retries`,
          error as Error
        );
      }

      retries++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new TokenError(
    TokenErrorType.TRANSACTION_FAILED,
    `Transaction not confirmed after ${maxRetries} retries`
  );
}

/**
 * Send and confirm a transaction with proper error handling
 *
 * @param transaction - Transaction to send
 * @param signers - Array of signers for the transaction
 * @param options - Send options
 * @returns Transaction signature
 */
export async function sendAndConfirmTransaction(
  transaction: Transaction,
  signers: Keypair[],
  options?: SendOptions
): Promise<TransactionSignature> {
  try {
    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash(DEFAULT_COMMITMENT);

    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = signers[0].publicKey;

    // Sign transaction
    transaction.sign(...signers);

    // Send transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: DEFAULT_COMMITMENT,
        ...options,
      }
    );

    // Confirm transaction
    await confirmTransaction(signature, {
      maxRetries: 30,
      timeout: 60000,
    });

    return signature;
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    // Parse common Solana errors
    const errorMessage = (error as Error).message?.toLowerCase() || '';

    if (errorMessage.includes('insufficient funds') ||
        errorMessage.includes('insufficient lamports')) {
      throw new TokenError(
        TokenErrorType.INSUFFICIENT_FUNDS,
        'Insufficient funds to complete transaction',
        error as Error
      );
    }

    throw new TokenError(
      TokenErrorType.TRANSACTION_FAILED,
      `Transaction failed: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Send and confirm a transaction using a wallet adapter (client-side).
 *
 * @param transaction - Transaction to send
 * @param wallet - Wallet adapter with sendTransaction capability
 * @param partialSigners - Any additional signers (e.g., newly generated keypairs)
 * @param options - Send options
 */
export async function sendAndConfirmWithWallet(
  transaction: Transaction,
  wallet: WalletTransactionSender,
  partialSigners: Keypair[] = [],
  options?: SendOptions
): Promise<TransactionSignature> {
  try {
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash(DEFAULT_COMMITMENT);

    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = wallet.publicKey;

    if (partialSigners.length > 0) {
      transaction.partialSign(...partialSigners);
    }

    const signature = await wallet.sendTransaction(
      transaction,
      connection,
      options
    );

    await confirmTransaction(signature, {
      maxRetries: 30,
      timeout: 60000,
    });

    return signature;
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    const errorMessage = (error as Error).message?.toLowerCase() || '';

    if (
      errorMessage.includes('insufficient funds') ||
      errorMessage.includes('insufficient lamports')
    ) {
      throw new TokenError(
        TokenErrorType.INSUFFICIENT_FUNDS,
        'Insufficient funds to complete transaction',
        error as Error
      );
    }

    throw new TokenError(
      TokenErrorType.TRANSACTION_FAILED,
      `Transaction failed: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Get SOL balance for a public key
 *
 * @param publicKey - Public key to check balance for
 * @returns Balance in SOL (not lamports)
 */
export async function getBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey, DEFAULT_COMMITMENT);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    throw new TokenError(
      TokenErrorType.NETWORK_ERROR,
      `Failed to fetch balance: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Check if an account exists on-chain
 *
 * @param publicKey - Public key to check
 * @returns True if account exists
 */
export async function accountExists(publicKey: PublicKey): Promise<boolean> {
  try {
    const accountInfo = await connection.getAccountInfo(publicKey, DEFAULT_COMMITMENT);
    return accountInfo !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Request an airdrop (devnet/testnet only)
 *
 * @param publicKey - Public key to receive airdrop
 * @param amount - Amount in SOL (not lamports)
 * @returns Transaction signature
 */
export async function requestAirdrop(
  publicKey: PublicKey,
  amount: number = 1
): Promise<TransactionSignature> {
  if (isMainnet()) {
    throw new TokenError(
      TokenErrorType.INVALID_PARAMETERS,
      'Airdrops are not available on mainnet'
    );
  }

  try {
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * 1e9 // Convert SOL to lamports
    );

    await confirmTransaction(signature);
    return signature;
  } catch (error) {
    throw new TokenError(
      TokenErrorType.NETWORK_ERROR,
      `Airdrop failed: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Get minimum rent exemption for a given data size
 *
 * @param dataSize - Size of data in bytes
 * @returns Minimum lamports needed for rent exemption
 */
export async function getMinimumBalanceForRentExemption(
  dataSize: number
): Promise<number> {
  try {
    return await connection.getMinimumBalanceForRentExemption(dataSize);
  } catch (error) {
    throw new TokenError(
      TokenErrorType.NETWORK_ERROR,
      `Failed to get rent exemption: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Get recent performance samples for connection monitoring
 *
 * @param limit - Number of samples to return
 * @returns Array of performance samples
 */
export async function getRecentPerformanceSamples(limit: number = 1) {
  try {
    return await connection.getRecentPerformanceSamples(limit);
  } catch (error) {
    console.error('Failed to get performance samples:', error);
    return [];
  }
}

/**
 * Test connection health
 *
 * @returns True if connection is healthy
 */
export async function testConnection(): Promise<boolean> {
  try {
    const version = await connection.getVersion();
    console.log('Connected to Solana cluster:', version);
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Log connection info on module load (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Solana Connection Initialized:', {
    endpoint: getRpcEndpoint(),
    network: getNetwork(),
    commitment: DEFAULT_COMMITMENT,
  });
}
