# Chapter 4: Celo MiniPay and x402 Micropayment Engine

## 4.1 Mobile MiniPay Integration

Celo MiniPay is a lightweight, mobile-first Web3 wallet embedded within the Opera Mini browser, catering to millions of users across emerging markets. MiniPay enforces strict operational standards:
1. Universal mobile viewport constraints (360px to 420px display width).
2. Elimination of native gas display (users pay network fees exclusively in stablecoins like USDm/cUSD or USDC).
3. Automatic wallet detection via `window.ethereum.isMiniPay`.

AgentPayAI implements a dedicated MiniPay detection and auto-connect hook (`useMiniPay.ts`), eliminating manual connection steps and rendering a streamlined mobile interface optimized for low-bandwidth cellular connections.

---

## 4.2 CIP-64 Gas Fee Abstraction

On standard EVM networks, users must hold native gas tokens (such as ETH or CELO) to execute transactions. This requirement imposes significant friction for non-technical users.

AgentPayAI leverages Celo's native **CIP-64 Fee Currency Abstraction**. All onchain contract invocations specify fee currency adapters directly within transaction parameters:

```typescript
// CIP-64 Fee Abstraction Transaction Configuration
const txConfig = {
  account: userAddress,
  to: registryAddress,
  data: encodedCalldata,
  feeCurrency: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // USDm / cUSD Adapter
};
```

Under this model, network transaction fees are deducted directly from the user's USDm or USDC stablecoin balance. Users never see or interact with native CELO tokens.

---

## 4.3 The x402 Micropayment Protocol

The x402 protocol standardizes HTTP-level payments by utilizing the HTTP 402 Payment Required status code. It enables web APIs to request cryptographic micro-payments prior to fulfilling data requests.

```
[ Client App ]                         [ AgentPayAI Gateway ]             [ Celo Facilitator ]
      |                                           |                                |
      |--- 1. POST /api/chat -------------------->|                                |
      |<-- 2. HTTP 402 + Payment Parameters ------|                                |
      |                                           |                                |
      |--- 3. Sign EIP-712 Signature (USDC) ------>|                                |
      |                                           |--- 4. Verify & Settle -------->|
      |                                           |<-- 5. Settlement Receipt ------|
      |                                           |                                |
      |<-- 6. HTTP 200 OK + AI Response ----------|                                |
```

### Protocol Steps:
1. **Initial Request**: The client requests an AI completion at `/api/chat`.
2. **Challenge**: The Hono gateway intercepts the request and returns `HTTP 402 Payment Required`, specifying the price ($0.01 USDm), recipient wallet address, asset address, and EIP-712 domain configuration (`{ name: "USDC", version: "2" }`).
3. **Signing**: The client signs an offchain EIP-712 authorization using the wallet (`window.ethereum`).
4. **Settlement**: The gateway transmits the signed payload to the Celo Facilitator (`api.x402.celo.org`), which executes an onchain transfer to the service provider.
5. **Fulfillment**: Upon settlement confirmation, the gateway invokes the AI inference model (Google Gemini 2.5 Flash) and returns the completed payload to the client.

---

## 4.4 Cryptographic Identity (ERC-8004) and Attribution (ERC-8021)

### ERC-8004 Agent Identity
AgentPayAI registers onchain agent metadata descriptors conforming to ERC-8004 specifications:
- **Mainnet Identity Registry**: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- **Mainnet Reputation Registry**: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`

The protocol records post-execution ratings onchain, establishing transparent reputation benchmarks.

### ERC-8021 Builder Attribution
To track transaction origins for ecosystem leaderboards (such as Celo Proof of Ship Season 2 and BotChain Infrastructure Grants), AgentPayAI appends an immutable attribution suffix to transaction call data:

$$\text{Calldata}_{\text{Final}} = \text{Calldata}_{\text{Base}} \mathbin{\Vert} \text{Hex}(\text{"agentpay-ai"}) \mathbin{\Vert} \text{0x8021}$$

The suffix ends with the magic marker `0x8021`, allowing indexers to parse and attribute transaction volume deterministically.
