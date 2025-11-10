/**
 * TypeScript types for Solana token creation utilities
 */

import { PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';

/**
 * Progress callback function type for token creation operations
 * @param step - Description of the current step
 * @param progress - Progress percentage (0-100)
 */
export type ProgressCallback = (step: string, progress: number) => void;

/**
 * Token metadata for storage on IPFS/Arweave
 */
export interface TokenMetadata {
  /** Token name (e.g., "Thunder Token") */
  name: string;
  /** Token symbol (e.g., "THUNDER") */
  symbol: string;
  /** Token description */
  description: string;
  /** Image URL or data URI */
  image?: string;
  /** External URL (website, documentation, etc.) */
  external_url?: string;
  /** Additional attributes */
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  /** Creator information */
  properties?: {
    files?: Array<{
      uri: string;
      type: string;
    }>;
    category?: string;
    creators?: Array<{
      address: string;
      share: number;
    }>;
  };
}

/**
 * Token creation configuration
 */
export interface CreateTokenConfig {
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Token description */
  description: string;
  /** Number of decimals (default: 9) */
  decimals?: number;
  /** Image file or URL */
  image?: File | string;
  /** Initial supply to mint */
  initialSupply?: number;
  /** Whether to renounce mint authority after creation */
  renounceMintAuthority?: boolean;
  /** Whether to disable freeze authority */
  disableFreezeAuthority?: boolean;
  /** External URL for the token */
  externalUrl?: string;
  /** Additional metadata attributes */
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  /** Progress callback for updates */
  onProgress?: ProgressCallback;
}

/**
 * Result of token creation operation
 */
export interface CreateTokenResult {
  /** Token mint address */
  mintAddress: PublicKey;
  /** Token account address (if created) */
  tokenAccountAddress?: PublicKey;
  /** Metadata URI (IPFS or Arweave) */
  metadataUri?: string;
  /** On-chain metadata account address */
  metadataAddress?: PublicKey;
  /** Transaction signatures */
  signatures: {
    createMint?: TransactionSignature;
    createMetadata?: TransactionSignature;
    createTokenAccount?: TransactionSignature;
    mintTokens?: TransactionSignature;
    renounceMintAuthority?: TransactionSignature;
  };
}

/**
 * IPFS upload configuration
 */
export interface IPFSUploadConfig {
  /** Pinata API key (from env) */
  apiKey?: string;
  /** Pinata secret key (from env) */
  secretKey?: string;
  /** Alternative IPFS gateway */
  gateway?: string;
}

/**
 * IPFS upload result
 */
export interface IPFSUploadResult {
  /** IPFS hash (CID) */
  ipfsHash: string;
  /** Full IPFS URL */
  url: string;
  /** Size of uploaded content in bytes */
  size: number;
}

/**
 * Metadata upload result
 */
export interface MetadataUploadResult {
  /** Metadata JSON URI */
  metadataUri: string;
  /** Image URI (if uploaded) */
  imageUri?: string;
  /** IPFS hashes */
  ipfsHashes: {
    metadata: string;
    image?: string;
  };
}

/**
 * Token account creation configuration
 */
export interface CreateTokenAccountConfig {
  /** Token mint address */
  mint: PublicKey;
  /** Owner of the token account */
  owner: PublicKey;
  /** Whether to use associated token account (default: true) */
  useAssociatedTokenAccount?: boolean;
}

/**
 * Token minting configuration
 */
export interface MintTokensConfig {
  /** Token mint address */
  mint: PublicKey;
  /** Destination token account */
  destination: PublicKey;
  /** Amount to mint (in token units, not lamports) */
  amount: number;
  /** Mint authority keypair or public key */
  mintAuthority: PublicKey;
  /** Number of decimals for the token */
  decimals?: number;
}

/**
 * Metaplex metadata configuration
 */
export interface SetMetadataConfig {
  /** Token mint address */
  mint: PublicKey;
  /** Metadata URI (IPFS/Arweave) */
  uri: string;
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Update authority (defaults to payer) */
  updateAuthority?: PublicKey;
  /** Seller fee basis points (0-10000, where 100 = 1%) */
  sellerFeeBasisPoints?: number;
  /** Creators array */
  creators?: Array<{
    address: PublicKey;
    verified: boolean;
    share: number; // 0-100
  }>;
  /** Whether the token is mutable */
  isMutable?: boolean;
}

/**
 * Transaction confirmation configuration
 */
export interface ConfirmationConfig {
  /** Maximum number of retries */
  maxRetries?: number;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to skip preflight checks */
  skipPreflight?: boolean;
}

/**
 * Error types for token operations
 */
export enum TokenErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  METADATA_UPLOAD_FAILED = 'METADATA_UPLOAD_FAILED',
  AUTHORITY_MISMATCH = 'AUTHORITY_MISMATCH',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for token operations
 */
export class TokenError extends Error {
  constructor(
    public type: TokenErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TokenError';
  }
}
