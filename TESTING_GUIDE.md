# Quintes NFT Mint - Testing & Integration Guide

## Quick Start

```bash
cd quintes-mint
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 1. Environment Setup

Create a `.env.local` file in the `quintes-mint` directory:

```env
# Chain Configuration
# Use 11155111 for Sepolia testnet, 1 for Ethereum mainnet
NEXT_PUBLIC_CHAIN_ID=11155111

# Your deployed QuintesNFT contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS_HERE

# WalletConnect Project ID (already configured)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=f0e39a65122b99311b30fb9b43f49dc8
```

---

## 2. Merkle Tree Functionality

### How It Works

The whitelist/GTD functionality uses a Merkle tree for gas-efficient proof verification.

**Files involved:**
- `lib/whitelist.ts` - Array of allowlisted wallet addresses
- `lib/merkle.ts` - Merkle tree construction and proof generation
- `app/api/proof/route.ts` - API endpoint that returns proofs for addresses

### Testing the Merkle Tree

#### Option A: Test via API

```bash
# Check if an address is whitelisted (replace with actual address from whitelist.ts)
curl "http://localhost:3000/api/proof?address=0xb5F0eBcE333B6159Cfc09e5FA6898d65962f34AB"
```

**Expected response for whitelisted address:**
```json
{
  "proof": ["0x...", "0x...", "0x..."],
  "eligible": true
}
```

**Expected response for non-whitelisted address:**
```json
{
  "proof": [],
  "eligible": false
}
```

#### Option B: Test in Browser

1. Connect a wallet that IS on the whitelist (see `lib/whitelist.ts`)
2. During GTD phase, you should see "You are GTD-allowlisted"
3. Connect a wallet NOT on the whitelist
4. You should see "Not on GTD list — wait for FCFS phase"

### Adding/Removing Addresses from Whitelist

Edit `lib/whitelist.ts`:

```typescript
export const whitelist = [
  "0xNewAddress1...",
  "0xNewAddress2...",
  // ... add more addresses
];
```

The Merkle tree is automatically reconstructed on server restart.

### Getting the Merkle Root for Contract Deployment

```typescript
import { getMerkleRoot } from './lib/merkle';

console.log('Merkle Root:', getMerkleRoot());
// Use this value when deploying/configuring your contract
```

---

## 3. Smart Contract Integration

### Required Contract Functions

Your QuintesNFT contract must implement these functions (see `lib/abi.ts`):

**Read Functions:**
| Function | Returns | Description |
|----------|---------|-------------|
| `totalSupply()` | uint256 | Current minted count |
| `MAX_SUPPLY()` | uint256 | Maximum supply (1000) |
| `mintPrice()` | uint256 | Price in wei (0 for free) |
| `gtdPhase()` | bool | Is GTD phase active? |
| `fcfsPhase()` | bool | Is FCFS phase active? |
| `paused()` | bool | Is minting paused? |
| `hasMinted(address)` | bool | Has address already minted? |

**Write Functions:**
| Function | Parameters | Description |
|----------|------------|-------------|
| `mintGTD(bytes32[] proof)` | Merkle proof | Mint during GTD phase |
| `mintFCFS()` | None (payable) | Mint during FCFS phase |

### Linking Your Contract

1. Deploy your contract to Sepolia (or target network)
2. Copy the deployed contract address
3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   ```
4. Restart the dev server

### Contract Deployment Checklist

Before deploying:
- [ ] Set the Merkle root from `getMerkleRoot()`
- [ ] Configure MAX_SUPPLY = 1000
- [ ] Set mintPrice = 0 (for free mint)
- [ ] Deploy to Sepolia first for testing

---

## 4. Testing Minting Flow

### Prerequisites
- MetaMask or compatible wallet installed
- Sepolia ETH for gas (get from faucet)
- Contract deployed to Sepolia

### GTD Phase Testing

1. **Enable GTD Phase** on contract (owner function)
2. **Connect wallet** that's on the whitelist
3. App should show "You are GTD-allowlisted"
4. Click "Mint GTD"
5. Confirm transaction in wallet
6. Should show success message with tx hash

### FCFS Phase Testing

1. **Enable FCFS Phase** on contract (owner function)
2. **Connect any wallet** (doesn't need to be whitelisted)
3. App should show "FCFS phase is open to everyone"
4. Click "Mint FCFS"
5. Confirm transaction in wallet
6. Should show success message

### Error States to Test

| Scenario | Expected Behavior |
|----------|------------------|
| Wrong network | Shows "Wrong Network" with switch button |
| Already minted | Shows "You have already minted!" |
| Not whitelisted (GTD) | Shows "Not on GTD list" |
| Minting paused | Button shows "Mint Paused" |
| Supply exhausted | Button disabled |

---

## 5. Network Configuration

### Supported Networks

Currently configured in `lib/wagmi.ts`:
- Ethereum Mainnet (chainId: 1)
- Arbitrum (chainId: 42161)
- Sepolia Testnet (chainId: 11155111)

### Adding a New Network

Edit `lib/wagmi.ts`:

```typescript
import { yourChain } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, arbitrum, sepolia, yourChain],
  transports: {
    // ... add transport for new chain
    [yourChain.id]: http(),
  },
});
```

---

## 6. Common Issues & Solutions

### "Contract read failed"
- Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` is correct
- Verify contract is deployed to the chain specified by `NEXT_PUBLIC_CHAIN_ID`
- Check that contract ABI matches deployed contract

### "User rejected transaction"
- User cancelled in wallet - this is expected behavior

### "Insufficient funds"
- Wallet needs ETH for gas fees
- For Sepolia: use a faucet to get test ETH

### Merkle proof invalid on contract
- Ensure the Merkle root in contract matches `getMerkleRoot()`
- Verify address casing (checksummed vs lowercase)

---

## 7. Production Deployment Checklist

- [ ] Update `NEXT_PUBLIC_CHAIN_ID` to mainnet (1)
- [ ] Deploy contract to mainnet
- [ ] Update `NEXT_PUBLIC_CONTRACT_ADDRESS`
- [ ] Verify whitelist addresses are final
- [ ] Test on mainnet with small amount before announcing
- [ ] Set up proper OpenGraph image (not just SVG)
- [ ] Configure proper domain in metadata

---

## 8. File Structure Reference

```
quintes-mint/
├── app/
│   ├── api/proof/route.ts    # Merkle proof API
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout + metadata
│   └── page.tsx              # Main page
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── mint/
│   │   ├── MintPanel.tsx     # Main minting UI
│   │   ├── MintHero.tsx
│   │   ├── PhaseToggle.tsx
│   │   ├── StatsBar.tsx
│   │   ├── EligibilityCard.tsx
│   │   └── TxStatus.tsx
│   └── sections/
│       ├── AboutSection.tsx
│       └── FAQSection.tsx
├── hooks/
│   ├── useMintStatus.ts      # Contract read hook
│   ├── useMintGTD.ts         # GTD mint hook
│   └── useMintFCFS.ts        # FCFS mint hook
├── lib/
│   ├── abi.ts                # Contract ABI
│   ├── contract.ts           # Contract exports
│   ├── merkle.ts             # Merkle tree utils
│   ├── wagmi.ts              # Web3 config
│   ├── web3-provider.tsx     # Provider wrapper
│   └── whitelist.ts          # Allowlist addresses
└── public/
    └── logo-light.svg        # Quintes logo
```

---

## Need Help?

- Check console for detailed error messages
- Verify all environment variables are set
- Ensure you're on the correct network
- Check contract is not paused
