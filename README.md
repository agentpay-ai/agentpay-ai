# 🤖 AgentPay AI

> **Pay-Per-Prompt AI Access Hub on Celo MiniPay**  
> Built for Celo Proof of Ship Season 2 | Track: AI Agents × MiniPay

---

## 🌟 Overview
AgentPay AI is a mobile-first MiniApp tailored for Celo MiniPay users, providing pay-as-you-go access to premium AI models (LLM text completion via Google Gemini Flash, AI image generation, and code review) using sub-cent stablecoin micropayments.

No credit card, no recurring subscriptions. Pay per prompt onchain in stablecoins (USDm / USDC).

---

## 🛠️ Architecture & Tech Stack

```
agentpay-ai/
├── apps/
│   ├── web/         # Next.js 14/15 App Router (MiniPay UI)
│   └── api/         # Hono API Server (x402 Micropayment Gateway + Google Gemini Flash)
└── contracts/       # Foundry Smart Contracts (AgentPayRegistry.sol)
```

- **Frontend**: Next.js (App Router), Tailwind CSS, viem, wagmi, `@x402/fetch`
- **Backend Gateway**: Hono framework, `@x402/hono`, `@google/genai` (Gemini 2.5 Flash / Flash Lite)
- **Smart Contracts**: Foundry, Solidity 0.8.24, ERC-8004 identity registration
- **Payments Protocol**: x402 Celo Facilitator (`https://api.x402.celo.org`)
- **Gas Abstraction**: CIP-64 fee abstraction using USDm/USDC

> [!NOTE]
> **Development & Multi-Model Roadmap**:  
> The integration of Google Gemini Flash (free tier) in the current build is optimized for development, rapid testing, and hackathon evaluation. In future production iterations, AgentPay AI will support a multi-model routing network including **Claude 3.5 Opus**, **Fable GPT Sol**, **GPT-4o**, and custom fine-tuned agents via the x402 micropayment rail.


---

## 🚀 Quickstart

### Prerequisites
- Node.js >= 18
- Foundry (`forge`, `cast`)
- Celo Sepolia / Mainnet RPC URL
- x402 API key from `https://x402.celo.org`
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/maziofweb3/agentpay-ai.git
cd agentpay-ai

# Install root dependencies
npm install

# Run Hono API gateway
cd apps/api && npm run dev

# Run Next.js MiniApp frontend
cd apps/web && npm run dev
```

---

## 📄 License
MIT License.
