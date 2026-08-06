import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeAnthropicResponse,
  parseAuditJson,
  classifyError,
  getActiveModel,
  AIGatewayError,
} from "../src/lib/ai.js";

// ─── normalizeAnthropicResponse ───────────────────────────────────────────────
// These run without network access: the point is that a broken gateway is detectable,
// which the previous `typeof === "string"` assertions could never catch.

test("normalize: standard SDK object with a single text block", () => {
  const result = normalizeAnthropicResponse({
    content: [{ type: "text", text: "Hello from Claude" }],
    usage: { input_tokens: 10, output_tokens: 5 },
    stop_reason: "end_turn",
  });

  assert.equal(result.text, "Hello from Claude");
  assert.equal(result.inputTokens, 10);
  assert.equal(result.outputTokens, 5);
  assert.equal(result.truncated, false);
});

test("normalize: AgentRouter returns the payload as a JSON string", () => {
  const raw = JSON.stringify({
    content: [{ type: "text", text: "Routed response" }],
    usage: { input_tokens: 172, output_tokens: 367 },
  });

  const result = normalizeAnthropicResponse(raw);
  assert.equal(result.text, "Routed response");
  assert.equal(result.inputTokens, 172);
  assert.equal(result.outputTokens, 367);
});

test("normalize: double-encoded JSON string still parses", () => {
  const raw = JSON.stringify(JSON.stringify({ content: [{ type: "text", text: "Nested" }] }));
  assert.equal(normalizeAnthropicResponse(raw).text, "Nested");
});

test("normalize: joins every text block rather than only the first", () => {
  const result = normalizeAnthropicResponse({
    content: [
      { type: "text", text: "First part." },
      { type: "text", text: "Second part." },
      { type: "text", text: "Third part." },
    ],
  });

  assert.equal(result.text, "First part.\nSecond part.\nThird part.");
});

test("normalize: ignores non-text blocks", () => {
  const result = normalizeAnthropicResponse({
    content: [
      { type: "thinking", thinking: "internal reasoning" },
      { type: "text", text: "Visible answer" },
    ],
  });

  assert.equal(result.text, "Visible answer");
});

test("normalize: gateway error body throws instead of passing as success", () => {
  assert.throws(
    () => normalizeAnthropicResponse({ error: { message: "该令牌无权访问模型 claude-opus-5" } }),
    (err: unknown) => err instanceof AIGatewayError && /无权访问模型/.test((err as Error).message)
  );
});

test("normalize: string-form error body throws", () => {
  assert.throws(
    () => normalizeAnthropicResponse(JSON.stringify({ error: "insufficient quota" })),
    (err: unknown) => err instanceof AIGatewayError
  );
});

test("normalize: response with no text content throws rather than returning a placeholder", () => {
  assert.throws(
    () => normalizeAnthropicResponse({ content: [] }),
    (err: unknown) => err instanceof AIGatewayError && (err as AIGatewayError).errorType === "empty_response"
  );
});

test("normalize: whitespace-only text is treated as empty", () => {
  assert.throws(
    () => normalizeAnthropicResponse({ content: [{ type: "text", text: "   \n  " }] }),
    (err: unknown) => err instanceof AIGatewayError
  );
});

test("normalize: flags truncation when stop_reason is max_tokens", () => {
  const result = normalizeAnthropicResponse({
    content: [{ type: "text", text: "Cut off mid-sen" }],
    stop_reason: "max_tokens",
  });

  assert.equal(result.truncated, true);
});

test("normalize: counts cache tokens toward input usage", () => {
  const result = normalizeAnthropicResponse({
    content: [{ type: "text", text: "Cached" }],
    usage: {
      input_tokens: 10,
      cache_creation_input_tokens: 100,
      cache_read_input_tokens: 50,
      output_tokens: 7,
    },
  });

  assert.equal(result.inputTokens, 160);
  assert.equal(result.outputTokens, 7);
});

test("normalize: a bare non-JSON string body is the model's text", () => {
  const result = normalizeAnthropicResponse("plain text reply");
  assert.equal(result.text, "plain text reply");
});

test("normalize: HTML WAF captcha challenge throws network error", () => {
  const html = '<!doctype html><meta charset="UTF-8"><meta name="aliyunwafaa" content="ff926c7f07e45e2e487a29a6197d3460">';
  assert.throws(
    () => normalizeAnthropicResponse(html),
    (err: unknown) => err instanceof AIGatewayError && /Aliyun WAF captcha/.test((err as Error).message)
  );
});

test("normalize: a JSON scalar is rejected, not silently emptied", () => {
  assert.throws(
    () => normalizeAnthropicResponse("42"),
    (err: unknown) => err instanceof AIGatewayError
  );
});

// ─── parseAuditJson ───────────────────────────────────────────────────────────

test("audit parse: extracts a well-formed verdict", () => {
  const audit = parseAuditJson(
    '{"score":"B","vulnerabilities":2,"summary":"Reentrancy risk","suggestions":["Add nonReentrant","Check effects order"]}'
  );

  assert.ok(audit);
  assert.equal(audit.score, "B");
  assert.equal(audit.vulnerabilities, 2);
  assert.equal(audit.suggestions.length, 2);
});

test("audit parse: tolerates markdown fences and surrounding prose", () => {
  const audit = parseAuditJson(
    'Here is the audit:\n```json\n{"score":"A","vulnerabilities":0,"summary":"Clean","suggestions":[]}\n```\nHope this helps!'
  );

  assert.ok(audit);
  assert.equal(audit.score, "A");
  assert.equal(audit.vulnerabilities, 0);
});

test("audit parse: rejects unparseable output instead of inventing a score", () => {
  assert.equal(parseAuditJson("The contract looks fine to me."), null);
});

test("audit parse: rejects a verdict missing required fields", () => {
  assert.equal(parseAuditJson('{"summary":"no score or count here"}'), null);
  assert.equal(parseAuditJson('{"score":"A"}'), null);
});

// ─── classifyError ────────────────────────────────────────────────────────────

test("classify: 401 and 403 are auth failures", () => {
  assert.equal(classifyError({ status: 401 }), "auth");
  assert.equal(classifyError({ status: 403, message: "该令牌无权访问模型" }), "auth");
});

test("classify: 404 is an invalid model", () => {
  assert.equal(classifyError({ status: 404, message: "model not found" }), "invalid_model");
});

test("classify: timeouts are distinguishable from network errors", () => {
  assert.equal(classifyError({ name: "APIConnectionTimeoutError", message: "timed out" }), "timeout");
  assert.equal(classifyError({ message: "ECONNREFUSED" }), "network");
  assert.equal(classifyError({ status: 502 }), "network");
});

test("classify: unrecognized failures fall through to unknown", () => {
  assert.equal(classifyError({ message: "something odd" }), "unknown");
});

// ─── model resolution ─────────────────────────────────────────────────────────

test("getActiveModel: honours ANTHROPIC_MODEL and defaults to claude-opus-5", () => {
  const original = process.env.ANTHROPIC_MODEL;
  try {
    process.env.ANTHROPIC_MODEL = "claude-opus-4-8";
    assert.equal(getActiveModel(), "claude-opus-4-8");

    delete process.env.ANTHROPIC_MODEL;
    assert.equal(getActiveModel(), "claude-opus-5");
  } finally {
    if (original === undefined) delete process.env.ANTHROPIC_MODEL;
    else process.env.ANTHROPIC_MODEL = original;
  }
});
