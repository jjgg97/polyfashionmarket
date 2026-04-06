'use client';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';

export function LeaderboardView() {
  const { tradeCount, totalVolumeSol, setView } = useAppStore();
  const { isLoggedIn, user } = useAuthStore();

  return (
    <div className="animate-fadeIn p-8 lg:p-20 max-w-5xl mx-auto">
      <div className="mb-12">
        <h2 className="font-serif text-4xl mb-2">Leaderboard</h2>
        <p className="text-gray-500 text-xs uppercase tracking-widest">Top forecasters by all-time performance</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="glass border border-white/10 p-6 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Total Trades</p>
          <p className="text-3xl font-bold">{tradeCount}</p>
        </div>
        <div className="glass border border-white/10 p-6 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Total Volume</p>
          <p className="text-3xl font-bold">◎{totalVolumeSol.toFixed(3)}</p>
        </div>
        <div className="glass border border-white/10 p-6 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Active Markets</p>
          <p className="text-3xl font-bold">30</p>
        </div>
      </div>

      <div className="border border-white/10 p-16 text-center">
        <p className="text-5xl mb-6">🏆</p>
        <h3 className="font-serif text-2xl mb-3">Be the first on the leaderboard</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
          No trades have been placed yet. The leaderboard will populate as users start trading.
          {isLoggedIn ? ` Make your first prediction, ${user?.username}.` : ' Sign up and make your first prediction.'}
        </p>
        <button onClick={() => setView('home')}
          className="bg-white text-black px-10 py-3 text-xs uppercase font-bold tracking-widest hover:bg-blue-600 hover:text-white transition-all">
          Browse Markets →
        </button>
      </div>

      <p className="text-center text-[9px] text-gray-700 uppercase tracking-widest mt-8">
        Rankings update in real time as trades are placed on-chain
      </p>
    </div>
  );
}
