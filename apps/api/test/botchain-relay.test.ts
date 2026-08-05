import test from "node:test";
import assert from "node:assert/strict";
import { botChainRelayRoute } from "../src/routes/botchain-relay.js";

function relayRequest(body: unknown): Request {
  return new Request("http://localhost/botchain/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * AI-backed services depend on a configured gateway, which tests do not assume. Each such case
 * asserts one of two valid outcomes: a well-formed success, or a well-formed failure. What must
 * never happen is a 200 carrying fabricated content.
 */
async function assertSuccessOrCleanFailure(
  res: Response,
  onSuccess: (result: Record<string, unknown>) => void
): Promise<void> {
  const data = await res.json();

  if (res.status === 200) {
    assert.equal(data.success, true);
    onSuccess(data.result as Record<string, unknown>);
    return;
  }

  assert.ok(res.status >= 500, `expected success or a 5xx, received ${res.status}`);
  assert.equal(data.success, false);
  assert.equal(typeof data.errorType, "string");
  assert.equal(typeof data.hint, "string");
}

test("BotChain Agent Relay - Missing service returns 400 with supported services list", async () => {
  const res = await botChainRelayRoute.request(relayRequest({}));
  assert.equal(res.status, 400);

  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.error.includes("Missing required 'service'"));
  assert.ok(Array.isArray(data.supportedServices));
  assert.ok(data.supportedServices.includes("chat"));
});

test("BotChain Agent Relay - Unsupported service returns 400", async () => {
  const res = await botChainRelayRoute.request(relayRequest({ service: "unknown_service" }));
  assert.equal(res.status, 400);

  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.error.includes("Unsupported service"));
});

test("BotChain Agent Relay - Rejects a malformed agentId", async () => {
  const res = await botChainRelayRoute.request(
    relayRequest({ service: "attribution", agentId: "not-an-address" })
  );
  assert.equal(res.status, 400);

  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.error.includes("agentId"));
});

test("BotChain Agent Relay - Enforces the declared maxCostUSDm ceiling", async () => {
  // 'image' costs 50 USDm; a ceiling of 10 must be refused rather than silently ignored.
  const res = await botChainRelayRoute.request(
    relayRequest({ service: "image", maxCostUSDm: 10, params: { prompt: "anything" } })
  );

  assert.equal(res.status, 402);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.serviceCostUSDm, 50);
  assert.equal(data.maxCostUSDm, 10);
});

test("BotChain Agent Relay - Rejects a negative maxCostUSDm", async () => {
  const res = await botChainRelayRoute.request(
    relayRequest({ service: "attribution", maxCostUSDm: -5 })
  );
  assert.equal(res.status, 400);
});

test("BotChain Agent Relay - Rejects a chat request with a non-string prompt", async () => {
  const res = await botChainRelayRoute.request(
    relayRequest({ service: "chat", params: { prompt: 12345 } })
  );

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.error.includes("must be a string"));
});

test("BotChain Agent Relay - Dispatches 'chat' with agentId and maxCostUSDm", async () => {
  const res = await botChainRelayRoute.request(
    relayRequest({
      agentId: "0xc035A9b2200CfEcB69f25118fC54B65beA56Cf67",
      service: "chat",
      maxCostUSDm: 50,
      payload: { prompt: "Explain BotChain EVM autonomous agent settlement." },
    })
  );

  await assertSuccessOrCleanFailure(res, (result) => {
    assert.equal(typeof result.response, "string");
    assert.ok((result.response as string).length > 0);
    assert.equal(typeof result.model, "string");
  });
});

test("BotChain Agent Relay - Dispatches 'image'", async () => {
  const res = await botChainRelayRoute.request(
    relayRequest({ service: "image", params: { prompt: "Futuristic AI Payment Gateway" } })
  );

  await assertSuccessOrCleanFailure(res, (result) => {
    assert.equal(typeof result.enhancedPrompt, "string");
  });
});

test("BotChain Agent Relay - Dispatches 'code' and returns a structured audit", async () => {
  const res = await botChainRelayRoute.request(
    relayRequest({
      service: "code",
      params: { code: "contract AgentPay { function pay() external payable {} }" },
    })
  );

  await assertSuccessOrCleanFailure(res, (result) => {
    const audit = result.audit as Record<string, unknown>;
    assert.ok(audit, "a successful code audit must carry an audit object");
    assert.equal(typeof audit.score, "string");
    assert.equal(typeof audit.vulnerabilities, "number");
  });
});

test("BotChain Agent Relay - 'reputation' does not report an unverified score", async () => {
  const res = await botChainRelayRoute.request(
    relayRequest({ agentId: "0x903a72f5C79fdeBbc5928c19fe757AC304EC09Ae", service: "reputation" })
  );

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.service, "reputation");

  const result = data.result as { reputationScore: number | null; reputationSource: string };
  // The previous hardcoded 100 asserted a trust level nothing had verified.
  assert.equal(result.reputationScore, null);
  assert.equal(result.reputationSource, "unimplemented");
});

test("BotChain Agent Relay - Dispatches 'attribution'", async () => {
  const res = await botChainRelayRoute.request(
    relayRequest({ service: "attribution", params: { calldata: "0xa9059cbb" } })
  );

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.service, "attribution");
  assert.equal((data.result as { attributionTag: string }).attributionTag, "0x8021");
});
