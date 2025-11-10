/**
 * Metadata Upload Utilities
 *
 * This module provides functions for uploading token metadata and images
 * to decentralized storage (IPFS via Pinata or Irys/Arweave)
 */

import axios, { AxiosError } from 'axios';
import {
  TokenMetadata,
  IPFSUploadConfig,
  IPFSUploadResult,
  MetadataUploadResult,
  TokenError,
  TokenErrorType,
} from './types';

/**
 * Default IPFS gateway
 */
const DEFAULT_IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

/**
 * Pinata API endpoints
 */
const PINATA_API = {
  pinFileToIPFS: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
  pinJSONToIPFS: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
};

/**
 * Upload an image to IPFS via Pinata
 *
 * @param image - Image file or data URL
 * @param config - IPFS upload configuration
 * @returns IPFS upload result with hash and URL
 */
export async function uploadImageToIPFS(
  image: File | string,
  config: IPFSUploadConfig = {}
): Promise<IPFSUploadResult> {
  const apiKey = config.apiKey || process.env.PINATA_API_KEY;
  const secretKey = config.secretKey || process.env.PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new TokenError(
      TokenErrorType.METADATA_UPLOAD_FAILED,
      'IPFS credentials not configured. Please set PINATA_API_KEY and PINATA_SECRET_KEY in environment variables.'
    );
  }

  try {
    let formData: FormData;

    // Handle File object
    if (image instanceof File) {
      formData = new FormData();
      formData.append('file', image);

      // Add metadata
      const metadata = JSON.stringify({
        name: image.name,
        keyvalues: {
          type: 'token-image',
          timestamp: Date.now().toString(),
        },
      });
      formData.append('pinataMetadata', metadata);

      // Add options
      const options = JSON.stringify({
        cidVersion: 1,
      });
      formData.append('pinataOptions', options);
    }
    // Handle data URL
    else if (typeof image === 'string') {
      // Convert data URL to blob
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], 'image.png', { type: blob.type });

      formData = new FormData();
      formData.append('file', file);

      const metadata = JSON.stringify({
        name: 'token-image',
        keyvalues: {
          type: 'token-image',
          timestamp: Date.now().toString(),
        },
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 1,
      });
      formData.append('pinataOptions', options);
    } else {
      throw new TokenError(
        TokenErrorType.INVALID_PARAMETERS,
        'Invalid image format. Expected File or data URL string.'
      );
    }

    // Upload to Pinata
    const uploadResponse = await axios.post(
      PINATA_API.pinFileToIPFS,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const ipfsHash = uploadResponse.data.IpfsHash;
    const gateway = config.gateway || DEFAULT_IPFS_GATEWAY;
    const url = `${gateway}${ipfsHash}`;
    const size = uploadResponse.data.PinSize || 0;

    return {
      ipfsHash,
      url,
      size,
    };
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      throw new TokenError(
        TokenErrorType.METADATA_UPLOAD_FAILED,
        `IPFS upload failed: ${axiosError.response.status} - ${JSON.stringify(
          axiosError.response.data
        )}`,
        error as Error
      );
    }

    throw new TokenError(
      TokenErrorType.METADATA_UPLOAD_FAILED,
      `Failed to upload image to IPFS: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata
 *
 * @param metadata - Token metadata object
 * @param config - IPFS upload configuration
 * @returns IPFS upload result with hash and URL
 */
export async function uploadJSONToIPFS(
  metadata: TokenMetadata,
  config: IPFSUploadConfig = {}
): Promise<IPFSUploadResult> {
  const apiKey = config.apiKey || process.env.PINATA_API_KEY;
  const secretKey = config.secretKey || process.env.PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new TokenError(
      TokenErrorType.METADATA_UPLOAD_FAILED,
      'IPFS credentials not configured. Please set PINATA_API_KEY and PINATA_SECRET_KEY in environment variables.'
    );
  }

  try {
    const data = {
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.symbol}-metadata.json`,
        keyvalues: {
          type: 'token-metadata',
          symbol: metadata.symbol,
          timestamp: Date.now().toString(),
        },
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    const response = await axios.post(PINATA_API.pinJSONToIPFS, data, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey,
      },
    });

    const ipfsHash = response.data.IpfsHash;
    const gateway = config.gateway || DEFAULT_IPFS_GATEWAY;
    const url = `${gateway}${ipfsHash}`;
    const size = response.data.PinSize || 0;

    return {
      ipfsHash,
      url,
      size,
    };
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      throw new TokenError(
        TokenErrorType.METADATA_UPLOAD_FAILED,
        `IPFS upload failed: ${axiosError.response.status} - ${JSON.stringify(
          axiosError.response.data
        )}`,
        error as Error
      );
    }

    throw new TokenError(
      TokenErrorType.METADATA_UPLOAD_FAILED,
      `Failed to upload metadata to IPFS: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Create token metadata JSON object
 *
 * @param name - Token name
 * @param symbol - Token symbol
 * @param description - Token description
 * @param imageUri - Image URI (IPFS or HTTP)
 * @param options - Additional metadata options
 * @returns Formatted token metadata
 */
export function createTokenMetadata(
  name: string,
  symbol: string,
  description: string,
  imageUri?: string,
  options?: {
    externalUrl?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
    creators?: Array<{ address: string; share: number }>;
  }
): TokenMetadata {
  const metadata: TokenMetadata = {
    name,
    symbol,
    description,
  };

  if (imageUri) {
    metadata.image = imageUri;
  }

  if (options?.externalUrl) {
    metadata.external_url = options.externalUrl;
  }

  if (options?.attributes && options.attributes.length > 0) {
    metadata.attributes = options.attributes;
  }

  if (options?.creators && options.creators.length > 0) {
    metadata.properties = {
      category: 'token',
      creators: options.creators,
    };

    if (imageUri) {
      metadata.properties.files = [
        {
          uri: imageUri,
          type: imageUri.endsWith('.png')
            ? 'image/png'
            : imageUri.endsWith('.jpg') || imageUri.endsWith('.jpeg')
            ? 'image/jpeg'
            : 'image/*',
        },
      ];
    }
  }

  return metadata;
}

/**
 * Upload complete token metadata (image + JSON) to IPFS
 *
 * This is the main function to use for uploading token metadata.
 * It handles both image and JSON uploads in the correct order.
 *
 * @param name - Token name
 * @param symbol - Token symbol
 * @param description - Token description
 * @param image - Image file or data URL (optional)
 * @param options - Additional metadata options
 * @param config - IPFS upload configuration
 * @returns Complete metadata upload result
 */
export async function uploadTokenMetadata(
  name: string,
  symbol: string,
  description: string,
  image?: File | string,
  options?: {
    externalUrl?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
    creators?: Array<{ address: string; share: number }>;
  },
  config: IPFSUploadConfig = {}
): Promise<MetadataUploadResult> {
  try {
    let imageUri: string | undefined;
    let imageHash: string | undefined;

    // Step 1: Upload image if provided
    if (image) {
      const imageResult = await uploadImageToIPFS(image, config);
      imageUri = imageResult.url;
      imageHash = imageResult.ipfsHash;
    }

    // Step 2: Create metadata JSON
    const metadata = createTokenMetadata(
      name,
      symbol,
      description,
      imageUri,
      options
    );

    // Step 3: Upload metadata JSON
    const metadataResult = await uploadJSONToIPFS(metadata, config);

    return {
      metadataUri: metadataResult.url,
      imageUri,
      ipfsHashes: {
        metadata: metadataResult.ipfsHash,
        image: imageHash,
      },
    };
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    throw new TokenError(
      TokenErrorType.METADATA_UPLOAD_FAILED,
      `Failed to upload token metadata: ${(error as Error).message}`,
      error as Error
    );
  }
}

/**
 * Validate IPFS URL format
 *
 * @param url - URL to validate
 * @returns True if valid IPFS URL
 */
export function isValidIPFSUrl(url: string): boolean {
  // Check for IPFS gateway URLs
  if (url.includes('/ipfs/')) {
    return true;
  }

  // Check for ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return true;
  }

  return false;
}

/**
 * Convert IPFS hash to gateway URL
 *
 * @param ipfsHash - IPFS hash (CID)
 * @param gateway - Optional custom gateway
 * @returns Full IPFS URL
 */
export function ipfsHashToUrl(
  ipfsHash: string,
  gateway?: string
): string {
  const gatewayUrl = gateway || DEFAULT_IPFS_GATEWAY;
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace('ipfs://', '');
  return `${gatewayUrl}${hash}`;
}

/**
 * Extract IPFS hash from URL
 *
 * @param url - IPFS URL
 * @returns IPFS hash (CID)
 */
export function extractIPFSHash(url: string): string | null {
  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }

  // Handle gateway URLs
  const match = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Test IPFS connection by attempting to access a known CID
 *
 * @param config - IPFS configuration
 * @returns True if IPFS is accessible
 */
export async function testIPFSConnection(
  config: IPFSUploadConfig = {}
): Promise<boolean> {
  try {
    const gateway = config.gateway || DEFAULT_IPFS_GATEWAY;
    // Test with a known IPFS CID (IPFS logo)
    const testCid = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
    const response = await axios.head(`${gateway}${testCid}`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('IPFS connection test failed:', error);
    return false;
  }
}
