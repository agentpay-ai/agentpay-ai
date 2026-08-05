import test from "node:test";
import assert from "node:assert/strict";
import { generateChatResponse, enhanceImagePrompt, auditCodeSnippet } from "../src/lib/ai.js";
import { appendAttributionTag, verifyAttributionTag } from "../src/lib/attribution.js";

/**
 * These exercise the shapes the routes actually consume. They assert the discriminated union
 * holds in both directions, so they are meaningful with or without a reachable gateway —
 * the old versions asserted `typeof === "string"`, which every fallback string satisfied.
 */

test("UI & Tool Workflows - chat returns a discriminated result, never bare prose", async () => {
  const result = await generateChatResponse("Explain smart contracts");

  if (result.ok) {
    assert.equal(typeof result.text, "string");
    assert.ok(result.text.length > 0);
    assert.equal(typeof result.model, "string");
    assert.equal(typeof result.inputTokens, "number");
  } else {
    assert.equal(typeof result.errorType, "string");
    assert.equal(typeof result.error, "string");
  }
});

test("UI & Tool Workflows - image enhancement returns a discriminated result", async () => {
  const result = await enhanceImagePrompt("Cyberpunk city");

  if (result.ok) {
    assert.equal(typeof result.text, "string");
    assert.ok(result.text.length > 0);
  } else {
    assert.equal(typeof result.errorType, "string");
  }
});

test("UI & Tool Workflows - code audit carries a verdict only on success", async () => {
  const result = await auditCodeSnippet("function transfer() public {}");

  if (result.ok) {
    assert.equal(typeof result.audit.score, "string");
    assert.equal(typeof result.audit.vulnerabilities, "number");
    assert.ok(Array.isArray(result.audit.suggestions));
  } else {
    // A failed audit must not smuggle a score through.
    assert.ok(!("audit" in result));
    assert.equal(typeof result.errorType, "string");
  }
});

test("UI & Tool Workflows - Attribution tag attaches seamlessly to transaction calldata", () => {
  const calldata = appendAttributionTag("0xa9059cbb");
  assert.ok(verifyAttributionTag(calldata));
});
