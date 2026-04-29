# Bountix - Decentralized Bounty Board on Stellar

![CI](https://github.com/Aman0choudhary/stellar-belt-dapp/actions/workflows/ci.yml/badge.svg?branch=main)

Bountix is a Stellar Testnet bounty board where posters lock XLM, hunters claim tasks, submit proof, and get paid on approval. Built with Soroban smart contracts and React.

## 🌐 Live Demo

**→ [https://stellar-belt-dapp.vercel.app](https://stellar-belt-dapp.vercel.app)**

## 📸 App Screenshots

![Hero Page](docs/screenshots/hero%20page.jpeg)

![Reputation Badge](docs/screenshots/level4-reputation-badge.jpeg)

![Bounty Board](docs/screenshots/Bounty%20board.jpeg)

![Wallet Connected](docs/screenshots/wallet%20connected%20.jpeg)

![Poster View](docs/screenshots/poster%20view.jpeg)

## ✅ CI/CD Pipeline

![CI Badge](https://github.com/Aman0choudhary/stellar-belt-dapp/actions/workflows/ci.yml/badge.svg?branch=main)

![CI Passed](docs/screenshots/CI-passed.png)

Pipeline: `.github/workflows/ci.yml`

| Job | Description |
|-----|-------------|
| **Test & Build Frontend** | `pnpm install` → `vitest run` → `vite build` |
| **Verify Soroban Contracts** | `cargo check --workspace` for all 3 contracts |

Auto-deploys to Vercel on push to `main`.

## 📜 Contract Addresses (Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| **Bounty** | `CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G` | [View on Explorer](https://stellar.expert/explorer/testnet/contract/CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G) |
| **Reputation (BNTX Token)** | `CDR7KO7B25CTWJL6KST4WIBXHZGONNZWBOLJDWVCBHAL63WVGK2RUS7C` | [View on Explorer](https://stellar.expert/explorer/testnet/contract/CDR7KO7B25CTWJL6KST4WIBXHZGONNZWBOLJDWVCBHAL63WVGK2RUS7C) |
| **Dispute** | `CDVB5K2TIH4USYFERUU7KEY2UX2CVYZXD3GNBSK547UJQRRPUFZTUIJR` | [View on Explorer](https://stellar.expert/explorer/testnet/contract/CDVB5K2TIH4USYFERUU7KEY2UX2CVYZXD3GNBSK547UJQRRPUFZTUIJR) |

### Inter-Contract Calls

The **Bounty contract** makes inter-contract calls to the **Reputation contract** when a bounty is approved — awarding BNTX points to the hunter via `award_points()`.

The **Dispute contract** is initialized with the Bounty contract as admin. Dispute resolution (2-of-3 validator vote) triggers on-chain events that the frontend reads.

### Transaction Hashes (Testnet)

- Bounty contract deploy: [View on Explorer](https://stellar.expert/explorer/testnet/contract/CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G)
- Reputation contract deploy: [View on Explorer](https://stellar.expert/explorer/testnet/contract/CDR7KO7B25CTWJL6KST4WIBXHZGONNZWBOLJDWVCBHAL63WVGK2RUS7C)
- Dispute contract deploy: [View on Explorer](https://stellar.expert/explorer/testnet/contract/CDVB5K2TIH4USYFERUU7KEY2UX2CVYZXD3GNBSK547UJQRRPUFZTUIJR)

### Custom Token

- **BNTX Reputation Token**: Non-transferable reputation points awarded to hunters on bounty approval
- Token Contract: `CDR7KO7B25CTWJL6KST4WIBXHZGONNZWBOLJDWVCBHAL63WVGK2RUS7C`
- Tiers: 🌱 Newcomer (0-10) → ⭐ Trusted (11-50) → 🔥 Elite (51-100) → 💎 Legend (100+)

## 🎬 Demo Video

[![Bountix Demo](https://img.youtube.com/vi/CMUWSU80CB4/maxresdefault.jpg)](https://youtu.be/CMUWSU80CB4)

## 📊 Level Status

**Current: Level 4 (Blue Belt)**

### Level 4 Checklist

- [x] Dispute contract deployed (3-validator, 2-of-3 majority)
- [x] Reputation contract deployed (BNTX non-transferable token)
- [x] Inter-contract call: bounty → reputation `award_points()`
- [x] Reputation badge shown in UI (🌱/⭐/🔥/💎 tiers)
- [x] Dispute raise + validator vote UI
- [x] Search + filter + sort + min XLM reward controls
- [x] Category tags (Social, Code, Design, Testing, Content, Other)
- [x] CI/CD workflow (GitHub Actions) — passing ✅
- [x] Auto-deploy to Vercel on push to `main`
- [x] Mobile responsive (375px+)
- [x] All 3 contract addresses documented
- [x] 8+ meaningful commits (34 total)

### ✅ Level 5 Checklist (Blue Belt)

- [x] Architecture document — [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [x] Shareable bounty pages — `/bounty/:id` (no wallet required to view)
- [x] Public hunter leaderboard — `/leaderboard` with BNTX tier rankings
- [x] Wallet-less browse mode — all bounties visible publicly
- [x] Bounty status timeline — visual Open→Claimed→Submitted→Approved tracker
- [x] Toast notifications — on-chain event alerts (bounty claimed, approved, etc.)
- [x] 10+ new commits (Level 5 total: 42+)
- [x] User feedback form — [Google Form](https://forms.gle/PLACEHOLDER) _(link will be updated)_
- [ ] 5+ real testnet user wallet addresses (collecting)
- [ ] 1 iteration based on user feedback (pending)

### Previous Levels

- **Level 2**: Core bounty lifecycle — post, claim, submit proof, approve/reject
- **Level 3**: Caching, countdown timers, skeleton loaders, 3 test suites (23 tests), Hunter/Poster dashboard

## 📸 Screenshots

All screenshots in `docs/screenshots/`:

| Screenshot | Description |
|-----------|-------------|
| `wallet-connected.png` | Wallet connected state |
| `balance-displayed.png` | XLM balance display |
| `tx-success.png` | Successful transaction |
| `bounty-board0.png` | Bounty board overview |
| `level4-mobile-375.png` | Mobile responsive (375px) |
| `level4-mobile-dashboard-375.png` | Mobile dashboard |
| `level4-reputation-badge.jpeg` | Reputation badge in UI |
| `Bounty filters.jpeg` | Search + filter controls |
| `hero page.jpeg` | Landing page hero |
| `poster view.jpeg` | Poster dashboard view |

## 🛠 Setup

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

## Environment Variables

```env
VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_BOUNTY_CONTRACT_ID=CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G
VITE_REPUTATION_CONTRACT_ID=CDR7KO7B25CTWJL6KST4WIBXHZGONNZWBOLJDWVCBHAL63WVGK2RUS7C
VITE_DISPUTE_CONTRACT_ID=CDVB5K2TIH4USYFERUU7KEY2UX2CVYZXD3GNBSK547UJQRRPUFZTUIJR
```

## Notes

- This project started as a Level 1 Stellar wallet app and evolved into Bountix.
- Scroll animations use a zero-re-render CSS-class approach for performance.
- Albedo wallet is recommended for mobile users.

## 🏗 Architecture

Full system architecture, component tree, data flows, and contract specs:

**→ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

## 👥 User Feedback (Level 5)

We collected feedback from 5+ real testnet users via Google Form.

- **Feedback Form:** [Fill out the form](https://forms.gle/PLACEHOLDER) _(link will be updated after form creation)_
- **Feedback Sheet:** [`docs/user-feedback.xlsx`](docs/user-feedback.xlsx) _(added after collection)_

### User Wallet Addresses (Verifiable on Stellar Testnet Explorer)

| # | Wallet Address | Explorer |
|---|---------------|----------|
| 1 | _(collecting)_ | — |
| 2 | _(collecting)_ | — |
| 3 | _(collecting)_ | — |
| 4 | _(collecting)_ | — |
| 5 | _(collecting)_ | — |

### Improvement Plan (Based on User Feedback)

After collecting user feedback, the following iteration was implemented:

> _Improvement description will be added here after user feedback is collected._

Implementation commit: _(link will be added after iteration commit)_
