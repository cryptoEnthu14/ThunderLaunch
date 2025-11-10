/**
 * Security Check API Endpoint
 *
 * POST /api/security/check
 *
 * Runs comprehensive security analysis on a token and returns results.
 * Includes rate limiting and result caching for performance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runSecurityCheck, getCachedScanResult } from '@/lib/security';
import { createSecurityCheck, getSecurityCheck } from '@/lib/supabase/queries';

/**
 * Rate limiting map (in-memory, would use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

/**
 * POST /api/security/check
 *
 * Run security check on a token
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tokenAddress, tokenId, marketCap, tokenName, tokenSymbol, forceRefresh } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        {
          error: 'Missing required field',
          message: 'tokenAddress is required',
        },
        { status: 400 }
      );
    }

    // Check if we have cached results (unless force refresh)
    if (!forceRefresh) {
      // Try to get from cache first
      const cached = getCachedScanResult(tokenAddress);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
        });
      }

      // Try to get from database if tokenId provided
      if (tokenId) {
        const dbResult = await getSecurityCheck(tokenId);
        if (dbResult.data && !dbResult.error) {
          // Check if result is recent (less than 1 hour old)
          const resultAge = Date.now() - new Date(dbResult.data.created_at).getTime();
          const oneHour = 60 * 60 * 1000;

          if (resultAge < oneHour) {
            return NextResponse.json({
              success: true,
              data: dbResult.data,
              cached: true,
              source: 'database',
            });
          }
        }
      }
    }

    // Run fresh security check
    const scanResult = await runSecurityCheck(tokenAddress, {
      tokenName,
      tokenSymbol,
      marketCap,
      enableCache: true,
    });

    // Save to database if tokenId provided
    if (tokenId) {
      try {
        await createSecurityCheck({
          token_id: tokenId,
          token_address: tokenAddress,
          risk_level: scanResult.securityCheck.risk_level,
          risk_score: scanResult.securityCheck.risk_score,
          status: 'completed',
          findings: scanResult.securityCheck.findings as any,
          passed_checks: scanResult.securityCheck.passed_checks,
          failed_checks: scanResult.securityCheck.failed_checks,
          warning_checks: scanResult.securityCheck.warning_checks,
          total_checks: scanResult.securityCheck.total_checks,
          security_score: scanResult.securityCheck.security_score,
          is_contract_verified: scanResult.securityCheck.is_contract_verified,
          is_audited: scanResult.securityCheck.is_audited,
        });
      } catch (dbError) {
        // Log error but don't fail the request
        console.error('Failed to save security check to database:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      data: scanResult,
      cached: false,
    });
  } catch (error) {
    console.error('Security check error:', error);

    return NextResponse.json(
      {
        error: 'Security check failed',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/security/check?tokenAddress=...
 *
 * Get cached security check results
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenAddress = searchParams.get('tokenAddress');
    const tokenId = searchParams.get('tokenId');

    if (!tokenAddress && !tokenId) {
      return NextResponse.json(
        {
          error: 'Missing required parameter',
          message: 'Either tokenAddress or tokenId is required',
        },
        { status: 400 }
      );
    }

    // Try cache first
    if (tokenAddress) {
      const cached = getCachedScanResult(tokenAddress);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
        });
      }
    }

    // Try database
    if (tokenId) {
      const dbResult = await getSecurityCheck(tokenId);
      if (dbResult.data && !dbResult.error) {
        return NextResponse.json({
          success: true,
          data: dbResult.data,
          cached: true,
          source: 'database',
        });
      }
    }

    return NextResponse.json(
      {
        error: 'No cached results found',
        message: 'Run a POST request to generate new security check results',
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Get security check error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get security check',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
