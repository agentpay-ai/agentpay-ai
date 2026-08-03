# Chapter 7: Roadmap, Multi-Model Network and Governance

## 7.1 Development Roadmap (Phases 0 through 11)

The protocol execution roadmap spans eleven structured phases:

```
[ Phase 0 - 6: Foundation & Gateway ] --------> [ Phase 7 - 8: Multi-Chain & Relays ] --------> [ Phase 9 - 11: Production & Grants ]
- Monorepo & GitHub Organization               - AgentPayRegistry.sol (Celo & BotChain)         - Vercel & Railway Deployment
- MiniPay Wallet & Balance Hooks               - BotChain Agent Relay Gateway                   - Celo Proof of Ship Season 2
- x402 Micropayment Engine                      - Multi-Chain Test Suite & CI                    - BotChain Ecosystem Grant Application
- Gemini 2.5 Flash Integration                 - PageSpeed 90+ Mobile Audit                     - Demo Video & Technical Documentation
- ERC-8004 Trust & ERC-8021 Attribution
- Mobile UI (/chat, /image, /code, /history)
```

---

## 7.2 Multi-Model AI Routing Network

While the current development build leverages Google Gemini 2.5 Flash for cost-free testing, the production architecture implements dynamic multi-model routing based on query complexity and user budget:

```
[ User / Bot Prompt Request ]
              |
              v
     [ AgentPayAI Gateway ]
              |
   +----------+----------+-------------------+
   |                     |                   |
   v                     v                   v
[ Tier 1: Fast ]    [ Tier 2: Reasoning ]   [ Tier 3: Autonomous ]
Gemini 2.5 Flash    Claude 3.5 Opus         Fable GPT Sol / GPT-4o
$0.01 USDm          $0.05 USDm              $0.10 USDm
```

### Supported Models & Use-Cases:
1. **Tier 1 (Fast / Mobile)**: Google Gemini 2.5 Flash — General chat, translation, fast summarization.
2. **Tier 2 (High-Reasoning)**: Anthropic Claude 3.5 Opus — Deep code analysis, formal logic, complex technical writing.
3. **Tier 3 (Autonomous Agents)**: OpenAI GPT-4o & Fable GPT Sol — Multi-step autonomous agent execution, tool-calling, and BotChain relay tasks.

---

## 7.3 Decentralized Governance and Protocol Evolution

As transaction volume scales across Celo and BotChain, protocol governance will transition to an open, decentralized model:

1. **Parameter Governance**: Token-weighted governance over protocol fee margins, supported stablecoin assets, and minimum micropayment thresholds.
2. **Model Registry Governance**: Decentralized voting to onboard new open-source and proprietary AI models into the routing gateway.
3. **Agent Trust Standards**: Community-driven moderation of ERC-8004 reputation algorithms to prevent bad-actor bots from accessing paid relay infrastructure.
