'use client';
import { useState } from 'react';

type Period = '1D' | '1W' | '1M' | 'ALL';

const PATHS: Record<Period, string> = {
  '1D':  'M0,50 Q10,40 20,60 T40,30 T60,20 T80,40 T100,28',
  '1W':  'M0,70 Q15,60 25,45 T50,35 T70,50 T85,30 T100,28',
  '1M':  'M0,80 Q20,70 35,55 T55,40 T75,45 T90,32 T100,28',
  'ALL': 'M0,90 Q10,80 25,65 T45,50 T65,40 T80,35 T100,28',
};
const FILL_PATHS: Record<Period, string> = {
  '1D':  'M0,100 L0,50 Q10,40 20,60 T40,30 T60,20 T80,40 T100,28 L100,100 Z',
  '1W':  'M0,100 L0,70 Q15,60 25,45 T50,35 T70,50 T85,30 T100,28 L100,100 Z',
  '1M':  'M0,100 L0,80 Q20,70 35,55 T55,40 T75,45 T90,32 T100,28 L100,100 Z',
  'ALL': 'M0,100 L0,90 Q10,80 25,65 T45,50 T65,40 T80,35 T100,28 L100,100 Z',
};

export function PriceChart() {
  const [period, setPeriod] = useState<Period>('1M');
  const periods: Period[] = ['1D', '1W', '1M', 'ALL'];

  return (
    <div className="w-full h-80 border border-white/10 glass mb-8 relative overflow-hidden">
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
        {[0,1,2,3].map(i => <div key={i} className="border-t border-white border-dashed w-full" />)}
      </div>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0055FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0055FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={FILL_PATHS[period]} fill="url(#chartGradient)" />
        <path d={PATHS[period]} fill="none" stroke="#0055FF" strokeWidth="2" className="transition-all duration-500" />
      </svg>
      <div className="absolute left-3 inset-y-3 flex flex-col justify-between pointer-events-none">
        {['100%','75%','50%','25%','0%'].map(l => <span key={l} className="text-[9px] text-gray-600">{l}</span>)}
      </div>
      <div className="absolute top-4 right-4 flex gap-1">
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-2.5 py-1 text-[9px] uppercase transition ${period === p ? 'bg-blue-600 text-white' : 'bg-black/60 border border-gray-700 text-gray-400 hover:text-white'}`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
