/**
 * Blockchain Chain Configurations
 *
 * Configuration for supported blockchain networks including RPC endpoints,
 * explorers, native tokens, and network-specific settings.
 */

import { Chain } from '@/types';
import { env } from './env';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Chain configuration interface
 */
export interface ChainConfig {
  /** Chain identifier */
  id: Chain;
  /** Chain name */
  name: string;
  /** Full chain name */
  fullName: string;
  /** Network type */
  network: 'mainnet' | 'testnet' | 'devnet';
  /** Chain ID (for EVM chains) */
  chainId?: number;
  /** RPC endpoint URL */
  rpcUrl: string;
  /** WebSocket endpoint URL (if available) */
  wsUrl?: string;
  /** Native token symbol */
  nativeToken: {
    symbol: string;
    name: string;
    decimals: number;
    logo?: string;
  };
  /** Block explorer configuration */
  explorer: {
    name: string;
    url: string;
    apiUrl?: string;
  };
  /** Icon/logo URL */
  icon: string;
  /** Is chain enabled */
  enabled: boolean;
  /** Token standard used */
  tokenStandard: 'spl-token' | 'erc20' | 'bep20';
  /** Average block time in seconds */
  blockTime: number;
  /** Gas/fee configuration */
  feeConfig: {
    /** Average transaction fee in native token */
    averageFee: number;
    /** Fee currency symbol */
    currency: string;
  };
}

// =============================================================================
// SOLANA CONFIGURATION
// =============================================================================

export const SOLANA_CONFIG: ChainConfig = {
  id: 'solana',
  name: 'Solana',
  fullName: 'Solana Blockchain',
  network: env.solana.network as 'mainnet' | 'testnet' | 'devnet',
  rpcUrl: env.solana.rpcEndpoint,
  wsUrl: env.solana.wsEndpoint,
  nativeToken: {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logo: '/tokens/sol.svg',
  },
  explorer: {
    name: 'Solana Explorer',
    url: 'https://explorer.solana.com',
    apiUrl: 'https://api.mainnet-beta.solana.com',
  },
  icon: '/chains/solana.svg',
  enabled: true,
  tokenStandard: 'spl-token',
  blockTime: 0.4, // ~400ms
  feeConfig: {
    averageFee: 0.000005, // 5,000 lamports
    currency: 'SOL',
  },
};

// =============================================================================
// BASE CONFIGURATION
// =============================================================================

export const BASE_CONFIG: ChainConfig = {
  id: 'base',
  name: 'Base',
  fullName: 'Base (Coinbase L2)',
  network: 'mainnet',
  chainId: 8453,
  rpcUrl: 'https://mainnet.base.org',
  wsUrl: 'wss://mainnet.base.org',
  nativeToken: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logo: '/tokens/eth.svg',
  },
  explorer: {
    name: 'BaseScan',
    url: 'https://basescan.org',
    apiUrl: 'https://api.basescan.org/api',
  },
  icon: '/chains/base.svg',
  enabled: true,
  tokenStandard: 'erc20',
  blockTime: 2, // ~2 seconds
  feeConfig: {
    averageFee: 0.0001,
    currency: 'ETH',
  },
};

// =============================================================================
// BNB SMART CHAIN CONFIGURATION
// =============================================================================

export const BNB_CONFIG: ChainConfig = {
  id: 'bnb',
  name: 'BNB Chain',
  fullName: 'BNB Smart Chain',
  network: 'mainnet',
  chainId: 56,
  rpcUrl: 'https://bsc-dataseed1.binance.org',
  wsUrl: 'wss://bsc-ws-node.nariox.org:443',
  nativeToken: {
    symbol: 'BNB',
    name: 'Binance Coin',
    decimals: 18,
    logo: '/tokens/bnb.svg',
  },
  explorer: {
    name: 'BscScan',
    url: 'https://bscscan.com',
    apiUrl: 'https://api.bscscan.com/api',
  },
  icon: '/chains/bnb.svg',
  enabled: true,
  tokenStandard: 'bep20',
  blockTime: 3, // ~3 seconds
  feeConfig: {
    averageFee: 0.0003,
    currency: 'BNB',
  },
};

// =============================================================================
// TESTNET CONFIGURATIONS
// =============================================================================

export const SOLANA_DEVNET_CONFIG: ChainConfig = {
  ...SOLANA_CONFIG,
  network: 'devnet',
  rpcUrl: 'https://api.devnet.solana.com',
  wsUrl: 'wss://api.devnet.solana.com',
};

export const BASE_TESTNET_CONFIG: ChainConfig = {
  ...BASE_CONFIG,
  name: 'Base Sepolia',
  fullName: 'Base Sepolia Testnet',
  network: 'testnet',
  chainId: 84532,
  rpcUrl: 'https://sepolia.base.org',
  wsUrl: 'wss://sepolia.base.org',
  explorer: {
    name: 'BaseScan Testnet',
    url: 'https://sepolia.basescan.org',
    apiUrl: 'https://api-sepolia.basescan.org/api',
  },
};

export const BNB_TESTNET_CONFIG: ChainConfig = {
  ...BNB_CONFIG,
  name: 'BNB Testnet',
  fullName: 'BNB Smart Chain Testnet',
  network: 'testnet',
  chainId: 97,
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  wsUrl: 'wss://testnet-dex.binance.org/api/ws',
  explorer: {
    name: 'BscScan Testnet',
    url: 'https://testnet.bscscan.com',
    apiUrl: 'https://api-testnet.bscscan.com/api',
  },
};

// =============================================================================
// CHAIN REGISTRY
// =============================================================================

/**
 * Map of all supported chains
 */
export const CHAINS: Record<Chain, ChainConfig> = {
  solana: SOLANA_CONFIG,
  base: BASE_CONFIG,
  bnb: BNB_CONFIG,
};

/**
 * Map of testnet configurations
 */
export const TESTNET_CHAINS: Record<Chain, ChainConfig> = {
  solana: SOLANA_DEVNET_CONFIG,
  base: BASE_TESTNET_CONFIG,
  bnb: BNB_TESTNET_CONFIG,
};

/**
 * Array of all chains
 */
export const ALL_CHAINS = Object.values(CHAINS);

/**
 * Array of enabled chains
 */
export const ENABLED_CHAINS = ALL_CHAINS.filter((chain) => chain.enabled);

// =============================================================================
// CHAIN UTILITIES
// =============================================================================

/**
 * Get chain configuration by ID
 */
export function getChainConfig(chainId: Chain, testnet = false): ChainConfig {
  return testnet ? TESTNET_CHAINS[chainId] : CHAINS[chainId];
}

/**
 * Get chain by chain ID (for EVM chains)
 */
export function getChainByChainId(chainId: number): ChainConfig | undefined {
  return ALL_CHAINS.find((chain) => chain.chainId === chainId);
}

/**
 * Get explorer URL for an address or transaction
 */
export function getExplorerUrl(
  chain: Chain,
  addressOrTx: string,
  type: 'address' | 'tx' | 'token' = 'address'
): string {
  const config = CHAINS[chain];

  switch (chain) {
    case 'solana': {
      const cluster = config.network !== 'mainnet' ? `?cluster=${config.network}` : '';
      return `${config.explorer.url}/${type === 'tx' ? 'tx' : type}/${addressOrTx}${cluster}`;
    }
    case 'base':
    case 'bnb': {
      const path = type === 'tx' ? 'tx' : type === 'token' ? 'token' : 'address';
      return `${config.explorer.url}/${path}/${addressOrTx}`;
    }
    default:
      return config.explorer.url;
  }
}

/**
 * Get RPC URL for a chain
 */
export function getRpcUrl(chain: Chain, testnet = false): string {
  return getChainConfig(chain, testnet).rpcUrl;
}

/**
 * Get WebSocket URL for a chain
 */
export function getWsUrl(chain: Chain, testnet = false): string | undefined {
  return getChainConfig(chain, testnet).wsUrl;
}

/**
 * Get native token symbol for a chain
 */
export function getNativeTokenSymbol(chain: Chain): string {
  return CHAINS[chain].nativeToken.symbol;
}

/**
 * Get native token decimals for a chain
 */
export function getNativeTokenDecimals(chain: Chain): number {
  return CHAINS[chain].nativeToken.decimals;
}

/**
 * Format native token amount with proper decimals
 */
export function formatNativeAmount(chain: Chain, amount: number): string {
  const decimals = getNativeTokenDecimals(chain);
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
}

/**
 * Check if chain is EVM-based
 */
export function isEvmChain(chain: Chain): boolean {
  return chain === 'base' || chain === 'bnb';
}

/**
 * Check if chain is Solana
 */
export function isSolanaChain(chain: Chain): boolean {
  return chain === 'solana';
}

/**
 * Get token standard for chain
 */
export function getTokenStandard(chain: Chain): 'spl-token' | 'erc20' | 'bep20' {
  return CHAINS[chain].tokenStandard;
}

/**
 * Get average block time for chain (in seconds)
 */
export function getBlockTime(chain: Chain): number {
  return CHAINS[chain].blockTime;
}

/**
 * Get average transaction fee for chain
 */
export function getAverageFee(chain: Chain): number {
  return CHAINS[chain].feeConfig.averageFee;
}

/**
 * Estimate transaction confirmation time in seconds
 */
export function estimateConfirmationTime(chain: Chain, confirmations = 1): number {
  return getBlockTime(chain) * confirmations;
}

// =============================================================================
// PROGRAM IDs / CONTRACT ADDRESSES
// =============================================================================

/**
 * Solana program IDs
 */
export const SOLANA_PROGRAMS = {
  TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  ASSOCIATED_TOKEN_PROGRAM_ID: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  SYSTEM_PROGRAM_ID: '11111111111111111111111111111111',
  RENT_PROGRAM_ID: 'SysvarRent111111111111111111111111111111111',
  METADATA_PROGRAM_ID: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
} as const;

/**
 * DEX program IDs / router addresses
 */
export const DEX_ADDRESSES = {
  solana: {
    raydium: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    orca: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    jupiter: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
  },
  base: {
    uniswap: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', // Uniswap V3 Router
    aerodrome: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
  },
  bnb: {
    pancakeswap: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2 Router
    biswap: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
  },
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export default CHAINS;
