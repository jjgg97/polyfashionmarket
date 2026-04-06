export function Footer() {
  return (
    <footer className="border-t border-white/10 p-12 lg:p-20 bg-black">
      <div className="grid lg:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h1 className="text-4xl font-black italic mb-6 uppercase">PolyFashionMarket</h1>
          <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
            The world's first decentralized fashion intelligence platform. We turn style intuition
            into a tradeable asset class. High stakes. Higher style.
          </p>
        </div>
        <div>
          <h5 className="text-[10px] uppercase tracking-widest text-white mb-6 font-bold">Platform</h5>
          <ul className="text-gray-500 text-xs space-y-4">
            <li><a href="#" className="hover:text-blue-500 transition">How it Works</a></li>
            <li><a href="#" className="hover:text-blue-500 transition">Market Oracles</a></li>
            <li><a href="#" className="hover:text-blue-500 transition">Tokenomics</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-[10px] uppercase tracking-widest text-white mb-6 font-bold">Connect</h5>
          <ul className="text-gray-500 text-xs space-y-4">
            <li><a href="#" className="hover:text-blue-500 transition">Discord</a></li>
            <li><a href="#" className="hover:text-blue-500 transition">Twitter (X)</a></li>
            <li><a href="#" className="hover:text-blue-500 transition">Telegram</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4">
        <p className="text-[9px] text-gray-600 uppercase tracking-widest">
          © 2026 PolyFashionMarket. All predictions are speculative. Built on Solana.
        </p>
        <div className="flex gap-6 text-[9px] text-gray-600 uppercase tracking-widest">
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Security</a>
        </div>
      </div>
    </footer>
  );
}
