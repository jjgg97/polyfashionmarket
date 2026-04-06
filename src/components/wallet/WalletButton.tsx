'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useSolBalance } from '@/hooks/useSolBalance';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function WalletButton() {
  const { connected, connecting, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { balance } = useSolBalance();

  if (connecting) {
    return (
      <button disabled className="flex items-center gap-2 bg-[#FAF9F6] text-black px-6 py-2.5 text-[10px] uppercase font-bold opacity-70 cursor-not-allowed">
        <LoadingSpinner size={12} />
        Connecting…
      </button>
    );
  }

  if (connected && publicKey) {
    const addr = publicKey.toBase58();
    const short = addr.slice(0, 4) + '…' + addr.slice(-4);
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <p className="text-[9px] uppercase text-gray-500">SOL Balance</p>
          <p className="text-xs font-bold text-white">
            {balance !== null ? `${balance.toFixed(3)} SOL` : '…'}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-blue-600 text-white px-6 py-2.5 text-[10px] uppercase font-bold hover:bg-red-500 transition-all group"
          title="Click to disconnect"
        >
          <span className="group-hover:hidden">{short}</span>
          <span className="hidden group-hover:inline">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="bg-[#FAF9F6] text-black px-6 py-2.5 text-[10px] uppercase font-bold hover:bg-blue-600 hover:text-white transition-all"
    >
      Connect Wallet
    </button>
  );
}
