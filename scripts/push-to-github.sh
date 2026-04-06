#!/usr/bin/env bash
# PolyFashionMarket — Push to GitHub
# Usage: ./scripts/push-to-github.sh <your-github-username>
# Example: ./scripts/push-to-github.sh joaquimgil

set -e

GITHUB_USER=${1:-"YOUR_GITHUB_USERNAME"}
REPO_NAME="polyfashionmarket"
REMOTE="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo "🚀 PolyFashionMarket → GitHub Push Script"
echo "==========================================="
echo "  Repo: $REMOTE"
echo ""

# ── Step 1: Init git if not already ──────────────────────────────────────────
if [ ! -d ".git" ]; then
  echo "📁 Initialising git repository..."
  git init
  git branch -M main
fi

# ── Step 2: Stage everything ──────────────────────────────────────────────────
echo "📦 Staging all files..."
git add .

# ── Step 3: Commit ────────────────────────────────────────────────────────────
echo "💾 Creating initial commit..."
git commit -m "feat: initial PolyFashionMarket — Solana prediction market

- Next.js 14 App Router + Tailwind CSS
- Phantom + Solflare wallet integration (@solana/wallet-adapter)
- Real Solana transaction signing (devnet)
- 30 fashion prediction markets
- Anchor smart contract scaffold (program/src/lib.rs)
  - initialize_market / buy_shares / sell_shares / resolve_market / claim_winnings
- Zustand state management
- Portfolio view with live P&L
- Leaderboard with sortable stats
- API routes: GET /api/markets, GET /api/markets/[id]
- ErrorBoundary, Toast notifications with Solscan links
- Deploy scripts: airdrop-devnet.sh, deploy-program.sh" 2>/dev/null || echo "  (nothing new to commit)"

# ── Step 4: Add remote (skip if already exists) ───────────────────────────────
if ! git remote get-url origin &>/dev/null; then
  echo "🔗 Adding remote origin..."
  git remote add origin "$REMOTE"
else
  echo "🔗 Updating remote origin..."
  git remote set-url origin "$REMOTE"
fi

# ── Step 5: Push ──────────────────────────────────────────────────────────────
echo ""
echo "⬆️  Pushing to GitHub..."
echo "   (You may be prompted for your GitHub credentials or PAT)"
echo ""
git push -u origin main

echo ""
echo "✅ Done! Your repo is live at:"
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "Next steps:"
echo "  1. Go to https://vercel.com → Import Project → select this repo"
echo "  2. Add env vars from .env.example in Vercel dashboard"
echo "  3. Deploy!"
