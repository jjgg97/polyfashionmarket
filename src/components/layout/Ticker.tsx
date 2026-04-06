import { TICKER_DATA } from '@/lib/data/markets';

export function Ticker() {
  const items = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div className="bg-white/5 border-b border-white/10 py-2 overflow-hidden whitespace-nowrap">
      <div className="inline-block whitespace-nowrap animate-marquee">
        {items.map((item, i) => (
          <span key={i} className="mx-8 text-[10px] uppercase tracking-[0.2em] text-gray-400">
            {item.label}{' '}
            <span className={item.up ? 'text-green-400' : 'text-red-400'}>{item.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
