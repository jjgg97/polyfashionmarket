'use client';
import { useAppStore } from '@/stores/useAppStore';
import { PriceChart } from '@/components/trading/PriceChart';
import { TradePanel } from '@/components/trading/TradePanel';
import { formatVolume } from '@/lib/amm';

export function MarketDetailView() {
  const { selectedMarket, setView, getMarketState } = useAppStore();
  if (!selectedMarket) return null;
  const m = selectedMarket;
  const state = getMarketState(m.id);
  const yesProb = state.yesProbability;
  const noProb = 100 - yesProb;
  const hasTraded = state.tradeCount > 0;

  return (
    <div className="animate-fadeIn p-6 lg:p-12 max-w-7xl mx-auto">
      <button onClick={() => setView('home')} className="text-[10px] uppercase text-gray-500 hover:text-white mb-8 tracking-widest">&larr; Back to Markets</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex gap-3 mb-4 flex-wrap">
            <span className="bg-white/10 px-2 py-1 text-[9px] uppercase tracking-widest">{m.cat}</span>
            <span className="bg-white/10 px-2 py-1 text-[9px] uppercase tracking-widest">Oracle: WWD / BoF</span>
            <span className="bg-white/10 px-2 py-1 text-[9px] uppercase tracking-widest">Ends: {m.date}</span>
            {!hasTraded && <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-2 py-1 text-[9px] uppercase tracking-widest">No bids yet</span>}
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl mb-6">{m.title}</h2>

          {hasTraded ? (
            <div className="flex items-center gap-4 mb-8 text-xl font-bold">
              <span className="text-blue-500">{yesProb}% YES</span>
              <div className="flex-grow h-2 bg-gray-800 flex rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${yesProb}%` }} />
                <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${noProb}%` }} />
              </div>
              <span className="text-red-500">{noProb}% NO</span>
            </div>
          ) : (
            <div className="glass border border-white/10 px-6 py-4 mb-8 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Opening Odds</p>
              <p className="text-3xl font-bold text-gray-400">50 / 50</p>
              <p className="text-[10px] text-gray-600 mt-1">No bids placed yet — be the first to move the market</p>
            </div>
          )}

          <PriceChart priceHistory={state.priceHistory} />

          <div className="border border-blue-500/30 bg-blue-500/5 p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] uppercase tracking-widest px-2 py-1">AI Insight</div>
            <h4 className="text-blue-500 font-bold mb-2 uppercase text-xs tracking-widest">Trend Intelligence</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {hasTraded
                ? `Market has ${state.tradeCount} trade${state.tradeCount !== 1 ? 's' : ''} with ${formatVolume(state.volumeSol)} volume. Sentiment: ${yesProb > 55 ? 'leaning YES' : yesProb < 45 ? 'leaning NO' : 'balanced'}.`
                : 'No market data yet. This market is waiting for its first bid. Prices will move based on collective sentiment once trading begins.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-4 border border-white/10">
              <p className="text-[9px] uppercase text-gray-500 mb-1">Volume</p>
              <p className="font-bold text-sm">{formatVolume(state.volumeSol)}</p>
            </div>
            <div className="glass p-4 border border-white/10">
              <p className="text-[9px] uppercase text-gray-500 mb-1">Trades</p>
              <p className="font-bold text-sm">{state.tradeCount}</p>
            </div>
            <div className="glass p-4 border border-white/10">
              <p className="text-[9px] uppercase text-gray-500 mb-1">End Date</p>
              <p className="font-bold text-sm">{m.date}</p>
            </div>
          </div>
        </div>
        <div><TradePanel /></div>
      </div>
    </div>
  );
}
