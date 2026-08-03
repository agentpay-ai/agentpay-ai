# AgentPayAI

> **Multi-Chain Pay-Per-Prompt AI Access Hub and Autonomous Agent Infrastructure**  
> Built for **BotChain** (AI Agent Infrastructure & Ecosystem Support Program) & **Celo MiniPay**  
> BotChain BOT Infrastructure Grant Target | Celo Proof of Ship Season 2

---

## Overview

AgentPayAI is a mobile-first, multi-chain AI MiniApp and autonomous agent payment gateway built for both the **BotChain** AI agent ecosystem ([botchain.notion.site/bot-chain-ecosystem-support-program-en](https://botchain.notion.site/bot-chain-ecosystem-support-program-en), [dev-docs.botchain.ai](https://dev-docs.botchain.ai/)) and **Celo MiniPay** users.

It provides pay-as-you-go access to premium AI models (LLM text completion via Google Gemini 2.5 Flash, AI image creation, and smart contract code review) using sub-cent stablecoin micropayments, eliminating recurring monthly subscriptions.

Every prompt is verified and settled onchain in stablecoins (USDm / USDC) with native **ERC-8004** agent identity trust and **ERC-8021** builder attribution tracking.

---

## AgentPayAI Whitepaper

The complete technical whitepaper and GitBook documentation suite is available in the [`docs/`](docs/README.md) directory:

- **[AgentPayAI Whitepaper Cover](docs/README.md)**
- **[GitBook Navigation Manifest](docs/SUMMARY.md)**
- **[Chapter 1: Executive Summary](docs/01-executive-summary.md)**
- **[Chapter 2: Problem Statement and Market Opportunity](docs/02-problem-and-market-opportunity.md)**
- **[Chapter 3: BotChain Protocol Integration and Infrastructure Grant Alignment](docs/03-botchain-protocol-integration.md)**
- **[Chapter 4: Celo MiniPay and x402 Micropayment Engine](docs/04-celo-minipay-and-x402-engine.md)**
- **[Chapter 5: Technical Architecture and Smart Contracts](docs/05-technical-architecture.md)**
- **[Chapter 6: Economic Model and Grant Allocation](docs/06-economic-model-and-grants.md)**
- **[Chapter 7: Roadmap, Multi-Model Network and Governance](docs/07-roadmap-and-future-vision.md)**

---

## Supported Ecosystems

| Ecosystem | Description | Primary Rail |
|---|---|---|
| BotChain | Dedicated AI Agent Infrastructure & Autonomous Agent Network ([docs](https://dev-docs.botchain.ai/)) | Onchain Agent Registration & BotChain Ecosystem Support Program |
| Celo MiniPay | Mobile-first Web3 wallet with CIP-64 gas fee abstraction | x402 Micropayment Gateway (`api.x402.celo.org`) |

---

## Architecture and Tech Stack

```
agentpay-ai/
├── docs/            # AgentPayAI Whitepaper & GitBook Documentation Suite
├── apps/
│   ├── web/         # Next.js 14/15 App Router (MiniPay & BotChain Web UI)
│   └── api/         # Hono API Gateway (x402 Micropayments + BotChain Agent Relay + Gemini Flash)
└── contracts/       # Foundry Smart Contracts (AgentPayRegistry.sol)
```

- **Frontend**: Next.js (App Router), Tailwind CSS, viem, wagmi, `@x402/fetch`
- **Backend Gateway**: Hono framework, `@x402/hono`, `@google/genai` (Gemini 2.5 Flash / Flash Lite)
- **AI Agent Protocols**: **BotChain** (AI Agent Protocol & Execution Framework), **ERC-8004** Identity & Reputation Registries
- **Smart Contracts**: Foundry, Solidity 0.8.24, ERC-8004 identity registration
- **Payments Protocol**: x402 Facilitator (`https://api.x402.celo.org`) & BotChain micropayment settlement
- **Attribution & Gas Abstraction**: ERC-8021 Attribution Tags, CIP-64 gas abstraction

> Note on Multi-Model Roadmap:  
> The integration of Google Gemini Flash (free tier) in the current build is optimized for development and rapid testing. Production iterations will support a multi-model routing network including **Claude 3.5 Opus**, **Fable GPT Sol**, and **GPT-4o**.

---

## Quickstart

### Prerequisites
- Node.js >= 18
- Foundry (`forge`, `cast`)
- Celo Sepolia / Mainnet / BotChain RPC URL
- x402 API key from `https://x402.celo.org`
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/agentpay-ai/agentpay-ai.git
cd agentpay-ai

# Install root dependencies
npm install

# Run Hono API gateway
cd apps/api && npm run dev

# Run Next.js MiniApp frontend
cd apps/web && npm run dev
```

---

## References & Documentation
- **BotChain Ecosystem Support Program**: [botchain.notion.site/bot-chain-ecosystem-support-program-en](https://botchain.notion.site/bot-chain-ecosystem-support-program-en)
- **BotChain Developer Documentation**: [dev-docs.botchain.ai](https://dev-docs.botchain.ai/)
- **Celo Developer Docs**: [docs.celo.org](https://docs.celo.org)

---

## License
MIT License.
