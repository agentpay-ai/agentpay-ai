# AgentPayAI

> **Multi-Chain Pay-Per-Prompt AI Access Hub and Autonomous Agent Infrastructure**  
> Built for **BotChain** (AI Agent Infrastructure & Ecosystem Support Program) & **Celo MiniPay**  
> BotChain BOT Infrastructure Grant Target | Celo Proof of Ship Season 2

---

## Overview

AgentPayAI is a mobile-first, multi-chain AI MiniApp and autonomous agent payment gateway built for both the **BotChain** AI agent ecosystem ([botchain.notion.site/bot-chain-ecosystem-support-program-en](https://botchain.notion.site/bot-chain-ecosystem-support-program-en), [dev-docs.botchain.ai](https://dev-docs.botchain.ai/)) and **Celo MiniPay** users.

AgentPayAI operates as a **decentralized AI compute aggregator and micropayment gateway**:
1. **Bulk Compute Aggregation**: Procures enterprise API inference access from major AI model providers (Google Gemini, Anthropic Claude, OpenAI GPT-4o, xAI Grok).
2. **Fractionalization and Reselling**: Fractionalizes bulk compute into sub-cent, pay-per-prompt units ($0.01 to $0.05 per call) resold directly to mobile users and autonomous software agents.
3. **Onchain Micropayment Rail**: Settles transactions ondemand in stablecoins (USDm/USDC) or native **$APAY** tokens via x402 HTTP payment signatures—requiring no credit cards or recurring monthly SaaS subscriptions.

Every prompt is verified and settled onchain with native **ERC-8004** agent identity trust and **ERC-8021** builder attribution tracking.

---

## AgentPayAI Whitepaper & GitBook Suite

The complete technical whitepaper and GitBook documentation suite is available in the [`docs/`](docs/README.md) directory and live on GitBook:

- **GitBook Space**: [app.gitbook.com/o/VbOtqOH2baqFJOkGZob9/s/jXrKr6TMx22gaie4amuM/](https://app.gitbook.com/o/VbOtqOH2baqFJOkGZob9/s/jXrKr6TMx22gaie4amuM/)
- **[AgentPayAI Whitepaper Cover](docs/README.md)**
- **[GitBook Navigation Manifest](docs/SUMMARY.md)**
- **[Chapter 1: Executive Summary](docs/01-executive-summary.md)**
- **[Chapter 2: Problem Statement and Market Opportunity](docs/02-problem-and-market-opportunity.md)**
- **[Chapter 3: BotChain Protocol Integration and Infrastructure Grant Alignment](docs/03-botchain-protocol-integration.md)**
- **[Chapter 4: Celo MiniPay and x402 Micropayment Engine](docs/04-celo-minipay-and-x402-engine.md)**
- **[Chapter 5: Technical Architecture and Smart Contracts](docs/05-technical-architecture.md)**
- **[Chapter 6: Economic Model, Tokenomics and Grant Allocation](docs/06-economic-model-and-grants.md)**
- **[Chapter 7: Roadmap, Multi-Model Network and Governance](docs/07-roadmap-and-future-vision.md)**

---

## Dynamic Prompt Pricing Formula

The gateway calculates prompt pricing dynamically using a 4-parameter formula:

$$\text{Price}_{\text{User}} = (\text{Cost}_{\text{Provider}} + \text{Cost}_{\text{Gas}}) \times (1 + \text{Margin}_{\text{Protocol}}) \times (1 - \text{Discount}_{\text{Token}})$$

- **$\text{Cost}_{\text{Provider}}$**: Dynamic upstream compute cost based on prompt token count or raw image render unit.
- **$\text{Cost}_{\text{Gas}}$**: Fixed sub-cent transaction cost (~$0.0005 USDm) using Celo CIP-64 gas fee abstraction or BotChain EVM execution.
- **$\text{Margin}_{\text{Protocol}}$**: Fixed protocol margin to cover gateway edge infrastructure, API reserves, and 15% automated $APAY buyback-and-burn mechanisms.
- **$\text{Discount}_{\text{Token}}$**: 20% discount for direct $APAY token settlement plus additional 10%–25% reductions for staked $APAY tiers.

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
> The integration of Google Gemini Flash (free tier) in the current build is optimized for development and rapid testing. Production iterations will support a multi-model routing network including **Claude 3.5 Opus**, **Fable GPT Sol**, **GPT-4o**, and **xAI Grok**.

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
