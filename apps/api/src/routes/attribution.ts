import { Hono } from "hono";
import { appendAttributionTag, DEFAULT_PROJECT_TAG, ERC8021_MAGIC_TAG } from "../lib/attribution.js";

export const attributionRoute = new Hono();

attributionRoute.get("/attribution/tag", (c) => {
  console.log("[ATTRIBUTION] ← GET /attribution/tag");
  const taggedSample = appendAttributionTag("0x");
  return c.json({
    success: true,
    protocol: "ERC-8021",
    projectTag: DEFAULT_PROJECT_TAG,
    magicTag: ERC8021_MAGIC_TAG,
    sampleCalldataSuffix: taggedSample,
    leaderboardCampaign: "Celo Proof of Ship Season 2",
    timestamp: new Date().toISOString(),
  });
});
