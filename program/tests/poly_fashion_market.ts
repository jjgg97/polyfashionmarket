/**
 * PolyFashionMarket — Anchor Integration Tests
 *
 * Run: anchor test --provider.cluster localnet
 * Or:  yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**\/*.ts
 */
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

// Import generated types after `anchor build`
// import { PolyFashionMarket } from "../target/types/poly_fashion_market";

describe("poly_fashion_market", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // const program = anchor.workspace.PolyFashionMarket as Program<PolyFashionMarket>;
  const admin   = provider.wallet;
  const buyer   = Keypair.generate();
  const treasury = Keypair.generate();

  const MARKET_ID = new BN(1);
  const MARKET_ID_BYTES = MARKET_ID.toArrayLike(Buffer, "le", 8);

  let marketPDA: PublicKey;
  let positionPDA: PublicKey;
  let marketBump: number;
  let positionBump: number;

  before(async () => {
    // Airdrop SOL to buyer for tests
    const sig = await provider.connection.requestAirdrop(buyer.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig);

    // Derive PDAs
    [marketPDA, marketBump] = await PublicKey.findProgramAddress(
      [Buffer.from("market"), MARKET_ID_BYTES],
      // program.programId
      SystemProgram.programId // placeholder until program is deployed
    );

    [positionPDA, positionBump] = await PublicKey.findProgramAddress(
      [Buffer.from("position"), buyer.publicKey.toBuffer(), MARKET_ID_BYTES],
      // program.programId
      SystemProgram.programId
    );
  });

  it("derives correct market PDA", async () => {
    assert.ok(marketPDA instanceof PublicKey);
    assert.equal(marketBump >= 0, true);
    console.log("  Market PDA:", marketPDA.toBase58());
  });

  it("derives correct position PDA for buyer", async () => {
    assert.ok(positionPDA instanceof PublicKey);
    console.log("  Position PDA:", positionPDA.toBase58());
  });

  // ── Uncomment below after `anchor build` and updating program ID ──────────

  /*
  it("initializes a market", async () => {
    const endTimestamp = new BN(Math.floor(Date.now() / 1000) + 86400 * 30); // 30 days

    await program.methods
      .initializeMarket(MARKET_ID, "Will LVMH acquire Jacquemus in 2026?", endTimestamp, new BN(7200))
      .accounts({
        market:             marketPDA,
        admin:              admin.publicKey,
        liquidityDeposit:   treasury.publicKey,
        systemProgram:      SystemProgram.programId,
      })
      .rpc();

    const market = await program.account.market.fetch(marketPDA);
    assert.equal(market.marketId.toNumber(), 1);
    assert.equal(market.yesProbBps.toNumber(), 7200);
    assert.equal(market.resolved, false);
    console.log("  ✅ Market initialized:", market.title);
  });

  it("buys YES shares", async () => {
    const amount = new BN(0.1 * LAMPORTS_PER_SOL);

    await program.methods
      .buyShares(MARKET_ID, true, amount)
      .accounts({
        market:        marketPDA,
        position:      positionPDA,
        buyer:         buyer.publicKey,
        treasury:      treasury.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    const position = await program.account.position.fetch(positionPDA);
    assert.ok(position.yesShares.toNumber() > 0);
    console.log("  ✅ Shares purchased:", position.yesShares.toNumber());

    const market = await program.account.market.fetch(marketPDA);
    console.log("  ✅ New YES prob:", market.yesProbBps.toNumber() / 100, "%");
  });

  it("resolves a market", async () => {
    await program.methods
      .resolveMarket(MARKET_ID, true) // YES wins
      .accounts({ market: marketPDA, admin: admin.publicKey })
      .rpc();

    const market = await program.account.market.fetch(marketPDA);
    assert.equal(market.resolved, true);
    assert.equal(market.outcome, true);
    console.log("  ✅ Market resolved: YES wins");
  });

  it("claims winnings", async () => {
    const winnerBalanceBefore = await provider.connection.getBalance(buyer.publicKey);

    await program.methods
      .claimWinnings(MARKET_ID)
      .accounts({
        market:        marketPDA,
        position:      positionPDA,
        winner:        buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    const winnerBalanceAfter = await provider.connection.getBalance(buyer.publicKey);
    assert.ok(winnerBalanceAfter > winnerBalanceBefore);
    console.log("  ✅ Winnings claimed:", (winnerBalanceAfter - winnerBalanceBefore) / LAMPORTS_PER_SOL, "SOL");

    const position = await program.account.position.fetch(positionPDA);
    assert.equal(position.claimed, true);
  });
  */
});
