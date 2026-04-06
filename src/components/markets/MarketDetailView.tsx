'use client';

import { useAppStore } from '@/stores/useAppStore';
import { PriceChart } from '@/components/trading/PriceChart';
import { TradePanel } from '@/components/trading/TradePanel';

export function MarketDetailView() {
  const { selectedMarket, setView } = useAppStore();
  if (!selectedMarket) return null;

  const m = selectedMarket;
  const noPrice = 100 - m.y;

  return (
    <div className="animate-fadeIn p-6 lg:p-12 max-w-7xl mx-auto">
      <button
        onClick={() => setView('home')}
        className="text-[10px] uppercase text-gray-500 hover:text-white mb-8 tracking-widest"
      >
        &larr; Back to Markets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Chart + Info */}
        <div className="lg:col-span-2">
          {/* Tags */}
          <div className="flex gap-3 mb-4">
            <span className="bg-white/10 px-2 py-1 text-[9px] uppercase tracking-widest">{m.cat}</span>
            <span className="bg-white/10 px-2 py-1 text-[9px] uppercase tracking-widest">Oracle: WWD / BoF</span>
            <span className="bg-white/10 px-2 py-1 text-[9px] uppercase tracking-widest">Ends: {m.date}</span>
          </div>

          <h2 className="font-serif text-4xl lg:text-5xl mb-6">{m.title}</h2>

          {/* Probability bar */}
          <div className="flex items-center gap-4 mb-8 text-xl font-bold">
            <span className="text-blue-500">{m.y}% YES</span>
            <div className="flex-grow h-2 bg-gray-800 flex rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${m.y}%` }} />
              <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${noPrice}%` }} />
            </div>
            <span className="text-red-500">{noPrice}% NO</span>
          </div>

          <PriceChart />

          {/* AI Insight */}
          <div className="border border-blue-500/30 bg-blue-500/5 p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] uppercase tracking-widest px-2 py-1">
              Powered by Gemini AI
            </div>
            <h4 className="text-blue-500 font-bold mb-2 uppercase text-xs tracking-widest">Trend Intelligence</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Based on recent executive reshuffling and cryptic social media interactions across the industry,
              sentiment analysis indicates a sharp spike in chatter over the last 14 days. This market shows
              high volatility, heavily influenced by upcoming quarterly earnings calls.
            </p>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Volume', value: m.vol },
              { label: 'End Date', value: m.date },
              { label: 'Liquidity', value: '$320K' },
            ].map(({ label, value }) => (
              <div key={label} className="glass p-4 border border-white/10">
                <p className="text-[9px] uppercase text-gray-500 mb-1">{label}</p>
                <p className="font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Trade Panel */}
        <div>
          <TradePanel />
        </div>
      </div>
    </div>
  );
}
