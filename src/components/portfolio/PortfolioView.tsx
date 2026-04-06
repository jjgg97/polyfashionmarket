'use client';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSolPrice } from '@/hooks/useSolPrice';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { SolPriceConverter } from '@/components/ui/SolPriceConverter';

export function PortfolioView() {
  const { positions, setSelectedMarket, markets, setView, tradeCount, totalVolumeSol, openAuthModal } = useAppStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { balance } = useSolBalance();
  const { solToUsd } = useSolPrice();

  const totalValue = positions.reduce((acc, p) => acc + (p.shares * p.currentPrice) / 100, 0);
  const totalCost  = positions.reduce((acc, p) => acc + (p.shares * p.avgPrice) / 100, 0);
  const totalPnl   = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  if (!isLoggedIn) {
    return (
      <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-8">
        <p className="text-6xl">👤</p>
        <h2 className="font-serif text-4xl">Sign in to view your portfolio</h2>
        <p className="text-gray-400 text-sm max-w-sm">Create an account or sign in to track your positions, P&L, and trade history.</p>
        <div className="flex gap-4">
          <button onClick={() => openAuthModal('signup')} className="bg-white text-black px-8 py-3 text-xs uppercase font-bold tracking-widest hover:bg-blue-600 hover:text-white transition-all">Create Account</button>
          <button onClick={() => openAuthModal('login')} className="border border-white/20 px-8 py-3 text-xs uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-all">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn p-8 lg:p-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h2 className="font-serif text-4xl mb-1">My Portfolio</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Welcome back, <span className="text-white">{user?.username}</span></p>
        </div>
        <div className="flex items-center gap-4">
          {connected && publicKey ? (
            <div className="text-right">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Wallet</p>
              <p className="text-xs font-mono text-white">{publicKey.toBase58().slice(0,4)}…{publicKey.toBase58().slice(-4)}</p>
              {balance !== null && <p className="text-[10px] text-gray-400">◎{balance.toFixed(3)} · {solToUsd(balance)}</p>}
            </div>
          ) : (
            <button onClick={() => setVisible(true)} className="border border-white/20 px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition">Connect Wallet</button>
          )}
          <button onClick={logout} className="text-[10px] text-gray-600 hover:text-red-400 uppercase tracking-widest transition">Sign Out</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="glass p-5 border border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Portfolio Value</p>
          <p className="text-2xl font-bold">◎{totalValue.toFixed(3)}</p>
          <p className="text-[10px] text-gray-500 mt-1">{solToUsd(totalValue)}</p>
        </div>
        <div className="glass p-5 border border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Total P&L</p>
          <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totalPnl >= 0 ? '+' : ''}◎{totalPnl.toFixed(3)}</p>
          <p className="text-[10px] text-gray-500 mt-1">{totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(1)}%</p>
        </div>
        <div className="glass p-5 border border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Open Positions</p>
          <p className="text-2xl font-bold">{positions.length}</p>
          <p className="text-[10px] text-gray-500 mt-1">{tradeCount} total trades</p>
        </div>
        <div className="glass p-5 border border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Volume Traded</p>
          <p className="text-2xl font-bold">◎{totalVolumeSol.toFixed(3)}</p>
          <p className="text-[10px] text-gray-500 mt-1">{solToUsd(totalVolumeSol)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-white/10 pb-4 mb-4">Active Positions</h3>
          {positions.length === 0 ? (
            <div className="text-center py-16 text-gray-600 border border-white/5">
              <p className="text-3xl mb-4">📊</p>
              <p className="text-sm uppercase tracking-widest mb-2">No open positions yet</p>
              <p className="text-xs text-gray-700 mb-6">Your trades will appear here once you place your first order.</p>
              <button onClick={() => setView('home')} className="border border-white/20 px-6 py-2 text-[10px] uppercase hover:bg-white hover:text-black transition">Browse Markets</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase tracking-widest">
                    <th className="pb-4 font-normal">Market</th><th className="pb-4 font-normal">Side</th>
                    <th className="pb-4 font-normal">Shares</th><th className="pb-4 font-normal">Avg</th>
                    <th className="pb-4 font-normal">P&L</th><th className="pb-4 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="border-t border-white/10">
                  {positions.map((pos, i) => {
                    const pnl = ((pos.shares * pos.currentPrice) - (pos.shares * pos.avgPrice)) / 100;
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-3 font-serif max-w-[180px] truncate pr-4">{pos.marketTitle}</td>
                        <td className="py-3"><span className={`text-xs font-bold px-2 py-0.5 ${pos.outcome === 'YES' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>{pos.outcome}</span></td>
                        <td className="py-3 font-mono text-xs">{pos.shares.toFixed(1)}</td>
                        <td className="py-3 font-mono text-xs">{pos.avgPrice}¢</td>
                        <td className="py-3 font-mono text-xs"><span className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{pnl >= 0 ? '+' : ''}◎{pnl.toFixed(3)}</span></td>
                        <td className="py-3 text-right">
                          <button onClick={() => { const m = markets.find(x => x.id === pos.marketId); if(m) setSelectedMarket(m); }}
                            className="border border-white/20 px-2 py-1 text-[9px] uppercase hover:bg-white hover:text-black transition">Trade</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-white/10 pb-4 mb-4">SOL / USD</h3>
          <SolPriceConverter />
        </div>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-widest border-b border-white/10 pb-4 mb-6">Transaction History</h3>
      <div className="text-center py-10 text-gray-700 border border-white/5">
        <p className="text-[10px] uppercase tracking-widest">
          {tradeCount === 0 ? 'No transactions yet — place your first trade to get started.' : `${tradeCount} transaction${tradeCount !== 1 ? 's' : ''} — all verifiable on Solscan.`}
        </p>
      </div>
    </div>
  );
}
