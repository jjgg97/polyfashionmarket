'use client';
import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { buyShares, getTxUrl } from '@/lib/solana/transactions';
import { TradeParams } from '@/types';

export function useTrade() {
  const wallet = useWallet();
  const { isTrading, setIsTrading, addToast, removeToast, selectedMarket, selectedOutcome, getMarketState, addPosition, executeBuy, openAuthModal } = useAppStore();
  const { isLoggedIn } = useAuthStore();

  const executeTrade = useCallback(async (amountSol: number) => {
    if (!isLoggedIn) { openAuthModal('login'); addToast({ type: 'info', title: 'Sign in required', message: 'Please sign in to trade.' }); return; }
    if (!wallet.connected || !wallet.publicKey) { addToast({ type: 'error', title: 'Wallet not connected', message: 'Connect Phantom or Solflare.' }); return; }
    if (!selectedMarket) { addToast({ type: 'error', title: 'No market selected' }); return; }
    if (!amountSol || amountSol <= 0) { addToast({ type: 'error', title: 'Invalid amount' }); return; }
    if (amountSol < 0.001) { addToast({ type: 'error', title: 'Minimum 0.001 SOL' }); return; }

    setIsTrading(true);
    const loadingId = addToast({ type: 'loading', title: 'Awaiting wallet approval…', message: 'Approve in your wallet.' });

    try {
      const isYes = selectedOutcome === 'YES';
      const state = getMarketState(selectedMarket.id);
      const priceAtTrade = isYes ? state.yesProbability : (100 - state.yesProbability);

      const result = await buyShares(wallet, { marketId: selectedMarket.id, outcome: selectedOutcome, amountSol, priceAtTrade } as TradeParams);

      const { sharesReceived, newProbability } = executeBuy(selectedMarket.id, isYes, amountSol);

      addPosition({ marketId: selectedMarket.id, marketTitle: selectedMarket.title, outcome: selectedOutcome, shares: sharesReceived, avgPrice: priceAtTrade, currentPrice: newProbability });

      removeToast(loadingId);
      addToast({ type: 'success', title: `◎ ${selectedOutcome} position opened`, message: `${sharesReceived.toFixed(2)} shares @ ${priceAtTrade}¢ → new prob: ${newProbability}%`, txSignature: result.txSignature });
      console.log('✅', getTxUrl(result.txSignature));
    } catch (err) {
      removeToast(loadingId);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      const rejected = msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('cancelled');
      addToast({ type: 'error', title: rejected ? 'Transaction cancelled' : 'Transaction failed', message: rejected ? 'You rejected the wallet request.' : msg });
    } finally { setIsTrading(false); }
  }, [wallet, selectedMarket, selectedOutcome, isLoggedIn, addToast, removeToast, setIsTrading, addPosition, executeBuy, getMarketState, openAuthModal]);

  return { executeTrade, isTrading };
}
