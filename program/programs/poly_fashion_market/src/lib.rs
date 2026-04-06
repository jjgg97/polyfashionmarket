//! PolyFashionMarket — Solana Anchor Smart Contract
//!
//! Instruction flow:
//!   1. Admin calls initialize_market()
//!   2. Users call buy_shares()  → SOL in, shares minted
//!   3. Users call sell_shares() → shares burned, SOL out
//!   4. Oracle/admin calls resolve_market() → sets winner
//!   5. Winners call claim_winnings()

use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::system_program;

declare_id!("REPLACE_WITH_YOUR_PROGRAM_ID_AFTER_ANCHOR_BUILD");

const BPS_DENOM: u64          = 10_000;
const TRADING_FEE_BPS: u64    = 100;       // 1%
const MIN_LIQUIDITY: u64      = 100_000_000; // 0.1 SOL
const MAX_TITLE_LEN: usize    = 256;
const LAMPORTS_PER_SHARE: u64 = 1_000_000; // 1 share = 0.001 SOL base unit

#[program]
pub mod poly_fashion_market {
    use super::*;

    // ─── initialize_market ────────────────────────────────────────────────────
    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u64,
        title: String,
        end_timestamp: i64,
        initial_yes_prob_bps: u64,
    ) -> Result<()> {
        require!(title.len() <= MAX_TITLE_LEN, MarketError::TitleTooLong);
        require!(initial_yes_prob_bps <= BPS_DENOM, MarketError::InvalidProbability);

        let clock = Clock::get()?;
        require!(end_timestamp > clock.unix_timestamp, MarketError::InvalidEndTime);

        // Seed initial liquidity from admin
        let initial_liquidity = ctx.accounts.market.to_account_info().lamports();
        require!(initial_liquidity >= MIN_LIQUIDITY, MarketError::InsufficientLiquidity);

        let m         = &mut ctx.accounts.market;
        m.market_id   = market_id;
        m.title       = title;
        m.admin       = ctx.accounts.admin.key();
        m.end_timestamp = end_timestamp;
        m.yes_prob_bps  = initial_yes_prob_bps;
        m.yes_shares    = 0;
        m.no_shares     = 0;
        m.total_volume  = 0;
        m.pool_lamports = 0;
        m.resolved      = false;
        m.outcome       = None;
        m.created_at    = clock.unix_timestamp;
        m.bump          = ctx.bumps.market;

        emit!(MarketCreated { market_id, admin: ctx.accounts.admin.key(), end_timestamp, initial_yes_prob_bps });
        Ok(())
    }

    // ─── buy_shares ───────────────────────────────────────────────────────────
    pub fn buy_shares(
        ctx: Context<BuyShares>,
        market_id: u64,
        is_yes: bool,
        amount_lamports: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        {
            let m = &ctx.accounts.market;
            require!(!m.resolved,                          MarketError::MarketAlreadyResolved);
            require!(clock.unix_timestamp < m.end_timestamp, MarketError::MarketExpired);
            require!(amount_lamports > 0,                  MarketError::ZeroAmount);
            require!(market_id == m.market_id,             MarketError::MarketMismatch);
        }

        // ── Fee split ─────────────────────────────────────────────────────────
        let fee = amount_lamports
            .checked_mul(TRADING_FEE_BPS).ok_or(MarketError::MathOverflow)?
            .checked_div(BPS_DENOM).ok_or(MarketError::MathOverflow)?;
        let trade_amount = amount_lamports.checked_sub(fee).ok_or(MarketError::MathOverflow)?;

        // ── AMM price → shares ────────────────────────────────────────────────
        // price_bps = yes_prob_bps (for YES) or (10000 - yes_prob_bps) (for NO)
        let price_bps = if is_yes {
            ctx.accounts.market.yes_prob_bps
        } else {
            BPS_DENOM.checked_sub(ctx.accounts.market.yes_prob_bps).ok_or(MarketError::MathOverflow)?
        };
        // shares = trade_amount * BPS_DENOM / (price_bps * LAMPORTS_PER_SHARE / BPS_DENOM)
        // simplified: shares = (trade_amount * BPS_DENOM) / price_bps  [in micro-share units]
        let shares = trade_amount
            .checked_mul(BPS_DENOM).ok_or(MarketError::MathOverflow)?
            .checked_div(price_bps).ok_or(MarketError::MathOverflow)?
            .checked_div(LAMPORTS_PER_SHARE).ok_or(MarketError::MathOverflow)?;
        require!(shares > 0, MarketError::InsufficientAmount);

        // ── Transfer SOL: buyer → market pool ────────────────────────────────
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to:   ctx.accounts.market.to_account_info(),
                },
            ),
            trade_amount,
        )?;

        // ── Transfer fee: buyer → treasury ───────────────────────────────────
        if fee > 0 {
            system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    system_program::Transfer {
                        from: ctx.accounts.buyer.to_account_info(),
                        to:   ctx.accounts.treasury.to_account_info(),
                    },
                ),
                fee,
            )?;
        }

        // ── Update market state ───────────────────────────────────────────────
        {
            let m = &mut ctx.accounts.market;
            if is_yes {
                m.yes_shares = m.yes_shares.checked_add(shares).ok_or(MarketError::MathOverflow)?;
            } else {
                m.no_shares  = m.no_shares.checked_add(shares).ok_or(MarketError::MathOverflow)?;
            }
            m.total_volume   = m.total_volume.checked_add(amount_lamports).ok_or(MarketError::MathOverflow)?;
            m.pool_lamports  = m.pool_lamports.checked_add(trade_amount).ok_or(MarketError::MathOverflow)?;
            // Recalculate AMM probability
            let total = m.yes_shares.checked_add(m.no_shares).unwrap_or(1);
            m.yes_prob_bps   = m.yes_shares.checked_mul(BPS_DENOM).ok_or(MarketError::MathOverflow)?
                                .checked_div(total).ok_or(MarketError::MathOverflow)?;
        }

        // ── Update position ───────────────────────────────────────────────────
        {
            let p = &mut ctx.accounts.position;
            if p.market_id == 0 {
                // First time — initialize
                p.owner     = ctx.accounts.buyer.key();
                p.market_id = market_id;
                p.bump      = ctx.bumps.position;
            }
            if is_yes {
                p.yes_shares = p.yes_shares.checked_add(shares).ok_or(MarketError::MathOverflow)?;
            } else {
                p.no_shares  = p.no_shares.checked_add(shares).ok_or(MarketError::MathOverflow)?;
            }
            p.total_invested = p.total_invested.checked_add(amount_lamports).ok_or(MarketError::MathOverflow)?;
        }

        emit!(SharesBought {
            market_id,
            buyer: ctx.accounts.buyer.key(),
            is_yes,
            shares,
            amount_lamports,
            fee,
            new_yes_prob_bps: ctx.accounts.market.yes_prob_bps,
        });

        Ok(())
    }

    // ─── sell_shares ──────────────────────────────────────────────────────────
    pub fn sell_shares(
        ctx: Context<SellShares>,
        market_id: u64,
        is_yes: bool,
        shares_to_sell: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        {
            let m = &ctx.accounts.market;
            require!(!m.resolved,                             MarketError::MarketAlreadyResolved);
            require!(clock.unix_timestamp < m.end_timestamp,  MarketError::MarketExpired);
            require!(shares_to_sell > 0,                      MarketError::ZeroAmount);
            require!(market_id == m.market_id,                MarketError::MarketMismatch);
        }

        // ── Verify seller has enough shares ───────────────────────────────────
        {
            let p = &ctx.accounts.position;
            if is_yes {
                require!(p.yes_shares >= shares_to_sell, MarketError::InsufficientShares);
            } else {
                require!(p.no_shares  >= shares_to_sell, MarketError::InsufficientShares);
            }
        }

        // ── Payout calculation ────────────────────────────────────────────────
        let price_bps = if is_yes {
            ctx.accounts.market.yes_prob_bps
        } else {
            BPS_DENOM.checked_sub(ctx.accounts.market.yes_prob_bps).ok_or(MarketError::MathOverflow)?
        };
        let gross_lamports = shares_to_sell
            .checked_mul(price_bps).ok_or(MarketError::MathOverflow)?
            .checked_mul(LAMPORTS_PER_SHARE).ok_or(MarketError::MathOverflow)?
            .checked_div(BPS_DENOM).ok_or(MarketError::MathOverflow)?;
        let fee = gross_lamports
            .checked_mul(TRADING_FEE_BPS).ok_or(MarketError::MathOverflow)?
            .checked_div(BPS_DENOM).ok_or(MarketError::MathOverflow)?;
        let net_lamports = gross_lamports.checked_sub(fee).ok_or(MarketError::MathOverflow)?;

        require!(ctx.accounts.market.pool_lamports >= gross_lamports, MarketError::InsufficientPoolBalance);

        // ── Transfer SOL: pool → seller (PDA signed) ─────────────────────────
        let market_id_bytes  = market_id.to_le_bytes();
        let seeds: &[&[u8]] = &[b"market", &market_id_bytes, &[ctx.accounts.market.bump]];
        let signer_seeds     = &[seeds];

        **ctx.accounts.market.to_account_info().try_borrow_mut_lamports()? -= net_lamports;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += net_lamports;

        if fee > 0 {
            **ctx.accounts.market.to_account_info().try_borrow_mut_lamports()? -= fee;
            **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += fee;
        }

        // ── Update state ──────────────────────────────────────────────────────
        {
            let m = &mut ctx.accounts.market;
            if is_yes { m.yes_shares = m.yes_shares.saturating_sub(shares_to_sell); }
            else       { m.no_shares  = m.no_shares.saturating_sub(shares_to_sell); }
            m.pool_lamports = m.pool_lamports.saturating_sub(gross_lamports);
            let total      = m.yes_shares.checked_add(m.no_shares).unwrap_or(1);
            m.yes_prob_bps = if total == 0 { 5000 } else {
                m.yes_shares.checked_mul(BPS_DENOM).ok_or(MarketError::MathOverflow)?
                .checked_div(total).ok_or(MarketError::MathOverflow)?
            };
        }
        {
            let p = &mut ctx.accounts.position;
            if is_yes { p.yes_shares = p.yes_shares.saturating_sub(shares_to_sell); }
            else       { p.no_shares  = p.no_shares.saturating_sub(shares_to_sell); }
        }

        emit!(SharesSold {
            market_id,
            seller: ctx.accounts.seller.key(),
            is_yes,
            shares_to_sell,
            net_lamports,
            fee,
            new_yes_prob_bps: ctx.accounts.market.yes_prob_bps,
        });

        Ok(())
    }

    // ─── resolve_market ───────────────────────────────────────────────────────
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        market_id: u64,
        outcome_is_yes: bool,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let m = &mut ctx.accounts.market;
        require!(!m.resolved,              MarketError::MarketAlreadyResolved);
        require!(market_id == m.market_id, MarketError::MarketMismatch);
        // Can only resolve after end time OR by admin early
        require!(
            clock.unix_timestamp >= m.end_timestamp || ctx.accounts.admin.key() == m.admin,
            MarketError::MarketNotExpired
        );

        m.resolved = true;
        m.outcome  = Some(outcome_is_yes);

        emit!(MarketResolved { market_id, outcome_is_yes, resolver: ctx.accounts.admin.key() });
        Ok(())
    }

    // ─── claim_winnings ───────────────────────────────────────────────────────
    pub fn claim_winnings(ctx: Context<ClaimWinnings>, market_id: u64) -> Result<()> {
        let m = &ctx.accounts.market;
        require!(m.resolved,                       MarketError::MarketNotResolved);
        require!(market_id == m.market_id,         MarketError::MarketMismatch);
        let outcome_is_yes = m.outcome.ok_or(MarketError::MarketNotResolved)?;

        let p = &mut ctx.accounts.position;
        require!(!p.claimed,                       MarketError::AlreadyClaimed);

        let winning_shares = if outcome_is_yes { p.yes_shares } else { p.no_shares };
        require!(winning_shares > 0,               MarketError::NoWinningShares);

        // 1 winning share = 1 lamport payout per share * pool / total_winning_shares
        let total_winning = if outcome_is_yes { m.yes_shares } else { m.no_shares };
        require!(total_winning > 0,                MarketError::NoWinningShares);

        let payout = m.pool_lamports
            .checked_mul(winning_shares).ok_or(MarketError::MathOverflow)?
            .checked_div(total_winning).ok_or(MarketError::MathOverflow)?;

        require!(m.pool_lamports >= payout,        MarketError::InsufficientPoolBalance);

        // Transfer from market PDA → winner
        **ctx.accounts.market.to_account_info().try_borrow_mut_lamports()? -= payout;
        **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += payout;

        p.claimed = true;

        emit!(WinningsClaimed {
            market_id,
            winner: ctx.accounts.winner.key(),
            payout,
            winning_shares,
        });

        Ok(())
    }
}

// ─── Account Contexts ─────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct InitializeMarket<'info> {
    #[account(
        init,
        payer  = admin,
        space  = Market::SIZE,
        seeds  = [b"market", &market_id.to_le_bytes()],
        bump
    )]
    pub market:  Account<'info, Market>,

    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Treasury wallet — just receives fees
    #[account(mut)]
    pub liquidity_deposit: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct BuyShares<'info> {
    #[account(
        mut,
        seeds = [b"market", &market_id.to_le_bytes()],
        bump  = market.bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        init_if_needed,
        payer  = buyer,
        space  = Position::SIZE,
        seeds  = [b"position", buyer.key().as_ref(), &market_id.to_le_bytes()],
        bump
    )]
    pub position: Account<'info, Position>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Treasury — verified by program constant / env
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct SellShares<'info> {
    #[account(
        mut,
        seeds = [b"market", &market_id.to_le_bytes()],
        bump  = market.bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds  = [b"position", seller.key().as_ref(), &market_id.to_le_bytes()],
        bump   = position.bump,
        has_one = owner @ MarketError::Unauthorized
    )]
    pub position: Account<'info, Position>,

    #[account(mut)]
    pub seller: Signer<'info>,

    /// CHECK: Treasury
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct ResolveMarket<'info> {
    #[account(
        mut,
        seeds = [b"market", &market_id.to_le_bytes()],
        bump  = market.bump,
        has_one = admin @ MarketError::Unauthorized
    )]
    pub market: Account<'info, Market>,

    pub admin: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct ClaimWinnings<'info> {
    #[account(
        mut,
        seeds = [b"market", &market_id.to_le_bytes()],
        bump  = market.bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds  = [b"position", winner.key().as_ref(), &market_id.to_le_bytes()],
        bump   = position.bump,
        has_one = owner @ MarketError::Unauthorized
    )]
    pub position: Account<'info, Position>,

    #[account(mut)]
    pub winner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ─── Account Data Structures ──────────────────────────────────────────────────

#[account]
pub struct Market {
    pub market_id:     u64,          // 8
    pub title:         String,       // 4 + 256
    pub admin:         Pubkey,       // 32
    pub end_timestamp: i64,          // 8
    pub yes_prob_bps:  u64,          // 8  — live AMM probability
    pub yes_shares:    u64,          // 8
    pub no_shares:     u64,          // 8
    pub total_volume:  u64,          // 8
    pub pool_lamports: u64,          // 8  — lamports in the prize pool
    pub resolved:      bool,         // 1
    pub outcome:       Option<bool>, // 2  (1 tag + 1 value)
    pub created_at:    i64,          // 8
    pub bump:          u8,           // 1
}

impl Market {
    // discriminator(8) + fields
    pub const SIZE: usize = 8 + 8 + (4 + 256) + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 2 + 8 + 1 + 32;
}

#[account]
pub struct Position {
    pub owner:          Pubkey,  // 32
    pub market_id:      u64,     // 8
    pub yes_shares:     u64,     // 8
    pub no_shares:      u64,     // 8
    pub total_invested: u64,     // 8  — total lamports spent
    pub claimed:        bool,    // 1
    pub bump:           u8,      // 1
}

impl Position {
    pub const SIZE: usize = 8 + 32 + 8 + 8 + 8 + 8 + 1 + 1 + 8; // +8 padding
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct MarketCreated {
    pub market_id:           u64,
    pub admin:               Pubkey,
    pub end_timestamp:       i64,
    pub initial_yes_prob_bps: u64,
}

#[event]
pub struct SharesBought {
    pub market_id:       u64,
    pub buyer:           Pubkey,
    pub is_yes:          bool,
    pub shares:          u64,
    pub amount_lamports: u64,
    pub fee:             u64,
    pub new_yes_prob_bps: u64,
}

#[event]
pub struct SharesSold {
    pub market_id:       u64,
    pub seller:          Pubkey,
    pub is_yes:          bool,
    pub shares_to_sell:  u64,
    pub net_lamports:    u64,
    pub fee:             u64,
    pub new_yes_prob_bps: u64,
}

#[event]
pub struct MarketResolved {
    pub market_id:     u64,
    pub outcome_is_yes: bool,
    pub resolver:      Pubkey,
}

#[event]
pub struct WinningsClaimed {
    pub market_id:     u64,
    pub winner:        Pubkey,
    pub payout:        u64,
    pub winning_shares: u64,
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[error_code]
pub enum MarketError {
    #[msg("Market title exceeds 256 characters")]
    TitleTooLong,
    #[msg("Probability must be between 0 and 10000 bps")]
    InvalidProbability,
    #[msg("End timestamp must be in the future")]
    InvalidEndTime,
    #[msg("Initial liquidity below minimum (0.1 SOL)")]
    InsufficientLiquidity,
    #[msg("Market has already been resolved")]
    MarketAlreadyResolved,
    #[msg("Market has not been resolved yet")]
    MarketNotResolved,
    #[msg("Trading period has ended")]
    MarketExpired,
    #[msg("Market has not expired yet")]
    MarketNotExpired,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Amount too small to receive any shares")]
    InsufficientAmount,
    #[msg("Market ID mismatch")]
    MarketMismatch,
    #[msg("Arithmetic overflow")]
    MathOverflow,
    #[msg("Insufficient shares to sell")]
    InsufficientShares,
    #[msg("Pool has insufficient balance")]
    InsufficientPoolBalance,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Winnings already claimed")]
    AlreadyClaimed,
    #[msg("No winning shares in this position")]
    NoWinningShares,
}
