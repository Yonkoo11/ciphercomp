# Vibecoder Mode - Paste this into any project's CLAUDE.md

## Communication Rules
- Never say: branch, commit, merge, PR, push, pull, HEAD, diff, npm, deploy, lint, daemon, env var
- Instead say: version, save point, combine changes, publish, update, latest, changes, install, check code
- Never show raw terminal output. Summarize in one sentence.
- Never show error messages directly. Say what happened and what you're doing to fix it.
- When done, describe what changed by what the user would SEE in the app, not what files changed.

## Behavior Rules
- Auto-save after every completed task (git add specific files + commit). Never ask "should I commit?"
- If you need to create a version, just do it silently.
- If tests fail, fix them without explaining test frameworks.
- After each task: update ai/progress.md with a "What Changed (Plain English)" section.
- Keep all explanations to 1-3 sentences. If the user wants more detail, they'll ask.

---

# CipherComp

Encrypted salary benchmarking using FHE on Fhenix. Nobody sees individual salaries -- not the protocol, not other users, not even the server. Only aggregate percentiles are revealed.

## Buildathon
- Private By Design dApp Buildathon (Fhenix)
- 5 waves: March 20 - June 5, 2026
- 50,000 USDC grant pool
- Judging: Privacy Architecture, Innovation & Originality, UX, Technical Execution, Market Potential

## Phase 1 Gate (MUST PASS BEFORE ANY OTHER WORK)
- Core Action: User selects role + location, submits encrypted salary, gets back percentile
- Success Test: 5 encrypted submissions → percentile query returns correct cumulative count
- Min Tech: SalaryBenchmark.sol + cofhejs frontend + Arb Sepolia
- NOT Phase 1: BLS data pipeline, multi-role dashboard, employer portal, compliance, design

## Stack
- Contracts: Hardhat + cofhe-hardhat-plugin 0.3.1, Solidity 0.8.25
- Frontend: Next.js 14 + wagmi v2 + cofhejs 0.3.1
- Chain: Arbitrum Sepolia (421614)
- PINNED: hardhat 2.22.19, ethers 6.13.5 (newer breaks FHE mocks)

## Commands
```bash
cd contracts && pnpm test        # Run tests with FHE mocks
cd contracts && pnpm compile     # Compile Solidity
cd contracts && pnpm deploy:arb  # Deploy to Arb Sepolia
```

## FHE Patterns (from MEV Shield, verified working)
- `FHE.asEuint64(val)` — create encrypted value
- `FHE.gte(a, b)` — encrypted comparison
- `FHE.select(cond, trueVal, falseVal)` — branchless conditional
- `FHE.add(a, b)` — encrypted addition
- `FHE.allowThis(val)` — persist ciphertext access
- `FHE.decrypt(val)` — initiate async decryption (void)
- `FHE.getDecryptResultSafe(val)` — poll for result (returns value, bool)

## Architecture
Cumulative distribution: bucketCounts[i] = count of salaries >= boundary[i]
- 8 buckets per role/location, boundaries from BLS data
- Submit: 24 FHE ops (8 × gte + select + add)
- Query: 1 decrypt + public division for percentile
- Sybil: one submission per wallet per role/location
- Privacy: min 5 submissions before queries allowed
