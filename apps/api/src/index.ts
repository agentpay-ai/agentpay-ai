import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { config } from "dotenv";

config();

const app = new Hono();

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "AgentPay AI API Gateway",
    timestamp: new Date().toISOString(),
    aiProvider: "Google Gemini Flash",
  });
});

const port = Number(process.env.PORT) || 3001;

console.log(`🤖 AgentPay AI Gateway starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});
