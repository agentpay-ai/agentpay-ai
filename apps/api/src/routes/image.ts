import { Hono } from "hono";

export const imageRoute = new Hono();

imageRoute.post("/image", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prompt = body.prompt || "Abstract cybernetic art";

  return c.json({
    success: true,
    tool: "image",
    prompt,
    imageUrl: `https://placehold.co/512x512/0f172a/f59e0b?text=${encodeURIComponent(prompt)}`,
    timestamp: new Date().toISOString(),
  });
});
