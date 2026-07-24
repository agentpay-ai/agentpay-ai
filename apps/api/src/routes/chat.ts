import { Hono } from "hono";

export const chatRoute = new Hono();

chatRoute.post("/chat", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prompt = body.prompt || "Hello Gemini";

  return c.json({
    success: true,
    tool: "chat",
    prompt,
    response: `[AgentPay AI] Processed AI prompt: "${prompt}". Powered by Google Gemini Flash.`,
    timestamp: new Date().toISOString(),
  });
});
