/**
 * GET /api/markets/[id]
 * Returns a single market by ID.
 *
 * TODO: Merge with live on-chain data from program.account.market.fetch(pda)
 */
import { NextResponse } from 'next/server';
import { MARKETS_DATA } from '@/lib/data/markets';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id     = parseInt(params.id);
  const market = MARKETS_DATA.find(m => m.id === id);

  if (!market) {
    return NextResponse.json({ error: 'Market not found' }, { status: 404 });
  }

  return NextResponse.json({ data: market }, {
    headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' },
  });
}
