# Bountix Security Checklist

## Smart Contracts
- [x] `require_auth()` on all state-changing functions
- [x] `overflow-checks = true` in Cargo profile
- [x] `unwrap_or` defaults on all storage reads
- [x] TTL extended on all persistent storage entries
- [x] Events emitted for all state transitions
- [x] Only authorized callers can award reputation points
- [x] Dispute voters checked against approved validators list
- [x] Cannot vote twice on same dispute

## Frontend
- [x] No private keys in any client-side code
- [x] `SPONSOR_SECRET` only in Vercel environment variables (server-side)
- [x] Stellar address validation before building transactions
- [x] Positive XLM amount validation
- [x] Error messages don't expose internals
- [x] All config via `VITE_` env variables
- [x] `pnpm audit` passes with no critical vulnerabilities
- [x] `.env` in `.gitignore`

## Deployment
- [x] HTTPS enforced (Vercel does this by default)
- [x] No secrets in GitHub repo
- [x] GitHub Actions secrets used for VERCEL_TOKEN
- [x] CSP headers set in `vercel.json`
