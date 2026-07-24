import { Hono } from "hono";
import { auditCodeSnippet } from "../lib/gemini.js";

export const codeRoute = new Hono();

codeRoute.post("/code", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const codeSnippet = body.code || "// no snippet provided";
  const audit = await auditCodeSnippet(codeSnippet);

  return c.json({
    success: true,
    tool: "code",
    audit,
    model: "gemini-2.5-flash",
    timestamp: new Date().toISOString(),
  });
});
