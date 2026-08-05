import test from "node:test";
import assert from "node:assert/strict";
import { generateChatResponse, enhanceImagePrompt, auditCodeSnippet } from "../src/lib/ai.js";
import { appendAttributionTag, verifyAttributionTag } from "../src/lib/attribution.js";

test("UI & Tool Workflows - Chat prompt payload generates valid text response", async () => {
  const chatOutput = await generateChatResponse("Explain smart contracts");
  assert.ok(typeof chatOutput === "string");
  assert.ok(chatOutput.length > 0);
});

test("UI & Tool Workflows - Image prompt payload generates enhanced prompt", async () => {
  const imageOutput = await enhanceImagePrompt("Cyberpunk city");
  assert.ok(typeof imageOutput === "string");
  assert.ok(imageOutput.length > 0);
});

test("UI & Tool Workflows - Code audit payload returns structured JSON analysis", async () => {
  const codeAudit = await auditCodeSnippet("function transfer() public {}");
  assert.ok(typeof codeAudit === "object");
  assert.ok(codeAudit !== null);
  assert.ok("score" in codeAudit);
  assert.ok("vulnerabilities" in codeAudit);
});

test("UI & Tool Workflows - Attribution tag attaches seamlessly to transaction calldata", () => {
  const calldata = appendAttributionTag("0xa9059cbb");
  assert.ok(verifyAttributionTag(calldata));
});
