# Bountix - Decentralized Bounty Board on Stellar

![CI](https://github.com/Aman0choudhary/stellar-belt-dapp/actions/workflows/ci.yml/badge.svg?branch=main)

Bountix is a Stellar Testnet bounty board where posters lock XLM, hunters claim tasks, submit proof, and get paid on approval.

## Live Demo

- https://stellar-belt-dapp.vercel.app/

## Level Status

Current focus: Level 4 (Blue Belt)

Implemented so far:
- Level 2 core bounty lifecycle
- Level 3 caching, tests, dashboard, countdown, skeleton loaders
- Level 4 reputation + dispute contracts, dispute UI, search/filter/sort, responsive polish, CI/CD workflow

## Contract Addresses (Testnet)

- Bounty Contract: `CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G`
- Reputation Contract: `CDR7KO7B25CTWJL6KST4WIBXHZGONNZWBOLJDWVCBHAL63WVGK2RUS7C`
- Dispute Contract: `CDVB5K2TIH4USYFERUU7KEY2UX2CVYZXD3GNBSK547UJQRRPUFZTUIJR`

Explorer links:
- https://stellar.expert/explorer/testnet/contract/CAFKMUKDXUJNUQUPWY6JGRCIYYA2BS3IHWUHR3A7QQIUSMC4ANNHFO6G
- https://stellar.expert/explorer/testnet/contract/CDR7KO7B25CTWJL6KST4WIBXHZGONNZWBOLJDWVCBHAL63WVGK2RUS7C
- https://stellar.expert/explorer/testnet/contract/CDVB5K2TIH4USYFERUU7KEY2UX2CVYZXD3GNBSK547UJQRRPUFZTUIJR

## CI/CD

Workflow file: `.github/workflows/ci.yml`

Pipeline jobs:
- Frontend install, test, and build
- Soroban contract builds (bounty, reputation, dispute)
- Auto deploy to Vercel on push to `main` (requires Vercel secrets)

Required GitHub secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## UI and Responsiveness

- Mobile-first improvements for 375px and up are included in `frontend/src/index.css`
- Horizontal-safe filter rows and pool table behavior on small screens
- Scroll-reveal animation is temporarily disabled for rendering stability

## Screenshots

Located in `docs/screenshots/`:
- `wallet-connected.png`
- `balance-displayed.png`
- `tx-success.png`
- `activity-feed.png`
- `bounty-board0.png`
- `bounty-board1.png`
- `level4-mobile-375.png`
- `level4-mobile-dashboard-375.png`

## Frontend Setup

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

## Level 4 Checklist

- [x] Dispute contract in repo
- [x] Reputation contract in repo
- [x] Inter-contract award points call in bounty approve flow
- [x] Reputation score display in UI
- [x] Dispute raise + validator vote UI
- [x] Search + filter + sort + min reward controls
- [x] CI workflow configured
- [x] Vercel auto deploy job configured for `main`
- [x] Mobile responsive updates (375px support)
- [x] All 3 contract addresses documented in README
- [x] Screenshot section updated

## Demo Video

[![Bountix Demo](https://img.youtube.com/vi/CMUWSU80CB4/maxresdefault.jpg)](https://youtu.be/CMUWSU80CB4)

## Notes

- This project started as a Level 1 Stellar wallet app and evolved into Bountix.
- Current branch contains in-progress Level 4 changes not yet fully merged into `main`.
