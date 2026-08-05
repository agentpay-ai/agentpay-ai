import { Hono } from "hono";
import { generateChatResponse, enhanceImagePrompt, auditCodeSnippet } from "../lib/gemini.js";
import { getAgentPayMetadata } from "../lib/erc8004.js";
import { appendAttributionTag } from "../lib/attribution.js";

export const botChainRelayRoute = new Hono();

botChainRelayRoute.post("/botchain/relay", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { service, params } = body;

  if (!service) {
    return c.json(
      {
        success: false,
        error: "Missing required 'service' parameter",
        supportedServices: ["chat", "image", "code", "reputation", "attribution"],
      },
      400
    );
  }

  let result: unknown;
  switch (service) {
    case "chat":
      result = await generateChatResponse(params?.prompt || "Hello BotChain Autonomous Agent");
      break;

    case "image":
      result = await enhanceImagePrompt(params?.prompt || "Autonomous AI agent on BotChain");
      break;

    case "code":
      result = await auditCodeSnippet(params?.code || "contract AgentPay { function pay() external payable {} }");
      break;

    case "reputation":
      result = getAgentPayMetadata();
      break;

    case "attribution":
      result = {
        calldata: appendAttributionTag(params?.calldata || "0x"),
        attributionTag: "0x8021",
      };
      break;

    default:
      return c.json(
        {
          success: false,
          error: `Unsupported service '${service}'`,
          supportedServices: ["chat", "image", "code", "reputation", "attribution"],
        },
        400
      );
  }

  return c.json({
    success: true,
    network: "botchain",
    service,
    result,
    timestamp: new Date().toISOString(),
  });
});
