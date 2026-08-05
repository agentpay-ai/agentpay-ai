import { Hono } from "hono";
import { auditCodeSnippet } from "../lib/ai.js";
import { validateTextField, aiErrorStatus, aiErrorHint } from "../lib/validation.js";
import { activity } from "../lib/activity-log.js";

export const codeRoute = new Hono();

codeRoute.post("/code", async (c) => {
  const body = await c.req.json().catch(() => ({}));

  const validated = validateTextField(body.code, "code");
  if (!validated.ok) {
    activity("request.reject", { tool: "code", reason: validated.error }, "warn");
    return c.json({ success: false, tool: "code", error: validated.error }, 400);
  }
  const codeSnippet = validated.value;

  activity("ai.code", { phase: "start", chars: codeSnippet.length });

  const result = await auditCodeSnippet(codeSnippet);

  // An audit that could not run must never report a passing grade.
  if (!result.ok) {
    const status = aiErrorStatus(result.errorType);
    activity(
      "ai.error",
      { tool: "code", errorType: result.errorType, status, details: result.error },
      "error"
    );
    return c.json(
      {
        success: false,
        tool: "code",
        error: "Code audit unavailable — no verdict was produced",
        errorType: result.errorType,
        hint: aiErrorHint(result.errorType),
        details: result.error,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }

  activity("ai.code", {
    phase: "ok",
    score: result.audit.score,
    vulnerabilities: result.audit.vulnerabilities,
  });

  return c.json({
    success: true,
    tool: "code",
    audit: result.audit,
    model: result.model,
    timestamp: new Date().toISOString(),
  });
});
