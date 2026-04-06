import { create } from 'zustand';
import { Market, Outcome, Toast, Position } from '@/types';
import { MARKETS_DATA } from '@/lib/data/markets';

export type View = 'home' | 'market' | 'portfolio' | 'leaderboard';

interface AppState {
  currentView: View; setView: (view: View) => void;
  markets: Market[]; selectedMarket: Market | null;
  setSelectedMarket: (market: Market) => void;
  selectedOutcome: Outcome; tradeAmount: string;
  setSelectedOutcome: (outcome: Outcome) => void;
  setTradeAmount: (amount: string) => void;
  positions: Position[];
  addPosition: (position: Position) => void;
  tradeCount: number; totalVolumeSol: number;
  recordTrade: (amountSol: number) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  isTrading: boolean; setIsTrading: (val: boolean) => void;
  authModalOpen: boolean; authModalTab: 'login' | 'signup';
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'home',
  setView: (view) => set({ currentView: view }),
  markets: MARKETS_DATA,
  selectedMarket: MARKETS_DATA[0],
  setSelectedMarket: (market) => set({ selectedMarket: market, currentView: 'market', selectedOutcome: 'YES', tradeAmount: '0.1' }),
  selectedOutcome: 'YES',
  tradeAmount: '0.1',
  setSelectedOutcome: (outcome) => set({ selectedOutcome: outcome }),
  setTradeAmount: (amount) => set({ tradeAmount: amount }),
  positions: [],
  addPosition: (position) => set(s => {
    const idx = s.positions.findIndex(p => p.marketId === position.marketId && p.outcome === position.outcome);
    if (idx >= 0) {
      const updated = [...s.positions];
      updated[idx] = { ...updated[idx], shares: updated[idx].shares + position.shares, avgPrice: Math.round((updated[idx].avgPrice + position.avgPrice) / 2) };
      return { positions: updated };
    }
    return { positions: [...s.positions, position] };
  }),
  tradeCount: 0, totalVolumeSol: 0,
  recordTrade: (amountSol) => set(s => ({ tradeCount: s.tradeCount + 1, totalVolumeSol: s.totalVolumeSol + amountSol })),
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    if (toast.type !== 'loading') setTimeout(() => get().removeToast(id), toast.duration ?? 6000);
    return id;
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  isTrading: false, setIsTrading: (val) => set({ isTrading: val }),
  authModalOpen: false, authModalTab: 'login',
  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
}));
