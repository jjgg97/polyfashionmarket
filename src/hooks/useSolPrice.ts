'use client';
import { useState, useEffect, useCallback } from 'react';

interface SolPrice {
  price: number; change24h: number; isLoading: boolean; error: boolean;
  solToUsd: (sol: number) => string; usdToSol: (usd: number) => string;
}

export function useSolPrice(): SolPrice {
  const [price, setPrice] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch('/api/sol-price');
      const data = await res.json();
      if (data.price > 0) { setPrice(data.price); setChange24h(data.change24h); setError(false); }
      else setError(true);
    } catch { setError(true); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const solToUsd = useCallback((sol: number) => {
    if (!price) return '—';
    return '$' + (sol * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [price]);

  const usdToSol = useCallback((usd: number) => {
    if (!price) return '—';
    return '◎' + (usd / price).toFixed(4);
  }, [price]);

  return { price, change24h, isLoading, error, solToUsd, usdToSol };
}
