import test from "node:test";
import assert from "node:assert/strict";
import {
  generateChatResponse,
  enhanceImagePrompt,
  auditCodeSnippet,
  __resetClientCache,
} from "../src/lib/ai.js";

/**
 * With no key configured, every entry point must report failure rather than returning
 * plausible-looking prose. The previous implementation returned canned strings here, which
 * is what made a misconfigured gateway look like a working chat.
 */

function withoutKey<T>(fn: () => Promise<T>): Promise<T> {
  const original = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  __resetClientCache();

  return fn().finally(() => {
    if (original === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = original;
    __resetClientCache();
  });
}

test("no key: generateChatResponse fails instead of echoing the prompt back", async () => {
  const result = await withoutKey(() => generateChatResponse("Explain BotChain micropayments"));

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.errorType, "no_key");
  // The old fallback embedded the prompt in a fake answer — make sure that cannot recur.
  assert.doesNotMatch(result.error, /micropayments/i);
});

test("no key: enhanceImagePrompt fails instead of returning a synthesized prompt", async () => {
  const result = await withoutKey(() => enhanceImagePrompt("Cyberpunk robot"));

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.errorType, "no_key");
});

test("no key: auditCodeSnippet never reports a passing grade", async () => {
  const result = await withoutKey(() =>
    auditCodeSnippet("contract Vault { function withdraw() external { msg.sender.call{value: 1}(''); } }")
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.errorType, "no_key");
  // Regression guard: the old code returned score "A+" with 0 vulnerabilities on failure.
  assert.ok(!("audit" in result), "a failed audit must not carry a verdict");
});

test("placeholder key is treated as no key", async () => {
  const original = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "your_anthropic_claude_api_key_here";
  __resetClientCache();

  try {
    const result = await generateChatResponse("hello");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.errorType, "no_key");
  } finally {
    if (original === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = original;
    __resetClientCache();
  }
});
