'use client';

import { useState } from 'react';

interface Trader {
  rank:      number;
  address:   string;
  pnl:       number;
  winRate:   number;
  markets:   number;
  volume:    number;
  badge:     string;
}

// Static mock data — replace with on-chain indexer query in production
const LEADERBOARD: Trader[] = [
  { rank: 1,  address: '7xKp...3mFQ', pnl:  18420, winRate: 81, markets: 32, volume: 94200,  badge: '👑' },
  { rank: 2,  address: 'AeRt...9nWz', pnl:  12105, winRate: 74, markets: 28, volume: 67300,  badge: '🥈' },
  { rank: 3,  address: 'Bv2L...5sYk', pnl:   9870, winRate: 71, markets: 21, volume: 51400,  badge: '🥉' },
  { rank: 4,  address: 'Cq8M...1rXj', pnl:   7340, winRate: 68, markets: 19, volume: 39100,  badge: '' },
  { rank: 5,  address: 'Dw4N...7pBn', pnl:   5920, winRate: 65, markets: 17, volume: 31800,  badge: '' },
  { rank: 6,  address: 'Ez9P...2cVm', pnl:   4480, winRate: 63, markets: 14, volume: 24500,  badge: '' },
  { rank: 7,  address: 'Fh3Q...8tGs', pnl:   3210, winRate: 60, markets: 12, volume: 19200,  badge: '' },
  { rank: 8,  address: 'Gk5R...4uHr', pnl:   2650, winRate: 58, markets: 11, volume: 15900,  badge: '' },
  { rank: 9,  address: 'Hm7S...6wJp', pnl:   1980, winRate: 55, markets: 9,  volume: 12300,  badge: '' },
  { rank: 10, address: 'Jn1T...0xKo', pnl:   1340, winRate: 52, markets: 7,  volume:  9100,  badge: '' },
];

type SortKey = 'pnl' | 'winRate' | 'markets' | 'volume';

export function LeaderboardView() {
  const [sortBy, setSortBy] = useState<SortKey>('pnl');

  const sorted = [...LEADERBOARD].sort((a, b) => b[sortBy] - a[sortBy])
    .map((t, i) => ({ ...t, rank: i + 1 }));

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSortBy(k)}
      className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition ${
        sortBy === k
          ? 'border-blue-500 bg-blue-500/10 text-blue-500'
          : 'border-white/20 text-gray-400 hover:border-white hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="animate-fadeIn p-8 lg:p-20 max-w-5xl mx-auto">
      <div className="mb-12">
        <h2 className="font-serif text-4xl mb-2">Leaderboard</h2>
        <p className="text-gray-500 text-xs uppercase tracking-widest">
          Top forecasters by all-time performance
        </p>
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap gap-2 mb-8">
        <SortBtn k="pnl"     label="P&amp;L (SOL)" />
        <SortBtn k="winRate" label="Win Rate" />
        <SortBtn k="markets" label="Markets" />
        <SortBtn k="volume"  label="Volume" />
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {sorted.slice(0, 3).map(t => (
          <div key={t.rank} className={`glass border p-6 text-center ${
            t.rank === 1 ? 'border-yellow-500/40 bg-yellow-500/5' :
            t.rank === 2 ? 'border-gray-400/40' :
                           'border-orange-700/40'
          }`}>
            <div className="text-3xl mb-2">{t.badge}</div>
            <p className="font-mono text-xs text-gray-400 mb-1">{t.address}</p>
            <p className="text-2xl font-bold text-green-400">+◎{t.pnl.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 mt-1">{t.winRate}% win rate</p>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/10">
              <th className="pb-4 font-normal w-12">#</th>
              <th className="pb-4 font-normal">Trader</th>
              <th className="pb-4 font-normal text-right">P&amp;L (SOL)</th>
              <th className="pb-4 font-normal text-right">Win Rate</th>
              <th className="pb-4 font-normal text-right">Markets</th>
              <th className="pb-4 font-normal text-right">Volume (SOL)</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(t => (
              <tr key={t.rank} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="py-4">
                  <span className={`font-mono font-bold ${
                    t.rank === 1 ? 'text-yellow-400' :
                    t.rank === 2 ? 'text-gray-300' :
                    t.rank === 3 ? 'text-orange-400' : 'text-gray-600'
                  }`}>
                    {t.rank}
                  </span>
                </td>
                <td className="py-4 font-mono text-sm">{t.badge} {t.address}</td>
                <td className="py-4 text-right font-mono font-bold text-green-400">
                  +◎{t.pnl.toLocaleString()}
                </td>
                <td className="py-4 text-right font-mono">
                  <span className={t.winRate >= 70 ? 'text-green-400' : t.winRate >= 55 ? 'text-yellow-400' : 'text-gray-400'}>
                    {t.winRate}%
                  </span>
                </td>
                <td className="py-4 text-right font-mono text-gray-400">{t.markets}</td>
                <td className="py-4 text-right font-mono text-gray-400">◎{t.volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-[9px] text-gray-700 uppercase tracking-widest mt-8">
        Data updates every 60 seconds · All trades verifiable on-chain
      </p>
    </div>
  );
}
