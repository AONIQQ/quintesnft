# Foundry Testing Plan for QuintesNFT
## 100% Confidence Before Public Mint

> **Goal**: Use Foundry to test the entire contract with absolute confidence that nothing will break during the public mint.

---

## 📋 Overview

This document outlines the complete testing strategy using **Foundry** (code-focused, CLI-based testing) vs Remix (UI-based manual testing).

### Why Foundry?
- ✅ **Automated unit tests** that run in seconds
- ✅ **Fuzzing** to catch edge cases you didn't think of
- ✅ **Invariant testing** to prove safety properties always hold
- ✅ **Integrated with your repo** - version controllable, CI-ready
- ✅ **Fast iteration** - test locally without deploying to testnet every time
- ✅ **Gas reporting** - see exactly how much each function costs

### What We'll Test
1. **Supply safety** - never exceed maxSupply
2. **Per-wallet limit** - one wallet = one NFT across all phases
3. **Merkle allowlist** - GTD phase works correctly
4. **Phase gating** - GTD and FCFS phases respect active flags
5. **Airdrop logic** - respects hasMinted, works with GTD tracking
6. **Owner functions** - ownerMint bypasses hasMinted for treasury
7. **Metadata** - reveal/prereveal logic works
8. **Pricing** - msg.value enforcement (currently free, but test for future)
9. **Access control** - only owner can call admin functions
10. **Withdraw** - funds go to owner correctly

---

## 🔧 Part 1: Setup Foundry

### Step 1.1: Install Foundry
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Update Foundry
foundryup

# Verify installation
forge --version
anvil --version
cast --version
```

### Step 1.2: Initialize Foundry in Your Project
```bash
# Navigate to your project root
cd /Users/andrew/Desktop/quintes-mint

# Create a contracts directory for Foundry
mkdir -p contracts

# Initialize Foundry
cd contracts
forge init --no-commit .

# This creates:
# contracts/
#   src/           <- Your contract goes here
#   test/          <- Test files go here
#   lib/           <- Dependencies (like forge-std)
#   foundry.toml   <- Configuration
```

### Step 1.3: Configure Foundry
Edit `contracts/foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
test = "test"
script = "script"

# Compiler settings to match your contract
solc_version = "0.8.17"
optimizer = true
optimizer_runs = 200
via_ir = false

# Gas reporting
gas_reports = ["QuintesNFT"]

# Test verbosity
verbosity = 2
```

### Step 1.4: Copy Contract to Foundry
```bash
# From /Users/andrew/Desktop/quintes-mint/contracts (Foundry root)
mkdir -p src
cp ../QuintesNFT.sol src/QuintesNFT.sol

# Compile to verify it works
forge build
```

**Notes**
- `QuintesNFT.sol` already bundles ERC721A, OperatorFilterer, and the project contract; keep the filename aligned with the contract name.
- You can split it into multiple files later if desired, but start with the full contract copied into `src/QuintesNFT.sol`.
- **Expected output**: `Compiler run successful!`

---

## 🧪 Part 2: Test Categories & Strategy

### Category 1: Supply Safety Tests
**Critical**: Ensure we can NEVER mint past maxSupply

Tests to write:
- ✅ `testCannotExceedMaxSupplyOwnerMint`
- ✅ `testCannotExceedMaxSupplyGtdMint`
- ✅ `testCannotExceedMaxSupplyFcfsMint`
- ✅ `testCannotExceedMaxSupplyAirdrop`
- ✅ `testCannotExceedMaxSupplyCombinedPhases`
- ✅ `testMaxSupplyCannotGoBelowMinted`

### Category 2: Per-Wallet Limit Tests
**Critical**: One wallet = one NFT across entire drop

Tests to write:
- ✅ `testGtdMintSetsHasMinted`
- ✅ `testGtdMintCannotMintTwice`
- ✅ `testFcfsMintCannotMintTwice`
- ✅ `testGtdMinterCannotMintFcfs`
- ✅ `testFcfsMinterCannotMintGtd`
- ✅ `testAirdropRecipientCannotMintGtd`
- ✅ `testAirdropRecipientCannotMintFcfs`
- ✅ `testAirdropCannotTargetSameWalletTwice`
- ✅ `testOwnerMintDoesNotSetHasMinted` ⚠️ **Important for treasury**

### Category 3: Merkle Allowlist Tests
**Critical**: Only allowlisted wallets can mint during GTD, and proofs must match the frontend hashing scheme (`keccak256(abi.encodePacked(address))`, sorted pairs just like `merkletreejs` defaults).

Implementation note:
- Generate a tiny Merkle tree in a helper (Solidity or Foundry script) or pre-compute it with the same Node script the frontend uses, then hardcode root + proof into tests. The goal is to ensure “frontend-generated proofs pass on-chain” parity.

Tests to write:
- ✅ `testGtdMintValidProofSucceeds`
- ✅ `testGtdMintInvalidProofReverts`
- ✅ `testGtdMintWrongAddressReverts`
- ✅ `testGtdMintEmptyProofReverts`

### Category 4: Phase Gating Tests
**Critical**: Phases respect active flags and paused state

Tests to write:
- ✅ `testGtdMintRequiresGtdPhaseActive`
- ✅ `testFcfsMintRequiresFcfsPhaseActive`
- ✅ `testGtdMintRevertsWhenPaused`
- ✅ `testFcfsMintRevertsWhenPaused`
- ✅ `testBothPhasesCanBeActiveSimultaneously` (edge case)

### Category 5: Airdrop Logic Tests
**Critical**: Airdrop respects one-per-wallet limit and updates tracking

Tests to write:
- ✅ `testAirdropSetsGtdMintedAndHasMinted`
- ✅ `testAirdropMultipleRecipients`
- ✅ `testAirdropRevertsIfRecipientAlreadyMinted`
- ✅ `testAirdropRevertsOnEmptyArray`

### Category 6: Metadata Tests
**Important**: Reveal logic works correctly

Tests to write:
- ✅ `testTokenUriBeforeRevealReturnsPreRevealUri`
- ✅ `testTokenUriAfterRevealReturnsCorrectUri`
- ✅ `testTokenUriNonexistentTokenReverts`

### Category 7: Pricing Tests
**Important**: msg.value enforcement (currently free, test for future)

Tests to write:
- ✅ `testGtdMintRequiresExactPrice`
- ✅ `testFcfsMintRequiresExactPrice`
- ✅ `testGtdMintRevertsOnInsufficientPayment`
- ✅ `testGtdMintRevertsOnExcessPayment`

### Category 8: Access Control Tests
**Important**: Only owner can call admin functions

Tests to write:
- ✅ `testOnlyOwnerCanSetGtdMerkleRoot`
- ✅ `testOnlyOwnerCanSetPaused`
- ✅ `testOnlyOwnerCanSetRevealed`
- ✅ `testOnlyOwnerCanSetMetadataUris`
- ✅ `testOnlyOwnerCanSetMaxSupply`
- ✅ `testOnlyOwnerCanSetPrice`
- ✅ `testOnlyOwnerCanSetGtdPhaseActive`
- ✅ `testOnlyOwnerCanSetFcfsPhaseActive`
- ✅ `testOnlyOwnerCanOwnerMint`
- ✅ `testOnlyOwnerCanAirdrop`
- ✅ `testOnlyOwnerCanWithdraw`

### Category 9: Withdraw Tests
**Important**: Funds go to owner correctly

Tests to write:
- ✅ `testWithdrawSendsFullBalanceToOwner`
- ✅ `testWithdrawOnlyOwner`
- ✅ `testWithdrawEmptyBalance`

### Category 10: Fuzzing Tests
**Advanced**: Let Foundry try random inputs to find bugs

Tests to write:
- ✅ `testFuzz_PerWalletLimit_RandomUser`
- ✅ `testFuzz_SupplyNeverExceeds_RandomMints`
- ✅ `testFuzz_InvalidProof_AlwaysReverts`

### Category 11: Invariant Tests
**Advanced**: Properties that must ALWAYS hold

Invariants to test:
- ✅ `invariant_totalSupply_NeverExceedsMaxSupply`
- ✅ `invariant_hasMinted_ImpliesBalanceGreaterThanZero`
- ✅ `invariant_contractBalance_MatchesSumOfPayments`

---

## 📝 Part 3: Test File Structure

We'll create these test files:

```
contracts/test/
├── QuintesNFT.t.sol              # Main test suite (setup + basic tests)
├── QuintesNFT.Supply.t.sol       # Supply safety tests
├── QuintesNFT.PerWallet.t.sol    # Per-wallet limit tests
├── QuintesNFT.Merkle.t.sol       # Merkle allowlist tests
├── QuintesNFT.Phases.t.sol       # Phase gating tests
├── QuintesNFT.Airdrop.t.sol      # Airdrop tests
├── QuintesNFT.Metadata.t.sol     # Metadata/reveal tests
├── QuintesNFT.Access.t.sol       # Access control tests
├── QuintesNFT.Fuzz.t.sol         # Fuzzing tests
└── QuintesNFT.Invariants.t.sol   # Invariant tests
```

---

## 🚀 Part 4: Execution Workflow

### Phase 1: Write Core Tests (Start Here)
1. Set up base test contract with Merkle tree helper
2. Write supply safety tests
3. Write per-wallet limit tests
4. Write Merkle allowlist tests
5. Run tests: `forge test -vv`

### Phase 2: Expand Coverage
6. Write phase gating tests
7. Write airdrop tests
8. Write metadata tests
9. Write access control tests
10. Run tests: `forge test -vv`

### Phase 3: Advanced Testing
11. Write fuzzing tests
12. Write invariant tests
13. Run gas report: `forge test --gas-report`
14. Run coverage: `forge coverage`

### Phase 4: Local End-to-End Testing
15. Start local Anvil chain: `anvil`
16. Deploy contract to Anvil: `forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast`
17. Point frontend to Anvil (chain ID 31337)
18. Test frontend + contract integration locally

### Phase 5: Testnet Deployment (Sepolia)
19. Get Sepolia ETH from faucet
20. Deploy to Sepolia: `forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify`
21. Update frontend `.env.local` with Sepolia contract address
22. Test with multiple real wallets on Sepolia

### Phase 6: Pre-Mainnet Checklist
23. ✅ All Foundry tests passing
24. ✅ Gas costs reviewed and acceptable
25. ✅ Coverage > 95%
26. ✅ Local Anvil testing successful
27. ✅ Sepolia testnet testing successful
28. ✅ Frontend integration tested on testnet
29. ✅ Merkle tree generation verified with real whitelist
30. ✅ Admin functions tested (pause, reveal, phase toggles)
31. ✅ Withdraw function tested
32. ✅ Contract verified on Etherscan (testnet)

---

## 🎯 Next Steps

1. **Install Foundry** (Part 1, Steps 1.1-1.4)
2. **Create base test file** with Merkle helper
3. **Start writing tests** (Category 1: Supply Safety)
4. **Iterate and expand** until all categories are covered
5. **Run local Anvil testing**
6. **Deploy to Sepolia and test**
7. **Deploy to mainnet with confidence** 🚀

---

## ✅ Latest Test Execution (Dec 5, 2025)

### Scope
- Location: `contracts/` Foundry workspace
- Contract under test: `src/QuintesNFT.sol`
- Tests: `test/QuintesNFT.t.sol` (unit + integration), `test/QuintesNFT.Invariants.t.sol` (invariants), plus default Counter sample

### Commands Run
- `forge build`
- `forge test`

### Results
- `forge build`: clean (no warnings)
- `forge test`: **39 tests passed, 0 failed, 0 skipped**
  - 34 unit/integration tests covering supply caps, per-wallet limit across GTD/FCFS/airdrop/ownerMint, Merkle allowlist parity (keccak256(abi.encodePacked(addr))), phase gating, pause, pricing, access control, metadata/reveal URIs, maxSupply constraints, happy-path lifecycle, withdraw.
  - 3 invariants (StdInvariant): `totalSupply() <= maxSupply`, `hasMinted -> balance > 0` (for exercised actors), contract balance non-negative across randomized GTD/FCFS/airdrop/ownerMint calls.

### Key Artifacts
- `contracts/test/QuintesNFT.t.sol`
- `contracts/test/QuintesNFT.Invariants.t.sol`

### Notes
- Operator filter + ERC721A vendor code kept intact; lint cleaned with helper wrappers to avoid behavioral changes.

---

## 📚 Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Foundry GitHub](https://github.com/foundry-rs/foundry)
- [Testing Guide](https://book.getfoundry.sh/forge/tests)
- [Fuzzing Guide](https://book.getfoundry.sh/forge/fuzz-testing)
- [Invariant Testing](https://book.getfoundry.sh/forge/invariant-testing)

---

**Ready to begin testing? Let's start with Part 1: Setup Foundry!**
