# Quintes NFT Smart Contract - Deployment Guide

## Overview

This guide walks you through deploying the QuintesNFT contract using Remix IDE and connecting it to the mint dApp.

---

## Contract Details

| Property | Value |
|----------|-------|
| Name | Quintes |
| Symbol | QUINTES |
| Max Supply | 1,000 |
| Mint Price | 0 ETH (free, gas only) |
| Standard | ERC721A (gas-optimized) |

---

## Step 1: Get the Merkle Root

Before deploying, you need the Merkle root for the GTD allowlist.

### Option A: From the Next.js app (recommended)

```bash
cd quintes-mint
node -e "const {getMerkleRoot} = require('./lib/merkle'); console.log('Merkle Root:', getMerkleRoot())"
```

### Option B: Check browser console
Run the app and add this to any component temporarily:
```typescript
import { getMerkleRoot } from '@/lib/merkle';
console.log('Merkle Root:', getMerkleRoot());
```

**⚠️ SAVE THIS VALUE** - you'll need it after deployment.

---

## Step 2: Deploy Using Remix IDE

### 2.1 Open Remix
Go to [https://remix.ethereum.org](https://remix.ethereum.org)

### 2.2 Create the Contract File
1. In the File Explorer (left panel), click the "+" icon
2. Name it: `QuintesNFT.sol`
3. Copy the ENTIRE contents of `ERC721A.sol` from this repo and paste it

### 2.3 Compile
1. Go to the **Solidity Compiler** tab (left sidebar, icon looks like "S")
2. Set compiler version to: **0.8.17** (or any 0.8.x version)
3. Click **Compile QuintesNFT.sol**
4. Wait for green checkmark ✓

### 2.4 Deploy

1. Go to the **Deploy & Run Transactions** tab (left sidebar, icon looks like Ethereum logo)

2. **Environment**: Select based on network:
   - **Sepolia (testing)**: Choose "Injected Provider - MetaMask"
   - **Mainnet (production)**: Choose "Injected Provider - MetaMask"
   
3. Make sure MetaMask is connected to the correct network

4. **Contract**: Select `QuintesNFT` from the dropdown (NOT ERC721A)

5. Click **Deploy**

6. MetaMask will popup - confirm the transaction

7. Wait for confirmation (may take 15-60 seconds)

8. **COPY THE CONTRACT ADDRESS** from the "Deployed Contracts" section

---

## Step 3: Configure the Contract

After deployment, expand the deployed contract in Remix to access functions.

### 3.1 Set the Merkle Root (REQUIRED)
```
Function: setGtdMerkleRoot
Parameter: 0x... (paste your Merkle root from Step 1)
```
Click "transact" and confirm in MetaMask.

### 3.2 Set Metadata URIs (can do later)
```
Function: setPreRevealMetadataUri
Parameter: ipfs://YOUR_PREREVEAL_CID/prereveal.json

Function: setUriPrefix  
Parameter: ipfs://YOUR_REVEALED_CID/

Function: setUriSuffix
Parameter: .json
```

### 3.3 Enable GTD Phase (when ready to start)
```
Function: setGtdPhaseActive
Parameter: true
```

### 3.4 Enable FCFS Phase (after GTD)
```
Function: setFcfsPhaseActive
Parameter: true
```

---

## Step 4: Connect to the Mint dApp

### 4.1 Update Environment Variables

Edit `quintes-mint/.env.local`:

```env
# For Sepolia testing
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS

# For Mainnet production
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

### 4.2 Restart the Dev Server

```bash
cd quintes-mint
# Stop the current server (Ctrl+C)
npm run dev
```

### 4.3 Test the Connection

1. Open http://localhost:3000
2. Connect a wallet (should match the network you deployed to)
3. Verify the stats bar shows correct supply info
4. If on GTD phase, check eligibility displays correctly

---

## Step 5: Testing Checklist

### On Sepolia Testnet

- [ ] Deploy contract
- [ ] Set Merkle root
- [ ] Enable GTD phase
- [ ] Test minting with whitelisted address
- [ ] Verify "already minted" blocking works
- [ ] Test with non-whitelisted address (should fail)
- [ ] Enable FCFS phase
- [ ] Test FCFS mint with new wallet
- [ ] Verify one-wallet-one-NFT enforcement

### Before Mainnet

- [ ] Final whitelist is in `lib/whitelist.ts`
- [ ] Generate fresh Merkle root
- [ ] Metadata URIs are ready (IPFS)
- [ ] Test full flow on Sepolia
- [ ] Verify ABI matches contract

---

## Contract Functions Reference

### Read Functions (used by dApp)

| Function | Returns | Frontend Hook |
|----------|---------|---------------|
| `totalSupply()` | uint256 | `useMintStatus` |
| `maxSupply()` | uint256 | `useMintStatus` |
| `price()` | uint256 | `useMintStatus` |
| `gtdPhaseActive()` | bool | `useMintStatus` |
| `fcfsPhaseActive()` | bool | `useMintStatus` |
| `paused()` | bool | `useMintStatus` |
| `hasMinted(address)` | bool | `useMintStatus` |

### Write Functions (used by dApp)

| Function | Parameters | Frontend Hook |
|----------|------------|---------------|
| `mintGTD(bytes32[])` | Merkle proof | `useMintGTD` |
| `mintFCFS()` | None (payable) | `useMintFCFS` |

### Owner-Only Functions (use Remix or Etherscan)

| Function | Purpose |
|----------|---------|
| `setGtdMerkleRoot(bytes32)` | Update allowlist |
| `setGtdPhaseActive(bool)` | Start/stop GTD |
| `setFcfsPhaseActive(bool)` | Start/stop FCFS |
| `setPaused(bool)` | Emergency pause |
| `setRevealed(bool)` | Reveal metadata |
| `setUriPrefix(string)` | Set base URI |
| `ownerMint(address, uint256)` | Treasury/team mint |
| `airdropGTD(address[])` | Batch airdrop |
| `withdraw()` | Withdraw ETH |

---

## Troubleshooting

### "Not in GTD allowlist" error
- Verify Merkle root is set correctly on contract
- Check address casing matches (try lowercase)
- Confirm address is in `lib/whitelist.ts`

### Contract not showing in dApp
- Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` is correct
- Verify `NEXT_PUBLIC_CHAIN_ID` matches deployment network
- Restart dev server after changing .env.local

### Transaction fails
- Check you have enough ETH for gas
- Verify you're on the correct network
- Check if contract is paused
- Verify phase is active

---

## Gas Estimates (Mainnet)

| Action | Estimated Gas |
|--------|---------------|
| Deploy contract | ~3,500,000 |
| Set Merkle root | ~50,000 |
| mintGTD | ~80,000 |
| mintFCFS | ~80,000 |
| ownerMint (1) | ~80,000 |
| airdropGTD (10) | ~400,000 |

At 30 gwei gas price:
- Deploy: ~0.1 ETH
- Mint: ~0.002 ETH

---

## Security Checklist

- [ ] Contract owner is a secure wallet (hardware wallet recommended)
- [ ] Merkle root verified before going live
- [ ] Test withdraw function works
- [ ] Consider renouncing ownership after mint completes (optional)
- [ ] Verify on Etherscan after deployment

---

## Verifying on Etherscan

After deployment, verify your contract for transparency:

1. Go to Etherscan (mainnet) or Sepolia Etherscan
2. Find your contract address
3. Go to "Contract" tab → "Verify and Publish"
4. Compiler: 0.8.17 (match Remix)
5. Optimization: Enabled, 200 runs
6. Paste the full source code
7. Submit

This allows users to read the contract code directly on Etherscan.

---

## Quick Reference

```
Sepolia Faucets:
- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia

Etherscan:
- Mainnet: https://etherscan.io
- Sepolia: https://sepolia.etherscan.io

Remix IDE: https://remix.ethereum.org
```
