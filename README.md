# 🤖 AgentPay AI

> **Multi-Chain Pay-Per-Prompt AI Access Hub & Autonomous Agent Rail**  
> Built for **Celo MiniPay** & **BotChain** (AI Agent Infrastructure & Ecosystem Support Program)  
> Celo Proof of Ship Season 2 | Track: AI Agents × MiniPay × BotChain Ecosystem

---

## 🌟 Overview
AgentPay AI is a mobile-first, multi-chain AI MiniApp and autonomous agent payment gateway built for both **Celo MiniPay** users and the **BotChain** AI agent ecosystem ([botchain.notion.site](https://botchain.notion.site/bot-chain-ecosystem-support-program-en), [dev-docs.botchain.ai](https://dev-docs.botchain.ai/)).

It provides seamless, pay-as-you-go access to premium AI models (LLM text completion via Google Gemini Flash, AI image creation, and smart contract code review) using sub-cent stablecoin micropayments — no credit cards, no recurring monthly subscriptions required.

Every prompt is verified and settled onchain in stablecoins (USDm / USDC) with native **ERC-8004** agent identity trust and **ERC-8021** builder attribution tracking.

---

## 🌐 Supported Ecosystems

| Ecosystem | Description | Primary Rail |
|---|---|---|
| 🟢 **Celo MiniPay** | Mobile-first Web3 wallet with CIP-64 gas fee abstraction | x402 Micropayment Gateway (`api.x402.celo.org`) |
| 🤖 **BotChain** | Dedicated AI Agent Infrastructure & Autonomous Agent Network ([docs](https://dev-docs.botchain.ai/)) | Onchain Agent Registration & BotChain Ecosystem Support Program |

---

## 🛠️ Architecture & Tech Stack

```
agentpay-ai/
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
- **Attribution & Gas Abstraction**: ERC-8021 Attribution Tags (Proof of Ship & BotChain leaderboard tracking), CIP-64 gas abstraction

> [!NOTE]
> **Development & Multi-Model Roadmap**:  
> The integration of Google Gemini Flash (free tier) in the current build is optimized for development, rapid testing, and hackathon evaluation. In future production iterations, AgentPay AI will support a multi-model routing network including **Claude 3.5 Opus**, **Fable GPT Sol**, **GPT-4o**, and custom fine-tuned autonomous agents across **BotChain** and **Celo**.

---

## 🚀 Quickstart

### Prerequisites
- Node.js >= 18
- Foundry (`forge`, `cast`)
- Celo Sepolia / Mainnet / BotChain RPC URL
- x402 API key from `https://x402.celo.org`
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/soomtochukwu/agentpay-ai.git
cd agentpay-ai

# Install root dependencies
npm install

# Run Hono API gateway
cd apps/api && npm run dev

# Run Next.js MiniApp frontend
cd apps/web && npm run dev
```

---

## 📚 References & Documentation
- **BotChain Ecosystem Support Program**: [botchain.notion.site](https://botchain.notion.site/bot-chain-ecosystem-support-program-en)
- **BotChain Developer Documentation**: [dev-docs.botchain.ai](https://dev-docs.botchain.ai/)
- **Celo Developer Docs**: [docs.celo.org](https://docs.celo.org)

---

## 📄 License
MIT License.
