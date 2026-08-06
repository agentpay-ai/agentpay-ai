# Chapter 7: Roadmap, Multi-Model Network and Governance

## 7.1 Development Roadmap (Phases 0 through 11)

The protocol execution roadmap spans eleven structured phases, incorporating $APAY token deployment, multi-chain smart contracts, and ecosystem grant integration:

```
[ Phase 0 - 6: Foundation & Gateway ] ------> [ Phase 7 - 8: Contracts & $APAY Token ] ------> [ Phase 9 - 11: Production & Grants ]
- Multi-Repo Architecture & GitHub Org           - AgentPayRegistry.sol (Celo & BotChain)         - Vercel Production Deployment
- MiniPay Wallet & Balance Hooks               - $APAY Utility Token Smart Contract             - $APAY Liquidity Seeding (DEX)
- x402 Micropayment Engine                      - BotChain Agent Relay Gateway                   - Celo Proof of Ship Season 2
- Gemini 2.5 Flash Integration                 - Multi-Chain Test Suite & CI                    - BotChain Ecosystem Grant Application
- ERC-8004 Trust & ERC-8021 Attribution        - PageSpeed 90+ Mobile Audit                     - Demo Video & Technical Documentation
- Mobile UI (/chat, /image, /code, /history)
```

---

## 7.2 $APAY Token Deployment and Utility Expansion

Following initial contract deployment on Celo and BotChain EVM, the protocol will execute the Token Generation Event (TGE) for **$APAY**:

1. **Phase 7–8 (Token Contract Deployment)**:  
   Deploy `$APAY` ERC-20 contract with gas-abstracted transfer functions, EIP-2612 permit approvals (enabling gasless $APAY micropayments), and automated buyback-and-burn fee sinks.

2. **Phase 9 (DEX Liquidity Seeding)**:  
   Seed initial decentralized exchange liquidity pools (`$APAY/USDm`, `$APAY/cUSD`, `$APAY/BOT`) on Celo (Ubeswap/Uniswap v3) and BotChain DEXs.

3. **Phase 10–11 (Agent Staking & Ecosystem Utility)**:  
   Activate BotChain agent collateral staking (`useAgentStaking.ts`), unlocking Tier 3 developer API access, priority model routing, and machine-to-machine trust delegation.

---

## 7.3 Multi-Model AI Routing Network

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
$0.01 USDm /        $0.05 USDm /            $0.10 USDm /
1.0 $APAY           5.0 $APAY               10.0 $APAY
```

### Supported Models & Use-Cases:
1. **Tier 1 (Fast / Mobile)**: Google Gemini 2.5 Flash — General chat, translation, fast summarization.
2. **Tier 2 (High-Reasoning)**: Anthropic Claude 3.5 Opus — Deep code analysis, formal logic, complex technical writing.
3. **Tier 3 (Autonomous Agents)**: OpenAI GPT-4o & Fable GPT Sol — Multi-step autonomous agent execution, tool-calling, and BotChain relay tasks.

---

## 7.4 Decentralized Governance and Protocol Evolution

As transaction volume scales across Celo and BotChain, protocol governance will transition to an open, token-weighted model:

1. **$APAY Parameter Governance**: $APAY holders vote on protocol fee margins, prompt discount percentages, and supported payment token assets.
2. **Model Registry Governance**: Decentralized voting to onboard new open-source and proprietary AI models into the routing gateway.
3. **Agent Trust Standards**: Community-driven moderation of ERC-8004 reputation algorithms to prevent bad-actor bots from accessing paid relay infrastructure.
