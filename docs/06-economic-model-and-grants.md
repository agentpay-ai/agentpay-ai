# Chapter 6: Economic Model, Tokenomics and Grant Allocation

## 6.1 Micropayment Revenue Architecture

AgentPayAI implements a sustainable, unit-economic positive business model. Every prompt execution generates protocol revenue while maintaining sub-cent costs for end-users and autonomous bots.

### Unit Cost Breakdown per Prompt

| Service Tool | USDm / USDC Price | $APAY Discounted Price | Raw Compute Cost | Network Settlement Cost | Protocol Net Margin |
|---|---|---|---|---|---|
| AI Text Assistant | $0.010 USDm | 1.0 $APAY (~$0.008) | $0.00015 | < $0.001 | ~$0.0088 USDm |
| AI Code Reviewer | $0.020 USDm | 2.0 $APAY (~$0.016) | $0.00030 | < $0.001 | ~$0.0187 USDm |
| AI Image Creator | $0.050 USDm | 5.0 $APAY (~$0.040) | $0.00300 | < $0.001 | ~$0.0460 USDm |

This positive unit margin ensures protocol viability without requiring external subsidy.

---

## 6.2 Native Utility Token ($APAY) Architecture

To establish long-term economic alignment across users, autonomous bots, and infrastructure providers, AgentPayAI will deploy its native utility and governance token: **$APAY** (AgentPay Token).

### Primary Token Utilities

1. **Pay-Per-Prompt Settlement Engine**:
   Users and autonomous bots can pay for AI completions directly using $APAY. Prompt executions paid in $APAY receive a **20% protocol discount** compared to standard stablecoin payments.

2. **Staking & Tiered Fee Discounts**:
   Holding and staking $APAY unlocks tiered benefits across the protocol:
   - **Tier 1 (100 $APAY)**: 10% discount on all API inference calls + 2x rate-limit quota.
   - **Tier 2 (1,000 $APAY)**: 25% discount + priority queue access for high-reasoning models (Claude 3.5 Opus, GPT-4o).
   - **Tier 3 (10,000 $APAY)**: Zero protocol fee gateway access for high-volume developer API keys.

3. **BotChain Agent Relay Collateral**:
   Autonomous bots on the BotChain network stake $APAY as proof-of-stake collateral to earn "Verified Agent" status. Staked collateral protects against malicious task execution and unlocks machine-to-machine (M2M) task relay routing.

4. **Buyback and Burn Mechanism**:
   For all payments executed in non-$APAY assets (such as USDm or USDC), **15% of protocol net margins** are automatically routed to market-buy $APAY on decentralized exchanges (Celo DEXs and BotChain DEXs) and permanently burned.

5. **Decentralized Governance**:
   $APAY stakers participate in protocol governance proposals, including AI model onboarding, pricing parameter adjustments, and BOT Infrastructure Grant allocation voting.

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
1. **Infrastructure & Gateway Scaling (40%)**: Provisioning global edge API gateways (Railway/AWS) and dedicated RPC endpoints to ensure sub-2-second settlement across BotChain EVM networks.
2. **Multi-Model Inference Liquidity (25%)**: Funding upstream API credit reserves for advanced reasoning models (Claude 3.5 Opus and OpenAI GPT-4o), ensuring zero downtime for high-priority bot relays.
3. **$APAY Liquidity Provision (20%)**: Initial liquidity seeding for $APAY token pairs ($APAY/USDm, $APAY/cUSD, $APAY/BOT) across Celo and BotChain decentralized exchanges.
4. **Security Audits & Protocol Hardening (15%)**: Comprehensive smart contract audits for `AgentPayRegistry.sol`, $APAY token contracts, and ERC-8004 identity protocols.

---

## 6.4 Value Accrual Summary

AgentPayAI establishes a multi-token value flywheel:
- **$APAY Token**: Value accrual via native prompt utility, staking discounts, agent collateral, and automated protocol buyback & burn.
- **BOT Token**: Value accrual via deep integration with BotChain AI Agent Infrastructure and network relay settlement.
- **Stablecoin Liquidity**: Continuous micropayment volume flowing through USDm and USDC pools on Celo and BotChain.
