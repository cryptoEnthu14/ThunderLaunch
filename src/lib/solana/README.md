# Solana Token Creation Utilities

Comprehensive TypeScript utilities for creating SPL tokens on Solana with full metadata support, IPFS integration, and error handling.

## Features

- ✅ **Complete Token Creation**: Create SPL tokens with a single function call
- ✅ **Metadata Support**: Automatic IPFS upload and on-chain metadata via Metaplex
- ✅ **Progress Tracking**: Real-time progress callbacks for UI integration
- ✅ **Error Handling**: Comprehensive error types and messages
- ✅ **TypeScript**: Full type safety and IntelliSense support
- ✅ **Flexible**: Use individual functions or the complete workflow
- ✅ **Production Ready**: Proper transaction confirmation and retries

## Installation

All dependencies are already installed in the project. Make sure your `.env.local` file is configured:

```bash
# Required for Solana connection
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_COMMITMENT=confirmed

# Required for IPFS metadata uploads
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## Quick Start

### Basic Token Creation

```typescript
import { createToken } from '@/lib/solana';
import { Keypair } from '@solana/web3.js';

// Create or load a wallet
const payer = Keypair.generate();

// Create a token
const result = await createToken(
  {
    name: 'Thunder Token',
    symbol: 'THUNDER',
    description: 'A powerful utility token',
    decimals: 9,
    initialSupply: 1000000,
    renounceMintAuthority: true,
    disableFreezeAuthority: true,
    onProgress: (step, progress) => {
      console.log(`${progress}%: ${step}`);
    },
  },
  payer
);

console.log('Token created!');
console.log('Mint Address:', result.mintAddress.toBase58());
console.log('Token Account:', result.tokenAccountAddress?.toBase58());
console.log('Metadata URI:', result.metadataUri);
```

### Token with Image and Metadata

```typescript
// Get image from file input
const imageFile = document.getElementById('image-input').files[0];

const result = await createToken(
  {
    name: 'My NFT Token',
    symbol: 'MNFT',
    description: 'A token with beautiful artwork',
    image: imageFile,
    externalUrl: 'https://mytoken.com',
    attributes: [
      { trait_type: 'Type', value: 'Utility' },
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Power', value: 9000 },
    ],
    decimals: 9,
    initialSupply: 1000000,
    onProgress: (step, progress) => {
      setProgress({ step, progress });
    },
  },
  payer
);
```

## API Reference

### Main Functions

#### `createToken(config, payer)`

Complete token creation workflow. Handles everything from metadata upload to minting.

**Parameters:**
- `config: CreateTokenConfig` - Token configuration
  - `name: string` - Token name (required, max 32 chars)
  - `symbol: string` - Token symbol (required, max 10 chars)
  - `description: string` - Token description (required)
  - `decimals?: number` - Number of decimals (default: 9, max: 9)
  - `image?: File | string` - Image file or data URL (optional)
  - `initialSupply?: number` - Initial tokens to mint (optional)
  - `renounceMintAuthority?: boolean` - Disable future minting (default: false)
  - `disableFreezeAuthority?: boolean` - Disable token freezing (default: true)
  - `externalUrl?: string` - Website URL (optional)
  - `attributes?: Array` - Metadata attributes (optional)
  - `onProgress?: ProgressCallback` - Progress updates (optional)
- `payer: Keypair` - Wallet that pays for and owns the token

**Returns:** `Promise<CreateTokenResult>`
```typescript
{
  mintAddress: PublicKey;           // Token mint address
  tokenAccountAddress?: PublicKey;  // Owner's token account
  metadataUri?: string;             // IPFS metadata URL
  metadataAddress?: PublicKey;      // On-chain metadata account
  signatures: {                     // Transaction signatures
    createMint?: string;
    createMetadata?: string;
    createTokenAccount?: string;
    mintTokens?: string;
    renounceMintAuthority?: string;
  };
}
```

### Individual Functions

#### `createMint(payer, decimals, mintAuthority?, freezeAuthority?)`

Create just the token mint without metadata or accounts.

```typescript
const { mint, signature } = await createMint(
  payer,
  9, // decimals
  payer.publicKey, // mint authority
  null // null = disable freeze
);
```

#### `createTokenAccount(config, payer)`

Create a token account for holding tokens.

```typescript
const { tokenAccount, signature } = await createTokenAccount(
  {
    mint: mintPublicKey,
    owner: ownerPublicKey,
  },
  payer
);
```

#### `mintTokens(config, payer)`

Mint tokens to a token account.

```typescript
const signature = await mintTokens(
  {
    mint: mintPublicKey,
    destination: tokenAccountPublicKey,
    amount: 1000000,
    mintAuthority: payer.publicKey,
    decimals: 9,
  },
  payer
);
```

#### `setTokenMetadata(config, payer)`

Add Metaplex metadata to a token.

```typescript
const { metadataAddress, signature } = await setTokenMetadata(
  {
    mint: mintPublicKey,
    uri: 'https://ipfs.io/ipfs/...',
    name: 'My Token',
    symbol: 'MTK',
    creators: [
      {
        address: payer.publicKey,
        verified: true,
        share: 100,
      },
    ],
  },
  payer
);
```

#### `uploadTokenMetadata(name, symbol, description, image?, options?, config?)`

Upload metadata to IPFS.

```typescript
const result = await uploadTokenMetadata(
  'My Token',
  'MTK',
  'A great token',
  imageFile,
  {
    externalUrl: 'https://mytoken.com',
    attributes: [{ trait_type: 'Type', value: 'Utility' }],
  }
);

console.log(result.metadataUri); // IPFS URL
```

### Utility Functions

```typescript
// Connection helpers
const network = getNetwork(); // 'devnet' | 'testnet' | 'mainnet-beta'
const isDevMode = isDevnet();
const balance = await getBalance(publicKey); // Balance in SOL
const exists = await accountExists(publicKey);

// Token info
const tokenInfo = await getTokenInfo(mintPublicKey);
const balance = await getTokenBalance(tokenAccountPublicKey);

// Devnet/testnet only
await requestAirdrop(publicKey, 1); // Request 1 SOL
```

## Error Handling

All functions throw `TokenError` with specific error types:

```typescript
import { TokenError, TokenErrorType } from '@/lib/solana';

try {
  const result = await createToken(config, payer);
} catch (error) {
  if (error instanceof TokenError) {
    switch (error.type) {
      case TokenErrorType.INSUFFICIENT_FUNDS:
        console.error('Not enough SOL to complete transaction');
        break;
      case TokenErrorType.NETWORK_ERROR:
        console.error('Network connection failed');
        break;
      case TokenErrorType.INVALID_PARAMETERS:
        console.error('Invalid configuration:', error.message);
        break;
      case TokenErrorType.TRANSACTION_FAILED:
        console.error('Transaction failed:', error.message);
        break;
      case TokenErrorType.METADATA_UPLOAD_FAILED:
        console.error('IPFS upload failed:', error.message);
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

## Progress Tracking

Track token creation progress for better UX:

```typescript
const [progress, setProgress] = useState({ step: '', progress: 0 });

const result = await createToken(
  {
    // ... config
    onProgress: (step, progress) => {
      setProgress({ step, progress });
      // Progress values: 0-100
      // Steps:
      // - "Uploading metadata to IPFS..." (10%)
      // - "Creating token mint..." (30%)
      // - "Setting on-chain metadata..." (55%)
      // - "Creating token account..." (70%)
      // - "Minting initial supply..." (85%)
      // - "Renouncing mint authority..." (95%)
      // - "Token creation complete!" (100%)
    },
  },
  payer
);

// Display in UI
<ProgressBar value={progress.progress} />
<Text>{progress.step}</Text>
```

## React Integration Example

```typescript
'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createToken } from '@/lib/solana';
import { Keypair } from '@solana/web3.js';

export default function CreateTokenForm() {
  const { publicKey } = useWallet();
  const [progress, setProgress] = useState({ step: '', progress: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setError(null);

      // In production, you'd use the connected wallet
      const payer = Keypair.generate(); // Demo only!

      const tokenResult = await createToken(
        {
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          image: formData.image,
          initialSupply: formData.supply,
          decimals: 9,
          renounceMintAuthority: formData.renounce,
          disableFreezeAuthority: true,
          onProgress: (step, prog) => {
            setProgress({ step, progress: prog });
          },
        },
        payer
      );

      setResult(tokenResult);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {/* Form UI */}
      {progress.progress > 0 && (
        <div>
          <ProgressBar value={progress.progress} />
          <p>{progress.step}</p>
        </div>
      )}
      {result && (
        <div>
          <h3>Token Created!</h3>
          <p>Mint: {result.mintAddress.toBase58()}</p>
          <p>Metadata: {result.metadataUri}</p>
        </div>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Environment Configuration

Always configure your environment variables properly:

```bash
# Development (.env.local)
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Production (.env.production)
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://your-premium-rpc.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

### 2. Error Handling

Always wrap token operations in try-catch blocks:

```typescript
try {
  const result = await createToken(config, payer);
  // Handle success
} catch (error) {
  // Handle error appropriately
  if (error instanceof TokenError) {
    // Show user-friendly error message
  }
}
```

### 3. Transaction Confirmation

The utilities handle transaction confirmation automatically, but you can customize timeouts:

```typescript
import { confirmTransaction } from '@/lib/solana';

await confirmTransaction(signature, {
  maxRetries: 50,
  timeout: 90000, // 90 seconds
});
```

### 4. Metadata Guidelines

- **Name**: Keep under 32 characters
- **Symbol**: Keep under 10 characters, use uppercase
- **Image**: Use PNG or JPG, recommended size: 512x512px or 1000x1000px
- **Description**: Be clear and concise

### 5. Security

- **Never** commit private keys or environment variables
- Use **devnet** for testing
- Test thoroughly before deploying to mainnet
- Consider using a **multi-sig** for important token operations
- **Renounce mint authority** carefully - it's irreversible!

## Testing

```typescript
// Test connection
import { testConnection, testIPFSConnection } from '@/lib/solana';

const solanaOk = await testConnection();
const ipfsOk = await testIPFSConnection();

console.log('Solana:', solanaOk ? '✅' : '❌');
console.log('IPFS:', ipfsOk ? '✅' : '❌');
```

## Troubleshooting

### "Insufficient funds" error
- Make sure your wallet has enough SOL for transactions
- On devnet, use `requestAirdrop()` to get test SOL

### "IPFS upload failed"
- Check your Pinata API keys in `.env.local`
- Verify your Pinata account is active
- Check image file size (max 100MB)

### "Transaction timeout"
- Network congestion can cause delays
- Increase timeout in confirmation config
- Try a different RPC endpoint

### "Invalid parameters"
- Check token name length (max 32 chars)
- Check symbol length (max 10 chars)
- Verify decimals is between 0-9

## Architecture

```
src/lib/solana/
├── index.ts           # Main exports
├── types.ts           # TypeScript types and interfaces
├── connection.ts      # Solana connection configuration
├── createToken.ts     # Token creation functions
├── uploadMetadata.ts  # IPFS/Arweave upload functions
└── README.md          # This file
```

## License

Part of the ThunderLaunch project.
