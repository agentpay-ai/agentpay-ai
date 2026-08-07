# Chapter 4: x402 Micropayment Engine and EIP-3009 Protocol

## 4.1 The x402 Open Micropayment Standard

The **x402 protocol** ([x402.org](https://x402.org/)) is an open web standard that standardizes machine-readable micropayments over HTTP using the native `402 Payment Required` status code. 

In traditional Web2 architectures, digital services enforce access control via rigid monthly SaaS subscriptions, API keys tied to credit cards, or ad-supported tracking models. x402 replaces these friction-heavy gates with direct, sub-second micropayment challenges executed transparently over standard HTTP request headers.

AgentPayAI implements the `@x402/express` middleware on its API gateway to enforce pay-per-prompt access settled in native **$APAY** tokens on BotChain EVM.

---

## 4.2 EIP-3009 (Transfer With Authorization) Standard

**EIP-3009** specifies a standardized protocol for delegating ERC-20 token transfers via offchain EIP-712 signed authorizations (`transferWithAuthorization`, `receiveWithAuthorization`, and `cancelAuthorization`).

### Why EIP-3009 for $APAY?
1. **Gasless 1-Click Micropayments**: Users and autonomous software agents sign offchain EIP-712 payment authorizations in their web/bot wallet (`eth_signTypedData_v4`) without spending native gas or requiring separate gas approval steps.
2. **Parallel Nonce Execution**: Unlike EIP-2612 (which relies on sequential nonces), EIP-3009 utilizes random 32-byte nonces (`bytes32 nonce`). This allows autonomous agents to issue multiple parallel AI requests simultaneously without transaction ordering deadlocks.
3. **Sub-Second Response Latency**: The API gateway verifies the signature off-chain with BOF (`/verify`), executes the upstream AI prompt immediately, and settles the payment on-chain asynchronously (`/settle`), eliminating user wait time for block confirmations.

---

## 4.3 Production Protocol Execution Flow

```
[ Client / Bot UI ]          [ AgentPayAI Gateway ]          [ BOF Facilitator ]          [ APAYToken.sol (BotChain) ]
        |                               |                            |                                  |
        |--- 1. POST /api/chat -------->|                            |                                  |
        |<-- 2. HTTP 402 Challenge -----|                            |                                  |
        |    (Price: 1.0 $APAY)         |                            |                                  |
        |                               |                            |                                  |
        |--- 3. Sign EIP-712 Payload --->|                            |                                  |
        |    (eth_signTypedData_v4)     |                            |                                  |
        |                               |                            |                                  |
        |--- 4. POST + X-Payment ------->|                            |                                  |
        |    (base64 EIP-3009 Auth)     |--- 5. POST /verify ------->|                                  |
        |                               |<-- 6. Valid + Signer -----|                                  |
        |                               |                            |                                  |
        |                               |--- 7. Execute AI Prompt -->| (Anthropic Claude)               |
        |                               |<-- 8. Return AI Payload ---|                                  |
        |                               |                            |                                  |
        |<-- 9. Stream AI Response -----|                            |                                  |
        |                               |--- 10. POST /settle (Async)|                                  |
        |                               |                            |--- 11. transferWithAuth() ------>|
        |                               |                            |<-- 12. On-Chain Receipt ---------|
```

1. **Initial Unpaid Request**: The client or bot submits a request to `/api/chat` without a payment header.
2. **402 Challenge**: The gateway returns `HTTP 402 Payment Required` containing the `$APAY` token address, price (`1.0 $APAY`), recipient vault address, and network (`eip155:968`).
3. **EIP-712 Signature**: The client signs an EIP-3009 `TransferWithAuthorization` payload in their wallet (0 gas).
4. **Resend with Header**: The client resends the request with `X-Payment: base64(EIP3009AuthPayload)`.
5. **Off-Chain Verification**: The gateway forwards the header to the BOF facilitator `/verify` endpoint to verify the EIP-712 signature and timestamp window off-chain in milliseconds.
6. **Immediate Fulfillment**: The gateway executes the upstream Anthropic Claude AI inference model and returns the result back to the user instantly.
7. **Asynchronous Settlement**: The gateway invokes BOF `/settle` asynchronously, broadcasting `transferWithAuthorization` on BotChain EVM without blocking the user response.

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
