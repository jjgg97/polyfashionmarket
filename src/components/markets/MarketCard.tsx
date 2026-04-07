'use client';
import { Market } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { formatVolume } from '@/lib/amm';

interface Props { market: Market; }

export function MarketCard({ market }: Props) {
  const { setSelectedMarket, getMarketState } = useAppStore();
  const state = getMarketState(market.id);
  const yesProb = state.yesProbability;
  const noProb = 100 - yesProb;
  const hasTraded = state.tradeCount > 0;

  return (
    <div className="border border-white/10 p-2 market-card flex flex-col justify-between" onClick={() => setSelectedMarket(market)}>
      <div className="relative h-48 mb-6 overflow-hidden">
        <img src={market.img} alt={market.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
        <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 text-[8px] uppercase tracking-widest border border-white/20 z-10">{market.cat}</div>
        {!hasTraded && (
          <div className="absolute top-4 right-4 bg-black/80 px-2 py-1 text-[8px] uppercase tracking-widest border border-white/20 z-10 text-gray-600">No bids yet</div>
        )}
      </div>
      <div className="px-4 pb-4 flex flex-col flex-grow justify-between">
        <h4 className="font-serif text-lg mb-4 leading-snug">{market.title}</h4>
        <div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-3 border-b border-white/10 pb-3">
            <span>Vol: {formatVolume(state.volumeSol)}</span>
            <span>Ends: {market.date}</span>
          </div>
          {hasTraded && (
            <div className="mb-3">
              <div className="h-1 bg-gray-800 flex rounded-full overflow-hidden mb-1">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${yesProb}%` }} />
                <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${noProb}%` }} />
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-blue-400">YES {yesProb}%</span>
                <span className="text-red-400">NO {noProb}%</span>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {hasTraded ? (
              <>
                <button className={`flex-1 py-3 border text-xs font-bold transition ${yesProb >= 50 ? 'border-blue-500 bg-blue-500 text-white' : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'}`}>YES {yesProb}¢</button>
                <button className={`flex-1 py-3 border text-xs font-bold transition ${noProb > 50 ? 'border-red-500 bg-red-500 text-white' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}>NO {noProb}¢</button>
              </>
            ) : (
              <>
                <button className="flex-1 py-3 border border-white/20 text-gray-500 text-xs font-bold hover:border-blue-500 hover:text-blue-500 transition">YES 50¢</button>
                <button className="flex-1 py-3 border border-white/20 text-gray-500 text-xs font-bold hover:border-red-500 hover:text-red-500 transition">NO 50¢</button>
              </>
            )}
          </div>
          {!hasTraded && <p className="text-center text-[9px] text-gray-700 uppercase tracking-widest mt-2">Be the first to bid</p>}
        </div>
      </div>
    </div>
  );
}
