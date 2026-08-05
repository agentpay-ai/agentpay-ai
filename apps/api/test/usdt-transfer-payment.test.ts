import test from "node:test";
import assert from "node:assert/strict";
import {
  amountForPaidRoute,
  _resetSpentTxHashesForTests,
  verifyUsdtTransferPayment,
} from "../src/lib/usdt-transfer-payment.js";

const prices = {
  "POST /api/chat": "10000",
  "POST /api/image": "50000",
  "POST /api/code": "20000",
  "POST /api/botchain/relay": "10000",
};

test("amountForPaidRoute maps paid tool routes", () => {
  assert.equal(amountForPaidRoute("POST", "/api/chat", prices), 10000n);
  assert.equal(amountForPaidRoute("POST", "/api/image", prices), 50000n);
  assert.equal(amountForPaidRoute("POST", "/api/code", prices), 20000n);
  assert.equal(amountForPaidRoute("post", "/api/chat/", prices), 10000n);
});

test("amountForPaidRoute ignores free routes", () => {
  assert.equal(amountForPaidRoute("GET", "/api/health", prices), null);
  assert.equal(amountForPaidRoute("POST", "/api/reputation", prices), null);
});

test("verifyUsdtTransferPayment rejects malformed tx hashes", async () => {
  _resetSpentTxHashesForTests();
  await assert.rejects(
    () =>
      verifyUsdtTransferPayment({
        txHash: "not-a-hash",
        usdtAddress: "0x75edC9335175Fc0552D51D48439F229c10420fe3",
        payTo: "0xc1eBB154EFf9bf9c08e39978E1447cC05e726dC6",
        minAmountAtomic: 10000n,
        chainId: 968,
        rpcUrl: "https://rpc.bohr.life",
      }),
    /Invalid payment transaction hash/
  );
});
