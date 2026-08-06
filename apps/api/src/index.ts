import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { getActiveModel } from "./lib/ai.js";
import { activity } from "./lib/activity-log.js";
import { app } from "./app.js";

config();

const port = Number(process.env.PORT) || 3001;
const network = process.env.X402_NETWORK ?? "testnet";

activity("server.start", {
  port,
  network,
  model: getActiveModel(),
  hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
});

console.log(`🤖 AgentPay AI Gateway starting on port ${port}...`);
console.log(`   🌐 Network: ${network}`);
console.log(`   🤖 AI:      Anthropic ${getActiveModel()} ${process.env.ANTHROPIC_API_KEY ? "✅" : "⚠️  no key"}`);
console.log(`   📍 Routes:  /api/chat, /api/image, /api/code, /api/botchain/relay`);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});
