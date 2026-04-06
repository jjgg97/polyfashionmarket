#!/usr/bin/env bash
# PolyFashionMarket — Devnet Setup Script
# Run: chmod +x scripts/airdrop-devnet.sh && ./scripts/airdrop-devnet.sh

set -e

WALLET=${1:-$(solana address 2>/dev/null || echo "")}

if [ -z "$WALLET" ]; then
  echo "❌  No wallet address found. Pass it as argument:"
  echo "    ./scripts/airdrop-devnet.sh <YOUR_WALLET_ADDRESS>"
  exit 1
fi

echo "🌐  Switching Solana CLI to devnet..."
solana config set --url devnet

echo "💧  Requesting 2 SOL airdrop for: $WALLET"
solana airdrop 2 "$WALLET" --url devnet

echo ""
echo "✅  Done! Balance:"
solana balance "$WALLET" --url devnet

echo ""
echo "🚀  Now run: npm run dev"
echo "    Then connect your Phantom wallet (also set to devnet)"
