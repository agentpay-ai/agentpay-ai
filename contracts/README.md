# AgentPay AI — Smart Contracts Suite

The `contracts` directory contains the Solidity smart contract suite for **AgentPay AI**, built with **Foundry** and using OpenZeppelin's **UUPS Upgradeable (ERC-1967)** standard.

---

## 📜 Deployed Contracts

### **BotChain Testnet (`Chain ID: 968`)**
- **RPC Endpoint**: `https://rpc.bohr.life`
- **Block Explorer**: `https://scan.bohr.life`
- **UUPS ERC1967 Proxy Vault Contract (`PAYMENT_RECIPIENT_ADDRESS` / `payTo`)**:  
  [`0xc1eBB154EFf9bf9c08e39978E1447cC05e726dC6`](https://scan.bohr.life/address/0xc1eBB154EFf9bf9c08e39978E1447cC05e726dC6)
- **Implementation Contract**:  
  [`0x60C516E2A6F3a6C034AA2D63AE32900D88B3bB4D`](https://scan.bohr.life/address/0x60C516E2A6F3a6C034AA2D63AE32900D88B3bB4D)

---

## 🛠️ Local Development & Testing

```bash
# Run 100% Foundry Unit Test Suite
forge test

# Run deployment script simulation for BotChain Testnet
PRIVATE_KEY=<your_private_key> forge script script/DeployBotChainRegistry.s.sol --rpc-url botchain_testnet
```
