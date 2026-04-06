'use client';
import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { buyShares, getTxUrl } from '@/lib/solana/transactions';
import { TradeParams } from '@/types';

export function useTrade() {
  const wallet = useWallet();
  const { isTrading, setIsTrading, addToast, removeToast, selectedMarket, selectedOutcome, addPosition, recordTrade, openAuthModal } = useAppStore();
  const { isLoggedIn } = useAuthStore();

  const executeTrade = useCallback(async (amountSol: number) => {
    if (!isLoggedIn) { openAuthModal('login'); addToast({ type: 'info', title: 'Sign in required', message: 'Please sign in to trade.' }); return; }
    if (!wallet.connected || !wallet.publicKey) { addToast({ type: 'error', title: 'Wallet not connected', message: 'Please connect your Phantom or Solflare wallet.' }); return; }
    if (!selectedMarket) { addToast({ type: 'error', title: 'No market selected' }); return; }
    if (!amountSol || amountSol <= 0) { addToast({ type: 'error', title: 'Invalid amount', message: 'Enter a valid SOL amount.' }); return; }
    if (amountSol < 0.001) { addToast({ type: 'error', title: 'Amount too small', message: 'Minimum trade is 0.001 SOL.' }); return; }

    setIsTrading(true);
    const loadingId = addToast({ type: 'loading', title: 'Awaiting wallet approval…', message: 'Approve the transaction in your wallet.' });

    try {
      const priceAtTrade = selectedOutcome === 'YES' ? selectedMarket.y : 100 - selectedMarket.y;
      const params: TradeParams = { marketId: selectedMarket.id, outcome: selectedOutcome, amountSol, priceAtTrade };
      const result = await buyShares(wallet, params);
      removeToast(loadingId);
      const sharesReceived = amountSol / (priceAtTrade / 100);
      addPosition({ marketId: selectedMarket.id, marketTitle: selectedMarket.title, outcome: selectedOutcome, shares: sharesReceived, avgPrice: priceAtTrade, currentPrice: priceAtTrade });
      recordTrade(amountSol);
      addToast({ type: 'success', title: `Order placed — ${result.outcome} shares`, message: `${sharesReceived.toFixed(2)} shares for ◎${result.amountSol}`, txSignature: result.txSignature });
      console.log('✅ Trade:', getTxUrl(result.txSignature));
    } catch (err) {
      removeToast(loadingId);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      const userRejected = msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('cancelled');
      addToast({ type: 'error', title: userRejected ? 'Transaction cancelled' : 'Transaction failed', message: userRejected ? 'You rejected the wallet request.' : msg });
    } finally { setIsTrading(false); }
  }, [wallet, selectedMarket, selectedOutcome, isLoggedIn, addToast, removeToast, setIsTrading, addPosition, recordTrade, openAuthModal]);

  return { executeTrade, isTrading };
}
