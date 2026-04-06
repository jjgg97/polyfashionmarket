'use client';

import { useAppStore } from '@/stores/useAppStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useSolBalance } from '@/hooks/useSolBalance';

export function PortfolioView() {
  const { positions, setSelectedMarket, markets, setView } = useAppStore();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { balance } = useSolBalance();

  // Calculate portfolio stats
  const totalValue = positions.reduce((acc, p) => {
    const currentVal = (p.shares * p.currentPrice) / 100;
    return acc + currentVal;
  }, 0);

  const totalCost = positions.reduce((acc, p) => {
    return acc + (p.shares * p.avgPrice) / 100;
  }, 0);

  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const goToMarket = (marketId: number) => {
    const m = markets.find(x => x.id === marketId);
    if (m) setSelectedMarket(m);
  };

  if (!connected) {
    return (
      <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-8">
        <p className="text-6xl">◎</p>
        <h2 className="font-serif text-4xl">Connect your wallet</h2>
        <p className="text-gray-400 text-sm max-w-sm">
          Connect your Phantom or Solflare wallet to view your portfolio, positions, and P&amp;L.
        </p>
        <button
          onClick={() => setVisible(true)}
          className="bg-white text-black px-10 py-4 text-xs uppercase font-bold tracking-widest hover:bg-blue-600 hover:text-white transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn p-8 lg:p-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h2 className="font-serif text-4xl mb-2">My Portfolio</h2>
          {publicKey && (
            <p className="text-[10px] text-gray-500 font-mono tracking-widest">
              {publicKey.toBase58().slice(0, 8)}…{publicKey.toBase58().slice(-8)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest">Wallet Balance</p>
          <p className="text-2xl font-bold">
            {balance !== null ? `◎ ${balance.toFixed(3)}` : '…'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass p-6 border border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Portfolio Value</p>
          <p className="text-3xl font-bold">◎ {totalValue.toFixed(3)}</p>
        </div>
        <div className="glass p-6 border border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Total Returns</p>
          <p className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}◎{totalPnl.toFixed(3)}{' '}
            <span className="text-sm">({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(1)}%)</span>
          </p>
        </div>
        <div className="glass p-6 border border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Active Positions</p>
          <p className="text-3xl font-bold">{positions.length}</p>
        </div>
      </div>

      {/* Positions Table */}
      <h3 className="text-sm font-bold uppercase tracking-widest border-b border-white/10 pb-4 mb-4">
        Active Positions
      </h3>
      <div className="overflow-x-auto mb-16">
        {positions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-sm uppercase tracking-widest">No open positions</p>
            <button
              onClick={() => setView('home')}
              className="mt-6 border border-white/20 px-6 py-2 text-[10px] uppercase hover:bg-white hover:text-black transition"
            >
              Browse Markets
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-widest">
                <th className="pb-4 font-normal">Market</th>
                <th className="pb-4 font-normal">Outcome</th>
                <th className="pb-4 font-normal">Shares</th>
                <th className="pb-4 font-normal">Avg Price</th>
                <th className="pb-4 font-normal">Current</th>
                <th className="pb-4 font-normal">Value</th>
                <th className="pb-4 font-normal">PnL</th>
                <th className="pb-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="border-t border-white/10">
              {positions.map((pos, i) => {
                const cost = (pos.shares * pos.avgPrice) / 100;
                const value = (pos.shares * pos.currentPrice) / 100;
                const pnl = value - cost;
                const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                const priceDir = pos.currentPrice > pos.avgPrice;

                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-4 font-serif text-base max-w-xs truncate pr-4">
                      {pos.marketTitle}
                    </td>
                    <td className="py-4">
                      <span className={`font-bold text-xs px-2 py-1 ${pos.outcome === 'YES' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                        {pos.outcome}
                      </span>
                    </td>
                    <td className="py-4 font-mono">{pos.shares.toLocaleString()}</td>
                    <td className="py-4 font-mono">{pos.avgPrice}¢</td>
                    <td className="py-4 font-mono">
                      <span className={priceDir ? 'text-green-400' : 'text-red-400'}>
                        {pos.currentPrice}¢
                      </span>
                    </td>
                    <td className="py-4 font-mono">◎{value.toFixed(3)}</td>
                    <td className="py-4">
                      <span className={`font-mono font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}◎{pnl.toFixed(3)}{' '}
                        <span className="text-xs opacity-70">({pnlPct.toFixed(1)}%)</span>
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => goToMarket(pos.marketId)}
                        className="border border-white/20 px-3 py-1 text-[10px] uppercase hover:bg-white hover:text-black transition"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Transaction History placeholder */}
      <h3 className="text-sm font-bold uppercase tracking-widest border-b border-white/10 pb-4 mb-6">
        Recent Transactions
      </h3>
      <div className="text-center py-12 text-gray-600">
        <p className="text-[10px] uppercase tracking-widest">
          Transaction history will appear here once you start trading.
        </p>
        <p className="text-[10px] uppercase tracking-widest mt-2 text-gray-700">
          All trades are verifiable on{' '}
          <a
            href={`https://solscan.io/?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 transition"
          >
            Solscan ↗
          </a>
        </p>
      </div>
    </div>
  );
}
