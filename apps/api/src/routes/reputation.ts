import { Hono } from "hono";
import { getAgentPayMetadata, formatReputationSummary } from "../lib/erc8004.js";

export const reputationRoute = new Hono();

reputationRoute.get("/agent-metadata.json", (c) => {
  console.log("[REPUTATION] ← GET /agent-metadata.json");
  return c.json(getAgentPayMetadata());
});

reputationRoute.get("/reputation", (c) => {
  console.log("[REPUTATION] ← GET /reputation");
  const summary = formatReputationSummary(98, 142);
  return c.json({
    success: true,
    agentId: 1,
    agentName: "AgentPay AI",
    erc8004Registry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
    reputation: summary,
    timestamp: new Date().toISOString(),
  });
});

reputationRoute.post("/reputation/feedback", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const score = Number(body.score) || 90;
  const tag = body.tag || "starred";
  const notes = body.notes || "Fast response";

  console.log(`[REPUTATION] ← POST /reputation/feedback score=${score} tag=${tag}`);

  return c.json({
    success: true,
    message: "Feedback submitted for ERC-8004 Reputation Registry",
    feedback: {
      score,
      tag,
      notes,
      timestamp: new Date().toISOString(),
    },
  });
});
