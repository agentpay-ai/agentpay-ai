import { Hono } from "hono";
import { generateChatResponse } from "../lib/gemini.js";

export const chatRoute = new Hono();

chatRoute.post("/chat", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prompt = body.prompt || "Hello Gemini";
  const response = await generateChatResponse(prompt);

  return c.json({
    success: true,
    tool: "chat",
    prompt,
    response,
    model: "gemini-2.5-flash",
    timestamp: new Date().toISOString(),
  });
});
