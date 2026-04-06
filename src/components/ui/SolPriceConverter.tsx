'use client';
import { useState } from 'react';
import { useSolPrice } from '@/hooks/useSolPrice';
import { LoadingSpinner } from './LoadingSpinner';

export function SolPriceConverter() {
  const { price, change24h, isLoading, error, solToUsd } = useSolPrice();
  const [solInput, setSolInput] = useState('1');
  const [usdInput, setUsdInput] = useState('');
  const up = change24h >= 0;

  const handleSolChange = (val: string) => {
    setSolInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && price) setUsdInput((num * price).toFixed(2));
  };

  const handleUsdChange = (val: string) => {
    setUsdInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && price) setSolInput((num / price).toFixed(6));
  };

  return (
    <div className="glass border border-white/10 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">SOL / USD</p>
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-400"><LoadingSpinner size={12} /> Fetching price…</div>
          ) : error ? (
            <p className="text-red-400 text-xs">Price unavailable</p>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`text-sm font-mono px-2 py-0.5 ${up ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                {up ? '+' : ''}{change24h.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest">Live · 30s</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1.5">SOL</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">◎</span>
            <input type="number" value={solInput} onChange={e => handleSolChange(e.target.value)}
              className="w-full bg-transparent border border-white/20 p-3 pl-9 text-lg focus:border-blue-500 focus:outline-none transition text-white"
              placeholder="0.00" min="0" step="0.01" />
          </div>
        </div>
        <div className="flex items-center justify-center text-gray-600 text-lg select-none">⇅</div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1.5">USD</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
            <input type="number" value={usdInput} onChange={e => handleUsdChange(e.target.value)}
              className="w-full bg-transparent border border-white/20 p-3 pl-8 text-lg focus:border-blue-500 focus:outline-none transition text-white"
              placeholder="0.00" min="0" step="0.01" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[0.1, 0.5, 1, 5].map(v => (
            <button key={v} onClick={() => handleSolChange(String(v))}
              className="py-1.5 text-[10px] border border-white/10 text-gray-500 hover:border-blue-500 hover:text-blue-400 transition uppercase tracking-widest">
              ◎{v}
            </button>
          ))}
        </div>
        {price > 0 && solInput && (
          <div className="border-t border-white/10 pt-3 mt-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              ◎{solInput || '0'} = <span className="text-white font-bold">{solToUsd(parseFloat(solInput) || 0)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
