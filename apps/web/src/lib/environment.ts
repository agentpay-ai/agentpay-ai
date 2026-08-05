/**
 * Environment and network-mode helpers.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so a production bundle cannot be flipped
 * into development mode at runtime.
 */

export type AppEnvironment = "development" | "production";

export function getEnvironment(): AppEnvironment {
  return process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ? "production" : "development";
}

/**
 * Base URL for the Hono API.
 *
 * In the browser, prefer same-origin relative URLs whenever the configured API is local.
 * Next.js rewrites `/api/*` → the backend (see next.config.ts), which:
 *  - always produces a visible network request from the page origin
 *  - avoids CORS preflight failures that can make it look like "nothing was sent"
 *  - works even when the API is only reachable via the Next proxy
 *
 * Absolute URLs are still used for non-local deployments and for server-side code.
 */
export function getApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  if (typeof window !== "undefined") {
    try {
      const url = new URL(configured, window.location.origin);
      const host = url.hostname;
      const isLocal =
        host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "";
      if (isLocal) {
        // Same-origin → Next rewrite. Paths like `/api/chat` hit the gateway.
        return "";
      }
      return configured.replace(/\/$/, "");
    } catch {
      return "";
    }
  }

  return configured.replace(/\/$/, "");
}

/**
 * Whether the network switcher should be offered.
 *
 * This is UX gating, not a security boundary — client code can always be edited. The binding
 * guarantee is server-side: the API registers only its configured network's payment scheme,
 * so a payload for the other network cannot be settled regardless of what the client does.
 *
 * Client-side only; returns false during SSR. Read it through `useCanSwitchNetwork` so the
 * first client render matches the server output.
 */
export function canSwitchNetwork(): boolean {
  if (typeof window === "undefined") return false;

  const { hostname } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

  return getEnvironment() === "development" && isLocal;
}
