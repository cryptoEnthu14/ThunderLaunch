/**
 * Trades API Endpoint
 *
 * POST /api/trades - Record a new trade
 * GET /api/trades - Fetch trades with filtering
 *
 * Handles trade recording and retrieval with validation and error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateApiKey } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Rate limiting map (in-memory, would use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

/**
 * Check rate limit for IP address
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
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

/**
 * POST /api/trades
 *
 * Record a new trade in the database
 *
 * Request body:
 * {
 *   token_address: string;
 *   wallet_address: string;
 *   trade_type: 'buy' | 'sell';
 *   token_amount: string;
 *   native_amount: number;
 *   price_usd: number;
 *   price_native: number;
 *   transaction_signature: string;
 *   slippage_tolerance: number;
 *   actual_slippage?: number;
 *   platform_fee: number;
 *   total_fee: number;
 * }
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
    const {
      token_address,
      wallet_address,
      trade_type,
      token_amount,
      native_amount,
      price_usd,
      price_native,
      transaction_signature,
      slippage_tolerance,
      actual_slippage,
      platform_fee,
      total_fee,
    } = body;

    // Validate required fields
    if (!token_address || !wallet_address || !trade_type || !token_amount || !transaction_signature) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'token_address, wallet_address, trade_type, token_amount, and transaction_signature are required',
        },
        { status: 400 }
      );
    }

    // Validate trade type
    if (trade_type !== 'buy' && trade_type !== 'sell') {
      return NextResponse.json(
        {
          error: 'Invalid trade type',
          message: 'trade_type must be "buy" or "sell"',
        },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get token info to populate token_id
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('id')
      .eq('mint_address', token_address)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        {
          error: 'Token not found',
          message: `Token with address ${token_address} not found in database`,
        },
        { status: 404 }
      );
    }

    // Calculate USD amount if not provided
    const usd_amount = body.usd_amount || native_amount * 100; // Assuming 1 SOL = $100 for now

    // Insert trade record
    const { data: tradeData, error: tradeError } = await supabase
      .from('trades')
      .insert({
        token_id: tokenData.id,
        token_address,
        wallet_address,
        trade_type,
        order_type: 'market',
        status: 'confirmed',
        token_amount: token_amount.toString(),
        native_amount,
        usd_amount,
        price_native,
        price_usd,
        slippage_tolerance: slippage_tolerance || 0.01,
        actual_slippage: actual_slippage || 0,
        transaction_fee: 0.000005, // Standard Solana fee
        platform_fee,
        total_fee,
        transaction_signature,
        chain: 'solana',
        priority: 'medium',
        retry_count: 0,
      })
      .select()
      .single();

    if (tradeError) {
      console.error('Error inserting trade:', tradeError);
      return NextResponse.json(
        {
          error: 'Database error',
          message: 'Failed to record trade',
          details: tradeError.message,
        },
        { status: 500 }
      );
    }

    // Update token statistics
    await updateTokenStats(supabase, tokenData.id, trade_type, parseFloat(token_amount), usd_amount);

    return NextResponse.json({
      success: true,
      data: tradeData,
    });
  } catch (error) {
    console.error('Error in POST /api/trades:', error);
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
 * GET /api/trades
 *
 * Fetch trades with optional filtering
 *
 * Query parameters:
 * - token_address: Filter by token address
 * - wallet_address: Filter by wallet address
 * - trade_type: Filter by trade type ('buy' or 'sell')
 * - limit: Number of trades to return (default: 20, max: 100)
 * - offset: Number of trades to skip (default: 0)
 * - sort: Sort order ('asc' or 'desc', default: 'desc')
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
    const token_address = searchParams.get('token_address');
    const wallet_address = searchParams.get('wallet_address');
    const trade_type = searchParams.get('trade_type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'desc';

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let query = supabase
      .from('trades')
      .select('*', { count: 'exact' });

    // Apply filters
    if (token_address) {
      query = query.eq('token_address', token_address);
    }

    if (wallet_address) {
      query = query.eq('wallet_address', wallet_address);
    }

    if (trade_type && (trade_type === 'buy' || trade_type === 'sell')) {
      query = query.eq('trade_type', trade_type);
    }

    // Apply sorting and pagination
    query = query
      .order('created_at', { ascending: sort === 'asc' })
      .range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching trades:', error);
      return NextResponse.json(
        {
          error: 'Database error',
          message: 'Failed to fetch trades',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/trades:', error);
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
 * Update token statistics after a trade
 */
async function updateTokenStats(
  supabase: any,
  tokenId: string,
  tradeType: 'buy' | 'sell',
  tokenAmount: number,
  usdAmount: number
): Promise<void> {
  try {
    // Get current token stats
    const { data: tokenData } = await supabase
      .from('tokens')
      .select('trades_count, total_volume, volume_24h')
      .eq('id', tokenId)
      .single();

    if (!tokenData) return;

    // Calculate new stats
    const newTradesCount = (tokenData.trades_count || 0) + 1;
    const newTotalVolume = (tokenData.total_volume || 0) + usdAmount;
    const newVolume24h = (tokenData.volume_24h || 0) + usdAmount;

    // Update token
    await supabase
      .from('tokens')
      .update({
        trades_count: newTradesCount,
        total_volume: newTotalVolume,
        volume_24h: newVolume24h,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenId);
  } catch (error) {
    console.error('Error updating token stats:', error);
    // Don't throw - trade recording should succeed even if stats update fails
  }
}
