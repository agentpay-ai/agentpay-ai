# Chapter 4: x402 Micropayment Engine and EIP-3009 Protocol

## 4.1 The x402 Open Micropayment Standard

The **x402 protocol** ([x402.org](https://x402.org/)) is an open web standard that standardizes machine-readable micropayments over HTTP using the native `402 Payment Required` status code. 

In traditional Web2 architectures, digital services enforce access control via rigid monthly SaaS subscriptions, API keys tied to credit cards, or ad-supported tracking models. x402 replaces these friction-heavy gates with direct, sub-second micropayment challenges executed transparently over standard HTTP request headers.

AgentPayAI implements the `@x402/express` middleware on its API gateway to enforce pay-per-prompt access settled in native **$APAY** tokens on BotChain.

---

## 4.2 EIP-3009 (Transfer With Authorization) Standard

**EIP-3009** specifies a standardized protocol for delegating ERC-20 token transfers via offchain EIP-712 signed authorizations (`transferWithAuthorization`, `receiveWithAuthorization`, and `cancelAuthorization`).

### Why EIP-3009 for $APAY?
1. **Gasless Micropayments**: Users and autonomous software agents sign offchain EIP-712 payment authorizations in their web/bot wallet without spending native gas or sending onchain transactions directly.
2. **Parallel Nonce Execution**: Unlike EIP-2612 (which relies on sequential nonces), EIP-3009 utilizes random 32-byte nonces (`bytes32 nonce`). This allows autonomous agents to issue multiple parallel AI requests simultaneously without transaction ordering deadlocks.
3. **1-Click Native Settlement**: The x402 Facilitator receives the signed authorization from the request header and invokes `$APAY.transferWithAuthorization` on BotChain to settle the exact payment onchain in a single atomic call.

---

## 4.3 Protocol Execution Steps

```
[ Client / Bot ]            [ AgentPayAI Gateway ]          [ x402 Facilitator ]          [ APAYToken.sol (BotChain) ]
       |                               |                             |                                  |
       |--- 1. POST /api/chat -------->|                             |                                  |
       |<-- 2. HTTP 402 Challenge -----|                             |                                  |
       |    (Price: 1.0 $APAY)         |                             |                                  |
       |                               |                             |                                  |
       |--- 3. Sign EIP-712 Payload --->|                             |                                  |
       |    (transferWithAuthorization)|                             |                                  |
       |                               |                             |                                  |
       |--- 4. POST + X-PAYMENT ------>|                             |                                  |
       |                               |--- 5. Verify & Settle ----->|                                  |
       |                               |                             |--- 6. transferWithAuth() ------->|
       |                               |                             |<-- 7. Event Transfer ------------|
       |<-- 8. Return AI Response -----|<-- 9. Settlement Confirmed -|                                  |
```

1. **Initial Request**: The client or autonomous bot issues an unpaid HTTP request (e.g. `POST /api/chat`).
2. **Challenge**: The gateway returns `HTTP 402 Payment Required`, specifying the `$APAY` token asset address, price (1.0 `$APAY`), recipient vault address, and `exact` payment scheme.
3. **EIP-712 Signature**: The client signs a typed `TransferWithAuthorization` payload containing `from`, `to`, `value`, `validAfter`, `validBefore`, and a unique random 32-byte `nonce`.
4. **Onchain Settlement**: The gateway forwards the signature to the x402 Facilitator, which calls `$APAY.transferWithAuthorization` on BotChain.
5. **Payload Fulfillment**: Upon settlement, the gateway invokes the Anthropic Claude AI inference model (`claude-opus-5`) and streams the result back to the client.

---

## 4.4 Cryptographic Identity (ERC-8004) and Builder Attribution (ERC-8021)

### ERC-8004 Agent Identity & Trust Registry
AgentPayAI integrates onchain agent metadata descriptors conforming to ERC-8004 specifications:
- **Mainnet Identity Registry**: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- **Mainnet Reputation Registry**: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`

The protocol records post-execution feedback onchain, establishing transparent trust scores for autonomous bot delegation.

### ERC-8021 Builder Attribution
To track transaction origins for ecosystem telemetry and BotChain Infrastructure Grants, AgentPayAI appends an immutable attribution suffix to transaction call data:

$$
\text{Calldata}_{\text{Final}} = \text{Calldata}_{\text{Base}} \mathbin{\Vert} \text{Hex}(\text{"agentpay-ai"}) \mathbin{\Vert} \text{0x8021}
$$

The suffix ends with the magic marker `0x8021`, allowing indexers to attribute transaction volume deterministically.
