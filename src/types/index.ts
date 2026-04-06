// ─── Market Definition (static) ───────────────────────────────────────────────
export type MarketCategory = 'All' | 'Business' | 'Personnel' | 'Aesthetics' | 'Tech' | 'Runway' | 'Sustainability' | 'Cultural';

export interface Market {
  id: number;
  title: string;
  cat: MarketCategory;
  date: string;
  img: string;
}

export interface MarketState {
  marketId: number;
  yesShares: number;
  noShares: number;
  poolSol: number;
  yesProbability: number;
  volumeSol: number;
  tradeCount: number;
  priceHistory: { time: number; prob: number }[];
}

export type Outcome = 'YES' | 'NO';

export interface Position {
  marketId: number;
  marketTitle: string;
  outcome: Outcome;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export interface TradeParams {
  marketId: number;
  outcome: Outcome;
  amountSol: number;
  priceAtTrade: number;
}

export interface TradeResult {
  txSignature: string;
  shares: number;
  amountSol: number;
  outcome: Outcome;
  newProbability: number;
}

export type ToastType = 'success' | 'error' | 'loading' | 'info';
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  txSignature?: string;
  duration?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  walletAddress?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}
