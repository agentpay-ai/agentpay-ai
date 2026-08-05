import test from "node:test";
import assert from "node:assert/strict";
import { generateChatResponse, enhanceImagePrompt, auditCodeSnippet } from "../src/lib/ai.js";

test("Claude AI - generateChatResponse returns non-empty string", async () => {
  const response = await generateChatResponse("Explain Celo stablecoin micropayments");
  assert.equal(typeof response, "string");
  assert.ok(response.length > 0);
});

test("Claude AI - enhanceImagePrompt returns enhanced text string", async () => {
  const prompt = "Cyberpunk robot on Celo";
  const enhanced = await enhanceImagePrompt(prompt);
  assert.equal(typeof enhanced, "string");
  assert.ok(enhanced.length > 0);
});

test("Claude AI - auditCodeSnippet returns structured audit result", async () => {
  const code = "contract SimpleVault { mapping(address => uint256) balances; }";
  const audit = await auditCodeSnippet(code);
  assert.equal(typeof audit.score, "string");
  assert.equal(typeof audit.vulnerabilities, "number");
  assert.ok(Array.isArray(audit.suggestions));
});
