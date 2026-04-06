'use client';

import { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAppStore } from '@/stores/useAppStore';
import { useTrade } from '@/hooks/useTrade';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Outcome } from '@/types';

export function TradePanel() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { selectedMarket, selectedOutcome, setSelectedOutcome, isTrading } = useAppStore();
  const { executeTrade } = useTrade();

  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [amountInput, setAmountInput] = useState('0.1');

  const market = selectedMarket;
  if (!market) return null;

  const yesPrice = market.y;
  const noPrice  = 100 - market.y;
  const priceAtTrade = selectedOutcome === 'YES' ? yesPrice : noPrice;
  const pricePerShare = priceAtTrade / 100; // 0.0–1.0 SOL
  const amount = parseFloat(amountInput) || 0;
  const estShares = amount > 0 ? amount / pricePerShare : 0;
  const estPayout = estShares; // 1 share = 1 SOL if correct
  const roi = amount > 0 ? ((estPayout - amount) / amount) * 100 : 0;

  const handleOutcome = (o: Outcome) => setSelectedOutcome(o);

  const handleTrade = async () => {
    if (!connected) { setVisible(true); return; }
    await executeTrade(amount);
  };

  return (
    <div className="glass border border-white/10 p-6 sticky top-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold uppercase tracking-widest text-sm">Trade</h3>
        <span className="text-[10px] text-gray-500">Vol: {market.vol}</span>
      </div>

      {/* Buy / Sell toggle */}
      <div className="flex bg-gray-900 rounded p-1 mb-6">
        {(['buy', 'sell'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setTradeMode(mode)}
            className={`flex-1 py-2 text-xs uppercase font-bold rounded transition ${
              tradeMode === mode ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-white'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Outcome buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => handleOutcome('YES')}
          className={`border-2 py-4 font-bold text-lg transition ${
            selectedOutcome === 'YES'
              ? 'border-blue-500 bg-blue-500/10 text-blue-500'
              : 'border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-500'
          }`}
        >
          YES <span className="text-sm">{yesPrice}¢</span>
        </button>
        <button
          onClick={() => handleOutcome('NO')}
          className={`border-2 py-4 font-bold text-lg transition ${
            selectedOutcome === 'NO'
              ? 'border-red-500 bg-red-500/10 text-red-500'
              : 'border-gray-700 text-gray-500 hover:border-red-500 hover:text-red-500'
          }`}
        >
          NO <span className="text-sm">{noPrice}¢</span>
        </button>
      </div>

      {/* Amount input */}
      <div className="mb-6">
        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
          Amount (SOL)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">◎</span>
          <input
            type="number"
            value={amountInput}
            onChange={e => setAmountInput(e.target.value)}
            className="w-full bg-transparent border border-white/20 p-4 pl-9 text-xl focus:border-blue-500 focus:outline-none transition text-white"
            placeholder="0.00"
            min="0.001"
            step="0.01"
          />
        </div>
        {/* Quick amounts */}
        <div className="flex gap-2 mt-2">
          {['0.05', '0.1', '0.5', '1'].map(v => (
            <button key={v} onClick={() => setAmountInput(v)}
              className="flex-1 py-1 text-[9px] border border-white/10 text-gray-500 hover:border-white/40 hover:text-white transition">
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calculation */}
      <div className="space-y-3 border-t border-white/10 pt-4 mb-6">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Est. Shares Received</span>
          <span className="text-white font-mono">{estShares.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Potential Payout</span>
          <span className="text-green-400 font-bold font-mono">◎{estPayout.toFixed(3)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Potential ROI</span>
          <span className={`font-mono ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Platform Fee (1%)</span>
          <span className="font-mono text-gray-500">◎{(amount * 0.01).toFixed(4)}</span>
        </div>
      </div>

      {/* CTA button */}
      <button
        onClick={handleTrade}
        disabled={isTrading}
        className={`w-full py-4 uppercase font-black tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
          isTrading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : connected
            ? 'bg-white text-black hover:bg-blue-500 hover:text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isTrading ? (
          <><LoadingSpinner size={14} /> Confirming on Solana…</>
        ) : connected ? (
          `Place ${tradeMode === 'buy' ? 'Buy' : 'Sell'} Order`
        ) : (
          'Connect Wallet to Trade'
        )}
      </button>

      {/* Network badge */}
      <p className="text-center text-[9px] text-gray-600 mt-3 uppercase tracking-widest">
        ◎ Solana {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}
      </p>
    </div>
  );
}
