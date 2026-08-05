import { Hono } from "hono";
import { generateChatResponse } from "../lib/ai.js";

export const chatRoute = new Hono();

chatRoute.post("/chat", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prompt = body.prompt || "Hello Claude";
  console.log(`[CHAT] ← prompt: "${prompt.slice(0, 80)}${prompt.length > 80 ? "..." : ""}"`);

  const response = await generateChatResponse(prompt);
  console.log(`[CHAT] → response: ${response.length} chars`);

  return c.json({
    success: true,
    tool: "chat",
    prompt,
    response,
    model: "claude-haiku-4.5",
    timestamp: new Date().toISOString(),
  });
});
