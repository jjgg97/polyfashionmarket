import { create } from 'zustand';
import { Market, MarketState, Outcome, Toast, Position } from '@/types';
import { MARKETS_DATA } from '@/lib/data/markets';
import { INITIAL_MARKET_STATE, applyTrade } from '@/lib/amm';

export type View = 'home' | 'market' | 'portfolio' | 'leaderboard';

const initialMarketStates: Record<number, MarketState> = {};
MARKETS_DATA.forEach(m => { initialMarketStates[m.id] = INITIAL_MARKET_STATE(m.id); });

interface AppState {
  currentView: View; setView: (view: View) => void;
  markets: Market[]; marketStates: Record<number, MarketState>;
  selectedMarket: Market | null; setSelectedMarket: (market: Market) => void;
  getMarketState: (marketId: number) => MarketState;
  selectedOutcome: Outcome; setSelectedOutcome: (outcome: Outcome) => void;
  positions: Position[]; addPosition: (position: Position) => void;
  tradeCount: number; totalVolumeSol: number;
  executeBuy: (marketId: number, isYes: boolean, amountSol: number) => { sharesReceived: number; priceAtTrade: number; newProbability: number };
  toasts: Toast[]; addToast: (toast: Omit<Toast, 'id'>) => string; removeToast: (id: string) => void;
  isTrading: boolean; setIsTrading: (val: boolean) => void;
  authModalOpen: boolean; authModalTab: 'login' | 'signup';
  openAuthModal: (tab?: 'login' | 'signup') => void; closeAuthModal: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'home', setView: (view) => set({ currentView: view }),
  markets: MARKETS_DATA, marketStates: initialMarketStates, selectedMarket: MARKETS_DATA[0],
  setSelectedMarket: (market) => set({ selectedMarket: market, currentView: 'market', selectedOutcome: 'YES' }),
  getMarketState: (marketId) => get().marketStates[marketId] ?? INITIAL_MARKET_STATE(marketId),
  selectedOutcome: 'YES', setSelectedOutcome: (outcome) => set({ selectedOutcome: outcome }),
  positions: [],
  addPosition: (position) => set(s => {
    const idx = s.positions.findIndex(p => p.marketId === position.marketId && p.outcome === position.outcome);
    if (idx >= 0) {
      const updated = [...s.positions];
      const ex = updated[idx];
      const total = ex.shares + position.shares;
      updated[idx] = { ...ex, shares: total, avgPrice: Math.round((ex.shares * ex.avgPrice + position.shares * position.avgPrice) / total) };
      return { positions: updated };
    }
    return { positions: [...s.positions, position] };
  }),
  tradeCount: 0, totalVolumeSol: 0,
  executeBuy: (marketId, isYes, amountSol) => {
    const current = get().marketStates[marketId] ?? INITIAL_MARKET_STATE(marketId);
    const { newState, sharesReceived, priceAtTrade } = applyTrade(current, amountSol, isYes);
    set(s => ({ marketStates: { ...s.marketStates, [marketId]: newState }, tradeCount: s.tradeCount + 1, totalVolumeSol: s.totalVolumeSol + amountSol }));
    return { sharesReceived, priceAtTrade, newProbability: newState.yesProbability };
  },
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }));
    if (toast.type !== 'loading') setTimeout(() => get().removeToast(id), toast.duration ?? 6000);
    return id;
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  isTrading: false, setIsTrading: (val) => set({ isTrading: val }),
  authModalOpen: false, authModalTab: 'login',
  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
}));
