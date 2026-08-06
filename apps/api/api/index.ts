/**
 * Vercel Node serverless entry.
 * Uses @hono/node-server/vercel so IncomingMessage is adapted correctly.
 */
import { handle } from "@hono/node-server/vercel";
import app from "../src/app.js";

// Allow long AI provider calls after payment verification.
export const config = {
  maxDuration: 60,
};

export default handle(app);
