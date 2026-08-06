/**
 * Vercel Serverless entry for Hono.
 * Uses native Web Standard Request/Response handler from 'hono/vercel'.
 */
import { handle } from "hono/vercel";
import app from "../src/app.js";

export const config = {
  maxDuration: 60,
};

export default handle(app);
