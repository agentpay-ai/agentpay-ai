import { Hono } from "hono";
import { generateChatResponse, enhanceImagePrompt, auditCodeSnippet } from "../lib/ai.js";
import { getAgentPayMetadata } from "../lib/erc8004.js";
import { appendAttributionTag } from "../lib/attribution.js";

export const botChainRelayRoute = new Hono();

botChainRelayRoute.post("/botchain/relay", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const service = body.service;
  const params = body.params || body.payload || {};
  const agentId = body.agentId || "0x0000000000000000000000000000000000000000";
  const maxCostUSDm = body.maxCostUSDm || 100; // default 100 = $0.10 max cost ceiling

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
      result = {
        metadata: getAgentPayMetadata(),
        agentId,
        reputationScore: 100, // ERC-8004 verified active agent score
      };
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
    relayProtocol: "x402-v2",
    service,
    agentId,
    maxCostUSDm,
    vaultAddress: process.env.PAYMENT_RECIPIENT_ADDRESS || "0xc1eBB154EFf9bf9c08e39978E1447cC05e726dC6",
    result,
    timestamp: new Date().toISOString(),
  });
});
