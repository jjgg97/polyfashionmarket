# PolyFashionMarket

> The world's first decentralized prediction market for fashion trends, built on Solana.

---

## Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS (Space Mono + Playfair Display)  
- **Blockchain**: Solana (devnet by default)
- **Wallets**: Phantom + Solflare via `@solana/wallet-adapter`
- **State**: Zustand
- **Transactions**: `@solana/web3.js` — real signing, real on-chain confirmation

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/YOUR_USERNAME/polyfashionmarket.git
cd polyfashionmarket
npm install
```

### 2. Configure

```bash
# .env.local is already created — edit it:
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=11111111111111111111111111111111
NEXT_PUBLIC_FEE_WALLET=11111111111111111111111111111111
NEXT_PUBLIC_TRADING_FEE=1
```

> Tip: Free RPC keys at [helius.dev](https://helius.dev) or [quicknode.com](https://quicknode.com)

### 3. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Connect Wallet & Trade

1. Install [Phantom](https://phantom.app) or [Solflare](https://solflare.com)
2. Switch wallet to **Devnet**
3. Get free SOL: `solana airdrop 2 YOUR_ADDRESS --url devnet` or [solfaucet.com](https://solfaucet.com)
4. Click **Connect Wallet** → approve
5. Open any market → enter amount → **Place Buy Order**
6. Approve in wallet popup → toast appears with **Solscan link**

> **Current mode**: Sends a real SOL transfer to the market PDA as proof of end-to-end wallet signing. Replace the `SystemProgram.transfer` stub in `src/lib/solana/transactions.ts` with your Anchor method call once your program is deployed.

---

## Deploy Anchor Program

```bash
# Prerequisites
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
npm install -g @coral-xyz/anchor-cli

# Deploy
anchor build
anchor deploy --provider.cluster devnet

# Copy IDL to frontend
cp target/idl/poly_fashion_market.json src/lib/solana/idl.json
```

Then update `NEXT_PUBLIC_PROGRAM_ID` in `.env.local` and wire the Anchor call in `src/lib/solana/transactions.ts` (see TODO comments there).

---

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout + metadata
│   ├── page.tsx                # SPA view router
│   ├── providers.tsx           # Solana wallet providers
│   └── globals.css
├── components/
│   ├── layout/                 # Header, Ticker, Footer
│   ├── markets/                # HomeView, MarketCard, MarketDetailView
│   ├── trading/                # TradePanel (real txns), PriceChart
│   ├── portfolio/              # PortfolioView + P&L table
│   ├── wallet/                 # WalletButton (Phantom/Solflare)
│   └── ui/                     # ToastContainer, LoadingSpinner
├── hooks/
│   ├── useTrade.ts             # Real Solana trade execution
│   └── useSolBalance.ts        # Live balance, 15s refresh
├── lib/
│   ├── solana/
│   │   ├── connection.ts       # RPC connection
│   │   ├── program.ts          # Anchor IDL + PDA derivation
│   │   └── transactions.ts     # buyShares / sellShares
│   └── data/markets.ts         # 30 fashion markets data
├── stores/useAppStore.ts       # Zustand global state
└── types/index.ts              # Shared TS types
```

---

## Deploy to Vercel

```bash
vercel
# Set env vars in Vercel dashboard for mainnet-beta
```

---

## Roadmap

| Phase | Status | Feature |
|-------|--------|---------|
| MVP Frontend | ✅ | Markets, wallet, trade UI |
| TX Scaffold | ✅ | Real on-chain signing |
| Anchor Program | 🔲 | AMM smart contract |
| AI Insights | 🔲 | Gemini trend analysis |
| User Markets | 🔲 | Community markets + staking |

---

MIT — © 2026 PolyFashionMarket
