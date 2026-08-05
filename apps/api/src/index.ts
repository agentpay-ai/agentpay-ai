import { Hono } from "hono";
import { cors } from "hono/cors";
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

config();

const app = new Hono();

app.use("*", cors());

const isMainnet = process.env.X402_NETWORK === "mainnet";

// BotChain CAIP-2 Identifiers
const botChainTestnetCaip = "eip155:968" as const;
const botChainMainnetCaip = "eip155:677" as const;
const activeBotChainCaip = isMainnet ? botChainMainnetCaip : botChainTestnetCaip;

// Verified BotChain USDT Addresses (6 decimals)
const usdtAddress = isMainnet
  ? "0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C" // Mainnet USDT
  : "0x75edC9335175Fc0552D51D48439F229c10420fe3"; // Testnet USDT

// Deployed AgentPayRegistry UUPS ERC1967 Proxy Vault Contract (BotChain Testnet)
const defaultProxyVaultAddress = "0xc1eBB154EFf9bf9c08e39978E1447cC05e726dC6";

const payToAddress =
  (process.env.PAYMENT_RECIPIENT_ADDRESS as `0x${string}`) ||
  defaultProxyVaultAddress;

const server = new x402ResourceServer(facilitator);

// Register schemes for all supported networks (BotChain EVM + Celo Fallbacks)
server.register(botChainTestnetCaip, new ExactEvmScheme());
server.register(botChainMainnetCaip, new ExactEvmScheme());
server.register("eip155:42220", new ExactEvmScheme());
server.register("eip155:11142220", new ExactEvmScheme());

const routes: RoutesConfig = {
  "POST /api/chat": {
    accepts: {
      scheme: "exact",
      network: activeBotChainCaip,
      payTo: payToAddress,
      price: {
        amount: "10000", // $0.01 USDT (6 decimals)
        asset: usdtAddress,
        extra: { name: "USDT", version: "1" },
      },
    },
    description: "Google Gemini Flash AI Chat Prompt ($0.01 USDT)",
  },
  "POST /api/image": {
    accepts: {
      scheme: "exact",
      network: activeBotChainCaip,
      payTo: payToAddress,
      price: {
        amount: "50000", // $0.05 USDT (6 decimals)
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
        amount: "20000", // $0.02 USDT (6 decimals)
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
        amount: "10000", // $0.01 USDT (6 decimals)
        asset: usdtAddress,
        extra: { name: "USDT", version: "1" },
      },
    },
    description: "BotChain Autonomous Agent Programmatic Relay ($0.01 USDT)",
  },
};

app.use("/api/*", paymentMiddleware(routes, server));

const healthHandler = (c: any) => {
  return c.json({
    status: "ok",
    service: "AgentPay AI API Gateway",
    timestamp: new Date().toISOString(),
    aiProvider: "Google Gemini Flash",
    network: activeBotChainCaip,
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

app.route("/api", chatRoute);
app.route("/api", imageRoute);
app.route("/api", codeRoute);
app.route("/api", reputationRoute);
app.route("/api", attributionRoute);
app.route("/api", botChainRelayRoute);

const port = Number(process.env.PORT) || 3001;

console.log(`🤖 AgentPay AI Gateway with x402 Micropayments starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});
