# Bountix — System Architecture

## Overview

Bountix is a decentralized bounty board built on the Stellar Testnet using Soroban smart contracts. Users post tasks with XLM rewards, hunters claim them, submit proof, and posters approve or dispute outcomes. All payment and state logic runs on-chain.

```
┌─────────────────────────────────────────────┐
│                  Users                      │
│  (Posters, Hunters, Validators, Guests)     │
└───────────────────┬─────────────────────────┘
                    │ HTTPS
        ┌───────────▼──────────┐
        │   React Frontend     │
        │   Vite + React 18    │
        │   stellar-belt-dapp  │
        │   .vercel.app        │
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────┐
        │   Stellar Wallets    │
        │  Freighter / Albedo  │
        │  Lobstr / xBull      │
        └───────────┬──────────┘
                    │  XDR sign & submit
        ┌───────────▼──────────┐
        │  Soroban RPC Server  │
        │  soroban-testnet     │
        │  .stellar.org        │
        └───┬───────┬──────┬───┘
            │       │      │
   ┌────────▼─┐ ┌───▼──┐ ┌─▼──────────┐
   │  Bounty  │ │ Rep. │ │  Dispute   │
   │ Contract │ │Contr.│ │  Contract  │
   │ CAFKMUK… │ │CDR7K…│ │ CDVB5K2T… │
   └────────┬─┘ └───▲──┘ └─▲──────────┘
            │       │      │
            └───────┘      │
        inter-contract      │
        award_points()      │
                           │
            Bounty ────────┘
            admin call on dispute
```

## Smart Contracts

### 1. Bounty Contract
**Address:** `CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G`

Manages the full bounty lifecycle:

| Function | Access | Description |
|----------|--------|-------------|
| `post_bounty(title, desc, reward, deadline)` | Any | Lock XLM and post a bounty |
| `claim_bounty(bounty_id)` | Any | Assign hunter to bounty |
| `submit_proof(bounty_id, proof_link)` | Hunter | Submit completion proof |
| `approve_bounty(bounty_id)` | Poster | Release XLM to hunter + award BNTX |
| `reject_bounty(bounty_id)` | Poster | Reject submission |
| `cancel_bounty(bounty_id)` | Poster | Cancel and refund |
| `get_bounty(id)` | Anyone | Read bounty by ID |
| `get_bounties()` | Anyone | Read all bounties |

**Inter-contract call:** On `approve_bounty`, the Bounty contract invokes `reputation_contract.award_points(poster, hunter, 10)`.

### 2. Reputation Contract (BNTX)
**Address:** `CDR7KO7B25CTWJL6KST4WIBXHZGONNZWBOLJDWVCBHAL63WVGK2RUS7C`

Non-transferable reputation token (BNTX) awarded to hunters on bounty approval.

| Function | Access | Description |
|----------|--------|-------------|
| `award_points(admin, hunter, points)` | Bounty contract | Mint BNTX to hunter |
| `get_score(address)` | Anyone | Read-only score lookup |

**Tier system:**
- 🌱 Newcomer — 0–10 BNTX
- ⭐ Trusted Hunter — 11–50 BNTX  
- 🔥 Elite Hunter — 51–99 BNTX
- 💎 Legend — 100+ BNTX

### 3. Dispute Contract
**Address:** `CDVB5K2TIH4USYFERUU7KEY2UX2CVYZXD3GNBSK547UJQRRPUFZTUIJR`

3-validator, 2-of-3 majority dispute resolution system.

| Function | Access | Description |
|----------|--------|-------------|
| `raise_dispute(bounty_id)` | Hunter | Open a dispute |
| `vote(dispute_id, approve)` | Validators | Cast majority vote |
| `resolve(dispute_id)` | Anyone | Resolve after 2/3 votes |

---

## Frontend Architecture

### Technology Stack
- **Framework:** React 18 + TypeScript
- **Build tool:** Vite 5
- **Package manager:** pnpm
- **Styling:** Vanilla CSS (custom design system in `index.css`)
- **Routing:** React Router v6 (BrowserRouter)
- **Deployment:** Vercel (auto-deploy on push to `main`)

### Page Structure
```
src/
├── pages/
│   ├── Home.tsx          — Landing page (hero, features, dashboard, pools, FAQ)
│   ├── MyDashboard.tsx   — Personal wallet dashboard
│   ├── BountyDetail.tsx  — Shareable bounty page /bounty/:id  [Level 5]
│   └── Leaderboard.tsx   — Public hunter rankings /leaderboard  [Level 5]
├── components/
│   ├── Navbar.tsx         — Navigation (links, wallet connect/disconnect)
│   ├── Hero.tsx           — Landing page hero section
│   ├── Dashboard.tsx      — Bounty board (public read, wallet needed to interact)
│   ├── BountyCard.tsx     — Single bounty card with timeline + share link
│   ├── BountyTimeline.tsx — Status stepper (compact + full modes)  [Level 5]
│   ├── BountyForm.tsx     — Post new bounty modal
│   ├── ProofSubmitModal.tsx — Submit proof modal
│   ├── DisputePanel.tsx   — Dispute raise + vote UI
│   ├── ReputationBadge.tsx — BNTX tier badge (sm/md/lg)
│   ├── Toast.tsx          — Global toast notification system  [Level 5]
│   ├── ActivityFeed.tsx   — On-chain event feed
│   ├── WalletButton.tsx   — Multi-wallet connect button
│   ├── BalanceDisplay.tsx — XLM balance
│   ├── SendForm.tsx       — XLM send form
│   └── CounterPanel.tsx   — Soroban counter demo
├── hooks/
│   ├── useWallet.ts       — Wallet connection state
│   ├── useBalance.ts      — XLM balance polling
│   ├── useBounties.ts     — Bounty CRUD + tx state
│   ├── useReputation.ts   — BNTX score + tier
│   ├── useContractEvents.ts — Event polling
│   ├── useTxStatus.ts     — Transaction step tracker
│   └── useScrollReveal.ts — CSS scroll animation observer
└── lib/
    ├── bountyContract.ts  — Soroban RPC calls for bounty contract
    ├── reputationContract.ts — Soroban RPC calls for reputation contract
    ├── disputeContract.ts — Soroban RPC calls for dispute contract
    ├── contract.ts        — Generic counter contract helper
    ├── transaction.ts     — Transaction building utilities
    ├── walletsKit.ts      — @creit-tech/stellar-wallets-kit setup
    ├── cache.ts           — In-memory TTL cache
    └── errors.ts          — Error parsing utilities
```

### Data Flow — Post a Bounty

```
User fills BountyForm
     ↓
useBounties.post(title, desc, reward, days)
     ↓
bountyContract.postBounty(publicKey, input)
     ↓
TransactionBuilder → bounty contract → post_bounty()
     ↓
WalletsKit.signTransaction(xdr)  ← wallet popup
     ↓
server.sendTransaction(signedXdr)
     ↓
server.pollTransaction(hash)
     ↓
useBounties re-fetches all bounties
     ↓
BountyCard rendered with new bounty
```

### Data Flow — Approve (with inter-contract call)

```
Poster clicks Approve on BountyCard
     ↓
bountyContract.approveBounty(publicKey, bountyId)
     ↓
Soroban executes approve_bounty()
     ↓  (inter-contract)
reputation_contract.award_points(poster, hunter, 10)
     ↓
Hunter BNTX score increases
     ↓
ReputationBadge re-fetches score → tier may upgrade
```

---

## CI/CD Pipeline

```
git push → main
     ↓
GitHub Actions ci.yml
     ├── Job 1: Verify Soroban Contracts
     │   └── cargo check --workspace (contracts/)
     └── Job 2: Test & Build Frontend
         ├── pnpm install --frozen-lockfile
         ├── pnpm test (vitest run)
         └── npx vite build
                     ↓
              Vercel auto-deploy
              stellar-belt-dapp.vercel.app
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_STELLAR_NETWORK` | `TESTNET` |
| `VITE_STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `VITE_STELLAR_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` |
| `VITE_HORIZON_URL` | `https://horizon-testnet.stellar.org` |
| `VITE_BOUNTY_CONTRACT_ID` | Bounty contract address |
| `VITE_REPUTATION_CONTRACT_ID` | Reputation contract address |
| `VITE_DISPUTE_CONTRACT_ID` | Dispute contract address |

---

## Security Notes

- All state mutations require a wallet-signed transaction — no server-side keys
- Read-only calls use a public readonly source account (no signing required)
- Testnet only — no real funds at risk
- Contract admin functions (award_points) are restricted to the bounty contract caller
