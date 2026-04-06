'use client';
import { useEffect } from 'react';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useAppStore, View } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';

export function Header() {
  const { currentView, setView, openAuthModal } = useAppStore();
  const { isLoggedIn, user, logout, hydrate } = useAuthStore();
  useEffect(() => { hydrate(); }, []);

  const navLink = (label: string, view: View) => {
    const active = currentView === view;
    return (
      <button onClick={() => setView(view)}
        className={`hover:text-white transition-colors text-[10px] uppercase tracking-[0.3em] ${active ? 'text-white border-b-2 border-blue-500 pb-0.5' : 'text-gray-400'}`}>
        {label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-10">
        <h1 onClick={() => setView('home')}
          className="text-2xl font-black tracking-tighter uppercase italic cursor-pointer hover:text-blue-500 transition">
          PolyFashionMarket
        </h1>
        <nav className="hidden lg:flex gap-8">
          {navLink('Markets', 'home')}
          {navLink('Portfolio', 'portfolio')}
          {navLink('Leaderboard', 'leaderboard')}
          <button className="text-blue-500 text-[10px] uppercase tracking-[0.3em] hover:text-blue-400 transition-colors">
            Create Market +
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Signed in as</p>
              <p className="text-xs font-bold text-white">{user?.username}</p>
            </div>
            <button onClick={logout} className="text-[9px] text-gray-600 hover:text-red-400 uppercase tracking-widest transition">Sign out</button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => openAuthModal('login')} className="text-[10px] text-gray-400 hover:text-white uppercase tracking-widest transition">Sign In</button>
            <button onClick={() => openAuthModal('signup')} className="border border-white/20 px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition">Sign Up</button>
          </div>
        )}
        <WalletButton />
      </div>
    </header>
  );
}
