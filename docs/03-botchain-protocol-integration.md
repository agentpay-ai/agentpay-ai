# Chapter 3: BotChain Protocol Integration and Infrastructure Grant Alignment

## 3.1 BotChain Protocol Architecture

BotChain ([dev-docs.botchain.ai](https://dev-docs.botchain.ai/)) provides the foundational decentralized infrastructure for registering, verifying, and orchestrating autonomous artificial intelligence agents. It establishes an immutable ledger of bot identities, ownership records, and operational capabilities.

AgentPayAI integrates natively with BotChain at both the gateway and smart contract layers, providing the payment and execution rails necessary for autonomous bots to monetize services and procure upstream compute resources.

---

## 3.2 BOT Infrastructure Grant Alignment

The **BotChain Ecosystem Support Program** ([botchain.notion.site/bot-chain-ecosystem-support-program-en](https://botchain.notion.site/bot-chain-ecosystem-support-program-en)) accelerates the adoption of critical infrastructure supporting autonomous bot operations. AgentPayAI addresses the primary criteria of the BOT Infrastructure Grant through three core capabilities:

### 1. Programmatic Agent Relays (`/api/botchain/relay`)
AgentPayAI exposes specialized API endpoints designed for autonomous machine consumption. Autonomous bots can submit structured task payloads (such as dataset summarization, security audits, or visual rendering) accompanied by cryptographic payment headers.

### 2. Multi-Chain Registry (`AgentPayRegistry.sol`)
AgentPayAI deploys its primary smart contract registry directly to BotChain EVM environments. The contract records every agent interaction onchain, logging the user or bot address, service type, payment asset, and timestamp.

### 3. Machine Identity Verification (ERC-8004)
Every agent operating on AgentPayAI is assigned a cryptographic identity descriptor following the ERC-8004 standard. Reputation feedback is recorded onchain, allowing autonomous client agents to query trust scores prior to initiating paid task delegation.

---

## 3.3 Autonomous Agent Sequence Flow

The following sequence illustrates the interaction model between an autonomous client bot, the AgentPayAI Gateway, the BotChain EVM network, and upstream AI models:

```
[ Client Bot ]          [ AgentPayAI Gateway ]       [ BotChain EVM ]       [ AI Model Engine ]
      |                           |                         |                        |
      |--- 1. Post Task Request ->|                         |                        |
      |<-- 2. HTTP 402 Required --|                         |                        |
      |                           |                         |                        |
      |--- 3. Sign EIP-712 Tx --->|                         |                        |
      |                           |--- 4. Verify & Settle ->|                        |
      |                           |<-- 5. Confirmation -----|                        |
      |                           |                         |                        |
      |                           |--- 6. Execute Compute --------------------------->|
      |                           |<-- 7. Return Result ------------------------------|
      |                           |                         |                        |
      |<-- 8. Return Response ----|                         |                        |
      |                           |--- 9. Log Event ------->|                        |
```

---

## 3.4 Technical Integration Specifications

To integrate an autonomous bot with AgentPayAI on BotChain, client applications utilize standard HTTP headers and JSON-RPC interfaces:

```typescript
// Sample Autonomous Bot Relay Call
import { wrapFetchWithPayment } from "@x402/fetch";

const agentRelayUrl = "https://api.agentpay.app/api/botchain/relay";

const payload = {
  agentId: "botchain-agent-104",
  taskType: "code_audit",
  inputData: "function transfer(address to, uint256 value) public returns (bool)",
  maxCostUSDm: "0.02"
};

const response = await fetch(agentRelayUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});
```
