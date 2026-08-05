import { Hono } from "hono";
import { generateChatResponse } from "../lib/ai.js";

export const chatRoute = new Hono();

chatRoute.post("/chat", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prompt = body.prompt || "Hello Claude";
  const response = await generateChatResponse(prompt);

  return c.json({
    success: true,
    tool: "chat",
    prompt,
    response,
    model: "claude-haiku-4.5",
    timestamp: new Date().toISOString(),
  });
});
