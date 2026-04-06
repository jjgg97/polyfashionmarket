/**
 * PolyFashionMarket — Solana Program Interface
 *
 * This file is the integration layer between the frontend and your
 * deployed Anchor smart contract.
 *
 * HOW TO ACTIVATE:
 * ─────────────────────────────────────────────────────────────────
 * 1. Build & deploy your Anchor program:
 *      anchor build && anchor deploy --provider.cluster devnet
 *
 * 2. Copy the generated IDL:
 *      cp target/idl/poly_fashion_market.json src/lib/solana/idl.json
 *
 * 3. Set NEXT_PUBLIC_PROGRAM_ID in .env.local to your program's address.
 *
 * 4. Replace the TODO sections below with your real instruction calls.
 * ─────────────────────────────────────────────────────────────────
 *
 * Program Architecture (suggested):
 *
 *   Market Account:
 *     - market_id: u64
 *     - yes_shares: u64
 *     - no_shares: u64
 *     - resolved: bool
 *     - outcome: Option<bool>
 *     - liquidity_pool: u64
 *
 *   Trade instruction: buyShares(market_id, is_yes, amount_lamports)
 *   Sell instruction:  sellShares(market_id, is_yes, shares)
 *   Resolve instruction: resolveMarket(market_id, outcome)  [admin only]
 */

import { PublicKey } from '@solana/web3.js';

// ─── Program ID ────────────────────────────────────────────────────────────────
// Replace with your real program ID after deployment
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || '11111111111111111111111111111111'
);

// ─── PDAs (Program Derived Addresses) ─────────────────────────────────────────

/**
 * Derives the PDA for a market account.
 * Seeds: ["market", market_id as u64 bytes]
 */
export async function getMarketPDA(marketId: number): Promise<[PublicKey, number]> {
  const marketIdBuffer = Buffer.alloc(8);
  marketIdBuffer.writeBigUInt64LE(BigInt(marketId));

  return PublicKey.findProgramAddress(
    [Buffer.from('market'), marketIdBuffer],
    PROGRAM_ID
  );
}

/**
 * Derives the PDA for a user's position account.
 * Seeds: ["position", user_pubkey, market_id as u64 bytes]
 */
export async function getPositionPDA(
  userPubkey: PublicKey,
  marketId: number
): Promise<[PublicKey, number]> {
  const marketIdBuffer = Buffer.alloc(8);
  marketIdBuffer.writeBigUInt64LE(BigInt(marketId));

  return PublicKey.findProgramAddress(
    [Buffer.from('position'), userPubkey.toBuffer(), marketIdBuffer],
    PROGRAM_ID
  );
}

// ─── IDL Stub ──────────────────────────────────────────────────────────────────
// TODO: Replace with your actual generated IDL from `anchor build`
export const IDL = {
  version: '0.1.0',
  name: 'poly_fashion_market',
  instructions: [
    {
      name: 'buyShares',
      accounts: [
        { name: 'market', isMut: true,  isSigner: false },
        { name: 'position', isMut: true, isSigner: false },
        { name: 'buyer', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'marketId', type: 'u64' },
        { name: 'isYes', type: 'bool' },
        { name: 'amountLamports', type: 'u64' },
      ],
    },
    {
      name: 'sellShares',
      accounts: [
        { name: 'market', isMut: true, isSigner: false },
        { name: 'position', isMut: true, isSigner: false },
        { name: 'seller', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'marketId', type: 'u64' },
        { name: 'isYes', type: 'bool' },
        { name: 'shares', type: 'u64' },
      ],
    },
  ],
  accounts: [],
  errors: [],
};
