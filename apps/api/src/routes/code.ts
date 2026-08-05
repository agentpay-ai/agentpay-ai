import { Hono } from "hono";
import { auditCodeSnippet } from "../lib/ai.js";

export const codeRoute = new Hono();

codeRoute.post("/code", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const codeSnippet = body.code || "// no snippet provided";
  const audit = await auditCodeSnippet(codeSnippet);

  return c.json({
    success: true,
    tool: "code",
    audit,
    model: "claude-haiku-4.5",
    timestamp: new Date().toISOString(),
  });
});
