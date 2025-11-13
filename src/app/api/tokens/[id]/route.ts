/**
 * Token Detail API Route
 *
 * GET /api/tokens/[id] - Fetch a single token by ID or mint address
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/tokens/[id]
 *
 * Fetch a single token by ID (UUID) or mint address
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token ID is required',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to fetch by ID first, then by mint_address
    let query = supabase.from('tokens').select('*');

    // Check if ID is a UUID or a mint address
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('mint_address', id);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching token:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'Token not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch token',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in GET /api/tokens/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
