import { timingSafeEqual } from 'crypto';
import { env } from '@/config/env';

interface ApiKeyValidationResult {
  valid: boolean;
  status?: number;
  message?: string;
}

/**
 * Extract API key from headers (supports X-API-Key and Authorization: Bearer)
 */
function extractApiKey(request: Request): string | null {
  const headerKey = request.headers.get('x-api-key');
  if (headerKey) return headerKey.trim();

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

/**
 * Validate that the incoming request provides the correct API secret key.
 *
 * Returns { valid: true } when authentication succeeds.
 * Otherwise returns { valid: false, status, message } describing the error.
 */
export function validateApiKey(request: Request): ApiKeyValidationResult {
  const configuredKey = env.security.apiSecretKey;

  if (!configuredKey) {
    return {
      valid: false,
      status: 500,
      message: 'API secret key is not configured on the server',
    };
  }

  const providedKey = extractApiKey(request);

  if (!providedKey) {
    return {
      valid: false,
      status: 401,
      message: 'Missing API key. Provide X-API-Key or Authorization header.',
    };
  }

  if (!safeCompare(providedKey, configuredKey)) {
    return {
      valid: false,
      status: 401,
      message: 'Invalid API key',
    };
  }

  return { valid: true };
}
