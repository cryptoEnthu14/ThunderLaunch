import { vi, beforeAll, afterEach, afterAll } from 'vitest';

// Mock environment variables
process.env.NEXT_PUBLIC_SOLANA_NETWORK = 'devnet';
process.env.NEXT_PUBLIC_SOLANA_RPC_URL = 'https://api.devnet.solana.com';

// Mock Solana Web3.js
vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn(() => ({
    getAccountInfo: vi.fn(),
    getBalance: vi.fn(),
    getTokenAccountsByOwner: vi.fn(),
    getParsedTokenAccountsByOwner: vi.fn(),
    getSignaturesForAddress: vi.fn(),
    confirmTransaction: vi.fn(),
    sendRawTransaction: vi.fn(),
  })),
  PublicKey: vi.fn((key: string) => ({
    toString: () => key,
    toBase58: () => key,
    equals: (other: any) => key === other.toString(),
  })),
  Transaction: vi.fn(),
  SystemProgram: {
    transfer: vi.fn(),
    createAccount: vi.fn(),
  },
  LAMPORTS_PER_SOL: 1000000000,
  Keypair: {
    generate: vi.fn(() => ({
      publicKey: { toString: () => 'mock-public-key' },
      secretKey: new Uint8Array(64),
    })),
  },
}));

// Mock SPL Token
vi.mock('@solana/spl-token', () => ({
  TOKEN_PROGRAM_ID: { toString: () => 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
  ASSOCIATED_TOKEN_PROGRAM_ID: { toString: () => 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' },
  getAssociatedTokenAddress: vi.fn(),
  createAssociatedTokenAccountInstruction: vi.fn(),
  createTransferInstruction: vi.fn(),
  getAccount: vi.fn(),
  getMint: vi.fn(),
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));

// Mock axios for external API calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Setup and teardown
beforeAll(() => {
  // Global test setup
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

afterAll(() => {
  // Global test cleanup
  vi.restoreAllMocks();
});

// Export mock helpers
export const mockConnection = {
  getAccountInfo: vi.fn(),
  getBalance: vi.fn().mockResolvedValue(1000000000),
  getTokenAccountsByOwner: vi.fn().mockResolvedValue({ value: [] }),
};

export const mockPublicKey = (address: string = 'mock-address') => ({
  toString: () => address,
  toBase58: () => address,
  toBuffer: () => Buffer.from(address),
  equals: (other: any) => address === other?.toString?.(),
});
