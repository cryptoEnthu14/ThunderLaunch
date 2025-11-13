/**
 * Solana Token Creation Utilities
 *
 * This module provides comprehensive functions for creating SPL tokens on Solana,
 * including mint creation, token account creation, minting tokens, and setting metadata.
 */

import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMint,
  getAccount,
  MintLayout,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

import {
  connection,
  sendAndConfirmWithWallet,
  getMinimumBalanceForRentExemption,
  WalletTransactionSender,
} from './connection';
import { uploadTokenMetadata } from './uploadMetadata';
import {
  CreateTokenConfig,
  CreateTokenResult,
  CreateTokenAccountConfig,
  MintTokensConfig,
  SetMetadataConfig,
  TokenError,
  TokenErrorType,
  ProgressCallback,
} from './types';

/**
 * Create a new token mint
 *
 * This function creates a new SPL token mint with the specified decimals.
 * It does NOT create token accounts or mint tokens - use createTokenAccount and mintTokens for that.
 *
 * @param wallet - Wallet adapter that will pay for and own the mint
 * @param decimals - Number of decimals for the token (default: 9)
 * @param mintAuthority - Optional custom mint authority (defaults to wallet)
 * @param freezeAuthority - Optional freeze authority (null to disable freezing)
 * @returns Object containing mint public key and transaction signature
 */
export async function createMint(
  wallet: WalletTransactionSender,
  decimals: number = 9,
  mintAuthority?: PublicKey,
  freezeAuthority?: PublicKey | null
): Promise<{ mint: PublicKey; signature: string }> {
  try {
    // Generate new mint keypair
    const mintKeypair = Keypair.generate();

    // Get minimum balance for rent exemption
    const lamports = await getMinimumBalanceForRentExemption(MintLayout.span);

    // Set authorities
    const mintAuthorityPubkey = mintAuthority || wallet.publicKey;
    const freezeAuthorityPubkey =
      freezeAuthority === null ? null : freezeAuthority || wallet.publicKey;

    // Create transaction
    const transaction = new Transaction().add(
      // Create account
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MintLayout.span,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize mint
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        mintAuthorityPubkey,
        freezeAuthorityPubkey,
        TOKEN_PROGRAM_ID
      )
    );

    // Send and confirm transaction
    const signature = await sendAndConfirmWithWallet(transaction, wallet, [
      mintKeypair,
    ]);

    return {
      mint: mintKeypair.publicKey,
      signature,
    };
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    throw new TokenError(
      TokenErrorType.TRANSACTION_FAILED,
      `Failed to create mint: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Create a token account for a specific mint
 *
 * By default, creates an Associated Token Account (ATA) which is the recommended approach.
 * ATAs are deterministic addresses derived from the owner and mint.
 *
 * @param config - Token account configuration
 * @param wallet - Wallet adapter that will pay for the account creation
 * @returns Token account public key and transaction signature
 */
export async function createTokenAccount(
  config: CreateTokenAccountConfig,
  wallet: WalletTransactionSender
): Promise<{ tokenAccount: PublicKey; signature: string }> {
  const { mint, owner, useAssociatedTokenAccount = true } = config;

  try {
    if (useAssociatedTokenAccount) {
      // Get associated token account address
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mint,
        owner,
        false, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Check if account already exists
      try {
        await getAccount(connection, associatedTokenAccount);
        // Account already exists
        return {
          tokenAccount: associatedTokenAccount,
          signature: '', // No transaction needed
        };
      } catch (error) {
        // Account doesn't exist, create it
      }

      // Create associated token account
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAccount,
          owner,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendAndConfirmWithWallet(transaction, wallet);

      return {
        tokenAccount: associatedTokenAccount,
        signature,
      };
    } else {
      // Create regular token account (less common, more complex)
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Non-associated token accounts are not yet supported. Please use associated token accounts.'
      );
    }
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    throw new TokenError(
      TokenErrorType.TRANSACTION_FAILED,
      `Failed to create token account: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Mint tokens to a destination account
 *
 * @param config - Minting configuration
 * @param wallet - Wallet adapter that will pay for the transaction (must be mint authority)
 * @returns Transaction signature
 */
export async function mintTokens(
  config: MintTokensConfig,
  wallet: WalletTransactionSender
): Promise<string> {
  const {
    mint,
    destination,
    amount,
    decimals = 9,
    mintAuthority,
  } = config;

  try {
    // Validate amount
    if (amount <= 0) {
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Amount must be greater than 0'
      );
    }

    // Convert amount to token units (applying decimals)
    const amountInTokenUnits = BigInt(Math.floor(amount * Math.pow(10, decimals)));

    // Create mint instruction
    const transaction = new Transaction().add(
      createMintToInstruction(
        mint,
        destination,
        mintAuthority || wallet.publicKey,
        amountInTokenUnits,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Send and confirm transaction
    const signature = await sendAndConfirmWithWallet(transaction, wallet);

    return signature;
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    throw new TokenError(
      TokenErrorType.TRANSACTION_FAILED,
      `Failed to mint tokens: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Set token metadata using Metaplex Token Metadata standard
 *
 * This creates on-chain metadata for the token following the Metaplex standard.
 * The metadata includes name, symbol, and URI pointing to off-chain JSON metadata.
 *
 * @param config - Metadata configuration
 * @param wallet - Wallet adapter that will pay for the transaction and be the update authority
 * @returns Metadata account public key and transaction signature
 */
export async function setTokenMetadata(
  config: SetMetadataConfig,
  wallet: WalletTransactionSender
): Promise<{ metadataAddress: PublicKey; signature: string }> {
  const {
    mint,
    uri,
    name,
    symbol,
    updateAuthority,
    sellerFeeBasisPoints = 0,
    creators,
    isMutable = true,
  } = config;

  try {
    // Validate inputs
    if (name.length > 32) {
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Token name must be 32 characters or less'
      );
    }

    if (symbol.length > 10) {
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Token symbol must be 10 characters or less'
      );
    }

    if (uri.length > 200) {
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Metadata URI must be 200 characters or less'
      );
    }

    // Validate seller fee
    if (sellerFeeBasisPoints < 0 || sellerFeeBasisPoints > 10000) {
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Seller fee basis points must be between 0 and 10000 (0-100%)'
      );
    }

    // Validate creators
    if (creators && creators.length > 0) {
      const totalShare = creators.reduce((sum, creator) => sum + creator.share, 0);
      if (totalShare !== 100) {
        throw new TokenError(
          TokenErrorType.INVALID_PARAMETERS,
          'Creator shares must sum to 100'
        );
      }
    }

    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const creatorsData =
      creators?.map((creator) => ({
        address: creator.address,
        verified: creator.verified,
        share: creator.share,
      })) || null;

    const instruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAddress,
        mint,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: updateAuthority || wallet.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name,
            symbol,
            uri,
            sellerFeeBasisPoints,
            creators: creatorsData,
            collection: null,
            uses: null,
          },
          isMutable,
          collectionDetails: null,
        },
      }
    );

    const transaction = new Transaction().add(instruction);
    const signature = await sendAndConfirmWithWallet(transaction, wallet);

    return {
      metadataAddress,
      signature,
    };
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    throw new TokenError(
      TokenErrorType.TRANSACTION_FAILED,
      `Failed to set token metadata: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Renounce mint authority
 *
 * This permanently removes the ability to mint more tokens.
 * USE WITH CAUTION - this action is irreversible!
 *
 * @param mint - Mint public key
 * @param currentAuthority - Current mint authority keypair
 * @returns Transaction signature
 */
export async function renounceMintAuthority(
  mint: PublicKey,
  wallet: WalletTransactionSender
): Promise<string> {
  try {
    const transaction = new Transaction().add(
      createSetAuthorityInstruction(
        mint,
        wallet.publicKey,
        AuthorityType.MintTokens,
        null, // Setting to null renounces authority
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await sendAndConfirmWithWallet(transaction, wallet);

    return signature;
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    throw new TokenError(
      TokenErrorType.TRANSACTION_FAILED,
      `Failed to renounce mint authority: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Complete token creation workflow
 *
 * This is the main function that orchestrates the entire token creation process:
 * 1. Upload metadata (image + JSON) to IPFS
 * 2. Create mint
 * 3. Set on-chain metadata
 * 4. Create token account for owner
 * 5. Mint initial supply (if specified)
 * 6. Optionally renounce mint authority
 *
 * @param config - Complete token creation configuration
 * @param wallet - Wallet adapter that will pay for all transactions and own the token
 * @returns Complete token creation result
 */
export async function createToken(
  config: CreateTokenConfig,
  wallet: WalletTransactionSender
): Promise<CreateTokenResult> {
  const {
    name,
    symbol,
    description,
    decimals = 9,
    image,
    initialSupply,
    owner,
    updateAuthority,
    renounceMintAuthority: shouldRenounceMintAuthority = false,
    disableFreezeAuthority = true,
    externalUrl,
    attributes,
    onProgress,
  } = config;

  const ownerPublicKey = owner || wallet.publicKey;
  const metadataAuthority = updateAuthority || ownerPublicKey;
  const offChainCreators = [
    {
      address: metadataAuthority.toBase58(),
      share: 100,
    },
  ];
  const onChainCreators = [
    {
      address: metadataAuthority,
      verified: metadataAuthority.equals(wallet.publicKey),
      share: 100,
    },
  ];

  const progress: ProgressCallback = onProgress || (() => {});
  const signatures: CreateTokenResult['signatures'] = {};

  try {
    // Validate inputs
    if (!name || name.trim().length === 0) {
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Token name is required'
      );
    }

    if (!symbol || symbol.trim().length === 0) {
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Token symbol is required'
      );
    }

    if (decimals < 0 || decimals > 9) {
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Decimals must be between 0 and 9'
      );
    }

    // Step 1: Upload metadata to IPFS (if image provided)
    progress('Uploading metadata to IPFS...', 10);
    let metadataUri: string | undefined;

    if (image || description) {
      try {
        const metadataResult = await uploadTokenMetadata(
          name,
          symbol,
          description,
          image,
          {
            externalUrl,
            attributes,
            creators: offChainCreators,
          }
        );
        metadataUri = metadataResult.metadataUri;
        progress('Metadata uploaded successfully', 20);
      } catch (error) {
        console.warn('Metadata upload failed, continuing without metadata:', error);
        // Continue without metadata if upload fails
        progress('Skipping metadata upload (failed)', 20);
      }
    } else {
      progress('Skipping metadata upload (no image/description)', 20);
    }

    // Step 2: Create mint
    progress('Creating token mint...', 30);
    const { mint, signature: createMintSig } = await createMint(
      wallet,
      decimals,
      wallet.publicKey,
      disableFreezeAuthority ? null : wallet.publicKey
    );
    signatures.createMint = createMintSig;
    progress('Token mint created', 45);

    // Step 3: Set on-chain metadata (if we have a metadata URI)
    let metadataAddress: PublicKey | undefined;
    if (metadataUri) {
      progress('Setting on-chain metadata...', 55);
      try {
        const metadataResult = await setTokenMetadata(
          {
            mint,
            uri: metadataUri,
            name,
            symbol,
            updateAuthority: metadataAuthority,
            creators: onChainCreators,
            isMutable: true,
          },
          wallet
        );
        metadataAddress = metadataResult.metadataAddress;
        signatures.createMetadata = metadataResult.signature;
        progress('Metadata set successfully', 65);
      } catch (error) {
        console.warn('Failed to set metadata, continuing:', error);
        progress('Skipping metadata (failed)', 65);
      }
    } else {
      progress('Skipping on-chain metadata', 65);
    }

    // Step 4: Create token account
    progress('Creating token account...', 70);
    const { tokenAccount, signature: createAccountSig } = await createTokenAccount(
      {
        mint,
        owner: ownerPublicKey,
      },
      wallet
    );
    if (createAccountSig) {
      signatures.createTokenAccount = createAccountSig;
    }
    progress('Token account created', 80);

    // Step 5: Mint initial supply (if specified)
    let mintTokensSig: string | undefined;
    if (initialSupply && initialSupply > 0) {
      progress(`Minting initial supply of ${initialSupply} tokens...`, 85);
      mintTokensSig = await mintTokens(
        {
          mint,
          destination: tokenAccount,
          amount: initialSupply,
          mintAuthority: wallet.publicKey,
          decimals,
        },
        wallet
      );
      signatures.mintTokens = mintTokensSig;
      progress('Initial supply minted', 90);
    } else {
      progress('Skipping initial mint', 90);
    }

    // Step 6: Renounce mint authority (if requested)
    if (shouldRenounceMintAuthority) {
      progress('Renouncing mint authority...', 95);
      const renounceSig = await renounceMintAuthority(mint, wallet);
      signatures.renounceMintAuthority = renounceSig;
      progress('Mint authority renounced', 98);
    }

    progress('Token creation complete!', 100);

    return {
      mintAddress: mint,
      tokenAccountAddress: tokenAccount,
      metadataUri,
      metadataAddress,
      signatures,
    };
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    throw new TokenError(
      TokenErrorType.UNKNOWN_ERROR,
      `Token creation failed: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Get token information from the blockchain
 *
 * @param mint - Mint public key
 * @returns Token mint information
 */
export async function getTokenInfo(mint: PublicKey) {
  try {
    const mintInfo = await getMint(connection, mint);
    return {
      address: mint.toBase58(),
      decimals: mintInfo.decimals,
      supply: Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals),
      mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
      freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
      isInitialized: mintInfo.isInitialized,
    };
  } catch (error) {
    throw new TokenError(
      TokenErrorType.NETWORK_ERROR,
      `Failed to fetch token info: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Get token account balance
 *
 * @param tokenAccount - Token account public key
 * @returns Token balance (accounting for decimals)
 */
export async function getTokenBalance(tokenAccount: PublicKey): Promise<number> {
  try {
    const accountInfo = await getAccount(connection, tokenAccount);
    const mintInfo = await getMint(connection, accountInfo.mint);
    return Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
  } catch (error) {
    throw new TokenError(
      TokenErrorType.NETWORK_ERROR,
      `Failed to fetch token balance: ${(error as Error).message}`,
      error as Error
    );
  }
}
