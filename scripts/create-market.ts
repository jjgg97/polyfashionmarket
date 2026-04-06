/**
 * scripts/create-market.ts
 *
 * CLI script to initialize a new market on-chain.
 * Run with: npx ts-node scripts/create-market.ts
 *
 * Prerequisites:
 *   1. `anchor build && anchor deploy` completed
 *   2. PROGRAM_ID set in .env.local
 *   3. Solana CLI keypair at ~/.config/solana/id.json
 */

import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// ── Config ────────────────────────────────────────────────────────────────────
const NETWORK     = 'devnet';
const PROGRAM_ID  = process.env.NEXT_PUBLIC_PROGRAM_ID ?? 'REPLACE_ME';
const connection  = new Connection(clusterApiUrl(NETWORK), 'confirmed');

// Load local Solana keypair (admin wallet)
const keypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
const secret      = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
const admin       = Keypair.fromSecretKey(Uint8Array.from(secret));

// ── Market definitions to seed ────────────────────────────────────────────────
const MARKETS_TO_CREATE = [
  {
    id:              1,
    title:           'Will LVMH acquire Jacquemus in 2026?',
    endTimestamp:    Math.floor(new Date('2026-12-31').getTime() / 1000),
    initialYesProb:  7200, // 72% in bps
  },
  {
    id:              2,
    title:           'Will "Gorpcore" lose >50% market share to Neo-Tailoring?',
    endTimestamp:    Math.floor(new Date('2026-12-20').getTime() / 1000),
    initialYesProb:  3400,
  },
];

async function main() {
  console.log('\n🚀 PolyFashionMarket — Market Initializer');
  console.log('─'.repeat(50));
  console.log(`Network:    ${NETWORK}`);
  console.log(`Program ID: ${PROGRAM_ID}`);
  console.log(`Admin:      ${admin.publicKey.toBase58()}`);

  const balance = await connection.getBalance(admin.publicKey);
  console.log(`Balance:    ${(balance / LAMPORTS_PER_SOL).toFixed(3)} SOL\n`);

  if (PROGRAM_ID === 'REPLACE_ME') {
    console.error('❌ Set NEXT_PUBLIC_PROGRAM_ID in .env.local before running this script.');
    process.exit(1);
  }

  for (const market of MARKETS_TO_CREATE) {
    const marketIdBuf = Buffer.alloc(8);
    marketIdBuf.writeBigUInt64LE(BigInt(market.id));

    const [marketPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('market'), marketIdBuf],
      new PublicKey(PROGRAM_ID)
    );

    console.log(`📊 Market #${market.id}: "${market.title}"`);
    console.log(`   PDA: ${marketPDA.toBase58()}`);
    console.log(`   End: ${new Date(market.endTimestamp * 1000).toLocaleDateString()}`);
    console.log(`   YES: ${market.initialYesProb / 100}%`);

    // TODO: Uncomment and fill accounts after anchor build
    /*
    const program = ... // load from IDL
    await program.methods
      .initializeMarket(
        new BN(market.id),
        market.title,
        new BN(market.endTimestamp),
        new BN(market.initialYesProb)
      )
      .accounts({
        market:           marketPDA,
        liquidityDeposit: admin.publicKey,
        admin:            admin.publicKey,
        systemProgram:    SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    console.log(`   ✅ Created!\n`);
    */
    console.log(`   ⏳ (Uncomment Anchor call above after deployment)\n`);
  }
}

main().catch(console.error);
