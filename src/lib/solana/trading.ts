/**
 * Solana Trading Execution Functions
 *
 * Comprehensive trading functions for buying and selling tokens
 * using bonding curve pricing on Solana blockchain.
 *
 * @example Execute a buy trade
 * ```typescript
 * import { executeBuy } from '@/lib/solana/trading';
 * import { useWallet } from '@solana/wallet-adapter-react';
 *
 * const { publicKey, signTransaction } = useWallet();
 *
 * const result = await executeBuy(
 *   {
 *     tokenMint: new PublicKey('...'),
 *     userWallet: publicKey,
 *     poolAddress: new PublicKey('...'),
 *     currentSupply: 1000000,
 *     solAmount: 1.5,
 *     slippageTolerance: 0.01,
 *     onProgress: (step, progress) => console.log(`${progress}%: ${step}`),
 *   },
 *   signTransaction
 * );
 * ```
 */

import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createBurnInstruction,
  getMint,
  getAccount,
  createMintToInstruction,
} from '@solana/spl-token';
import { connection, confirmTransaction, getBalance, accountExists } from './connection';
import {
  completeBuyCalculation,
  completeSellCalculation,
  getCurrentPrice,
  BondingCurveType,
} from '@/lib/bonding-curve';
import {
  PLATFORM_FEE_PERCENTAGE,
  CREATOR_FEE_PERCENTAGE,
  MIN_BUY_AMOUNT_SOL,
  MIN_SELL_AMOUNT_TOKENS,
} from '@/lib/bonding-curve/constants';
import type {
  BuyTradeConfig,
  SellTradeConfig,
  TradeExecutionResult,
  TradePreview,
  TokenPriceInfo,
  PoolLiquidityInfo,
  TradeError,
  TradeErrorType,
  TradeMonitoringOptions,
  TransactionStatus,
} from './tradingTypes';

/**
 * Type for wallet adapter's signTransaction function
 */
type SignTransaction = (transaction: Transaction) => Promise<Transaction>;

/**
 * Execute a buy trade
 *
 * @param config - Buy trade configuration
 * @param signTransaction - Wallet adapter sign function
 * @returns Trade execution result
 *
 * @example
 * ```typescript
 * const result = await executeBuy({
 *   tokenMint: new PublicKey('...'),
 *   userWallet: publicKey,
 *   poolAddress: new PublicKey('...'),
 *   currentSupply: 1000000,
 *   solAmount: 1.5,
 *   slippageTolerance: 0.01,
 * }, signTransaction);
 * ```
 */
export async function executeBuy(
  config: BuyTradeConfig,
  signTransaction: SignTransaction
): Promise<TradeExecutionResult> {
  const {
    tokenMint,
    userWallet,
    poolAddress,
    currentSupply,
    solAmount,
    curveType = BondingCurveType.LINEAR,
    slippageTolerance = 0.01,
    onProgress,
  } = config;

  try {
    // Validate inputs
    onProgress?.('Validating trade parameters', 5);
    validateBuyTrade(solAmount, slippageTolerance);

    // Check user balance
    onProgress?.('Checking SOL balance', 10);
    const userBalance = await getBalance(userWallet);
    if (userBalance < solAmount) {
      throw createTradeError(
        'INSUFFICIENT_SOL' as TradeErrorType,
        `Insufficient SOL balance. Required: ${solAmount}, Available: ${userBalance}`
      );
    }

    // Calculate trade details
    onProgress?.('Calculating trade details', 20);
    const calculation = completeBuyCalculation(solAmount, currentSupply, curveType);

    // Check slippage
    if (calculation.priceImpact > slippageTolerance) {
      throw createTradeError(
        'SLIPPAGE_EXCEEDED' as TradeErrorType,
        `Price impact ${(calculation.priceImpact * 100).toFixed(2)}% exceeds tolerance ${(slippageTolerance * 100).toFixed(2)}%`
      );
    }

    // Get or create user token account
    onProgress?.('Preparing token account', 30);
    const userTokenAccount = await getOrCreateTokenAccount(
      userWallet,
      tokenMint,
      userWallet
    );

    // Build transaction
    onProgress?.('Building transaction', 40);
    const transaction = new Transaction();

    // Add instruction to transfer SOL to pool
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: userWallet,
        toPubkey: poolAddress,
        lamports: Math.floor(solAmount * LAMPORTS_PER_SOL),
      })
    );

    // Add instruction to mint tokens to user
    // Note: In production, this would be handled by a program
    // For now, this is a simplified version
    transaction.add(
      createMintToInstruction(
        tokenMint,
        userTokenAccount,
        poolAddress, // Mint authority (in production, this would be the program)
        Math.floor(calculation.tokensReceived),
        []
      )
    );

    // Get recent blockhash
    onProgress?.('Getting blockhash', 50);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = userWallet;

    // Sign transaction
    onProgress?.('Waiting for signature', 60);
    const signedTransaction = await signTransaction(transaction);

    // Send transaction
    onProgress?.('Sending transaction', 70);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }
    );

    // Confirm transaction
    onProgress?.('Confirming transaction', 80);
    await confirmTransaction(signature, {
      maxRetries: 30,
      timeout: 60000,
    });

    onProgress?.('Trade completed', 100);

    // Return result
    return {
      signature,
      tradeType: 'buy',
      tokenAmount: calculation.tokensReceived,
      solAmount: calculation.totalCost,
      price: calculation.averagePrice,
      platformFee: calculation.platformFee,
      creatorFee: calculation.creatorFee,
      totalFees: calculation.totalFees,
      actualSlippage: calculation.priceImpact,
      newSupply: calculation.newSupply,
      timestamp: Date.now(),
    };
  } catch (error) {
    if (isTradeError(error)) {
      throw error;
    }
    throw createTradeError(
      'TRANSACTION_FAILED' as TradeErrorType,
      `Buy transaction failed: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Execute a sell trade
 *
 * @param config - Sell trade configuration
 * @param signTransaction - Wallet adapter sign function
 * @returns Trade execution result
 *
 * @example
 * ```typescript
 * const result = await executeSell({
 *   tokenMint: new PublicKey('...'),
 *   userWallet: publicKey,
 *   poolAddress: new PublicKey('...'),
 *   currentSupply: 1000000,
 *   tokenAmount: 1000,
 *   slippageTolerance: 0.01,
 * }, signTransaction);
 * ```
 */
export async function executeSell(
  config: SellTradeConfig,
  signTransaction: SignTransaction
): Promise<TradeExecutionResult> {
  const {
    tokenMint,
    userWallet,
    poolAddress,
    currentSupply,
    tokenAmount,
    curveType = BondingCurveType.LINEAR,
    slippageTolerance = 0.01,
    onProgress,
  } = config;

  try {
    // Validate inputs
    onProgress?.('Validating trade parameters', 5);
    validateSellTrade(tokenAmount, slippageTolerance);

    // Get user token account
    onProgress?.('Checking token balance', 10);
    const userTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      userWallet
    );

    // Check if account exists
    const accountInfo = await getAccount(connection, userTokenAccount);
    const userBalance = Number(accountInfo.amount);

    if (userBalance < tokenAmount) {
      throw createTradeError(
        'INSUFFICIENT_TOKENS' as TradeErrorType,
        `Insufficient token balance. Required: ${tokenAmount}, Available: ${userBalance}`
      );
    }

    // Calculate trade details
    onProgress?.('Calculating trade details', 20);
    const calculation = completeSellCalculation(tokenAmount, currentSupply, curveType);

    // Check slippage
    if (calculation.priceImpact > slippageTolerance) {
      throw createTradeError(
        'SLIPPAGE_EXCEEDED' as TradeErrorType,
        `Price impact ${(calculation.priceImpact * 100).toFixed(2)}% exceeds tolerance ${(slippageTolerance * 100).toFixed(2)}%`
      );
    }

    // Build transaction
    onProgress?.('Building transaction', 40);
    const transaction = new Transaction();

    // Add instruction to burn user's tokens
    transaction.add(
      createBurnInstruction(
        userTokenAccount,
        tokenMint,
        userWallet,
        Math.floor(tokenAmount)
      )
    );

    // Add instruction to transfer SOL from pool to user
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: poolAddress,
        toPubkey: userWallet,
        lamports: Math.floor(calculation.proceeds * LAMPORTS_PER_SOL),
      })
    );

    // Get recent blockhash
    onProgress?.('Getting blockhash', 50);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = userWallet;

    // Sign transaction
    onProgress?.('Waiting for signature', 60);
    const signedTransaction = await signTransaction(transaction);

    // Send transaction
    onProgress?.('Sending transaction', 70);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }
    );

    // Confirm transaction
    onProgress?.('Confirming transaction', 80);
    await confirmTransaction(signature, {
      maxRetries: 30,
      timeout: 60000,
    });

    onProgress?.('Trade completed', 100);

    // Return result
    return {
      signature,
      tradeType: 'sell',
      tokenAmount: calculation.tokensSold,
      solAmount: calculation.proceeds,
      price: calculation.averagePrice,
      platformFee: calculation.platformFee,
      creatorFee: calculation.creatorFee,
      totalFees: calculation.totalFees,
      actualSlippage: calculation.priceImpact,
      newSupply: calculation.newSupply,
      timestamp: Date.now(),
    };
  } catch (error) {
    if (isTradeError(error)) {
      throw error;
    }
    throw createTradeError(
      'TRANSACTION_FAILED' as TradeErrorType,
      `Sell transaction failed: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Get current token price
 *
 * @param tokenMint - Token mint address
 * @param currentSupply - Current token supply
 * @param curveType - Bonding curve type
 * @returns Token price information
 */
export async function getTokenPrice(
  tokenMint: PublicKey,
  currentSupply: number,
  curveType: BondingCurveType = BondingCurveType.LINEAR
): Promise<TokenPriceInfo> {
  const priceInfo = getCurrentPrice(currentSupply, curveType);

  return {
    priceInSol: priceInfo.price,
    supply: currentSupply,
    marketCapSol: priceInfo.price * currentSupply,
    timestamp: Date.now(),
  };
}

/**
 * Get pool liquidity information
 *
 * @param poolAddress - Pool address
 * @param tokenMint - Token mint address
 * @param currentSupply - Current token supply
 * @param curveType - Bonding curve type
 * @returns Pool liquidity info
 */
export async function getPoolLiquidity(
  poolAddress: PublicKey,
  tokenMint: PublicKey,
  currentSupply: number,
  curveType: BondingCurveType = BondingCurveType.LINEAR
): Promise<PoolLiquidityInfo> {
  // Get pool SOL balance
  const poolBalance = await getBalance(poolAddress);

  // Get token reserves (simplified - in production would query actual reserves)
  const tokenReserves = currentSupply;

  return {
    poolAddress,
    tokenMint,
    solReserves: poolBalance,
    tokenReserves,
    totalLiquiditySol: poolBalance,
    currentSupply,
    curveType,
  };
}

/**
 * Estimate buy amount (preview trade)
 *
 * @param solAmount - Amount of SOL to spend
 * @param currentSupply - Current token supply
 * @param curveType - Bonding curve type
 * @param slippageTolerance - Slippage tolerance (0-1)
 * @returns Trade preview
 */
export function estimateBuyAmount(
  solAmount: number,
  currentSupply: number,
  curveType: BondingCurveType = BondingCurveType.LINEAR,
  slippageTolerance: number = 0.01
): TradePreview {
  const calculation = completeBuyCalculation(solAmount, currentSupply, curveType);

  return {
    expectedOutput: calculation.tokensReceived,
    price: calculation.averagePrice,
    priceImpact: calculation.priceImpact,
    platformFee: calculation.platformFee,
    creatorFee: calculation.creatorFee,
    totalFees: calculation.totalFees,
    minimumOutput: calculation.tokensReceived * (1 - slippageTolerance),
    newSupply: calculation.newSupply,
  };
}

/**
 * Estimate sell proceeds (preview trade)
 *
 * @param tokenAmount - Amount of tokens to sell
 * @param currentSupply - Current token supply
 * @param curveType - Bonding curve type
 * @param slippageTolerance - Slippage tolerance (0-1)
 * @returns Trade preview
 */
export function estimateSellProceeds(
  tokenAmount: number,
  currentSupply: number,
  curveType: BondingCurveType = BondingCurveType.LINEAR,
  slippageTolerance: number = 0.01
): TradePreview {
  const calculation = completeSellCalculation(tokenAmount, currentSupply, curveType);

  return {
    expectedOutput: calculation.proceeds,
    price: calculation.averagePrice,
    priceImpact: calculation.priceImpact,
    platformFee: calculation.platformFee,
    creatorFee: calculation.creatorFee,
    totalFees: calculation.totalFees,
    minimumOutput: calculation.proceeds * (1 - slippageTolerance),
    newSupply: calculation.newSupply,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get or create associated token account
 */
async function getOrCreateTokenAccount(
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const associatedTokenAddress = await getAssociatedTokenAddress(mint, owner);

  // Check if account exists
  const exists = await accountExists(associatedTokenAddress);

  if (!exists) {
    // In a real implementation, you would create the account
    // For now, we'll just return the address
    // The creation would be added to the transaction
  }

  return associatedTokenAddress;
}

/**
 * Validate buy trade parameters
 */
function validateBuyTrade(solAmount: number, slippageTolerance: number): void {
  if (solAmount <= 0) {
    throw createTradeError(
      'INVALID_AMOUNT' as TradeErrorType,
      'SOL amount must be greater than 0'
    );
  }

  if (solAmount < MIN_BUY_AMOUNT_SOL) {
    throw createTradeError(
      'INVALID_AMOUNT' as TradeErrorType,
      `Minimum buy amount is ${MIN_BUY_AMOUNT_SOL} SOL`
    );
  }

  if (slippageTolerance < 0 || slippageTolerance > 1) {
    throw createTradeError(
      'INVALID_AMOUNT' as TradeErrorType,
      'Slippage tolerance must be between 0 and 1'
    );
  }
}

/**
 * Validate sell trade parameters
 */
function validateSellTrade(tokenAmount: number, slippageTolerance: number): void {
  if (tokenAmount <= 0) {
    throw createTradeError(
      'INVALID_AMOUNT' as TradeErrorType,
      'Token amount must be greater than 0'
    );
  }

  if (tokenAmount < MIN_SELL_AMOUNT_TOKENS) {
    throw createTradeError(
      'INVALID_AMOUNT' as TradeErrorType,
      `Minimum sell amount is ${MIN_SELL_AMOUNT_TOKENS} tokens`
    );
  }

  if (slippageTolerance < 0 || slippageTolerance > 1) {
    throw createTradeError(
      'INVALID_AMOUNT' as TradeErrorType,
      'Slippage tolerance must be between 0 and 1'
    );
  }
}

/**
 * Create a trade error
 */
function createTradeError(
  type: TradeErrorType,
  message: string,
  originalError?: Error
): TradeError {
  const error = new Error(message) as TradeError;
  error.type = type;
  error.originalError = originalError;
  error.name = 'TradeError';
  return error;
}

/**
 * Check if error is a TradeError
 */
function isTradeError(error: unknown): error is TradeError {
  return error instanceof Error && error.name === 'TradeError';
}

/**
 * Monitor transaction status
 *
 * @param signature - Transaction signature
 * @param options - Monitoring options
 * @returns Promise that resolves when transaction is confirmed
 */
export async function monitorTransaction(
  signature: string,
  options: TradeMonitoringOptions = {}
): Promise<void> {
  const {
    timeout = 60000,
    pollingInterval = 2000,
    maxRetries = 30,
    onStatusChange,
  } = options;

  const startTime = Date.now();
  let retries = 0;

  onStatusChange?.('SUBMITTED' as TransactionStatus);

  while (retries < maxRetries) {
    if (Date.now() - startTime > timeout) {
      onStatusChange?.('FAILED' as TransactionStatus);
      throw new Error('Transaction confirmation timeout');
    }

    try {
      const status = await connection.getSignatureStatus(signature);

      if (status?.value?.confirmationStatus === 'confirmed' ||
          status?.value?.confirmationStatus === 'finalized') {
        if (status.value.err) {
          onStatusChange?.('FAILED' as TransactionStatus);
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        }
        onStatusChange?.('CONFIRMED' as TransactionStatus);
        return;
      }

      onStatusChange?.('CONFIRMING' as TransactionStatus);
    } catch (error) {
      if (retries >= maxRetries - 1) {
        onStatusChange?.('FAILED' as TransactionStatus);
        throw error;
      }
    }

    await new Promise(resolve => setTimeout(resolve, pollingInterval));
    retries++;
  }

  onStatusChange?.('FAILED' as TransactionStatus);
  throw new Error('Transaction not confirmed after maximum retries');
}
