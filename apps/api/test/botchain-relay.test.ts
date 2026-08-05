import test from "node:test";
import assert from "node:assert/strict";
import { botChainRelayRoute } from "../src/routes/botchain-relay.js";

test("BotChain Agent Relay - Missing service returns 400 with supported services list", async () => {
  const req = new Request("http://localhost/botchain/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const res = await botChainRelayRoute.request(req);
  assert.equal(res.status, 400);

  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.error.includes("Missing required 'service'"));
  assert.ok(Array.isArray(data.supportedServices));
  assert.ok(data.supportedServices.includes("chat"));
});

test("BotChain Agent Relay - Unsupported service returns 400", async () => {
  const req = new Request("http://localhost/botchain/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: "unknown_service" }),
  });

  const res = await botChainRelayRoute.request(req);
  assert.equal(res.status, 400);

  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.error.includes("Unsupported service"));
});

test("BotChain Agent Relay - Dispatches 'chat' service request with agentId and maxCostUSDm", async () => {
  const req = new Request("http://localhost/botchain/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "0xc035A9b2200CfEcB69f25118fC54B65beA56Cf67",
      service: "chat",
      maxCostUSDm: 50,
      payload: { prompt: "Explain BotChain EVM autonomous agent settlement." },
    }),
  });

  const res = await botChainRelayRoute.request(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.network, "botchain");
  assert.equal(data.service, "chat");
  assert.equal(data.agentId, "0xc035A9b2200CfEcB69f25118fC54B65beA56Cf67");
  assert.equal(data.maxCostUSDm, 50);
  assert.ok(typeof data.vaultAddress === "string");
  assert.ok(typeof data.result === "string");
  assert.ok(data.result.length > 0);
});

test("BotChain Agent Relay - Dispatches 'image' service request", async () => {
  const req = new Request("http://localhost/botchain/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: "image",
      params: { prompt: "Futuristic AI Payment Gateway" },
    }),
  });

  const res = await botChainRelayRoute.request(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.service, "image");
  assert.ok(typeof data.result === "string");
});

test("BotChain Agent Relay - Dispatches 'code' service request", async () => {
  const req = new Request("http://localhost/botchain/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: "code",
      params: { code: "contract AgentPay { function pay() external payable {} }" },
    }),
  });

  const res = await botChainRelayRoute.request(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.service, "code");
  assert.ok(typeof data.result === "object");
  assert.ok("score" in (data.result as Record<string, unknown>));
});

test("BotChain Agent Relay - Dispatches 'reputation' service request with score", async () => {
  const req = new Request("http://localhost/botchain/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "0x903a72f5C79fdeBbc5928c19fe757AC304EC09Ae",
      service: "reputation",
    }),
  });

  const res = await botChainRelayRoute.request(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.service, "reputation");
  assert.equal((data.result as { reputationScore: number }).reputationScore, 100);
});

test("BotChain Agent Relay - Dispatches 'attribution' service request", async () => {
  const req = new Request("http://localhost/botchain/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: "attribution",
      params: { calldata: "0xa9059cbb" },
    }),
  });

  const res = await botChainRelayRoute.request(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.service, "attribution");
  assert.equal((data.result as { attributionTag: string }).attributionTag, "0x8021");
});
