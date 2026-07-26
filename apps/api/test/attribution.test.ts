import test from "node:test";
import assert from "node:assert/strict";
import { appendAttributionTag, verifyAttributionTag, ERC8021_MAGIC_TAG } from "../src/lib/attribution.js";

test("ERC-8021 Attribution - appendAttributionTag appends magic tag 0x8021", () => {
  const tagged = appendAttributionTag("0x123456");
  assert.ok(tagged.startsWith("0x123456"));
  assert.ok(tagged.endsWith("8021"));
  assert.equal(verifyAttributionTag(tagged), true);
});

test("ERC-8021 Attribution - verifyAttributionTag rejects untagged data", () => {
  assert.equal(verifyAttributionTag("0x123456"), false);
  assert.equal(verifyAttributionTag(""), false);
  assert.equal(verifyAttributionTag("0x"), false);
});

test("ERC-8021 Attribution - handles empty calldata gracefully", () => {
  const tagged = appendAttributionTag("0x");
  assert.ok(tagged.endsWith("8021"));
  assert.equal(verifyAttributionTag(tagged), true);
});
