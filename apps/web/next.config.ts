import type { NextConfig } from "next";
import path from "path";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  // Local monorepo only — Vercel deploys apps/web as root and does not need this.
  ...(!process.env.VERCEL
    ? {
        turbopack: {
          root: path.resolve(__dirname, "../../"),
        },
      }
    : {}),
  async rewrites() {
    // Absolute API origin for rewrites. On Vercel set NEXT_PUBLIC_API_URL to the
    // deployed Hono gateway (e.g. https://agentpay-api.vercel.app).
    if (!API_URL || API_URL.startsWith("/")) {
      return [];
    }
    return [
      {
        source: "/health",
        destination: `${API_URL}/health`,
      },
      {
        source: "/api/health",
        destination: `${API_URL}/api/health`,
      },
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
