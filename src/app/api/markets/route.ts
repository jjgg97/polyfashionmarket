/**
 * GET /api/markets
 * Returns all markets with live on-chain data merged in.
 *
 * In production: query your Solana indexer / program accounts here.
 * For now: returns the static dataset with simulated volume.
 */
import { NextResponse } from 'next/server';
import { MARKETS_DATA } from '@/lib/data/markets';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit    = parseInt(searchParams.get('limit') || '30');
  const offset   = parseInt(searchParams.get('offset') || '0');

  let markets = MARKETS_DATA;

  if (category && category !== 'All') {
    markets = markets.filter(m => m.cat === category);
  }

  const paginated = markets.slice(offset, offset + limit);

  return NextResponse.json({
    data:  paginated,
    total: markets.length,
    limit,
    offset,
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
