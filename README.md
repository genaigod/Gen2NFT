# ERC-7007 NFT Contract

## Introduction
This project implements an ERC-7007 standard NFT contract with the following features:

1. **Supports agent-driven mint transactions**
2. **Supports upgradeability**
3. **Based on the Hardhat framework**

---

## **Install Dependencies**

```sh
npm install
```

---

## **Compile the Contract**

```sh
npx hardhat compile
```

---

## **Deploy the Contract**

```sh
npx hardhat deploy-7007 \
  --network baseSepolia \
  --name <name> \
  --symbol <symbol> \
  --owner <owner> \
  --minter <minter> \
  --max-supply <maxSupply> \
  --mint-limit <perWalletMintLimit> \
  --base-url <baseUrl>
```

### **Parameter Explanation**
- `--network baseSepolia`: Specifies the deployment network
- `--name`: NFT contract name
- `--symbol`: NFT token symbol
- `--owner`: Contract owner address
- `--minter`: Designated `Agent` address authorized to mint NFTs
- `--max-supply`: Maximum NFT supply
- `--mint-limit`: Per-wallet mint limit
- `--base-url`: Base URL for NFT metadata

---

## **Test the Contract**

```sh
npx hardhat test
```

---

## **Contract Features**

### **1. Agent-Driven Mint Transactions**
- Only the `minter` role can call the `mint` function
- Each address can mint up to `perWalletMintLimit` NFTs

### **2. Supports Upgradeability**
- The contract uses OpenZeppelin's `TransparentUpgradeableProxy` for upgrade management
- Can be upgraded using `upgradeTo`

---

## **Environment Requirements**

- Node.js 16+
- Hardhat 2.20+
- Solidity 0.8.20+
- OpenZeppelin Contracts 5.0+

---

## **License**

This project is open-source under the **MIT License**.

