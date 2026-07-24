import test from "node:test";
import assert from "node:assert/strict";
import { getAgentPayMetadata, validateAgentMetadata, formatReputationSummary } from "../src/lib/erc8004.js";

test("ERC-8004 Metadata - getAgentPayMetadata produces valid agent metadata", () => {
  const metadata = getAgentPayMetadata();
  assert.equal(metadata.type, "Agent");
  assert.equal(metadata.name, "AgentPay AI");
  assert.ok(Array.isArray(metadata.endpoints));
  assert.ok(metadata.endpoints.some((e) => e.type === "a2a"));
  assert.ok(metadata.endpoints.some((e) => e.type === "x402"));
  assert.ok(metadata.endpoints.some((e) => e.type === "wallet"));
  assert.ok(validateAgentMetadata(metadata));
});

test("ERC-8004 Metadata Validator - rejects invalid metadata objects", () => {
  assert.equal(validateAgentMetadata(null), false);
  assert.equal(validateAgentMetadata({ type: "User" }), false);
  assert.equal(validateAgentMetadata({ type: "Agent", endpoints: [] }), false);
});

test("ERC-8004 Reputation - formatReputationSummary formats score and reviews", () => {
  const summary = formatReputationSummary(98, 142);
  assert.equal(summary.score, 98);
  assert.equal(summary.totalReviews, 142);
  assert.equal(summary.ratingText, "98/100");
  assert.equal(summary.isVerified, true);
});
