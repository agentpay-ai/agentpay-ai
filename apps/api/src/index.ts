import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { paymentMiddleware } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { x402ResourceServer, RoutesConfig } from "@x402/core/server";
import { facilitator } from "./x402-facilitator.js";
import { chatRoute } from "./routes/chat.js";
import { imageRoute } from "./routes/image.js";
import { codeRoute } from "./routes/code.js";
import { reputationRoute } from "./routes/reputation.js";
import { attributionRoute } from "./routes/attribution.js";
import { botChainRelayRoute } from "./routes/botchain-relay.js";
import { createCreditsRoute } from "./routes/credits.js";
import { getActiveModel } from "./lib/ai.js";
import {
  amountForPaidRoute,
  PAYMENT_TX_HEADER,
  verifyUsdtTransferPayment,
} from "./lib/usdt-transfer-payment.js";
import { trySessionPayment } from "./lib/session-payment.js";
import { activity } from "./lib/activity-log.js";

config();

const app = new Hono();

app.use("*", cors());
app.use("*", logger());

const rawNetwork = process.env.X402_NETWORK ?? "testnet";
if (rawNetwork !== "testnet" && rawNetwork !== "mainnet") {
  console.error(`✗ X402_NETWORK must be "testnet" or "mainnet", received "${rawNetwork}"`);
  process.exit(1);
}
if (!process.env.X402_NETWORK) {
  console.warn('⚠️  X402_NETWORK is not set — defaulting to "testnet"');
}

const isMainnet = rawNetwork === "mainnet";

const botChainTestnetCaip = "eip155:968" as const;
const botChainMainnetCaip = "eip155:677" as const;
const activeBotChainCaip = isMainnet ? botChainMainnetCaip : botChainTestnetCaip;
const activeChainId = isMainnet ? 677 : 968;
const activeRpcUrl = isMainnet
  ? process.env.BOTCHAIN_RPC_URL || "https://rpc.botchain.ai"
  : process.env.BOTCHAIN_RPC_URL || "https://rpc.bohr.life";

const usdtAddress = (
  isMainnet
    ? "0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C"
    : "0x75edC9335175Fc0552D51D48439F229c10420fe3"
) as `0x${string}`;

const defaultProxyVaultAddress =
  "0xc1eBB154EFf9bf9c08e39978E1447cC05e726dC6" as `0x${string}`;

const payToAddress =
  (process.env.PAYMENT_RECIPIENT_ADDRESS as `0x${string}`) ||
  defaultProxyVaultAddress;

const server = new x402ResourceServer(facilitator);
server.register(activeBotChainCaip, new ExactEvmScheme());

const extraNetworks = (process.env.X402_EXTRA_NETWORKS ?? "")
  .split(",")
  .map((n) => n.trim())
  .filter(Boolean);
for (const network of extraNetworks) {
  server.register(network as `${string}:${string}`, new ExactEvmScheme());
}

const routePrices: Record<string, string> = {
  "POST /api/chat": "10000",
  "POST /api/image": "50000",
  "POST /api/code": "20000",
  "POST /api/botchain/relay": "10000",
};

const routes: RoutesConfig = {
  "POST /api/chat": {
    accepts: {
      scheme: "exact",
      network: activeBotChainCaip,
      payTo: payToAddress,
      price: {
        amount: routePrices["POST /api/chat"],
        asset: usdtAddress,
        extra: { name: "USDT", version: "1" },
      },
    },
    description: "Claude AI Chat Prompt ($0.01 USDT)",
  },
  "POST /api/image": {
    accepts: {
      scheme: "exact",
      network: activeBotChainCaip,
      payTo: payToAddress,
      price: {
        amount: routePrices["POST /api/image"],
        asset: usdtAddress,
        extra: { name: "USDT", version: "1" },
      },
    },
    description: "AI Image Generation ($0.05 USDT)",
  },
  "POST /api/code": {
    accepts: {
      scheme: "exact",
      network: activeBotChainCaip,
      payTo: payToAddress,
      price: {
        amount: routePrices["POST /api/code"],
        asset: usdtAddress,
        extra: { name: "USDT", version: "1" },
      },
    },
    description: "AI Code Security & Audit ($0.02 USDT)",
  },
  "POST /api/botchain/relay": {
    accepts: {
      scheme: "exact",
      network: activeBotChainCaip,
      payTo: payToAddress,
      price: {
        amount: routePrices["POST /api/botchain/relay"],
        asset: usdtAddress,
        extra: { name: "USDT", version: "1" },
      },
    },
    description: "BotChain Autonomous Agent Programmatic Relay ($0.01 USDT)",
  },
};

const x402Payment = paymentMiddleware(routes, server);

/**
 * Payment gate (order matters):
 *  1. Bearer session → debit prepaid ledger (seamless, no wallet popup)
 *  2. X-AgentPay-Payment-Tx → verify on-chain one-shot USDT transfer
 *  3. Else → x402 402 challenge
 */
app.use("/api/*", async (c, next) => {
  const method = c.req.method.toUpperCase();
  const pathname = new URL(c.req.url).pathname;
  const requiredAmount = amountForPaidRoute(method, pathname, routePrices);

  if (requiredAmount === null) {
    return next();
  }

  // 1) Prepaid session
  const auth = c.req.header("authorization") || c.req.header("Authorization");
  if (auth) {
    try {
      const paid = trySessionPayment(auth, requiredAmount, pathname);
      if (paid) {
        c.header("X-AgentPay-Charged", paid.chargedAtomic.toString());
        c.header("X-AgentPay-Remaining", paid.remainingAtomic.toString());
        return next();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Session payment failed";
      return c.json(
        {
          error: message,
          paymentAsset: "USDT",
          paymentMethod: "prepaid-session",
          requiredAmount: requiredAmount.toString(),
          network: activeBotChainCaip,
          hint: "Deposit more USDT via /api/credits/deposit or pay with a one-shot transfer.",
        },
        402
      );
    }
  }

  // 2) One-shot on-chain USDT transfer proof
  const txHash = c.req.header(PAYMENT_TX_HEADER) || c.req.header("X-AgentPay-Payment-Tx");
  if (txHash) {
    try {
      const result = await verifyUsdtTransferPayment({
        txHash,
        usdtAddress,
        payTo: payToAddress,
        minAmountAtomic: requiredAmount,
        chainId: activeChainId,
        rpcUrl: activeRpcUrl,
      });
      activity("payment.transfer_ok", {
        path: pathname,
        txHash: result.txHash,
        from: result.from,
        amountAtomic: result.amount.toString(),
      });
      return next();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid USDT payment transaction";
      activity("payment.transfer_fail", { path: pathname, reason: message }, "warn");
      return c.json(
        {
          error: message,
          paymentAsset: "USDT",
          payTo: payToAddress,
          requiredAmount: requiredAmount.toString(),
          network: activeBotChainCaip,
        },
        402
      );
    }
  }

  // 3) Challenge
  activity("payment.challenge", {
    path: pathname,
    requiredAmount: requiredAmount.toString(),
    network: activeBotChainCaip,
  });
  return x402Payment(c, next);
});

const healthHandler = (c: any) => {
  return c.json({
    status: "ok",
    service: "AgentPay AI API Gateway",
    timestamp: new Date().toISOString(),
    aiProvider: `Anthropic ${getActiveModel()}`,
    model: getActiveModel(),
    network: activeBotChainCaip,
    chainId: activeChainId,
    usdtAsset: usdtAddress,
    paymentAsset: "USDT",
    paymentAssetOnly: true,
    paymentMethods: ["prepaid-session", "usdt-transfer", "x402-exact"],
    paymentTxHeader: "X-AgentPay-Payment-Tx",
    sessionHeader: "Authorization: Bearer <sessionToken>",
    creditsDeposit: "/api/credits/deposit",
    rpcUrl: activeRpcUrl,
    supportedNetworks: [
      { name: "BotChain Testnet", caip2: botChainTestnetCaip, chainId: 968 },
      { name: "BotChain Mainnet", caip2: botChainMainnetCaip, chainId: 677 },
    ],
    relayEndpoint: "/api/botchain/relay",
    payTo: payToAddress,
    payToType: "AgentPayRegistry UUPS ERC1967 Proxy Smart Contract Vault",
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.route(
  "/api",
  createCreditsRoute({
    usdtAddress,
    payTo: payToAddress,
    chainId: activeChainId,
    rpcUrl: activeRpcUrl,
    network: activeBotChainCaip,
  })
);
app.route("/api", chatRoute);
app.route("/api", imageRoute);
app.route("/api", codeRoute);
app.route("/api", reputationRoute);
app.route("/api", attributionRoute);
app.route("/api", botChainRelayRoute);

const port = Number(process.env.PORT) || 3001;

activity("server.start", {
  port,
  network: activeBotChainCaip,
  chainId: activeChainId,
  usdt: usdtAddress,
  vault: payToAddress,
  model: getActiveModel(),
  hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
});

console.log(`🤖 AgentPay AI Gateway starting on port ${port}...`);
console.log(`   🌐 Network:     ${activeBotChainCaip} (${isMainnet ? "MAINNET ⚠️" : "TESTNET"})`);
console.log(`   Chain ID:   ${activeChainId}`);
console.log(`   💰 USDT:       ${usdtAddress}`);
console.log(`   🤖 AI:         Anthropic ${getActiveModel()} ${process.env.ANTHROPIC_API_KEY ? "✅" : "⚠️  no key"}`);
console.log(`   🏦 Vault:      ${payToAddress}`);
console.log(`   🔗 RPC:        ${activeRpcUrl}`);
console.log(`   💳 Pay path:   prepaid session → one-shot USDT tx → x402 402`);
console.log(`   📍 Routes:     /api/chat, /api/image, /api/code, /api/credits, /api/botchain/relay`);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});
