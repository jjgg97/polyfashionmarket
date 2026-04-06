import { create } from 'zustand';
import { Market, Outcome, Toast, Position } from '@/types';
import { MARKETS_DATA, PORTFOLIO_POSITIONS } from '@/lib/data/markets';

export type View = 'home' | 'market' | 'portfolio' | 'leaderboard';

interface AppState {
  currentView:       View;
  setView:           (view: View) => void;

  markets:           Market[];
  selectedMarket:    Market | null;
  setSelectedMarket: (market: Market) => void;

  selectedOutcome:   Outcome;
  tradeAmount:       string;
  setSelectedOutcome:(outcome: Outcome) => void;
  setTradeAmount:    (amount: string) => void;

  positions:         Position[];

  toasts:            Toast[];
  addToast:          (toast: Omit<Toast, 'id'>) => string;
  removeToast:       (id: string) => void;

  isTrading:         boolean;
  setIsTrading:      (val: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView:   'home',
  setView:       (view) => set({ currentView: view }),

  markets:       MARKETS_DATA,
  selectedMarket: MARKETS_DATA[0],

  setSelectedMarket: (market) =>
    set({ selectedMarket: market, currentView: 'market', selectedOutcome: 'YES', tradeAmount: '0.1' }),

  selectedOutcome: 'YES',
  tradeAmount:     '0.1',
  setSelectedOutcome: (outcome) => set({ selectedOutcome: outcome }),
  setTradeAmount:     (amount)  => set({ tradeAmount: amount }),

  positions: PORTFOLIO_POSITIONS,

  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    if (toast.type !== 'loading') {
      setTimeout(() => get().removeToast(id), toast.duration ?? 6000);
    }
    return id;
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  isTrading:    false,
  setIsTrading: (val) => set({ isTrading: val }),
}));
