# CipherComp Progress

## What Changed (Plain English)
- Created the project from scratch
- Smart contract written and compiles: encrypts salary data, tracks which pay brackets people fall into, lets you check your percentile
- 10 tests passing: role setup, salary submission, duplicate prevention, percentile calculation all work
- Deploy script ready: deploys contract + configures 5 roles x 3 locations = 15 role/location combos
- Frontend built and renders: landing page, Connect Wallet, salary form, percentile display
- Build succeeds (static export works, 196 kB first load)
- Fixed hash collision bug (abi.encodePacked -> abi.encode)
- Fixed frontend timing bugs: tx confirmation wait, bucket result persistence, polling race condition

## Phase Status
- [x] Project structure created
- [x] Contract written (SalaryBenchmark.sol) — 24 FHE ops per submit, cumulative distribution
- [x] 10 tests passing with encrypted mock data (24 seconds)
- [x] Project docs (CLAUDE.md, memory.md)
- [x] Repo initialized, save points created
- [x] Deploy script written (contracts/scripts/deploy.ts)
- [x] Frontend: providers, cofhe hook, contract hook, SalaryForm, PercentileDisplay
- [x] Static build succeeds (Next.js 14 + wagmi v2 + cofhejs 0.3.1)
- [x] Code review: fixed hash collision, tx timing, polling race condition
- [ ] **BLOCKED: Deploy to Arb Sepolia** — wallet 0x296...ceB has 0 ETH, need faucet
- [ ] End-to-end demo works in browser with real wallet
- [ ] /design for visual polish
- [ ] GitHub Pages deployment
- [ ] AKINDO Wave 2 submission

## What's Next
1. Get testnet ETH from faucet for 0x29645627E382a1EEa17593A0cFAeA2867F6C0ceB
2. Deploy: `cd contracts && npx hardhat run scripts/deploy.ts --network arb-sepolia`
3. Update contract address in app/lib/contract.ts
4. End-to-end test with MetaMask
5. /design for visual polish
6. GitHub Pages deployment
7. AKINDO Wave 2 submission

## Key Files
- `contracts/contracts/SalaryBenchmark.sol` — main contract (abi.encode for hash keys)
- `contracts/test/SalaryBenchmark.test.ts` — 10 tests
- `contracts/scripts/deploy.ts` — deploy + configure 15 roles
- `contracts/scripts/check-balance.ts` — check deployer balance
- `app/hooks/useCofhe.ts` — FHE encryption hook (from MEV Shield)
- `app/hooks/useSalaryBenchmark.ts` — contract interaction hooks
- `app/components/SalaryForm.tsx` — role/location/salary form (waits for tx receipt)
- `app/components/PercentileDisplay.tsx` — bucket visualization (stores all results, Reveal All button)
- `app/app/page.tsx` — main page with hero + how it works + why it matters

## Bugs Fixed (Code Review)
1. getRoleKey used abi.encodePacked — hash collision between concatenated strings. Fixed: abi.encode
2. onSubmitted fired before tx confirmed — PercentileDisplay showed stale data. Fixed: useEffect on txConfirmed
3. PercentileDisplay only showed one bucket at a time — previous results disappeared. Fixed: results stored in Record<number, BucketResult>
4. Polling race condition — switching buckets while polling first one. Fixed: track polling bucket explicitly, cleanup on unmount
5. Dev server hangs with cofhejs WASM — known issue, production build works fine

## Known Issues Still Open
- cofhejs client-side encryption never tested on live CoFHE
- No published gas benchmarks for CoFHE operations
- requestPercentile has no rate limiting (gas-only cost)
- getPercentileResult is public (aggregate data, intentional)
- Deploy script configureRole sends 15 sequential txs (slow, could batch)

## Config
- Deployer wallet: 0x29645627E382a1EEa17593A0cFAeA2867F6C0ceB
- Uses env vars: POLY_PRIVATE_KEY, ARBITRUM_SEPOLIA_RPC
- Hardhat config: contracts/hardhat.config.ts
