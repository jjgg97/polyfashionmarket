import { NextResponse } from 'next/server';

let cached = null;
const CACHE_MS = 30_000;

export async function GET() {
  if (cached && Date.now() - cached.ts < CACHE_MS) return NextResponse.json(cached);
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true', { next: { revalidate: 30 } });
    const data = await res.json();
    const price = data?.solana?.usd ?? 0;
    const change24h = data?.solana?.usd_24h_change ?? 0;
    cached = { price, change24h, ts: Date.now() };
    return NextResponse.json({ price, change24h, ts: Date.now() });
  } catch {
    return NextResponse.json({ price: 0, change24h: 0, ts: Date.now(), error: 'Price unavailable' });
  }
}
