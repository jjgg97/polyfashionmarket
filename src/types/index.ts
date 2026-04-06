// ─── Market Types ─────────────────────────────────────────────────────────────

export type MarketCategory =
  | 'All'
  | 'Business'
  | 'Personnel'
  | 'Aesthetics'
  | 'Tech'
  | 'Runway'
  | 'Sustainability'
  | 'Cultural';

export interface Market {
  id: number;
  title: string;
  cat: MarketCategory;
  vol: string;
  date: string;
  /** YES probability 0–100 */
  y: number;
  img: string;
}

// ─── Position Types ────────────────────────────────────────────────────────────

export type Outcome = 'YES' | 'NO';

export interface Position {
  marketId: number;
  marketTitle: string;
  outcome: Outcome;
  shares: number;
  avgPrice: number; // cents (0–100)
  currentPrice: number; // cents
}

// ─── Trade Types ───────────────────────────────────────────────────────────────

export interface TradeParams {
  marketId: number;
  outcome: Outcome;
  amountSol: number;
  priceAtTrade: number; // cents (0-100)
}

export interface TradeResult {
  txSignature: string;
  shares: number;
  amountSol: number;
  outcome: Outcome;
}

// ─── Toast / Notification ──────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'loading' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  txSignature?: string;
  duration?: number;
}
