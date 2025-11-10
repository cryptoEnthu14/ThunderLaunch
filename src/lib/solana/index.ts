/**
 * Solana Token Creation Utilities
 *
 * This module provides a comprehensive set of utilities for creating
 * SPL tokens on Solana with metadata support.
 *
 * @example Basic token creation
 * ```typescript
 * import { createToken } from '@/lib/solana';
 * import { Keypair } from '@solana/web3.js';
 *
 * const payer = Keypair.generate();
 *
 * const result = await createToken(
 *   {
 *     name: 'My Token',
 *     symbol: 'MTK',
 *     description: 'My awesome token',
 *     decimals: 9,
 *     initialSupply: 1000000,
 *     renounceMintAuthority: true,
 *     disableFreezeAuthority: true,
 *     onProgress: (step, progress) => {
 *       console.log(`${progress}%: ${step}`);
 *     },
 *   },
 *   payer
 * );
 *
 * console.log('Token created:', result.mintAddress.toBase58());
 * ```
 *
 * @example Token creation with image and metadata
 * ```typescript
 * const imageFile = // ... File object from input
 *
 * const result = await createToken(
 *   {
 *     name: 'My Token',
 *     symbol: 'MTK',
 *     description: 'My awesome token with an image',
 *     image: imageFile,
 *     externalUrl: 'https://mytoken.com',
 *     attributes: [
 *       { trait_type: 'Type', value: 'Utility' },
 *       { trait_type: 'Rarity', value: 'Legendary' },
 *     ],
 *     initialSupply: 1000000,
 *   },
 *   payer
 * );
 * ```
 */

// ============================================================================
// Connection and Configuration
// ============================================================================
export {
  connection,
  createConnection,
  getNetwork,
  isDevnet,
  isMainnet,
  getCommitment,
  confirmTransaction,
  sendAndConfirmTransaction,
  getBalance,
  accountExists,
  requestAirdrop,
  getMinimumBalanceForRentExemption,
  testConnection,
} from './connection';

// ============================================================================
// Token Creation Functions
// ============================================================================
export {
  createToken,
  createMint,
  createTokenAccount,
  mintTokens,
  setTokenMetadata,
  renounceMintAuthority,
  getTokenInfo,
  getTokenBalance,
} from './createToken';

// ============================================================================
// Metadata Upload Functions
// ============================================================================
export {
  uploadTokenMetadata,
  uploadImageToIPFS,
  uploadJSONToIPFS,
  createTokenMetadata,
  isValidIPFSUrl,
  ipfsHashToUrl,
  extractIPFSHash,
  testIPFSConnection,
} from './uploadMetadata';

// ============================================================================
// Types
// ============================================================================
export type {
  ProgressCallback,
  TokenMetadata,
  CreateTokenConfig,
  CreateTokenResult,
  IPFSUploadConfig,
  IPFSUploadResult,
  MetadataUploadResult,
  CreateTokenAccountConfig,
  MintTokensConfig,
  SetMetadataConfig,
  ConfirmationConfig,
} from './types';

export { TokenErrorType, TokenError } from './types';
