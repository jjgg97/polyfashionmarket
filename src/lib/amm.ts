import { MarketState } from '@/types';

export const INITIAL_MARKET_STATE = (marketId: number): MarketState => ({
  marketId, yesShares: 0, noShares: 0, poolSol: 0,
  yesProbability: 50, volumeSol: 0, tradeCount: 0, priceHistory: [],
});

export function calcProbability(yesShares: number, noShares: number): number {
  const total = yesShares + noShares;
  if (total === 0) return 50;
  return Math.round((yesShares / total) * 100);
}

export function calcSharesOut(amountSol: number, isYes: boolean, state: MarketState): number {
  const prob = state.yesProbability / 100;
  const pricePerShare = isYes ? prob : (1 - prob);
  return amountSol / Math.max(pricePerShare, 0.01);
}

export function applyTrade(state: MarketState, amountSol: number, isYes: boolean, feeRate = 0.01): { newState: MarketState; sharesReceived: number; priceAtTrade: number } {
  const netSol = amountSol * (1 - feeRate);
  const sharesReceived = calcSharesOut(netSol, isYes, state);
  const priceAtTrade = isYes ? state.yesProbability : (100 - state.yesProbability);
  const newYesShares = isYes ? state.yesShares + sharesReceived : state.yesShares;
  const newNoShares  = !isYes ? state.noShares + sharesReceived : state.noShares;
  const newProbability = calcProbability(newYesShares, newNoShares);
  const newState: MarketState = {
    ...state, yesShares: newYesShares, noShares: newNoShares,
    poolSol: state.poolSol + netSol, yesProbability: newProbability,
    volumeSol: state.volumeSol + amountSol, tradeCount: state.tradeCount + 1,
    priceHistory: [...state.priceHistory, { time: Date.now(), prob: newProbability }],
  };
  return { newState, sharesReceived, priceAtTrade };
}

export function formatVolume(sol: number): string {
  if (sol === 0) return '◎0';
  if (sol < 1) return `◎${sol.toFixed(3)}`;
  if (sol < 1000) return `◎${sol.toFixed(2)}`;
  return `◎${(sol / 1000).toFixed(1)}K`;
}
