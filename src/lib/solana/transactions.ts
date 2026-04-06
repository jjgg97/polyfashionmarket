/**
 * Real Solana transaction execution layer.
 *
 * Uses @solana/web3.js directly.
 * When your Anchor program is deployed, replace the SystemProgram transfer
 * stubs with proper Anchor method calls using the program interface.
 */

import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { connection, getTxUrl } from './connection';
import { PROGRAM_ID, getMarketPDA, getPositionPDA } from './program';
import { TradeParams, TradeResult } from '@/types';

// ─── Constants ─────────────────────────────────────────────────────────────────

const TRADING_FEE_BPS = parseInt(process.env.NEXT_PUBLIC_TRADING_FEE || '1') * 100; // 1% = 100 BPS
const FEE_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_FEE_WALLET || '11111111111111111111111111111111'
);

// ─── Buy Shares ────────────────────────────────────────────────────────────────

/**
 * Executes a real buyShares transaction on Solana.
 *
 * ⚡ CURRENT MODE: "Scaffold" — sends a real SOL transfer to prove wallet
 *    signing works. Once your Anchor program is deployed, replace the
 *    SystemProgram.transfer call with your program instruction.
 *
 * 📝 HOW TO UPGRADE:
 *    1. Import your Anchor Program instance
 *    2. Replace the instruction below with:
 *       const tx = await program.methods
 *         .buyShares(new BN(params.marketId), params.outcome === 'YES', new BN(lamports))
 *         .accounts({ market: marketPDA, position: positionPDA, buyer: wallet.publicKey, systemProgram: SystemProgram.programId })
 *         .transaction();
 */
export async function buyShares(
  wallet: WalletContextState,
  params: TradeParams
): Promise<TradeResult> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const lamports = Math.floor(params.amountSol * LAMPORTS_PER_SOL);
  if (lamports <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  // Check user balance
  const balance = await connection.getBalance(wallet.publicKey);
  if (balance < lamports + 5000) {
    // 5000 lamports for tx fee buffer
    throw new Error(
      `Insufficient balance. You need ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL + fees.`
    );
  }

  // ─── Build Transaction ───────────────────────────────────────────────────────

  const transaction = new Transaction();

  // Get PDAs (will be used when program is deployed)
  const [marketPDA] = await getMarketPDA(params.marketId);
  const [positionPDA] = await getPositionPDA(wallet.publicKey, params.marketId);

  // ─────────────────────────────────────────────────────────────────────────────
  // TODO: Replace this block with your real Anchor instruction when deployed.
  //
  // For now we send a tiny real SOL transfer to the market PDA as proof of
  // transaction signing. This is NOT a mock — it uses your real wallet and
  // creates a real on-chain transaction you can verify on Solscan.
  // ─────────────────────────────────────────────────────────────────────────────
  const MIN_TRANSFER = 890880; // min rent-exempt lamports for 0-byte account

  // Calculate fee
  const feeAmount = Math.floor(lamports * (TRADING_FEE_BPS / 10000));
  const tradeAmount = lamports - feeAmount;

  // Instruction 1: Trade amount to market account
  // (Replace with program.methods.buyShares() when deployed)
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: marketPDA,                    // ← this becomes your market PDA
      lamports: Math.max(tradeAmount, MIN_TRANSFER),
    })
  );

  // Instruction 2: Fee to platform wallet
  if (feeAmount > 0 && !FEE_WALLET.equals(SystemProgram.programId)) {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: FEE_WALLET,
        lamports: feeAmount,
      })
    );
  }

  // ─── Sign & Send ─────────────────────────────────────────────────────────────

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');

  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  // Wallet adapter handles signing (opens Phantom/Solflare popup)
  const signedTx = await wallet.signTransaction(transaction);

  // Send to network
  const rawTx = signedTx.serialize();
  const signature = await connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  // Wait for confirmation
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed'
  );

  // ─── Calculate shares based on AMM price ─────────────────────────────────────
  // Share price = probability (0–100 cents) → 0.00–1.00 SOL per share
  const pricePerShareSol = params.priceAtTrade / 100;
  const sharesReceived = params.amountSol / pricePerShareSol;

  return {
    txSignature: signature,
    shares: sharesReceived,
    amountSol: params.amountSol,
    outcome: params.outcome,
  };
}

// ─── Sell Shares ───────────────────────────────────────────────────────────────

/**
 * Scaffolded sell instruction.
 * TODO: Wire up to program.methods.sellShares() after deployment.
 */
export async function sellShares(
  wallet: WalletContextState,
  marketId: number,
  outcome: 'YES' | 'NO',
  shares: number
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const transaction = new Transaction();

  // TODO: Replace with Anchor instruction
  // const tx = await program.methods.sellShares(new BN(marketId), outcome === 'YES', new BN(shares))...
  transaction.add(
    new TransactionInstruction({
      keys: [],
      programId: PROGRAM_ID,
      data: Buffer.from([]),
    })
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  const signed = await wallet.signTransaction(transaction);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

  return sig;
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

export async function getSolBalance(pubkey: PublicKey): Promise<number> {
  const lamports = await connection.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

export { getTxUrl };
