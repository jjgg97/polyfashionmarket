'use client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTrade } from '@/hooks/useTrade';
import { useSolPrice } from '@/hooks/useSolPrice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Outcome } from '@/types';
import { calcSharesOut } from '@/lib/amm';

export function TradePanel() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { selectedMarket, selectedOutcome, setSelectedOutcome, isTrading, openAuthModal, getMarketState } = useAppStore();
  const { isLoggedIn } = useAuthStore();
  const { executeTrade } = useTrade();
  const { price, solToUsd } = useSolPrice();
  const [amountInput, setAmountInput] = useState('0.1');

  const market = selectedMarket;
  if (!market) return null;

  const state = getMarketState(market.id);
  const yesProb = state.yesProbability;
  const noProb = 100 - yesProb;
  const isYes = selectedOutcome === 'YES';
  const priceAtTrade = isYes ? yesProb : noProb;
  const amount = parseFloat(amountInput) || 0;
  const estShares = amount > 0 ? calcSharesOut(amount * 0.99, isYes, state) : 0;
  const roi = amount > 0 ? ((estShares - amount) / amount) * 100 : 0;
  const usdValue = price > 0 && amount > 0 ? (amount * price).toFixed(2) : null;
  const hasTraded = state.tradeCount > 0;

  // Project new probability after this trade
  const newYes = isYes ? state.yesShares + estShares : state.yesShares;
  const newNo  = !isYes ? state.noShares + estShares : state.noShares;
  const newTotal = newYes + newNo;
  const projectedProb = newTotal > 0 ? Math.round((newYes / newTotal) * 100) : yesProb;

  return (
    <div className="glass border border-white/10 p-6 sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold uppercase tracking-widest text-sm">Trade</h3>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 block">Vol: {state.volumeSol > 0 ? `◎${state.volumeSol.toFixed(3)}` : '—'}</span>
          <span className="text-[10px] text-gray-600">{state.tradeCount} trade{state.tradeCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Current odds */}
      <div className="mb-6 p-3 bg-white/5 border border-white/10">
        <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2">Current Odds</p>
        {hasTraded ? (
          <div className="flex items-center gap-3">
            <span className="text-blue-400 font-mono font-bold text-sm">{yesProb}%</span>
            <div className="flex-grow h-1 bg-gray-800 flex rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${yesProb}%` }} />
              <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${noProb}%` }} />
            </div>
            <span className="text-red-400 font-mono font-bold text-sm">{noProb}%</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-gray-600 font-mono text-sm">50%</span>
              <div className="flex-grow h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gray-600 w-1/2" />
              </div>
              <span className="text-gray-600 font-mono text-sm">50%</span>
            </div>
            <p className="text-[9px] text-gray-700 text-center">Market opens at 50/50 — your bid moves the price</p>
          </div>
        )}
      </div>

      {/* YES / NO */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(['YES', 'NO'] as Outcome[]).map(o => (
          <button key={o} onClick={() => setSelectedOutcome(o)}
            className={`border-2 py-4 font-bold text-lg transition ${selectedOutcome === o
              ? (o === 'YES' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-red-500 bg-red-500/10 text-red-500')
              : 'border-gray-700 text-gray-500 hover:border-white/40 hover:text-white'}`}>
            {o} <span className="text-sm">{o === 'YES' ? yesProb : noProb}¢</span>
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="mb-6">
        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Amount (SOL)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">◎</span>
          <input type="number" value={amountInput} onChange={e => setAmountInput(e.target.value)}
            className="w-full bg-transparent border border-white/20 p-4 pl-9 text-xl focus:border-blue-500 focus:outline-none transition text-white"
            placeholder="0.00" min="0.001" step="0.01" />
        </div>
        {usdValue && <p className="text-[10px] text-gray-500 mt-1.5">≈ ${usdValue} USD</p>}
        <div className="flex gap-2 mt-2">
          {['0.05','0.1','0.5','1'].map(v => (
            <button key={v} onClick={() => setAmountInput(v)}
              className="flex-1 py-1 text-[9px] border border-white/10 text-gray-500 hover:border-white/40 hover:text-white transition">
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calculation */}
      <div className="space-y-2 border-t border-white/10 pt-4 mb-6">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Price per share</span>
          <span className="font-mono text-white">{priceAtTrade}¢</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Est. shares received</span>
          <span className="font-mono text-white">{estShares.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Max payout if correct</span>
          <div className="text-right">
            <span className="text-green-400 font-bold font-mono">◎{estShares.toFixed(3)}</span>
            {price > 0 && <p className="text-[9px] text-gray-600">${(estShares * price).toFixed(2)}</p>}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>ROI if correct</span>
          <span className={`font-mono ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{roi >= 0 ? '+' : ''}{roi.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Platform fee (1%)</span>
          <span className="font-mono text-gray-600">◎{(amount * 0.01).toFixed(4)}</span>
        </div>
        {amount > 0 && (
          <div className="flex justify-between text-xs border-t border-white/10 pt-2">
            <span className="text-gray-400">New probability if filled</span>
            <span className={`font-mono ${isYes ? 'text-blue-400' : 'text-red-400'}`}>{projectedProb}% YES</span>
          </div>
        )}
      </div>

      <button onClick={async () => {
        if (!isLoggedIn) { openAuthModal('login'); return; }
        if (!connected) { setVisible(true); return; }
        await executeTrade(amount);
      }} disabled={isTrading}
        className={`w-full py-4 uppercase font-black tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
          isTrading ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
          : !isLoggedIn ? 'bg-blue-600 text-white hover:bg-blue-700'
          : !connected ? 'bg-white text-black hover:bg-blue-500 hover:text-white'
          : 'bg-white text-black hover:bg-blue-500 hover:text-white'}`}>
        {isTrading ? <><LoadingSpinner size={14} /> Confirming…</>
          : !isLoggedIn ? 'Sign In to Trade'
          : !connected ? 'Connect Wallet to Trade'
          : `Place ${selectedOutcome} Order`}
      </button>

      <p className="text-center text-[9px] text-gray-600 mt-3 uppercase tracking-widest">
        ◎ Solana {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}
        {price > 0 && ` · 1 SOL = $${price.toFixed(2)}`}
      </p>
    </div>
  );
}
