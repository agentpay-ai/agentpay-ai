import { HTTPFacilitatorClient } from "@x402/core/server";

const FACILITATOR_URL =
  process.env.X402_NETWORK === "mainnet"
    ? "https://api.x402.celo.org"
    : "https://api.x402.sepolia.celo.org";

export const facilitator = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
  createAuthHeaders: async () => {
    const h = { "X-API-Key": process.env.X402_API_KEY || "demo" };
    return { verify: h, settle: h, supported: h };
  },
});
