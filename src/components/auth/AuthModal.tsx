'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Props { isOpen: boolean; onClose: () => void; defaultTab?: 'login' | 'signup'; }

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: Props) {
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup, isLoading, error, clearError, isLoggedIn } = useAuthStore();

  useEffect(() => { if (isLoggedIn) onClose(); }, [isLoggedIn]);
  useEffect(() => { setTab(defaultTab); }, [defaultTab]);
  useEffect(() => { clearError(); setEmail(''); setUsername(''); setPassword(''); }, [tab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') await login(email, password);
    else await signup(email, username, password);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass border border-white/10 w-full max-w-md mx-4 p-8 animate-fadeIn">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-serif text-3xl mb-1">{tab === 'login' ? 'Welcome back' : 'Join the market'}</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{tab === 'login' ? 'Sign in to your account' : 'Create your account'}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-xl">✕</button>
        </div>
        <div className="flex bg-gray-900 rounded p-1 mb-8">
          {(['login', 'signup'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded transition ${tab === t ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-white'}`}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">{tab === 'login' ? 'Email or Username' : 'Email'}</label>
            <input type={tab === 'login' ? 'text' : 'email'} value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border border-white/20 p-3 text-sm focus:border-blue-500 focus:outline-none transition text-white placeholder-gray-600"
              placeholder={tab === 'login' ? 'email or username' : 'your@email.com'} required />
          </div>
          {tab === 'signup' && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-transparent border border-white/20 p-3 text-sm focus:border-blue-500 focus:outline-none transition text-white placeholder-gray-600"
                placeholder="fashiontrader" required />
            </div>
          )}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/20 p-3 text-sm focus:border-blue-500 focus:outline-none transition text-white placeholder-gray-600"
              placeholder="••••••••" required />
          </div>
          {error && <div className="border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">{error}</div>}
          <button type="submit" disabled={isLoading}
            className={`w-full py-4 uppercase font-black tracking-widest text-sm transition-all flex items-center justify-center gap-2 mt-2 ${isLoading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}>
            {isLoading ? <><LoadingSpinner size={14} /> Processing…</> : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest">
          {tab === 'login' ? "Don't have an account? " : 'Already a member? '}
          <button onClick={() => setTab(tab === 'login' ? 'signup' : 'login')} className="text-blue-500 hover:text-blue-400 transition">
            {tab === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
