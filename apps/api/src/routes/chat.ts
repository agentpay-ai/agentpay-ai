import { Hono } from "hono";
import { generateChatResponse } from "../lib/ai.js";
import { validateTextField, preview, aiErrorStatus, aiErrorHint } from "../lib/validation.js";
import { activity } from "../lib/activity-log.js";

export const chatRoute = new Hono();

chatRoute.post("/chat", async (c) => {
  const body = await c.req.json().catch(() => ({}));

  const validated = validateTextField(body.prompt, "prompt");
  if (!validated.ok) {
    activity("request.reject", { tool: "chat", reason: validated.error }, "warn");
    return c.json({ success: false, tool: "chat", error: validated.error }, 400);
  }
  const prompt = validated.value;

  activity("ai.chat", { phase: "start", promptPreview: preview(prompt) });

  const result = await generateChatResponse(prompt);

  if (!result.ok) {
    const status = aiErrorStatus(result.errorType);
    activity(
      "ai.error",
      { tool: "chat", errorType: result.errorType, status, details: result.error },
      "error"
    );
    return c.json(
      {
        success: false,
        tool: "chat",
        error: "AI response unavailable",
        errorType: result.errorType,
        hint: aiErrorHint(result.errorType),
        details: result.error,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }

  activity("ai.chat", {
    phase: "ok",
    model: result.model,
    chars: result.text.length,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    truncated: result.truncated,
  });

  return c.json({
    success: true,
    tool: "chat",
    prompt,
    response: result.text,
    model: result.model,
    truncated: result.truncated,
    usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens },
    timestamp: new Date().toISOString(),
  });
});
