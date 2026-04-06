#!/usr/bin/env bash
# PolyFashionMarket — Anchor Program Deploy Script
# Prerequisites: Rust, Solana CLI, Anchor CLI installed

set -e

echo "🔨  Building Anchor program..."
cd program
anchor build

echo ""
echo "🚀  Deploying to devnet..."
anchor deploy --provider.cluster devnet

PROGRAM_ID=$(anchor keys list | grep poly_fashion_market | awk '{print $2}')
echo ""
echo "✅  Program deployed!"
echo "    Program ID: $PROGRAM_ID"
echo ""
echo "📝  Updating .env.local..."
cd ..
sed -i.bak "s/NEXT_PUBLIC_PROGRAM_ID=.*/NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID/" .env.local
echo "    .env.local updated with Program ID"

echo ""
echo "📋  Copying IDL to frontend..."
cp program/target/idl/poly_fashion_market.json src/lib/solana/idl.json
echo "    IDL copied to src/lib/solana/idl.json"

echo ""
echo "🎉  All done! Now:"
echo "    1. npm run dev"
echo "    2. Connect Phantom (devnet)"
echo "    3. Trade real markets!"
