import { NextResponse } from 'next/server';
import { getServiceRoleClient, supabase as anonClient } from '@/lib/supabase/client';

const FIELDS =
  'token_id,timestamp,price_usd,price_native,volume,market_cap,liquidity';
const DEFAULT_LIMIT = 500;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get('tokenId');
  const tokenAddress = searchParams.get('tokenAddress');
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;

  if (!tokenId && !tokenAddress) {
    return NextResponse.json(
      { success: false, error: 'tokenId or tokenAddress is required' },
      { status: 400 }
    );
  }

  const since = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();

  let client = anonClient;
  try {
    client = getServiceRoleClient();
  } catch {
    // Fallback to anon client when service role key is not configured.
  }

  let query = client
    .from('price_history')
    .select(FIELDS)
    .gt('timestamp', since)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (tokenId) {
    query = query.eq('token_id', tokenId);
  } else if (tokenAddress) {
    query = query.eq('token_address', tokenAddress);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[price-history] Query failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: data ?? [],
    },
    { status: 200 }
  );
}
