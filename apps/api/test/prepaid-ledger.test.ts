import test from "node:test";
import assert from "node:assert/strict";
import {
  _resetLedgerForTests,
  creditPrepaid,
  debitPrepaid,
  getPrepaidBalance,
  issueSessionToken,
  verifySessionToken,
} from "../src/lib/prepaid-ledger.js";

test("prepaid ledger credits and debits", () => {
  _resetLedgerForTests();
  const addr = "0xabc0000000000000000000000000000000000001";
  creditPrepaid(addr, BigInt(100_000), "0x" + "11".repeat(32));
  assert.equal(getPrepaidBalance(addr), BigInt(100_000));
  debitPrepaid(addr, BigInt(10_000));
  assert.equal(getPrepaidBalance(addr), BigInt(90_000));
});

test("prepaid ledger rejects double-credit of same deposit tx", () => {
  _resetLedgerForTests();
  const addr = "0xabc0000000000000000000000000000000000002";
  const tx = "0x" + "22".repeat(32);
  creditPrepaid(addr, BigInt(50_000), tx);
  assert.throws(() => creditPrepaid(addr, BigInt(1), tx), /already credited/i);
});

test("prepaid ledger rejects overdraft", () => {
  _resetLedgerForTests();
  const addr = "0xabc0000000000000000000000000000000000003";
  creditPrepaid(addr, BigInt(5_000), "0x" + "33".repeat(32));
  assert.throws(() => debitPrepaid(addr, BigInt(10_000)), /Insufficient prepaid/i);
});

test("session tokens round-trip and expire check", () => {
  _resetLedgerForTests();
  const addr = "0xABC0000000000000000000000000000000000004";
  const token = issueSessionToken(addr, 3600);
  const payload = verifySessionToken(token);
  assert.equal(payload.address, addr.toLowerCase());
  assert.ok(payload.exp > Math.floor(Date.now() / 1000));
});

test("session tokens reject tampering", () => {
  _resetLedgerForTests();
  const token = issueSessionToken("0xabc0000000000000000000000000000000000005", 3600);
  const bad = token.slice(0, -4) + "dead";
  assert.throws(() => verifySessionToken(bad), /Invalid session/i);
});
