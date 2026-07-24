import { Hono } from "hono";
import { enhanceImagePrompt } from "../lib/gemini.js";

export const imageRoute = new Hono();

imageRoute.post("/image", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const rawPrompt = body.prompt || "Abstract cybernetic art";
  const enhancedPrompt = await enhanceImagePrompt(rawPrompt);

  return c.json({
    success: true,
    tool: "image",
    rawPrompt,
    enhancedPrompt,
    imageUrl: `https://placehold.co/512x512/0f172a/f59e0b?text=${encodeURIComponent(rawPrompt)}`,
    model: "gemini-2.5-flash",
    timestamp: new Date().toISOString(),
  });
});
