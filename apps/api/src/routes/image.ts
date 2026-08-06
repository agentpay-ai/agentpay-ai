import { Hono } from "hono";
import { enhanceImagePrompt } from "../lib/ai.js";
import { validateTextField, preview, aiErrorStatus, aiErrorHint } from "../lib/validation.js";
import { activity } from "../lib/activity-log.js";

export const imageRoute = new Hono();

imageRoute.post("/image", async (c) => {
  const body = await c.req.json().catch(() => ({}));

  const validated = validateTextField(body.prompt, "prompt");
  if (!validated.ok) {
    activity("request.reject", { tool: "image", reason: validated.error }, "warn");
    return c.json({ success: false, tool: "image", error: validated.error }, 400);
  }
  const rawPrompt = validated.value;

  activity("ai.image", { phase: "start", promptPreview: preview(rawPrompt) });

  const result = await enhanceImagePrompt(rawPrompt);

  if (!result.ok) {
    const status = aiErrorStatus(result.errorType);
    activity(
      "ai.error",
      {
        tool: "image",
        errorType: result.errorType,
        status,
        details: result.error,
        isCaptcha: result.isCaptcha ?? false,
      },
      "error"
    );
    return c.json(
      {
        success: false,
        tool: "image",
        error: result.isCaptcha ? "Security Verification Required" : "Image prompt enhancement unavailable",
        errorType: result.errorType,
        isCaptcha: result.isCaptcha ?? false,
        captchaHtml: result.captchaHtml,
        hint: result.isCaptcha
          ? "Please complete the CAPTCHA verification to proceed"
          : aiErrorHint(result.errorType),
        details: result.error,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }

  activity("ai.image", { phase: "ok", chars: result.text.length });

  return c.json({
    success: true,
    tool: "image",
    rawPrompt,
    enhancedPrompt: result.text,
    // Placeholder renderer — no image model is wired up yet.
    imageUrl: `https://placehold.co/512x512/0f172a/f59e0b?text=${encodeURIComponent(rawPrompt)}`,
    model: result.model,
    truncated: result.truncated,
    usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens },
    timestamp: new Date().toISOString(),
  });
});
