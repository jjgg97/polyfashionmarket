'use client';

import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppStore } from '@/stores/useAppStore';
import { buyShares, getTxUrl } from '@/lib/solana/transactions';
import { TradeParams } from '@/types';

/**
 * useTrade — Hook that wires the UI trade panel to real Solana transactions.
 *
 * Returns executeTrade() which:
 *  1. Validates inputs
 *  2. Calls the real buyShares() transaction function
 *  3. Shows loading / success / error toasts
 *  4. Never uses setTimeout or fake delays
 */
export function useTrade() {
  const wallet = useWallet();
  const { isTrading, setIsTrading, addToast, removeToast, selectedMarket, selectedOutcome } =
    useAppStore();

  const executeTrade = useCallback(
    async (amountSol: number) => {
      // ─── Guards ──────────────────────────────────────────────────────────────
      if (!wallet.connected || !wallet.publicKey) {
        addToast({
          type: 'error',
          title: 'Wallet not connected',
          message: 'Please connect your Phantom or Solflare wallet to trade.',
        });
        return;
      }

      if (!selectedMarket) {
        addToast({ type: 'error', title: 'No market selected' });
        return;
      }

      if (!amountSol || amountSol <= 0) {
        addToast({
          type: 'error',
          title: 'Invalid amount',
          message: 'Enter a valid SOL amount greater than 0.',
        });
        return;
      }

      const MIN_SOL = 0.001;
      if (amountSol < MIN_SOL) {
        addToast({
          type: 'error',
          title: 'Amount too small',
          message: `Minimum trade is ${MIN_SOL} SOL.`,
        });
        return;
      }

      // ─── Show loading toast ───────────────────────────────────────────────────
      setIsTrading(true);
      const loadingId = Math.random().toString(36).slice(2);
      addToast({
        type: 'loading',
        title: 'Awaiting wallet approval…',
        message: 'Approve the transaction in your wallet.',
      });

      try {
        const params: TradeParams = {
          marketId: selectedMarket.id,
          outcome: selectedOutcome,
          amountSol,
          priceAtTrade:
            selectedOutcome === 'YES' ? selectedMarket.y : 100 - selectedMarket.y,
        };

        // 🔥 REAL Solana transaction
        const result = await buyShares(wallet, params);

        // ─── Success ────────────────────────────────────────────────────────────
        removeToast(loadingId);
        addToast({
          type: 'success',
          title: `Order placed — ${result.outcome} shares`,
          message: `${result.shares.toFixed(2)} shares for ${result.amountSol} SOL`,
          txSignature: result.txSignature,
        });

        console.log('✅ Trade success:', getTxUrl(result.txSignature));
      } catch (err) {
        // ─── Error ──────────────────────────────────────────────────────────────
        removeToast(loadingId);
        const msg = err instanceof Error ? err.message : 'Unknown error';

        // User rejected → different message
        const userRejected =
          msg.toLowerCase().includes('rejected') ||
          msg.toLowerCase().includes('cancelled') ||
          msg.toLowerCase().includes('user denied');

        addToast({
          type: 'error',
          title: userRejected ? 'Transaction cancelled' : 'Transaction failed',
          message: userRejected ? 'You rejected the wallet request.' : msg,
        });

        console.error('❌ Trade error:', err);
      } finally {
        setIsTrading(false);
      }
    },
    [wallet, selectedMarket, selectedOutcome, addToast, removeToast, setIsTrading]
  );

  return { executeTrade, isTrading };
}
