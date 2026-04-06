'use client';

import { Market } from '@/types';
import { useAppStore } from '@/stores/useAppStore';

interface Props { market: Market; }

export function MarketCard({ market }: Props) {
  const { setSelectedMarket } = useAppStore();
  const noPrice = 100 - market.y;
  const yesLeading = market.y > 50;

  return (
    <div
      className="border border-white/10 p-2 market-card flex flex-col justify-between"
      onClick={() => setSelectedMarket(market)}
    >
      <div className="relative h-48 mb-6 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={market.img}
          alt={market.title}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 text-[8px] uppercase tracking-widest border border-white/20 z-10">
          {market.cat}
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col flex-grow justify-between">
        <h4 className="font-serif text-lg mb-4 leading-snug">{market.title}</h4>
        <div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-4 border-b border-white/10 pb-4">
            <span>Vol: {market.vol}</span>
            <span>Ends: {market.date}</span>
          </div>
          <div className="flex gap-2">
            <button className={`flex-1 py-3 border text-xs font-bold transition ${yesLeading ? 'border-blue-500 bg-blue-500 text-white' : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'}`}>
              YES {market.y}¢
            </button>
            <button className={`flex-1 py-3 border text-xs font-bold transition ${!yesLeading ? 'border-red-500 bg-red-500 text-white' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}>
              NO {noPrice}¢
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
