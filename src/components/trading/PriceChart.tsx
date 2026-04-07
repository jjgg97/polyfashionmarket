'use client';
import { useState } from 'react';

interface Props {
  priceHistory?: { time: number; prob: number }[];
}

export function PriceChart({ priceHistory = [] }: Props) {
  const [period, setPeriod] = useState<'ALL' | '1H' | '24H'>('ALL');
  const periods = ['1H', '24H', 'ALL'] as const;
  const now = Date.now();
  const filtered = priceHistory.filter(p => {
    if (period === '1H')  return now - p.time < 3_600_000;
    if (period === '24H') return now - p.time < 86_400_000;
    return true;
  });
  const hasData = filtered.length > 0;

  const buildPath = () => {
    if (filtered.length === 0) return '';
    return 'M' + filtered.map((p, i) => {
      const x = filtered.length === 1 ? 50 : (i / (filtered.length - 1)) * 100;
      const y = 100 - p.prob;
      return `${x},${y}`;
    }).join(' L');
  };

  const buildFill = () => {
    if (filtered.length === 0) return '';
    const lastX = filtered.length === 1 ? 50 : 100;
    return buildPath() + ` L${lastX},100 L0,100 Z`;
  };

  const latestProb = filtered.length > 0 ? filtered[filtered.length - 1].prob : 50;

  return (
    <div className="w-full h-64 border border-white/10 glass mb-8 relative overflow-hidden">
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-10">
        {[0,1,2,3].map(i => <div key={i} className="border-t border-white border-dashed w-full" />)}
      </div>
      <div className="absolute left-3 inset-y-3 flex flex-col justify-between pointer-events-none">
        {['100%','75%','50%','25%','0%'].map(l => <span key={l} className="text-[9px] text-gray-700">{l}</span>)}
      </div>

      {hasData ? (
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0055FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0055FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={buildFill()} fill="url(#chartGrad)" />
          <path d={buildPath()} fill="none" stroke="#0055FF" strokeWidth="2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#ffffff" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.3" />
        </svg>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-gray-700 text-xs uppercase tracking-widest mb-1">No price data yet</p>
          <p className="text-gray-800 text-[10px]">Chart appears after first trade</p>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="100" y2="50" stroke="#333" strokeWidth="0.5" strokeDasharray="3,3" />
            <text x="50" y="48" textAnchor="middle" fill="#444" fontSize="4" fontFamily="monospace">50%</text>
          </svg>
        </div>
      )}

      {hasData && (
        <div className="absolute top-3 left-10 bg-black/80 border border-white/10 px-2 py-1 text-[10px]">
          {latestProb}% YES
        </div>
      )}
      <div className="absolute top-3 right-3 flex gap-1">
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-2 py-0.5 text-[9px] uppercase transition ${period === p ? 'bg-blue-600 text-white' : 'bg-black/60 border border-gray-700 text-gray-400 hover:text-white'}`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
