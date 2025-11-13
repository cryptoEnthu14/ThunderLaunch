use anchor_lang::prelude::*;

declare_id!("6avMmcRVikm9UKbVjWKFvS7tYaaVRWRTPPNXvtPffhwD");

#[program]
pub mod plp {
    use super::*;

    pub fn init_pool(ctx: Context<InitPool>, args: InitPoolArgs) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.mint = args.mint;
        pool.vault_sol = ctx.accounts.vault_sol.key();
        pool.vault_token = ctx.accounts.vault_token.key();
        pool.curve_type = args.curve_type;
        pool.locked = false;
        pool.graduated = false;
        pool.graduation_dex = GraduationDex::default() as u8;
        pool.total_sol = 0;
        pool.total_tokens = 0;
        pool.bump = ctx.bumps.pool;
        Ok(())
    }

    pub fn buy(ctx: Context<Trade>, tokens: u64, lamports: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(!pool.locked, PlpError::LiquidityLocked);
        require!(!pool.graduated, PlpError::PoolGraduated);
        pool.total_sol = pool
            .total_sol
            .checked_add(lamports)
            .ok_or(PlpError::Overflow)?;
        pool.total_tokens = pool
            .total_tokens
            .checked_add(tokens)
            .ok_or(PlpError::Overflow)?;
        Ok(())
    }

    pub fn sell(ctx: Context<Trade>, tokens: u64, lamports: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(!pool.locked, PlpError::LiquidityLocked);
        require!(!pool.graduated, PlpError::PoolGraduated);
        pool.total_sol = pool
            .total_sol
            .checked_sub(lamports)
            .ok_or(PlpError::InsufficientSol)?;
        pool.total_tokens = pool
            .total_tokens
            .checked_sub(tokens)
            .ok_or(PlpError::InsufficientTokens)?;
        Ok(())
    }

    pub fn lock_liquidity(ctx: Context<UpdateState>, locked: bool) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.locked = locked;
        Ok(())
    }

    pub fn graduate(ctx: Context<UpdateState>, dex: GraduationDex) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.graduated = true;
        pool.graduation_dex = dex as u8;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(args: InitPoolArgs)]
pub struct InitPool<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + Pool::LEN,
        seeds = [b"pool", args.mint.as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    /// CHECK: validated in front-end
    pub authority: UncheckedAccount<'info>,
    /// CHECK: vault accounts managed off-chain
    pub vault_sol: UncheckedAccount<'info>,
    /// CHECK: vault accounts managed off-chain
    pub vault_token: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Trade<'info> {
    #[account(mut, seeds = [b"pool", pool.mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, Pool>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateState<'info> {
    #[account(mut, has_one = authority, seeds = [b"pool", pool.mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, Pool>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub vault_sol: Pubkey,
    pub vault_token: Pubkey,
    pub curve_type: u8,
    pub locked: bool,
    pub graduated: bool,
    pub graduation_dex: u8,
    pub total_sol: u64,
    pub total_tokens: u64,
    pub bump: u8,
}

impl Pool {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 1 + 1 + 1 + 1 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitPoolArgs {
    pub mint: Pubkey,
    pub curve_type: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub enum GraduationDex {
    #[default]
    Raydium = 0,
    Orca = 1,
    Jupiter = 2,
}

#[error_code]
pub enum PlpError {
    #[msg("Liquidity is locked")]
    LiquidityLocked,
    #[msg("Pool already graduated")]
    PoolGraduated,
    #[msg("Math overflow")]
    Overflow,
    #[msg("Insufficient SOL")]
    InsufficientSol,
    #[msg("Insufficient tokens")]
    InsufficientTokens,
}
