import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Plp } from '../target/types/plp';
import BN from 'bn.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PROGRAM_SO_PATH = path.join(PROJECT_ROOT, 'target', 'deploy', 'plp.so');
const PROGRAM_KEYPAIR_PATH = path.join(PROJECT_ROOT, 'target', 'deploy', 'plp-keypair.json');
const PROGRAM_CARGO_MANIFEST = path.join(PROJECT_ROOT, 'programs', 'plp', 'Cargo.toml');
const BPF_LOADER_DEPRECATED = new PublicKey('BPFLoader2111111111111111111111111111111111');
const BPF_LOADER_UPGRADEABLE = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111');

async function main() {
  const rpcUrl = process.env.ANCHOR_PROVIDER_URL || 'http://127.0.0.1:8899';
  const connection = new anchor.web3.Connection(rpcUrl, 'confirmed');
  const walletPath =
    process.env.ANCHOR_WALLET || `${process.env.HOME}/.config/solana/id.json`;
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  anchor.setProvider(provider);
  const program = anchor.workspace.Plp as Program<Plp>;
  await ensureLocalProgram(program.programId, connection, rpcUrl);

  const mint = Keypair.generate().publicKey;
  const vaultSol = Keypair.generate().publicKey;
  const vaultToken = Keypair.generate().publicKey;
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), mint.toBuffer()],
    program.programId
  );

  console.log('Initializing pool...');
  await program.methods
    .initPool({
      mint,
      curveType: 0,
    })
    .accounts({
      pool: poolPda,
      authority: provider.wallet.publicKey,
      vaultSol,
      vaultToken,
      payer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    } as any)
    .rpc();

  let pool = await fetchPool(program, poolPda);
  expect(pool.graduated).to.be.false;
  console.log('Pool initialized ✅');

  console.log('Simulating buy...');
  await program.methods
    .buy(new BN(1_000_000), new BN(1_000))
    .accounts({
      pool: poolPda,
      user: provider.wallet.publicKey,
    } as any)
    .rpc();

  pool = await fetchPool(program, poolPda);
  expect(pool.totalTokens.toNumber()).to.equal(1_000_000);
  expect(pool.totalSol.toNumber()).to.equal(1_000);
  console.log('Buy ok ✅');

  console.log('Simulating sell...');
  await program.methods
    .sell(new BN(500_000), new BN(400))
    .accounts({
      pool: poolPda,
      user: provider.wallet.publicKey,
    } as any)
    .rpc();

  pool = await fetchPool(program, poolPda);
  expect(pool.totalTokens.toNumber()).to.equal(500_000);
  expect(pool.totalSol.toNumber()).to.equal(600);
  console.log('Sell ok ✅');

  console.log('Locking liquidity...');
  await program.methods
    .lockLiquidity(true)
    .accounts({
      pool: poolPda,
      authority: provider.wallet.publicKey,
    } as any)
    .rpc();
  pool = await waitForPoolCondition(
    program,
    poolPda,
    (latest) => latest.locked === true,
    'pool.locked === true after lockLiquidity'
  );

  console.log('Graduating pool...');
  await program.methods
    .graduate({ raydium: {} })
    .accounts({
      pool: poolPda,
      authority: provider.wallet.publicKey,
    } as any)
    .rpc();
  pool = await (program.account as any).pool.fetch(poolPda);
  expect(pool.graduated).to.be.true;

  console.log('All PLP tests passed ✅');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function ensureLocalProgram(
  programId: PublicKey,
  connection: anchor.web3.Connection,
  rpcUrl: string
) {
  if (!isLocalRpc(rpcUrl)) {
    return;
  }

  const info = await getAccountInfoOrThrow(connection, programId, rpcUrl);
  if (info?.executable && info.owner.equals(BPF_LOADER_UPGRADEABLE)) {
    return;
  }

  if (info) {
    console.log(
      `PLP program account found (owner=${info.owner.toBase58()}, executable=${info.executable}). Redeploying...`
    );
    closeProgramAccount(programId, rpcUrl);
  } else {
    console.log('PLP program not found on the local validator. Building & deploying...');
  }
  await buildProgramBinaryIfNeeded();

  if (!fs.existsSync(PROGRAM_KEYPAIR_PATH)) {
    throw new Error(
      `Missing program keypair at ${PROGRAM_KEYPAIR_PATH}. Run "anchor build" to regenerate it.`
    );
  }

  console.log('Deploying PLP program via `solana program deploy`...');
  runCommand(
    `solana program deploy ${PROGRAM_SO_PATH} --program-id ${PROGRAM_KEYPAIR_PATH} --url ${rpcUrl} --skip-feature-verify`,
    'deploy PLP program'
  );
  await waitForProgram(connection, programId);
}

function isLocalRpc(rpcUrl: string): boolean {
  try {
    const hostname = new URL(rpcUrl).hostname;
    return hostname === '127.0.0.1' || hostname === 'localhost';
  } catch {
    return false;
  }
}

async function buildProgramBinaryIfNeeded() {
  console.log('Building PLP program artifacts (`anchor build` + `cargo build-sbf --no-default-features`)...');
  runCommand('anchor build', 'run anchor build');

  console.log('Running `cargo build-sbf` to emit the SBF binary...');
  const deployDir = path.join(PROJECT_ROOT, 'target', 'deploy');
  const cargoBuildCmd = `cargo build-sbf --manifest-path ${JSON.stringify(
    PROGRAM_CARGO_MANIFEST
  )} --sbf-out-dir ${JSON.stringify(deployDir)} -- --no-default-features`;
  runCommand(cargoBuildCmd, 'build PLP program with cargo build-sbf');

  if (!fs.existsSync(PROGRAM_SO_PATH)) {
    throw new Error(`Expected binary at ${PROGRAM_SO_PATH}, but it is still missing after build.`);
  }
}

async function waitForProgram(connection: anchor.web3.Connection, programId: PublicKey) {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const info = await connection.getAccountInfo(programId);
      if (info?.executable && info.owner.equals(BPF_LOADER_UPGRADEABLE)) {
        console.log('PLP program deployed ✅');
        return;
      }
      if (info) {
        if (!info.executable) {
          lastError = new Error('Program account found but executable flag is false.');
        } else if (!info.owner.equals(BPF_LOADER_UPGRADEABLE)) {
          lastError = new Error(
            `Program account owned by ${info.owner.toBase58()}, expected BPFLoaderUpgradeable`
          );
        }
      }
    } catch (error) {
      lastError = error as Error;
    }
    await sleep(500 * (attempt + 1));
  }

  throw new Error(
    `Program ${programId.toBase58()} was deployed but the validator did not report it in time.${
      lastError ? ` Last RPC error: ${lastError.message}` : ''
    }`
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runCommand(command: string, context: string) {
  try {
    execSync(command, { stdio: 'inherit', cwd: PROJECT_ROOT });
  } catch (error) {
    throw new Error(`Failed to ${context}. Original error: ${(error as Error).message}`);
  }
}

function closeProgramAccount(programId: PublicKey, rpcUrl: string) {
  try {
    runCommand(
      `solana program close ${programId.toBase58()} --bypass-warning --url ${rpcUrl}`,
      'close existing PLP program'
    );
  } catch (error) {
    console.warn(
      `Attempted to close existing program ${programId.toBase58()}, but it failed: ${
        (error as Error).message
      }. If this persists, restart your validator with --reset to clear old program accounts.`
    );
  }
}

async function getAccountInfoOrThrow(
  connection: anchor.web3.Connection,
  programId: PublicKey,
  rpcUrl: string
) {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await connection.getAccountInfo(programId);
    } catch (error) {
      lastError = error as Error;
      await sleep(500 * (attempt + 1));
    }
  }

  throw new Error(
    `Failed to reach RPC at ${rpcUrl}. Is 'solana-test-validator' running? Last error: ${
      lastError?.message ?? 'unknown'
    }`
  );
}

async function fetchPool(program: Program<Plp>, poolPda: PublicKey) {
  return (program.account as any).pool.fetch(poolPda);
}

async function waitForPoolCondition(
  program: Program<Plp>,
  poolPda: PublicKey,
  predicate: (pool: any) => boolean,
  description: string,
  attempts = 5
) {
  let lastPool: any = null;
  for (let i = 0; i < attempts; i++) {
    lastPool = await fetchPool(program, poolPda);
    if (predicate(lastPool)) {
      return lastPool;
    }
    await sleep(300 * (i + 1));
  }
  throw new Error(
    `Timed out waiting for ${description}. Last observed pool state: ${JSON.stringify(
      lastPool,
      null,
      2
    )}`
  );
}
