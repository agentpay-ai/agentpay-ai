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
          | x402 Facilitator |  | Gemini / AI  |  | BotChain Agent    |
          | Settlement Core  |  | Model Engine |  | Relay Protocol    |
          +------------------+  +--------------+  +-------------------+
                       |                                |
                       v                                v
          +---------------------------------------------------+
          |     UUPS Upgradeable Smart Contract Vault         |
          |  (ERC1967Proxy AgentPayRegistry.sol on BotChain)  |
          +---------------------------------------------------+
```

---

## 5.2 Compute Aggregation, Reselling Model, and Upstream Routing

AgentPayAI operates as a decentralized compute aggregator. It procures enterprise inference access from primary AI providers (Google Gemini, Anthropic Claude, OpenAI, xAI Grok) and resells compute capabilities to end-users and autonomous software agents on a pay-per-prompt basis through a 3-stage execution pipeline:

### 1. API Gateway Interception & Reselling Meter (`apps/api`)
The core gateway is built on the Hono framework and edge-deployed for low-latency response times. Whenever a client interface (Next.js MiniApp) or autonomous software bot issues a request to `/api/chat`, `/api/image`, `/api/code`, or `/api/botchain/relay`, the gateway intercepts the request.

Before issuing any upstream AI API calls, the gateway verifies the attached `x402` micropayment header (or $APAY token signature). If no valid payment is present, it halts execution and returns `HTTP 402 Payment Required`.

### 2. Upstream Enterprise Provider Routing
Once micropayment settlement is verified, the gateway dispatches the prompt payload to upstream AI model providers using protocol-managed API key pools:
- **LLM Text Completions (`/api/chat`)**: Integrates directly with `@google/genai` SDK for Google Gemini 2.5 Flash / Flash Lite, with dynamic routing adapters for Anthropic Claude 3.5 Opus, OpenAI GPT-4o, and xAI Grok.
- **AI Image Rendering (`/api/image`)**: Routes prompts through visual rendering engines (SDXL / Gemini Image / Replicate) to return high-resolution base64 or CDN image payloads.
- **Smart Contract Code Auditing (`/api/code`)**: Combines AST-level static code parsing with specialized LLM vulnerability detection models to analyze Solidity code snippets and generate structured security risk reports.
- **Autonomous Bot Relays (`/api/botchain/relay`)**: Programmatic JSON-RPC relay formatting machine-to-machine task payloads for BotChain agents.

### 3. Execution, Payload Fulfillment, and Onchain Logging
Upon receiving the inference output from upstream model providers:
1. **Response Stream**: The gateway returns the AI response (JSON payload or rendered image) immediately back to the client app UI or autonomous bot relay.
2. **Asynchronous Ledger Update**: Simultaneously, the gateway issues an asynchronous transaction to `AgentPayRegistry.sol` onchain (Celo or BotChain EVM), recording the prompt execution event, user address, service type, and timestamp.

---

## 5.3 Hono API Gateway Specification (`apps/api`)

The API gateway handles route protection, micropayment verification, AI inference orchestration, and event logging.

### Endpoint Overview

| Route | Method | Price ($ / $APAY) | Upstream AI Provider | Description |
|---|---|---|---|---|
| `/api/chat` | POST | $0.010 / 1.0 $APAY | Gemini 2.5 Flash / Claude Opus / Grok | Text completion & conversation engine |
| `/api/image` | POST | $0.050 / 5.0 $APAY | SDXL / Gemini Image / Replicate | Image prompt enhancer & renderer |
| `/api/code` | POST | $0.020 / 2.0 $APAY | Gemini 2.5 Flash / Audit Engine | Solidity smart contract vulnerability audit |
| `/api/reputation` | GET / POST | Free / $0.00 | ERC-8004 Registry | Query score and submit agent ratings |
| `/api/attribution/tag` | GET | Free | ERC-8021 Engine | Retrieve signed calldata suffix |
| `/api/botchain/relay` | POST | Dynamic | BotChain Agent Protocol | Programmatic bot task relay |

---

## 5.4 Smart Contract Implementation (`AgentPayRegistry.sol`)

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
     * @param asset Address of the payment token (USDm / USDC / APAY)
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

## 5.5 Foundry Build and Multi-Chain RPC Configuration

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
