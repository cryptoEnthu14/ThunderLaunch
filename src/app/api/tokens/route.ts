/**
 * Tokens API Endpoint
 *
 * GET /api/tokens - Fetch tokens with filtering, sorting, and pagination
 *
 * Provides comprehensive token listing with search and filter capabilities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateApiKey } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Rate limiting map
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 60 * 1000;

/**
 * Check rate limit
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
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
 * Get client IP
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0] : 'unknown';
}

/**
 * GET /api/tokens
 *
 * Fetch tokens with filtering, sorting, and pagination
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sort_by: Field to sort by (created_at, market_cap, volume_24h, risk_score, price_change_24h)
 * - sort_order: Sort order (asc or desc, default: desc)
 * - chain: Filter by chain (solana, base, bnb)
 * - risk_level: Filter by risk level (low, medium, high, critical)
 * - verification_tier: Filter by verification (free, verified, premium)
 * - status: Filter by status (active, paused, delisted)
 * - min_market_cap: Minimum market cap
 * - max_market_cap: Maximum market cap
 * - min_liquidity: Minimum liquidity
 * - search: Search by name or symbol
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Validate sort field
    const validSortFields = [
      'created_at',
      'market_cap',
      'volume_24h',
      'risk_score',
      'price_change_24h',
      'holders_count',
      'current_price',
    ];

    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        {
          error: 'Invalid sort field',
          message: `sort_by must be one of: ${validSortFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Filters
    const chain = searchParams.get('chain');
    const riskLevel = searchParams.get('risk_level');
    const verificationTier = searchParams.get('verification_tier');
    const status = searchParams.get('status') || 'active';
    const minMarketCap = searchParams.get('min_market_cap');
    const maxMarketCap = searchParams.get('max_market_cap');
    const minLiquidity = searchParams.get('min_liquidity');
    const search = searchParams.get('search');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let query = supabase
      .from('tokens')
      .select('*', { count: 'exact' });

    // Apply filters
    if (chain) {
      query = query.eq('chain', chain);
    }

    if (riskLevel) {
      query = query.eq('risk_level', riskLevel);
    }

    if (verificationTier) {
      query = query.eq('verification_tier', verificationTier);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (minMarketCap) {
      query = query.gte('market_cap', parseFloat(minMarketCap));
    }

    if (maxMarketCap) {
      query = query.lte('market_cap', parseFloat(maxMarketCap));
    }

    if (minLiquidity) {
      query = query.gte('liquidity', parseFloat(minLiquidity));
    }

    // Search by name or symbol
    if (search) {
      query = query.or(`name.ilike.%${search}%,symbol.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching tokens:', error);
      return NextResponse.json(
        {
          error: 'Database error',
          message: 'Failed to fetch tokens',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages,
        hasMore,
        hasPrevious,
      },
      filters: {
        chain,
        riskLevel,
        verificationTier,
        status,
        minMarketCap,
        maxMarketCap,
        minLiquidity,
        search,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/tokens:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tokens
 *
 * Persist a newly created token to the database.
 * Uses the Supabase service role key so we can insert despite RLS.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: authResult.message,
        },
        { status: authResult.status ?? 401 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error: 'Service role key missing',
          message: 'SUPABASE_SERVICE_ROLE_KEY must be set on the server.',
        },
        { status: 500 }
      );
    }

    const payload = await request.json();

    // Basic payload validation
    const requiredFields = [
      'mint_address',
      'name',
      'symbol',
      'creator_wallet',
      'chain',
      'total_supply',
      'decimals',
    ];

    for (const field of requiredFields) {
      if (!payload[field]) {
        return NextResponse.json(
          {
            error: 'Missing required field',
            message: `${field} is required`,
          },
          { status: 400 }
        );
      }
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await serviceClient
      .from('tokens')
      .insert({
        ...payload,
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: payload.updated_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert token:', error);
      return NextResponse.json(
        {
          error: 'Database error',
          message: 'Failed to save token',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Token creation API error:', error);
    return NextResponse.json(
      {
        error: 'Unexpected error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
