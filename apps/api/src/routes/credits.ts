import { Hono } from "hono";
import {
  creditPrepaid,
  getPrepaidBalance,
  issueSessionToken,
  peekSessionAddress,
  verifySessionToken,
} from "../lib/prepaid-ledger.js";
import {
  PAYMENT_TX_HEADER,
  verifyUsdtTransferPayment,
} from "../lib/usdt-transfer-payment.js";
import { activity } from "../lib/activity-log.js";

export interface CreditsRouteConfig {
  usdtAddress: `0x${string}`;
  payTo: `0x${string}`;
  chainId: number;
  rpcUrl: string;
  network: string;
}

/**
 * Prepaid credit endpoints.
 * POST /credits/deposit  — credit a verified USDT transfer + issue session
 * POST /credits/refresh  — re-issue session from existing token (if credit remains)
 * GET  /credits/me       — balance + optional refreshed token (Bearer required)
 * GET  /credits/:address — public balance peek (no token issued)
 */
export function createCreditsRoute(cfg: CreditsRouteConfig) {
  const app = new Hono();

  app.get("/credits/me", (c) => {
    const auth = c.req.header("authorization") || c.req.header("Authorization");
    const m = auth?.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      return c.json({ error: "Authorization Bearer session required" }, 401);
    }
    const token = m[1].trim();

    // Accept valid tokens, or expired-but-signed tokens if credit remains.
    let address: string;
    try {
      address = verifySessionToken(token).address;
    } catch {
      const peeked = peekSessionAddress(token);
      if (!peeked) {
        return c.json({ error: "Invalid session token" }, 401);
      }
      address = peeked;
    }

    const balance = getPrepaidBalance(address);
    const sessionToken =
      balance > BigInt(0) ? issueSessionToken(address) : undefined;

    activity("credits.balance", {
      address,
      balanceAtomic: balance.toString(),
      refreshed: Boolean(sessionToken),
    });

    return c.json({
      address,
      balanceAtomic: balance.toString(),
      balanceUsdt: Number(balance) / 1e6,
      asset: "USDT",
      network: cfg.network,
      chainId: cfg.chainId,
      sessionToken,
      expiresInSeconds: sessionToken ? 60 * 60 * 24 * 30 : 0,
      hasCredit: balance > BigInt(0),
    });
  });

  app.post("/credits/refresh", async (c) => {
    const auth = c.req.header("authorization") || c.req.header("Authorization");
    const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
    const tokenFromBody = typeof body.sessionToken === "string" ? body.sessionToken : "";
    const m = auth?.match(/^Bearer\s+(.+)$/i);
    const token = (m?.[1] || tokenFromBody).trim();

    if (!token) {
      return c.json({ error: "sessionToken required" }, 400);
    }

    const address = peekSessionAddress(token);
    if (!address) {
      return c.json({ error: "Invalid session token" }, 401);
    }

    const balance = getPrepaidBalance(address);
    if (balance <= BigInt(0)) {
      return c.json(
        {
          error: "No prepaid credit for this account. Authorize a new spending budget.",
          address,
          balanceAtomic: "0",
          hasCredit: false,
        },
        402
      );
    }

    const sessionToken = issueSessionToken(address);
    activity("credits.balance", {
      address,
      balanceAtomic: balance.toString(),
      refreshed: true,
    });

    return c.json({
      success: true,
      address,
      balanceAtomic: balance.toString(),
      balanceUsdt: Number(balance) / 1e6,
      sessionToken,
      expiresInSeconds: 60 * 60 * 24 * 30,
      hasCredit: true,
      network: cfg.network,
      chainId: cfg.chainId,
    });
  });

  app.get("/credits/:address", (c) => {
    const address = c.req.param("address");
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return c.json({ error: "Invalid address" }, 400);
    }
    const balance = getPrepaidBalance(address);
    return c.json({
      address: address.toLowerCase(),
      balanceAtomic: balance.toString(),
      balanceUsdt: Number(balance) / 1e6,
      asset: "USDT",
      network: cfg.network,
      chainId: cfg.chainId,
      hasCredit: balance > BigInt(0),
      // Never issue a session token on the public endpoint.
    });
  });

  app.post("/credits/deposit", async (c) => {
    const txHash =
      c.req.header(PAYMENT_TX_HEADER) ||
      c.req.header("X-AgentPay-Payment-Tx") ||
      "";
    const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
    const hash = (txHash || (typeof body.txHash === "string" ? body.txHash : "")).trim();

    if (!hash) {
      activity("credits.deposit_fail", { reason: "missing_tx" }, "warn");
      return c.json(
        {
          error: "Missing deposit tx hash. Send X-AgentPay-Payment-Tx or body.txHash.",
        },
        400
      );
    }

    try {
      const result = await verifyUsdtTransferPayment({
        txHash: hash,
        usdtAddress: cfg.usdtAddress,
        payTo: cfg.payTo,
        minAmountAtomic: BigInt(1),
        chainId: cfg.chainId,
        rpcUrl: cfg.rpcUrl,
      });

      const balance = creditPrepaid(result.from, result.amount, result.txHash);
      const sessionToken = issueSessionToken(result.from);

      activity("credits.deposit_ok", {
        address: result.from.toLowerCase(),
        amountAtomic: result.amount.toString(),
        txHash: result.txHash,
        balanceAtomic: balance.toString(),
      });

      return c.json({
        success: true,
        address: result.from.toLowerCase(),
        creditedAtomic: result.amount.toString(),
        creditedUsdt: Number(result.amount) / 1e6,
        balanceAtomic: balance.toString(),
        balanceUsdt: Number(balance) / 1e6,
        sessionToken,
        expiresInSeconds: 60 * 60 * 24 * 30,
        chainId: cfg.chainId,
        network: cfg.network,
        txHash: result.txHash,
        message:
          "Spending authorized. Subsequent tool calls use this credit without signing until it runs out.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Deposit failed";
      activity("credits.deposit_fail", { reason: message, txHash: hash }, "warn");
      return c.json({ error: message }, 402);
    }
  });

  return app;
}
