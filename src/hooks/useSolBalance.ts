'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getSolBalance } from '@/lib/solana/transactions';

/**
 * Fetches the connected wallet's SOL balance and refreshes every 15s.
 */
export function useSolBalance() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(null);
      return;
    }
    setIsLoading(true);
    try {
      const bal = await getSolBalance(publicKey);
      setBalance(bal);
    } catch (e) {
      console.error('Balance fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 15_000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { balance, isLoading, refresh: fetch };
}
