# Bountix - Decentralized Bounty Board on Stellar

Bountix is a Stellar Testnet bounty board where posters lock XLM, hunters claim work, submit proof, and get paid when the poster approves.

## Level Status

Current target: Level 2 (Yellow Belt) ✅ Complete

Implemented:
- StellarWalletsKit multi-wallet connect flow
- Bounty board UI with stats, filters, search, posting flow, proof submission, and role-aware actions
- Soroban bounty contract with escrow-oriented bounty lifecycle deployed on Testnet
- Live contract event polling feed
- Transaction status feedback and error handling
- Bounty card with always-visible next-step indicators and action buttons

## What Bountix Does

1. Poster posts a bounty and locks XLM in the contract
2. Hunter claims the bounty
3. Hunter submits a proof link
4. Poster approves to release XLM, or rejects to reopen the bounty

Statuses:

`OPEN -> CLAIMED -> SUBMITTED -> APPROVED / REJECTED / CANCELLED / EXPIRED`

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Soroban SDK (Rust)
- `@stellar/stellar-sdk`
- `@creit.tech/stellar-wallets-kit`

## Project Structure

```text
contracts/
  bounty/
  counter/
frontend/
  src/
    components/
    hooks/
    lib/
    pages/
docs/
```

## Local Setup

### Prerequisites

- Node.js 18+
- pnpm
- Freighter, xBull, or LOBSTR wallet on Stellar Testnet
- Rust and Stellar CLI for contract build/deploy

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

### Environment Variables

Set these in `frontend/.env`:

```env
VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_BOUNTY_CONTRACT_ID=CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G
VITE_REPUTATION_CONTRACT_ID=
VITE_DISPUTE_CONTRACT_ID=
VITE_COUNTER_CONTRACT_ID=
```

## Contract Build and Deploy

Build the Level 2 bounty contract:

```bash
cd contracts/bounty
stellar contract build
```

Get the native XLM asset contract id on testnet:

```bash
stellar contract id asset --network testnet --asset native
```

Deploy the bounty contract and pass the native asset contract id to the constructor:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/bounty.wasm \
  --source deployer \
  --network testnet \
  -- \
  --asset <NATIVE_XLM_ASSET_CONTRACT_ID>
```

After deployment, add the returned contract id to `frontend/.env` as `VITE_BOUNTY_CONTRACT_ID`.

## Wallet Support

Via StellarWalletsKit:
- Freighter
- xBull
- LOBSTR

## Error Handling

Handled in the frontend:
- Wallet not found
- User rejected request
- Insufficient XLM balance

## Live Demo

- https://stellar-belt-dapp.vercel.app/

## Deployed Contract

- Bounty Contract: `CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G`
- Network: Stellar Testnet
- Explorer: https://stellar.expert/explorer/testnet/contract/CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G
- Native XLM Asset Contract: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

## Transaction Hash

- WASM upload: `6102b16b943e0e49b4ed9b47b706b937da8c7e2320ad903112985073525b7194`
- Contract deploy: `2ed9b074072e3588623fc8b2eba8f2fb555ea7873c1a09981de8169af1613dfb`
- Explorer:
  - https://stellar.expert/explorer/testnet/tx/6102b16b943e0e49b4ed9b47b706b937da8c7e2320ad903112985073525b7194
  - https://stellar.expert/explorer/testnet/tx/2ed9b074072e3588623fc8b2eba8f2fb555ea7873c1a09981de8169af1613dfb

## Level 2 Checklist

- [x] StellarWalletsKit integrated in frontend
- [x] Bounty board UI implemented
- [x] Post, claim, submit, approve, reject, cancel flows wired in frontend
- [x] Error states surfaced in UI
- [x] Transaction status feedback implemented
- [x] Activity feed polling implemented
- [x] Bounty contract built and deployed
- [x] Contract address added to README
- [x] Verified contract-call transaction hash added to README
- [x] Live demo redeployed
- [x] Screenshots captured
## Level 3 Checklist

- [x] Loading skeletons on bounty cards while fetching
- [x] Progress steps during transaction signing
- [x] Countdown timer on every bounty card (live-updating)
- [x] Balance caching with 10s TTL, invalidated after actions
- [x] Bounty list caching with 15s TTL, invalidated after actions
- [x] Hunter dashboard — my claims, my submissions, my earnings
- [x] Poster dashboard — pending reviews, active bounties, history
- [x] Separate `/my-dashboard` page with Hunter/Poster tabs
- [x] 3 test suites (23 tests) passing — cache, errors, BountyCard
- [ ] 1-minute demo video link in README
- [x] Live demo deployed
- [x] 3+ meaningful commits

### Test Results

```
 ✓ src/tests/errors.test.ts (10 tests) 24ms
 ✓ src/tests/cache.test.ts (5 tests) 87ms
 ✓ src/tests/BountyCard.test.tsx (8 tests) 287ms

 Test Files  3 passed (3)
      Tests  23 passed (23)
```

### Demo Video

<!-- Replace with your recorded demo video URL -->
- Pending — record with Loom or OBS and add link here

## Notes

- This repo started as the Level 1 Stellar wallet dApp and is now being upgraded into Bountix following `bountix-plan.md`.
- The current codebase is being completed one level at a time so each submission stage can stand on its own.
