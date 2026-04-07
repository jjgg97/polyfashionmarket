'use client';
import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { MarketCard } from './MarketCard';
import { MarketCategory } from '@/types';
import { formatVolume } from '@/lib/amm';

const CATEGORIES: MarketCategory[] = ['All','Business','Personnel','Aesthetics','Tech','Runway','Sustainability','Cultural'];

export function HomeView() {
  const { markets, setSelectedMarket, getMarketState, tradeCount, totalVolumeSol } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const filtered = activeCategory === 'All' ? markets : markets.filter(m => m.cat === activeCategory);
  const hero = markets[0];
  const heroState = getMarketState(hero.id);

  return (
    <div className="animate-fadeIn">
      <section onClick={() => setSelectedMarket(hero)}
        className="relative w-full h-[60vh] flex items-center overflow-hidden border-b border-white/10 cursor-pointer group">
        <img src={hero.img} className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 group-hover:scale-110 transition-transform duration-1000" alt="Featured" />
        <div className="absolute inset-0 img-gradient" />
        <div className="relative z-10 px-8 lg:px-20 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">Featured Market</span>
            {heroState.tradeCount === 0 && <span className="bg-white/10 text-gray-400 text-[10px] px-3 py-1 uppercase tracking-widest">No bids yet — be first</span>}
          </div>
          <h2 className="font-serif text-5xl md:text-8xl leading-[0.9] mb-8 group-hover:text-blue-100 transition-colors">
            Will <span className="italic">LVMH</span> acquire <span className="text-blue-500 group-hover:text-blue-400">Jacquemus</span> in 2026?
          </h2>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="glass px-8 py-4 rounded-sm">
              <p className="text-[10px] uppercase text-gray-500 mb-1">Current Probability</p>
              <p className="text-4xl font-bold">
                {heroState.yesProbability}%
                {heroState.tradeCount > 0
                  ? <span className="text-sm ml-2 text-gray-400">({heroState.tradeCount} trade{heroState.tradeCount !== 1 ? 's' : ''})</span>
                  : <span className="text-sm ml-2 text-gray-600 italic">no trades yet</span>}
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-sm uppercase font-black tracking-widest transition-all">
              Trade This Market &rarr;
            </button>
          </div>
        </div>
      </section>

      {tradeCount > 0 && (
        <div className="border-b border-white/10 px-8 lg:px-20 py-3 flex gap-8 text-[10px] uppercase tracking-widest text-gray-500">
          <span>{tradeCount} trades placed</span>
          <span>{formatVolume(totalVolumeSol)} total volume</span>
          <span>{markets.filter(m => getMarketState(m.id).tradeCount > 0).length} active markets</span>
        </div>
      )}

      <div className="p-8 lg:p-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h3 className="font-serif text-4xl mb-2">Live Markets ({filtered.length})</h3>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">All markets start at 50/50 — prices move with every bid</p>
          </div>
          <div className="flex gap-2 text-[10px] uppercase tracking-widest overflow-x-auto w-full md:w-auto pb-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 border transition whitespace-nowrap ${activeCategory === cat ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-white/20 text-gray-400 hover:border-white hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(market => <MarketCard key={market.id} market={market} />)}
        </div>
      </div>
    </div>
  );
}
