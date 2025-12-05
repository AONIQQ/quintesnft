# QuintesNFT Testing & Verification Report

## Summary
- Contract: `0xeEf9C72C728Ddc83cb5856eaa1d36C09c1E43186` (Sepolia)
- Chain: Sepolia `11155111`, RPC `https://sepolia.infura.io/v3/c3286b0a09eb4072b627c68e781c653b`
- State at finish: paused = false, price = 0, FCFS active, GTD inactive
- Frontend env (Sepolia):
  - `NEXT_PUBLIC_CONTRACT_ADDRESS=0xeEf9C72C728Ddc83cb5856eaa1d36C09c1E43186`
  - `NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/c3286b0a09eb4072b627c68e781c653b`
  - `NEXT_PUBLIC_CHAIN_ID=11155111`
- Detailed automated test plan: see `FOUNDRY_TESTING_PLAN.md` for the full checklist and test matrix.

## Automated Testing (Foundry)
- Location: `contracts/`
- Commands: `forge build`, `forge test`
- Scope: 34 unit/integration tests + 3 invariants
  - Supply caps, per-wallet limit across GTD/FCFS/airdrop/ownerMint, Merkle allowlist parity, phase gating, pause, pricing, access control, metadata/reveal, withdraw, happy-path lifecycle.
  - Invariants: `totalSupply <= maxSupply`; `hasMinted -> balance > 0`; contract balance non-negative.
- Result: All tests passing.

## Manual Tests (Sepolia)
- GTD allowlist (two addresses):
  - `0x2ff6dab293516321a288aae645bf721a87490a13`
  - `0x3a31535ec30ea4ed48d3a78c54854e59dc076b6e`
  - Merkle root set: `0xac0a271ca2ee02889d29f279721310d315e2725f29878c01be242f8bc91928f8`
  - Proofs:
    - For `0x2ff6…0a13`: `["0xcc26e3ac4161c6755b2abfab9bbb9726537c3566e64833aaa479be539577b6c8"]`
    - For `0x3a31…b6e`: `["0x9f00b73d7394fb6b56a4f815cd605ce81290d08f27a2e5426975973146930e8b"]`
- GTD phase testing:
  - Non-allowlisted wallet: correctly blocked with “Not on GTD list”.
  - Allowlisted wallet minted successfully (price 0).
- FCFS phase testing:
  - Switched to FCFS (GTD off). Wallet that already minted saw “You have already minted!” and could not mint again (1/wallet enforced).
  - Non-allowlisted wallet minted successfully during FCFS.
  - Supply reflected mint (e.g., Minted 1, Remaining 999).
- Sample mint tx (Sepolia): `https://sepolia.etherscan.io/tx/0xf1a3ff5e80ce21c40eab0ee76681cb2ffd6450dc0abd6765032f96732cdf6dd2`

## Frontend Behavior
- `TxStatus` success banner now links to Etherscan based on `NEXT_PUBLIC_CHAIN_ID`.
- Proofs are fetched via `/api/proof`, which builds the Merkle tree from `lib/whitelist.ts` (now only the two test addresses above).

## Etherscan Verification (Sepolia)
- Address: `0xeEf9C72C728Ddc83cb5856eaa1d36C09c1E43186`
- Compiler Type: Solidity (Single file)
- Compiler Version: `v0.8.17` (matching Foundry config)
- License: MIT
- Optimization: Enabled (runs 200) — aligns with `foundry.toml`
- Contract name: `QuintesNFT`
- Status: Verified on Sepolia — https://sepolia.etherscan.io/address/0xeEf9C72C728Ddc83cb5856eaa1d36C09c1E43186#code

## Phase Toggles (for reference)
- Enable GTD: `setGtdPhaseActive(true)`; disable FCFS.
- Enable FCFS: `setFcfsPhaseActive(true)`; disable GTD.
- Pause/unpause: `setPaused(bool)`.

## Notes
- One-NFT-per-wallet holds across GTD, FCFS, and airdrop; ownerMint bypasses the per-wallet flag (intended).
- Operator filter + ERC721A vendor code left intact; lint warnings addressed via helper wrappers without logic changes.

