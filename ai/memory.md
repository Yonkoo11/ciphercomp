# CipherComp - Project Memory

## Hackathon
- **Name:** Private By Design dApp Buildathon
- **Sponsor:** Fhenix (FHE protocol)
- **URL:** https://app.akindo.io/wave-hacks/Nm2qjzEBgCqJD90W
- **Grant Pool:** 50,000 USDC on Arbitrum
- **Wave 2:** Starting April 4, 2026
- **Waves:** 5 total (March 20 - June 5)
- **Judging:** Privacy Architecture, Innovation & Originality, UX, Technical Execution, Market Potential
- **186 Wave 1 submissions** — all apps, zero toolkit/infra projects
- **Top scores:** MedVault 43/50 (clinical trials), BATNA 43/50, SCAN 39/50 (advertising)
- **Pattern:** Non-DeFi FHE apps score Innovation 8-10. DeFi privacy apps score Innovation 4-5.

## Why This Idea
- DOJ withdrew compensation benchmarking safe harbor (Feb 2023)
- Jan 2025 DOJ-FTC Guidelines: sharing comp data through third parties may violate antitrust law
- ~50% of comp professionals already worried about legality
- FHE removes the legal risk: protocol computes percentiles without seeing individual salaries
- $3-5B compensation data market, Pave valued at $1.6B, Glassdoor acquired for $1.2B
- Zama bounty #144 ("Confidential Benchmarking") validates the use case
- Zero FHE salary implementations exist anywhere

## Architecture Decisions
- **Cumulative distribution** (not histogram): bucketCounts[i] = count of salaries >= boundary[i]
- **Why cumulative:** Avoids encrypted array indexing problem. Can compute percentile with 1 decrypt instead of N. Same pattern as MEV Shield's buyVolume accumulation.
- **8 buckets:** Maps to BLS OEWS percentile breakdowns (10th/25th/50th/75th/90th + boundaries)
- **FHE ops:** 24 per submission (8 × gte + select + add), 1 decrypt per query. MEV Shield handled 200+, so this is trivial.
- **Async decrypt:** FHE.decrypt() is void, FHE.getDecryptResultSafe() polls. 2-tx pattern.

## Tech Stack
- Contracts: Hardhat + cofhe-hardhat-plugin 0.3.1, Solidity 0.8.25
- Frontend: Next.js 14 + wagmi v2 + cofhejs 0.3.1 (reused from MEV Shield)
- Chain: Arbitrum Sepolia
- Pinned versions: hardhat 2.22.19, ethers 6.13.5

## SDK Migration Note
Fhenix migrated from cofhejs/cofhe-hardhat-plugin (v0.3.1) to @cofhe/sdk/@cofhe/hardhat-plugin (v0.4.0).
Old packages are frozen. We're using OLD packages because they work (MEV Shield has 13 passing tests).
Migrate to v0.4.0 after hackathon if needed.

## What's Proven
- Contract compiles (Solidity 0.8.25, cofhe-contracts v0.0.13)
- 10 tests passing with FHE mocks (37 seconds)
- Cumulative distribution correctly counts salaries per bucket
- Async decrypt pattern works (time.increase(15) for mock)
- Percentile query returns correct count after MIN_SAMPLE reached

## What's NOT Proven
- cofhejs client-side encryption on live CoFHE (same untested gap as MEV Shield)
- Actual gas costs for 24 FHE ops on Arb Sepolia (no published benchmarks)
- Frontend end-to-end with real wallet
- Whether boundaries mapped from BLS data produce useful percentile ranges

## Competitive Landscape
- Pave ($1.6B): Direct HRIS integration. 8,700 companies. But: antitrust risk from DOJ 2025 guidelines
- Glassdoor ($1.2B acq): Self-reported, documented garbage data quality (±25%)
- Levels.fyi: Verified (offer letters), tech-only
- Mercer/Radford: Enterprise, $2,500-$11,400+ per module
- Zero FHE-based compensation tools exist anywhere

## BLS Data Seed
- BLS OEWS: ~830 occupations, percentile breakdowns, 530 metros
- Free, public domain, downloadable CSV
- Hardcoded top 20 roles × 10 metros for hackathon
- Solves cold start problem
