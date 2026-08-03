# Chapter 4: Celo MiniPay and x402 Micropayment Engine

## 4.1 Celo MiniPay Ecosystem Integration

Celo MiniPay is a mobile-first Web3 wallet embedded within the Opera Mini browser, specifically architected for fast, frictionless stablecoin transactions in high-growth emerging markets. MiniPay abstracts blockchain complexity through automated wallet creation, phone number mapping, and local fiat cash-in/cash-out rails.

AgentPayAI leverages MiniPay as its primary consumer interface, enabling millions of mobile users across Africa, Asia, and Latin America to access advanced AI models without requiring credit cards or monthly subscriptions.

---

## 4.2 CIP-64 Gas Fee Abstraction

A primary friction point in Web3 user experience is the requirement for users to hold native gas tokens (such as CELO or ETH) to execute transactions.

AgentPayAI natively supports **CIP-64 (Celo Improvement Proposal 64)**, which enables transaction gas fees to be paid directly in ERC-20 stablecoins (such as **USDm** or **cUSD**).

### Technical Benefits of CIP-64:
- **Zero Native Gas Requirement**: Users only hold stablecoins in their MiniPay balance.
- **Automated Gas Payment**: Gas is deducted seamlessly from the user's stablecoin balance during payment settlement.
- **Predictable Sub-Cent Fees**: Transaction gas fees on Celo average less than **\$0.001 USDm** per prompt execution.

---

## 4.3 x402 HTTP Micropayment Engine

The **x402 protocol** ([x402.org](https://x402.org/)) is an open web standard that standardizes machine-readable micropayments over HTTP using the native `402 Payment Required` status code.

AgentPayAI implements the `@x402/hono` middleware on its API gateway to enforce sub-cent pay-per-prompt access.

### Protocol Steps:
1. **Initial Request**: The client requests an AI completion at `/api/chat`.
2. **Challenge**: The Hono gateway intercepts the request and returns `HTTP 402 Payment Required`, specifying the price (\$0.01 USDm), recipient wallet address, asset address, and EIP-712 domain configuration (`{ name: "USDC", version: "2" }`).
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

$$
\text{Calldata}_{\text{Final}} = \text{Calldata}_{\text{Base}} \mathbin{\Vert} \text{Hex}(\text{"agentpay-ai"}) \mathbin{\Vert} \text{0x8021}
$$

The suffix ends with the magic marker `0x8021`, allowing indexers to parse and attribute transaction volume deterministically.
