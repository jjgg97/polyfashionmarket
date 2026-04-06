'use client';

import { WalletButton } from '@/components/wallet/WalletButton';
import { useAppStore, View } from '@/stores/useAppStore';

export function Header() {
  const { currentView, setView } = useAppStore();

  const navLink = (label: string, view: View) => {
    const active = currentView === view;
    return (
      <button
        onClick={() => setView(view)}
        className={`hover:text-white transition-colors text-[10px] uppercase tracking-[0.3em] ${
          active ? 'text-white border-b-2 border-blue-500 pb-0.5' : 'text-gray-400'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-10">
        <h1
          onClick={() => setView('home')}
          className="text-2xl font-black tracking-tighter uppercase italic cursor-pointer hover:text-blue-500 transition"
        >
          PolyFashionMarket
        </h1>
        <nav className="hidden lg:flex gap-8">
          {navLink('Markets',     'home')}
          {navLink('Portfolio',   'portfolio')}
          {navLink('Leaderboard', 'leaderboard')}
          <button className="text-blue-500 text-[10px] uppercase tracking-[0.3em] hover:text-blue-400 transition-colors">
            Create Market +
          </button>
        </nav>
      </div>
      <WalletButton />
    </header>
  );
}
