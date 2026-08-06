# Chapter 5: Technical Architecture and Smart Contracts

## 5.1 System Architecture

AgentPayAI is constructed as a decoupled multi-repository architecture containing: `agentpay_frontend` (Next.js 16 web interface), `agentpay_backend` (Express.js API gateway), and `contracts/` (Solidity smart contracts).

```
                      +----------------------------------+
                      |     Next.js 16 Frontend App      |
                      |       (agentpay_frontend)        |
                      +----------------------------------+
                                       |
                                HTTP / REST
                                       |
                                       v
                      +----------------------------------+
                      |     Express.js API Gateway       |
                      |       (agentpay_backend)         |
                      +----------------------------------+
                         /             |              \
                        /              |               \
                       v               v                v
          +------------------+  +--------------+  +-------------------+
          | x402 Facilitator |  | Claude / AI  |  | BotChain Agent    |
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

AgentPayAI operates as a decentralized compute aggregator. It procures enterprise inference access from primary AI providers (Anthropic Claude, Google Gemini, OpenAI) and resells compute capabilities to end-users and autonomous software agents on a pay-per-prompt basis through a 3-stage execution pipeline:

### 1. API Gateway Interception & Reselling Meter (`agentpay_backend`)
The core gateway is built on Express.js with `@x402/express` middleware and deployed on Vercel for low-latency response times. Whenever a client interface (`agentpay_frontend`) or autonomous software bot issues a request to `/api/chat`, `/api/image`, `/api/code`, or `/api/botchain/relay`, the gateway intercepts the request.

Before issuing any upstream AI API calls, the gateway verifies the attached `X-AgentPay-Payment-Tx` micropayment header (or prepaid session token). If no valid payment is present, it halts execution and returns `HTTP 402 Payment Required`.

### 2. Upstream Enterprise Provider Routing
Once micropayment settlement is verified, the gateway dispatches the prompt payload to upstream AI model providers using protocol-managed API keys:
- **LLM Text Completions (`/api/chat`)**: Integrates directly with `@anthropic-ai/sdk` for Anthropic Claude (`claude-opus-5`).
- **AI Image Rendering (`/api/image`)**: Enhances prompts and routes to image generation pipelines.
- **Smart Contract Code Auditing (`/api/code`)**: Combines AST-level static code parsing with specialized LLM vulnerability detection models to analyze Solidity code snippets and generate structured security risk reports.
- **Autonomous Bot Relays (`/api/botchain/relay`)**: Programmatic JSON-RPC relay formatting machine-to-machine task payloads for BotChain agents.

### 3. Execution, Payload Fulfillment, and Onchain Logging
Upon receiving the inference output from upstream model providers:
1. **Response Stream**: The gateway returns the AI response (JSON payload or rendered image) immediately back to the client app UI or autonomous bot relay.
2. **Asynchronous Ledger Update**: Simultaneously, the gateway issues an asynchronous transaction to `AgentPayRegistry.sol` onchain (Celo or BotChain EVM), recording the prompt execution event, user address, service type, and timestamp.

---

## 5.3 Express.js API Gateway Specification (`agentpay_backend`)

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

## 5.4 Smart Contract Architecture (`agentpay_contracts`)

The smart contract layer consists of two primary contracts deployed on BotChain Testnet (`968`) and Mainnet (`677`):

1. **`APAYToken.sol`**: An EIP-3009 compliant ERC-20 utility token powering native x402 gasless micropayments (`transferWithAuthorization`, `receiveWithAuthorization`, `cancelAuthorization`).
2. **`AgentPayRegistry.sol`**: An onchain execution and reputation ledger recording prompt settlement events.

### EIP-3009 Token Specification (`APAYToken.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title APAYToken
 * @notice EIP-3009 Compliant Utility Token for AgentPay AI on BotChain
 */
contract APAYToken is ERC20, ERC20Permit {
    bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH =
        keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");

    bytes32 public constant RECEIVE_WITH_AUTHORIZATION_TYPEHASH =
        keccak256("ReceiveWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");

    bytes32 public constant CANCEL_AUTHORIZATION_TYPEHASH =
        keccak256("CancelAuthorization(address authorizer,bytes32 nonce)");

    mapping(address => mapping(bytes32 => bool)) private _authorizationStates;

    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);
    event AuthorizationCanceled(address indexed authorizer, bytes32 indexed nonce);

    function authorizationState(address authorizer, bytes32 nonce) external view returns (bool) {
        return _authorizationStates[authorizer][nonce];
    }
}
```

### Registry Contract Implementation (`AgentPayRegistry.sol`)

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
