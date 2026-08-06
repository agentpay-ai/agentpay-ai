# Chapter 6: Economic Model, Tokenomics and Grant Allocation

## 6.1 Micropayment Revenue Architecture

AgentPayAI implements a sustainable, unit-economic positive business model. Every prompt execution generates protocol revenue while maintaining sub-cent costs for end-users and autonomous bots.

### 6.1.1 Dynamic Prompt Pricing Formula

The gateway calculates prompt pricing dynamically using a 4-parameter formula:

$$
\text{Price}_{\text{User}} = (\text{Cost}_{\text{Provider}} + \text{Cost}_{\text{Gas}}) \times (1 + \text{Margin}_{\text{Protocol}}) \times (1 - \text{Discount}_{\text{Token}})
$$

#### Formula Parameters:
1. **Upstream Inference Cost ($\text{Cost}_{\text{Provider}}$)**: Calculated dynamically based on prompt token count (Input + Output Tokens) or raw compute unit from the provider API (e.g., Gemini 2.5 Flash: ~\$0.00015/prompt, Claude 3.5 Opus: ~\$0.00300/prompt, Image Render: ~\$0.00300/image).
2. **Onchain Settlement Fee ($\text{Cost}_{\text{Gas}}$)**: Gasless EIP-3009 transfer authorization settled directly on BotChain EVM.
3. **Protocol Margin Multiplier ($\text{Margin}_{\text{Protocol}}$)**: Applied to fund edge gateway node hosting, API liquidity reserves, and 15% automated \$APAY token buyback-and-burn mechanisms.
4. **Token Discount Adjuster ($\text{Discount}_{\text{Token}}$)**:
   - **Native Payment**: 100% of prompt executions settled in **\$APAY** tokens (EIP-3009).
   - **Staking Tier Reductions**: Additional 10% to 25% fee reductions applied automatically based on the user's or bot's staked \$APAY tier (Tier 1: 100 \$APAY, Tier 2: 1,000 \$APAY, Tier 3: 10,000 \$APAY).

---

### Unit Cost Breakdown per Prompt

| Service Tool | \$APAY Price (EIP-3009) | Raw Compute Cost | Network Settlement | Protocol Net Margin |
|---|---|---|---|---|
| AI Text Assistant (`/api/chat`) | 1.0 \$APAY | \$0.00015 | Gasless Signature | High |
| AI Code Reviewer (`/api/code`) | 2.0 \$APAY | \$0.00030 | Gasless Signature | High |
| AI Image Creator (`/api/image`) | 5.0 \$APAY | \$0.00300 | Gasless Signature | High |

This positive unit margin ensures protocol viability without requiring external subsidy.

---

## 6.2 Native Utility Token (\$APAY) Architecture

To establish long-term economic alignment across users, autonomous bots, and infrastructure providers, AgentPayAI operates using its native utility and governance token: **\$APAY** (AgentPay Token), implemented as an **EIP-3009 compliant ERC-20 token** on BotChain.

### Primary Token Utilities

1. **EIP-3009 Native Pay-Per-Prompt Settlement Engine**:
   Users and autonomous bots pay for AI completions directly using \$APAY via gasless `transferWithAuthorization` EIP-712 signatures. \$APAY serves as the exclusive native utility token across the AgentPay AI platform.

2. **Staking & Tiered Fee Discounts**:
   Holding and staking \$APAY unlocks tiered benefits across the protocol:
   - **Tier 1 (100 \$APAY)**: 10% discount on all API inference calls + 2x rate-limit quota.
   - **Tier 2 (1,000 \$APAY)**: 25% discount + priority queue access for high-reasoning models (Claude 3.5 Opus, GPT-4o).
   - **Tier 3 (10,000 \$APAY)**: Zero protocol fee gateway access for high-volume developer API keys.

3. **BotChain Agent Relay Collateral**:
   Autonomous bots on the BotChain network stake \$APAY as proof-of-stake collateral to earn "Verified Agent" status. Staked collateral protects against malicious task execution and unlocks machine-to-machine (M2M) task relay routing.

4. **Buyback and Burn Mechanism**:
   For all payments executed in non-\$APAY assets (such as USDm or USDC), **15% of protocol net margins** are automatically routed to market-buy \$APAY on decentralized exchanges (Celo DEXs and BotChain DEXs) and permanently burned.

5. **Decentralized Governance**:
   \$APAY stakers participate in protocol governance proposals, including AI model onboarding, pricing parameter adjustments, and BOT Infrastructure Grant allocation voting.

---

## 6.3 BOT Infrastructure Grant Allocation Plan

The **BotChain Ecosystem Support Program** ([botchain.notion.site/bot-chain-ecosystem-support-program-en](https://botchain.notion.site/bot-chain-ecosystem-support-program-en)) provides infrastructure grants to projects building essential agent rails. 

AgentPayAI proposes the following structured capital allocation for grant funding:

```
[ BOT Infrastructure Grant Allocation ]
├── 40% -- High-Performance Gateway Scaling & Node Redundancy
├── 25% -- Multi-Model API Credit Reserve (Claude Opus / GPT-4o)
├── 20% -- $APAY Token Liquidity Provision & DEX Market Making
└── 15% -- Security Audits & ERC-8004 Onchain Trust Registries
```

### Allocation Breakdown:
1. **Infrastructure & Gateway Scaling (40%)**: Provisioning global serverless API gateways (Vercel) and dedicated RPC endpoints to ensure sub-2-second settlement across BotChain EVM networks.
2. **Multi-Model Inference Liquidity (25%)**: Funding upstream API credit reserves for advanced reasoning models (Claude 3.5 Opus and OpenAI GPT-4o), ensuring zero downtime for high-priority bot relays.
3. **\$APAY Liquidity Provision (20%)**: Initial liquidity seeding for \$APAY token pairs (\$APAY/USDm, \$APAY/cUSD, \$APAY/BOT) across Celo and BotChain decentralized exchanges.
4. **Security Audits & Protocol Hardening (15%)**: Comprehensive smart contract audits for `AgentPayRegistry.sol`, \$APAY token contracts, and ERC-8004 identity protocols.

---

## 6.4 Value Accrual Summary

AgentPayAI establishes a multi-token value flywheel:
- **\$APAY Token**: Value accrual via native prompt utility, staking discounts, agent collateral, and automated protocol buyback & burn.
- **BOT Token**: Value accrual via deep integration with BotChain AI Agent Infrastructure and network relay settlement.
- **Stablecoin Liquidity**: Continuous micropayment volume flowing through USDm and USDC pools on Celo and BotChain.
