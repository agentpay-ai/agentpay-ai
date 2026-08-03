# Chapter 5: Technical Architecture and Smart Contracts

## 5.1 System Architecture

AgentPayAI is constructed as a monorepo containing three core packages: `apps/web` (Next.js frontend), `apps/api` (Hono API gateway), and `contracts/` (Solidity smart contracts).

```
                      +----------------------------------+
                      |       Next.js 14/15 Frontend     |
                      |       (apps/web - MiniPay UI)    |
                      +----------------------------------+
                                       |
                                HTTP / REST
                                       |
                                       v
                      +----------------------------------+
                      |         Hono API Gateway         |
                      |         (apps/api)               |
                      +----------------------------------+
                         /             |              \
                        /              |               \
                       v               v                v
          +------------------+  +--------------+  +-------------------+
          | x402 Facilitator |  | Gemini Flash |  | BotChain Agent    |
          | Settlement Core  |  | AI Engine    |  | Relay Protocol    |
          +------------------+  +--------------+  +-------------------+
                       |                                |
                       v                                v
          +---------------------------------------------------+
          |       Multi-Chain Smart Contracts Registry        |
          |       (AgentPayRegistry.sol on Celo & BotChain)   |
          +---------------------------------------------------+
```

---

## 5.2 Hono API Gateway Specification (`apps/api`)

The API gateway handles route protection, micropayment verification, AI inference orchestration, and event logging.

### Endpoint Overview

| Route | Method | Price | Description |
|---|---|---|---|
| `/api/chat` | POST | $0.01 USDm | Text generation using Google Gemini 2.5 Flash |
| `/api/image` | POST | $0.05 USDm | Image generation prompt enhancer and rendering |
| `/api/code` | POST | $0.02 USDm | Automated smart contract vulnerability audit |
| `/api/reputation` | GET / POST | Free / $0.00 | Query ERC-8004 score and submit ratings |
| `/api/attribution/tag` | GET | Free | Retrieve signed ERC-8021 calldata suffix |
| `/api/botchain/relay` | POST | Dynamic | Programmatic bot task relay for BotChain agents |

---

## 5.3 Smart Contract Implementation (`AgentPayRegistry.sol`)

The `AgentPayRegistry.sol` contract provides an onchain ledger of prompt executions and micropayments across Celo and BotChain EVM networks.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AgentPayRegistry
 * @notice Multi-Chain Onchain Registry for AgentPayAI (Celo & BotChain EVM)
 */
contract AgentPayRegistry is Ownable, Pausable {
    event PromptRecorded(
        address indexed user,
        string tool,
        uint256 amount,
        address indexed asset,
        uint256 indexed chainId,
        uint256 timestamp
    );

    mapping(address => uint256) public userPromptCounts;
    mapping(address => uint256) public totalAmountProcessed;
    uint256 public totalPromptsRecorded;

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Record a prompt execution onchain
     * @param user Address of the user or bot invoking the prompt
     * @param tool Identifer string of the AI tool consumed
     * @param amount Micropayment value in token base units
     * @param asset Address of the payment token (USDm / USDC)
     * @param chainId EVM Chain ID where transaction originated
     */
    function recordPrompt(
        address user,
        string calldata tool,
        uint256 amount,
        address asset,
        uint256 chainId
    ) external onlyOwner whenNotPaused {
        require(user != address(0), "Invalid user address");
        userPromptCounts[user] += 1;
        totalPromptsRecorded += 1;
        totalAmountProcessed[asset] += amount;

        emit PromptRecorded(user, tool, amount, asset, chainId, block.timestamp);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
```

---

## 5.4 Foundry Build and Multi-Chain RPC Configuration

The contract compilation target uses Solidity `0.8.24` with EVM version `cancun`. Multi-chain deployment targets are configured within `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.24"
evm_version = "cancun"

[rpc_endpoints]
celo = "https://forno.celo.org"
celo_sepolia = "https://forno.celo-sepolia.celo-testnet.org"
botchain_testnet = "https://rpc-testnet.botchain.ai"
botchain = "https://rpc.botchain.ai"
```
