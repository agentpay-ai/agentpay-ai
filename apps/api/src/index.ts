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

config();

const app = new Hono();

app.use("*", cors());

const isMainnet = process.env.X402_NETWORK === "mainnet";
const networkCaip2 = (isMainnet ? "eip155:42220" : "eip155:11142220") as `${string}:${string}`;
const usdcAddress = isMainnet
  ? "0xcebA9300f2b948710d2653dD7B07f33A8B32118C"
  : "0x01C5C0122039549AD1493B8220cABEdD739BC44E";

const payToAddress =
  (process.env.PAYMENT_RECIPIENT_ADDRESS as `0x${string}`) ||
  "0x199A6E94191d4e0ebB7DE602C5E78a83F204E6C3";

const server = new x402ResourceServer(facilitator);
server.register(networkCaip2, new ExactEvmScheme());

const routes: RoutesConfig = {
  "POST /api/chat": {
    accepts: {
      scheme: "exact",
      network: networkCaip2,
      payTo: payToAddress,
      price: {
        amount: "10000", // $0.01 USDC (6 decimals)
        asset: usdcAddress,
        extra: { name: "USDC", version: "2" },
      },
    },
    description: "Google Gemini Flash AI Chat Prompt ($0.01)",
  },
  "POST /api/image": {
    accepts: {
      scheme: "exact",
      network: networkCaip2,
      payTo: payToAddress,
      price: {
        amount: "50000", // $0.05 USDC (6 decimals)
        asset: usdcAddress,
        extra: { name: "USDC", version: "2" },
      },
    },
    description: "AI Image Generation ($0.05)",
  },
  "POST /api/code": {
    accepts: {
      scheme: "exact",
      network: networkCaip2,
      payTo: payToAddress,
      price: {
        amount: "20000", // $0.02 USDC (6 decimals)
        asset: usdcAddress,
        extra: { name: "USDC", version: "2" },
      },
    },
    description: "AI Code Security & Audit ($0.02)",
  },
};

app.use("/api/*", paymentMiddleware(routes, server));

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "AgentPay AI API Gateway",
    timestamp: new Date().toISOString(),
    aiProvider: "Google Gemini Flash",
    network: networkCaip2,
    payTo: payToAddress,
  });
});

app.route("/api", chatRoute);
app.route("/api", imageRoute);
app.route("/api", codeRoute);
app.route("/api", reputationRoute);
app.route("/api", attributionRoute);

const port = Number(process.env.PORT) || 3001;

console.log(`🤖 AgentPay AI Gateway with x402 Micropayments starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});
