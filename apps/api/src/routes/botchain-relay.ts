import { Hono } from "hono";
import { generateChatResponse, enhanceImagePrompt, auditCodeSnippet } from "../lib/ai.js";
import { getAgentPayMetadata } from "../lib/erc8004.js";
import { appendAttributionTag } from "../lib/attribution.js";
import { validateTextField, aiErrorStatus, aiErrorHint } from "../lib/validation.js";

export const botChainRelayRoute = new Hono();

const SUPPORTED_SERVICES = ["chat", "image", "code", "reputation", "attribution"] as const;
type SupportedService = (typeof SUPPORTED_SERVICES)[number];

/** Per-service price in USDm (1 USDm = $0.001), mirroring the x402 route prices in index.ts. */
const SERVICE_COST_USDM: Record<SupportedService, number> = {
  chat: 10, // $0.01
  image: 50, // $0.05
  code: 20, // $0.02
  reputation: 0,
  attribution: 0,
};

const DEFAULT_MAX_COST_USDM = 100; // $0.10

botChainRelayRoute.post("/botchain/relay", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const service = body.service;
  const params = body.params || body.payload || {};
  const agentId = body.agentId || "0x0000000000000000000000000000000000000000";

  const maxCostUSDm = body.maxCostUSDm === undefined ? DEFAULT_MAX_COST_USDM : Number(body.maxCostUSDm);

  console.log(`[RELAY] ← service=${service || "NONE"} agentId=${agentId} maxCostUSDm=${maxCostUSDm}`);

  if (!service) {
    console.warn("[RELAY] ✗ 400 Bad Request: Missing service parameter");
    return c.json(
      { success: false, error: "Missing required 'service' parameter", supportedServices: SUPPORTED_SERVICES },
      400
    );
  }

  if (!SUPPORTED_SERVICES.includes(service)) {
    console.warn(`[RELAY] ✗ 400 Bad Request: Unsupported service '${service}'`);
    return c.json(
      { success: false, error: `Unsupported service '${service}'`, supportedServices: SUPPORTED_SERVICES },
      400
    );
  }

  if (!Number.isFinite(maxCostUSDm) || maxCostUSDm < 0) {
    console.warn(`[RELAY] ✗ 400 Bad Request: invalid maxCostUSDm '${body.maxCostUSDm}'`);
    return c.json({ success: false, error: "'maxCostUSDm' must be a non-negative number" }, 400);
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(agentId)) {
    console.warn(`[RELAY] ✗ 400 Bad Request: invalid agentId '${agentId}'`);
    return c.json({ success: false, error: "'agentId' must be a 20-byte hex address" }, 400);
  }

  // Enforce the caller's declared ceiling rather than merely echoing it back.
  const serviceCostUSDm = SERVICE_COST_USDM[service as SupportedService];
  if (serviceCostUSDm > maxCostUSDm) {
    console.warn(
      `[RELAY] ✗ 402 cost ceiling exceeded: '${service}' costs ${serviceCostUSDm} USDm, ceiling is ${maxCostUSDm} USDm`
    );
    return c.json(
      {
        success: false,
        error: `Service '${service}' costs ${serviceCostUSDm} USDm, which exceeds the declared maxCostUSDm of ${maxCostUSDm}`,
        serviceCostUSDm,
        maxCostUSDm,
      },
      402
    );
  }

  try {
    let result: unknown;

    switch (service as SupportedService) {
      case "chat": {
        const validated = validateTextField(params?.prompt, "params.prompt");
        if (!validated.ok) return c.json({ success: false, error: validated.error }, 400);

        const ai = await generateChatResponse(validated.value);
        if (!ai.ok) {
          const status = aiErrorStatus(ai.errorType);
          console.error(`[RELAY] ✗ ${status} chat ${ai.errorType}: ${ai.error}`);
          return c.json(
            {
              success: false,
              service,
              error: "AI response unavailable",
              errorType: ai.errorType,
              hint: aiErrorHint(ai.errorType),
              details: ai.error,
            },
            status
          );
        }
        result = { response: ai.text, model: ai.model, truncated: ai.truncated };
        break;
      }

      case "image": {
        const validated = validateTextField(params?.prompt, "params.prompt");
        if (!validated.ok) return c.json({ success: false, error: validated.error }, 400);

        const ai = await enhanceImagePrompt(validated.value);
        if (!ai.ok) {
          const status = aiErrorStatus(ai.errorType);
          console.error(`[RELAY] ✗ ${status} image ${ai.errorType}: ${ai.error}`);
          return c.json(
            {
              success: false,
              service,
              error: "Image prompt enhancement unavailable",
              errorType: ai.errorType,
              hint: aiErrorHint(ai.errorType),
              details: ai.error,
            },
            status
          );
        }
        result = { enhancedPrompt: ai.text, model: ai.model, truncated: ai.truncated };
        break;
      }

      case "code": {
        const validated = validateTextField(params?.code, "params.code");
        if (!validated.ok) return c.json({ success: false, error: validated.error }, 400);

        const ai = await auditCodeSnippet(validated.value);
        if (!ai.ok) {
          const status = aiErrorStatus(ai.errorType);
          console.error(`[RELAY] ✗ ${status} code ${ai.errorType}: ${ai.error}`);
          return c.json(
            {
              success: false,
              service,
              error: "Code audit unavailable — no verdict was produced",
              errorType: ai.errorType,
              hint: aiErrorHint(ai.errorType),
              details: ai.error,
            },
            status
          );
        }
        result = { audit: ai.audit, model: ai.model };
        break;
      }

      case "reputation":
        result = {
          metadata: getAgentPayMetadata(),
          agentId,
          // TODO: read the on-chain ERC-8004 score; this is a placeholder, not a verified value.
          reputationScore: null,
          reputationSource: "unimplemented",
        };
        break;

      case "attribution":
        result = {
          calldata: appendAttributionTag(params?.calldata || "0x"),
          attributionTag: "0x8021",
        };
        break;
    }

    console.log(`[RELAY] → service '${service}' dispatched successfully`);

    return c.json({
      success: true,
      network: "botchain",
      relayProtocol: "x402-v2",
      service,
      agentId,
      maxCostUSDm,
      serviceCostUSDm,
      vaultAddress: process.env.PAYMENT_RECIPIENT_ADDRESS || "0xc1eBB154EFf9bf9c08e39978E1447cC05e726dC6",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[RELAY] ✗ 500 unhandled error in '${service}':`, err?.message || err);
    return c.json(
      { success: false, service, error: "Relay processing failed", details: err?.message || String(err) },
      500
    );
  }
});
