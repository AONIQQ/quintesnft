# Quintes NFT: Architecture & Technical Specification

## 1. Project Overview

Quintes is launching a 1,000-supply ERC-721 collection on Ethereum, with a simple but strict rule:

Every wallet can receive at most one Quintes NFT (counting both GTD and FCFS mints, and any user airdrops).

Total supply is fixed at 1,000 NFTs.

Mint price is free (0 ETH), users only pay gas.

The mint runs in two phases against a single shared pool of 1,000 NFTs:

* GTD (Guaranteed) Phase – allowlisted wallets (company reserve, collabs, ambassadors, etc.).
* FCFS (First-Come, First-Served) Phase – open to the public for all remaining supply.

All NFTs share a single artwork style (one image), with standard metadata hosted off-chain (IPFS). The contract exposes a standard `baseURI` and an optional pre-reveal URI, so Quintes can keep art hidden until reveal if needed.

This document defines the architecture, contracts, rebasing logic (how the shared pool is consumed across phases), data flows, and final confirmation for Milestone 1.

---

## 2. Key Requirements

### 2.1 Supply & Allocation

* Total supply: 1,000
* Price: 0 ETH (free mint)
* Chain: Ethereum (L1, or EVM-compatible network if desired later)

High-level allocation targets (enforced operationally, not by the contract):

* Company reserve: 250 (minted directly to company/treasury wallet(s))
* Community collabs (GTD): 500
* Ambassadors: 50
* FCFS / Public: 200

All of the above draw from the same 1,000-token pool.

The contract itself enforces:

* Hard cap of 1,000 total minted tokens.
* Per-wallet limit: 1 NFT per address (for public/allowlist participants).

The exact breakdown between “reserve”, “collab”, “ambassador”, and “FCFS” is enforced operationally via which wallets the owner mints to and who receives GTD allowlist slots.

### 2.2 Mint Phases

GTD phase:

* Allowlisted wallets only (Merkle tree).
* Each allowlisted wallet can claim 1 NFT max.

FCFS phase:

* Open to any wallet.
* Each wallet can claim 1 NFT max, and cannot mint again if they already got one in GTD or via GTD airdrop.
* Same pool: unclaimed GTD supply automatically becomes available in FCFS.

### 2.3 Per-Wallet Limit

One wallet can receive at most one user-facing NFT via:

* GTD mint, or
* FCFS mint, or
* GTD airdrop (owner pushing a token into that wallet).

Internal company wallets (treasury, market-making wallets, etc.) can hold more than one NFT by using owner-only mint functions that bypass the user limit.

---

## 3. System Architecture

### 3.1 High-Level Components

On-chain:

* QuintesNFT (ERC721A + Ownable + OperatorFilterer), deployed on Ethereum.

Off-chain / infrastructure:

* Mint website (Next.js, hosted on Vercel):

  * Connects to user wallets (MetaMask, WalletConnect, etc.).
  * Calls contract mint functions (`mintGTD`, `mintFCFS`).
* Backend / scripts:

  * Build GTD allowlist and generate Merkle tree.
  * Push Merkle root to the contract (`setGtdMerkleRoot`).
  * Trigger phase toggles (`setGtdPhaseActive`, `setFcfsPhaseActive`).
  * Run admin mints: `ownerMint` (company reserve) and `airdropGTD` (guaranteed airdrops).
* IPFS / storage:

  * Host pre-reveal JSON metadata.
  * Host final base URI and metadata files.

### 3.2 Architecture Diagram

View the system architecture diagram here:
[Quintes Architecture Diagram](https://github.com/AONIQQ/quintes/blob/main/architecturediagram.md)

The diagram shows the four-layer structure (Contract, Admin/Backend, Frontend, Storage/Metadata) and data flows between them.

### 3.3 Layer Breakdown

Layer 1 – Contract:

* QuintesNFT on Ethereum.

Layer 2 – Admin/Backend:

* Scripts or a small admin panel controlled by Quintes.

Tasks:

* Generate Merkle tree from CSV of allowlisted addresses.
* Call `setGtdMerkleRoot`.
* Call `setGtdPhaseActive` / `setFcfsPhaseActive`.
* Call `ownerMint` for company reserve.
* Call `airdropGTD` for collabs/ambassadors.

Layer 3 – Frontend:

* Public mint page following Quintes branding
  (Figma: [https://www.figma.com/design/MIIZQzF2jjhFTHZlM5ncny/Quintes-%7C-Visual-Structure?node-id=1-177&p=f](https://www.figma.com/design/MIIZQzF2jjhFTHZlM5ncny/Quintes-%7C-Visual-Structure?node-id=1-177&p=f))
  for GTD and FCFS:

  * Shows phase status and remaining supply.
  * Connects wallet and calls mints.
  * Handles Merkle proof generation on the client or fetches proof from backend.

Layer 4 – Storage / Metadata:

* IPFS base URI for revealed metadata.
* Single pre-reveal URI (placeholder JSON) until revealed.

Data flows between layers are described in section 6.

---

## 4. Contract Definitions

### 4.1 Standards and Inheritance

The main contract is `QuintesNFT`.

Inherits:

* `ERC721A` (gas-efficient ERC-721 implementation).
* `Ownable` (single owner for admin controls).
* `DefaultOperatorFilterer` (for marketplace operator filtering such as OpenSea’s default registry).

### 4.2 Core State

Key state variables:

Metadata:

* `string uriPrefix` – base URI (for example `ipfs://.../`).
* `string uriSuffix` – typically `.json`.
* `string preRevealMetadataUri` – single URI for pre-reveal placeholder.
* `bool revealed` – toggles between pre-reveal and final URIs.

Supply and pricing:

* `uint256 maxSupply = 1000` – hard cap.
* `uint256 price = 0` – free mint by default (can be updated if needed).

Phases:

* `bytes32 gtdMerkleRoot` – Merkle root for GTD allowlist.
* `bool paused` – global switch to pause mints.
* `bool gtdPhaseActive` – gate for GTD phase.
* `bool fcfsPhaseActive` – gate for FCFS phase.

Per-wallet limit:

* `mapping(address => bool) hasMinted` – global flag for “this address already got its NFT”.

Optionally, auxiliary mappings:

* `mapping(address => bool) gtdMinted`.
* `mapping(address => bool) fcfsMinted`.

These are mainly for analytics/debugging; the actual limit is enforced by `hasMinted`.

### 4.3 Public Mint Functions

GTD mint – `mintGTD(bytes32[] calldata merkleProof)`

Conditions:

* Contract not paused.
* `gtdPhaseActive == true`.
* `totalMinted + 1 <= maxSupply`.
* `hasMinted[msg.sender] == false`.
* `msg.value == price`.
* Merkle proof validates `msg.sender` against `gtdMerkleRoot`.

Effects:

* `hasMinted[msg.sender] = true`.
* `gtdMinted[msg.sender] = true` (for tracking).
* `_safeMint(msg.sender, 1)`.

FCFS mint – `mintFCFS()`

Conditions:

* Contract not paused.
* `fcfsPhaseActive == true`.
* `totalMinted + 1 <= maxSupply`.
* `hasMinted[msg.sender] == false`.
* `msg.value == price`.

Effects:

* `hasMinted[msg.sender] = true`.
* `fcfsMinted[msg.sender] = true` (for tracking).
* `_safeMint(msg.sender, 1)`.

This structure enforces “one wallet, one NFT” across both phases.

### 4.4 Owner / Backend Mint Functions

Company reserve mint – `ownerMint(address to, uint256 quantity)`:

* Only callable by owner.
* Uses ERC721A batch minting to send multiple tokens in a single transaction.
* Respects `maxSupply`.
* Does not mark `hasMinted[to]` (so company internal wallets can hold more than one NFT if needed).

GTD airdrop – `airdropGTD(address[] calldata recipients)`:

* Only owner.
* Mints 1 NFT per recipient in a loop.

Conditions for each recipient:

* `hasMinted[recipient] == false`.
* `totalMinted + count <= maxSupply`.

Effects:

* `hasMinted[recipient] = true`.
* `gtdMinted[recipient] = true`.
* `_safeMint(recipient, 1)`.

This matches the GTD model: collabs/ambassadors can be fully satisfied via airdrop, and those wallets are then blocked from additional user mints.

### 4.5 Admin Controls

* `setGtdMerkleRoot(bytes32 root)` – set allowlist Merkle root.
* `setUriPrefix(string memory uriPrefix)` – set base URI.
* `setUriSuffix(string memory uriSuffix)` – set suffix (`.json`).
* `setPreRevealMetadataUri(string memory uri)` – set pre-reveal URI.
* `setRevealed(bool state)` – flip from pre-reveal to reveal.
* `setPaused(bool state)` – pause/unpause mint functions.
* `setPrice(uint256 newPrice)` – adjust mint price if ever needed.
* `setMaxSupply(uint256 newSupply)` – only allows increasing or setting equal to current minted; cannot cut below minted.
* `setGtdPhaseActive(bool state)` – open/close GTD phase.
* `setFcfsPhaseActive(bool state)` – open/close FCFS phase.
* `withdraw()` – transfer contract ETH balance to owner.

All admin functions are gated by `onlyOwner`.

### 4.6 View Functions

* `walletOfOwner(address owner)` – returns all token IDs owned by an address.
* `tokenURI(uint256 tokenId)`:

  * If `!revealed`, return `preRevealMetadataUri`.
  * If `revealed`, return `string(abi.encodePacked(uriPrefix, tokenId.toString(), uriSuffix))`.
* `totalSupply()` – inherited from ERC721A; total minted minus burned.

---

## 5. Rebasing Logic

### 5.1 What “Rebasing” Means Here

* A single shared supply pool (1,000 total NFTs).
* Dynamic allocation of unclaimed GTD tokens into the FCFS phase.
* Global per-wallet limit applied across all mint paths.

The “rebase” is effectively:

* GTD supply and FCFS supply share one pool.
* Any GTD allocation that is not claimed by the time Quintes moves to FCFS is simply part of the remaining supply.

### 5.2 Shared Pool Logic

There is no separate “GTD pool” and “FCFS pool” on-chain. Instead, everything checks against the same `maxSupply` and `totalSupply()`:

* GTD mint and airdrops call `_safeMint` as long as `totalMinted + quantity <= maxSupply`.
* FCFS mint uses the same condition.

When GTD ends, whatever number of tokens has not been minted yet is automatically what is available during FCFS.

This keeps the contract simple and reliable:

* No manual rebalancing or recalculation needed.
* No special state flips for moving “unclaimed GTD tokens” into a new pool; they were always just part of the unminted supply.

### 5.3 Per-Wallet Rebase

The other “rebase” angle is the per-wallet limit:

* `hasMinted[address]` is set:

  * When they mint during GTD.
  * When they mint during FCFS.
  * When they receive a GTD airdrop.

Both mint functions check `hasMinted[msg.sender] == false` before allowing a user to mint.

This ensures a wallet cannot:

* Mint GTD and then also mint FCFS, or
* Mint FCFS and then also be included in GTD, or
* Mint GTD and later receive a second token via GTD airdrop.

Company wallets that need more than one token use `ownerMint`, which is explicitly allowed to bypass `hasMinted`.

### 5.4 Future Extension for Milestone 4

Milestone 4 (Full NFT Logic + Airdrop/Redeploy Mechanism) will build on this foundation. The current design is intentionally:

* Simple and deterministic – no complex migration logic is baked into the first contract.
* Amenable to a snapshot-based airdrop – the team can snapshot holders and mint new NFTs in a new contract later.

The rebasing logic described here is sufficient for Milestone 2’s scope and does not constrain a future redeploy/airdrop pattern.

---

## 6. Data Flow Diagrams (Textual)

### 6.1 GTD Allowlist Setup

* Quintes compiles GTD wallets into a CSV (company reserve addresses, collabs, ambassadors, etc.).
* Backend script:

  * Normalizes addresses.
  * Creates Merkle tree: each leaf is `keccak256(abi.encodePacked(address))`.
  * Computes `gtdMerkleRoot`.
* Owner calls `setGtdMerkleRoot(gtdMerkleRoot)` on `QuintesNFT`.
* Owner calls `setGtdPhaseActive(true)` when ready to begin GTD.
* Mint site pulls:

  * Phase status.
  * Remaining supply (optional).
* Mint site displays GTD UI.

### 6.2 GTD User Mint Flow

* User connects wallet on the mint site.
* Frontend obtains Merkle proof:

  * Either computed client-side from a public JSON Merkle tree, or
  * Fetched from a backend endpoint that returns the proof for that wallet if allowlisted.
* User clicks “Mint GTD”.
* Frontend calls `mintGTD(proof)` from the user’s wallet.
* Contract checks:

  * Not paused.
  * GTD phase is active.
  * `totalSupply + 1 <= maxSupply`.
  * `hasMinted[user] == false`.
  * `MerkleProof.verify` passes.
* On success:

  * `hasMinted[user] = true`.
  * `gtdMinted[user] = true`.
  * `_safeMint(user, 1)`.

### 6.3 GTD Airdrop Flow (Backend)

* Quintes prepares list of addresses to receive guaranteed NFTs without manual minting.
* Owner calls `airdropGTD(recipients)` from an admin wallet.
* For each address:

  * Contract checks `hasMinted[addr] == false`.
  * Sets `hasMinted[addr] = true` and `gtdMinted[addr] = true`.
  * Calls `_safeMint(addr, 1)`.
* Gas cost scales linearly with number of recipients; ERC721A keeps it efficient.

### 6.4 Company Reserve Mint Flow

* Quintes decides which internal wallet(s) should hold the company reserve.
* Owner calls `ownerMint(treasuryWallet, 250)` (or in batches).
* Contract checks:

  * `totalSupply + 250 <= maxSupply`.
* On success:

  * Mints 250 tokens to `treasuryWallet`.
  * `hasMinted[treasuryWallet]` is left untouched (so treasury can hold many).

### 6.5 Phase Switch: GTD → FCFS

When GTD is complete (or the GTD window closes), owner:

* Calls `setGtdPhaseActive(false)`.
* Calls `setFcfsPhaseActive(true)`.

At this point:

* `totalSupply()` reports how many tokens are already minted.
* `maxSupply - totalSupply()` is remaining supply for FCFS.

No rebalancing is required; any unminted GTD allocation is simply part of the remaining pool for FCFS.

### 6.6 FCFS Mint Flow

* User connects wallet on mint site.
* Frontend checks phase status and shows FCFS UI.
* User clicks “Mint”.
* Frontend calls `mintFCFS()` from user’s wallet.
* Contract checks:

  * Not paused.
  * FCFS phase is active.
  * `totalSupply + 1 <= maxSupply`.
  * `hasMinted[user] == false`.
  * `msg.value == price`.
* On success:

  * `hasMinted[user] = true`.
  * `fcfsMinted[user] = true`.
  * `_safeMint(user, 1)`.

### 6.7 Reveal Flow

* Quintes uploads final metadata files to IPFS.
* Owner calls:

  * `setUriPrefix("ipfs://.../")`.
  * `setUriSuffix(".json")`.
* When ready to reveal:

  * `setRevealed(true)`.

After this:

* `tokenURI(tokenId)` serves `baseURI + tokenId + suffix`.

---

## 7. Final Confirmation and Assumptions

### 7.1 What This Design Guarantees

* Fixed 1,000 max supply, enforced on-chain.
* One wallet equals one NFT for all user-facing mints and airdrops:

  * No double-minting across GTD and FCFS.
  * No user receives more than one via GTD airdrop plus mint combo.
* Single shared pool:

  * GTD and FCFS draw from the same supply.
  * Unused GTD capacity automatically flows into FCFS.
* Simple, auditable contract:

  * Clear per-phase gating.
  * Clear `hasMinted` logic.
  * Minimal external dependencies (OpenZeppelin and OperatorFilterer).
* Gas-efficient operations:

  * ERC721A for batch mints and airdrops.
  * Multi-mint owner functions for company reserve.




### 7.2 Rebasing Roadmap And Marketing Alignment

The current QuintesNFT contract is intentionally simple, but it is designed to plug cleanly into the “rebasing NFT” strategy described in the Quintes marketing plan.

In this context, “rebasing” means:

* NFTs are issued now as long-term identity keys.
* Future contracts and airdrops can target these original holders.
* Narrative or utility “upgrades” can be delivered over time (new NFTs, new traits, protocol access), while preserving the original collection as the canonical genesis set.

The current design supports that in several ways.

1. Stable, one-per-wallet base layer

* Each user wallet can hold at most one Quintes NFT from the main collection.
* This makes the holder set clean and easy to reason about for:

  * Snapshotting holders for airdrops.
  * Calculating on-chain engagement metrics.
  * Designing fair “rebase” mechanics where every address has a single genesis identity.

2. Snapshot-friendly architecture

At any later point, Quintes can:

* Take a snapshot of `QuintesNFT` holders (either off-chain via an indexer or on-chain via a script).
* Use that snapshot as the basis for:

  * A new “rebased” NFT collection.
  * Evolving/alternate artwork drops.
  * Access passes for the core protocol.
  * Reward distributions tied to engagement, lore contests, or quests.

Because the current contract does not bake in complex rebasing rules, it remains:

* Easy to audit.
* Easy to integrate with external protocols.
* Flexible enough that multiple different “rebase” experiments can be tried later using new contracts and airdrops.

3. Metadata and evolution hooks

Even without a new contract, some rebasing-style mechanics can be simulated via metadata:

* Pre-reveal and base URI controls allow:

  * Staged reveals.
  * Multi-phase art updates (for example, minor visual evolutions or trait tweaks).
* Future extensions (in Milestone 4 or beyond) could introduce:

  * Additional URIs or trait layers that reflect on-chain or off-chain achievements.
  * Separate “evolution” contracts that read QuintesNFT ownership and serve upgraded metadata.

For Milestone 1 and 2, these mechanisms are kept out of the core contract on purpose. The first priority is a clean, predictable mint that:

* Caps supply at 1,000.
* Enforces one genesis NFT per wallet.
* Makes it trivial to snapshot holders and run future rebases, airdrops, or evolutions as separate layers.

This keeps the base contract stable while leaving room to build the full Berachain-style narrative and rebasing meta on top in later stages. 

