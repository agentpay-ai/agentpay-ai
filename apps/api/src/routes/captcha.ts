import { Hono } from "hono";
import {
  getLastCaptchaHtml,
  setLastCaptchaHtml,
  getWafCookies,
  ingestWafCookies,
  isUsingAgentRouter,
} from "../lib/ai.js";
import { activity } from "../lib/activity-log.js";

const AGENT_ROUTER_BASE = "https://agentrouter.org";

export const captchaRoute = new Hono();

/**
 * GET /captcha/challenge
 *
 * Serves the most recent Aliyun WAF captcha challenge HTML with modifications:
 *  1. All relative / agentrouter.org URLs rewritten to flow through our proxy.
 *  2. A `postMessage` hook injected so the client iframe can signal success.
 *
 * The captcha widget itself loads from Alibaba CDN (alicdn.com) and that's fine —
 * only the WAF verification callback (which goes to the protected domain) needs to
 * be proxied through the backend so the backend's IP receives the session cookie.
 */
captchaRoute.get("/captcha/challenge", async (c) => {
  // Direct Anthropic keys (sk-ant-*) never need WAF captcha verification
  if (!isUsingAgentRouter()) {
    return c.json({ error: "Captcha verification not required for this API configuration" }, 404);
  }

  let html = getLastCaptchaHtml();
  if (!html) {
    // No cached captcha — try to trigger one by hitting agentrouter.org directly
    activity("captcha.trigger", { phase: "fetching_fresh_challenge" });
    try {
      const cookies = getWafCookies();
      const res = await fetch(`${AGENT_ROUTER_BASE}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookies ? { Cookie: cookies } : {}),
        },
        body: JSON.stringify({ model: "claude-opus-5", messages: [{ role: "user", content: "hi" }], max_tokens: 1 }),
      });
      const text = await res.text();
      // Check if this is a captcha page
      if (
        text.trim().toLowerCase().startsWith("<!doctype") ||
        text.toLowerCase().includes("<html") ||
        text.includes("aliyunwaf")
      ) {
        html = text;
        setLastCaptchaHtml(text);
        // Capture any cookies from this request
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) ingestWafCookies(setCookie);
      }
    } catch (err) {
      activity("captcha.trigger_error", { error: String(err) }, "error");
    }
  }

  if (!html) {
    return c.json({ error: "No captcha challenge available — the gateway may not require one right now." }, 404);
  }

  // Build the proxy base URL from the current request
  const reqUrl = new URL(c.req.url);
  const proxyBase = `${reqUrl.protocol}//${reqUrl.host}/api/captcha/proxy`;

  // Rewrite the captcha HTML:
  // 1. Intercept form submissions and navigation that go to agentrouter.org
  // 2. Inject a completion callback that posts a message to the parent window
  const modifiedHtml = rewriteCaptchaHtml(html, proxyBase);

  activity("captcha.challenge_served", { htmlLength: modifiedHtml.length });

  return c.html(modifiedHtml);
});

/**
 * ALL /captcha/proxy/*
 *
 * Transparent reverse proxy to agentrouter.org for captcha verification.
 * All requests flow from the Render backend's IP, so the WAF associates
 * successful verification with this server. Captured cookies are stored
 * in the shared WAF cookie jar for subsequent AI API calls.
 */
captchaRoute.all("/captcha/proxy/*", async (c) => {
  const suffix = c.req.path.replace(/^\/api\/captcha\/proxy\/?/, "");
  const targetUrl = `${AGENT_ROUTER_BASE}/${suffix}`;

  const reqHeaders: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    // Forward relevant headers, skip hop-by-hop ones
    if (["host", "connection", "transfer-encoding", "keep-alive"].includes(lower)) return;
    reqHeaders[key] = value;
  });

  // Inject our WAF cookies
  const cookies = getWafCookies();
  if (cookies) {
    reqHeaders["Cookie"] = cookies;
  }
  // Ensure Host matches the target
  reqHeaders["Host"] = "agentrouter.org";

  const method = c.req.method;
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await c.req.text().catch(() => undefined);
  }

  activity("captcha.proxy", { method, target: targetUrl });

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers: reqHeaders,
      body,
      redirect: "manual", // Don't follow redirects — relay them to client
    });

    // Capture ALL cookies from the upstream response
    const setCookieAll = upstream.headers.getSetCookie?.() ?? [];
    const setCookieSingle = upstream.headers.get("set-cookie");
    if (setCookieAll.length > 0) {
      ingestWafCookies(setCookieAll);
    } else if (setCookieSingle) {
      ingestWafCookies(setCookieSingle);
    }

    // Check if the response itself is another captcha or a success page
    const contentType = upstream.headers.get("content-type") || "";
    const status = upstream.status;

    // Build response headers (strip hop-by-hop)
    const resHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (["connection", "transfer-encoding", "keep-alive", "set-cookie"].includes(lower)) return;
      resHeaders.set(key, value);
    });
    // Forward Set-Cookie as-is so the iframe also gets them
    if (setCookieSingle) {
      resHeaders.set("set-cookie", setCookieSingle);
    }

    // If redirect, rewrite Location to go through our proxy
    if (status >= 300 && status < 400) {
      const location = upstream.headers.get("location");
      if (location) {
        const reqUrl = new URL(c.req.url);
        const proxyBase = `${reqUrl.protocol}//${reqUrl.host}/api/captcha/proxy`;
        let rewritten = location;
        if (location.startsWith("https://agentrouter.org")) {
          rewritten = location.replace("https://agentrouter.org", proxyBase);
        } else if (location.startsWith("/")) {
          rewritten = `${proxyBase}${location}`;
        }
        resHeaders.set("location", rewritten);
      }
    }

    const responseBody = await upstream.arrayBuffer();

    // Check if this is a success page (not another captcha) — means verification worked!
    if (contentType.includes("text/html")) {
      const bodyText = new TextDecoder().decode(responseBody);
      const isCaptcha =
        bodyText.trim().toLowerCase().startsWith("<!doctype") &&
        (bodyText.includes("aliyunwaf") || bodyText.includes("AliyunCaptcha"));

      if (!isCaptcha && status >= 200 && status < 300) {
        activity("captcha.verified", {
          cookies: getWafCookies().slice(0, 50) + "…",
        });
        // Clear stored captcha — it's been solved
        setLastCaptchaHtml(null);
      }
    }

    return new Response(responseBody, {
      status,
      headers: resHeaders,
    });
  } catch (err) {
    activity("captcha.proxy_error", { error: String(err) }, "error");
    return c.json({ error: "Captcha proxy request failed", details: String(err) }, 502);
  }
});

/**
 * POST /captcha/verify
 *
 * Called by the client after the captcha iframe signals success.
 * Makes a test request to agentrouter.org using stored cookies to confirm
 * the WAF session is active.
 */
captchaRoute.post("/captcha/verify", async (c) => {
  const cookies = getWafCookies();
  if (!cookies) {
    return c.json({ verified: false, error: "No WAF cookies stored" }, 400);
  }

  activity("captcha.verify_check", { cookieCount: cookies.split(";").length });

  try {
    // Lightweight probe — just check if we can get past the WAF
    const probe = await fetch(`${AGENT_ROUTER_BASE}/v1/models`, {
      method: "GET",
      headers: {
        Cookie: cookies,
        "User-Agent": process.env.ANTHROPIC_USER_AGENT || "Cline/3.0.0",
        Accept: "application/json",
      },
    });

    const text = await probe.text();
    const isStillCaptcha =
      text.trim().toLowerCase().startsWith("<!doctype") ||
      text.includes("aliyunwaf") ||
      text.includes("AliyunCaptcha");

    // Capture any fresh cookies
    const setCookie = probe.headers.get("set-cookie");
    if (setCookie) ingestWafCookies(setCookie);

    if (isStillCaptcha) {
      activity("captcha.verify_failed", { reason: "still_captcha" }, "warn");
      return c.json({ verified: false, error: "WAF still requires captcha" }, 403);
    }

    activity("captcha.verify_ok", { status: probe.status });
    setLastCaptchaHtml(null); // Clear — captcha is solved
    return c.json({ verified: true, message: "WAF session active — AI requests will now succeed" });
  } catch (err) {
    activity("captcha.verify_error", { error: String(err) }, "error");
    return c.json({ verified: false, error: String(err) }, 500);
  }
});

// ─── Helpers ───

/**
 * Rewrite captcha HTML to proxy all agentrouter.org requests through our backend,
 * and inject a success notification script.
 */
function rewriteCaptchaHtml(html: string, proxyBase: string): string {
  let modified = html;

  // Rewrite absolute agentrouter.org URLs
  modified = modified.replace(
    /https?:\/\/agentrouter\.org/gi,
    proxyBase
  );

  // Rewrite relative paths in form actions and XHR
  // The Aliyun captcha typically submits to the same origin, so rewrite "/" paths
  modified = modified.replace(
    /(action|src|href)=["']\/(?!\/)/gi,
    `$1="${proxyBase}/`
  );

  // Inject a script at the end of <body> (or before </html>) that:
  // 1. Monitors for page navigation / reload (sign of captcha success)
  // 2. Intercepts XMLHttpRequest and fetch to capture verification
  // 3. Posts a message to the parent window on success
  const injectedScript = `
<script>
(function() {
  var verified = false;

  // Monitor for navigation — Aliyun WAF typically reloads the page after captcha success
  var origAssign = window.location.assign;
  var origReplace = window.location.replace;

  function notifyParent() {
    if (verified) return;
    verified = true;
    try {
      window.parent.postMessage({ type: 'agentpay-captcha-verified' }, '*');
    } catch(e) {}
  }

  // Intercept XHR
  var origXHROpen = XMLHttpRequest.prototype.open;
  var origXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._captchaUrl = url;
    return origXHROpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    var xhr = this;
    xhr.addEventListener('load', function() {
      // If the XHR response is NOT another captcha page, verification succeeded
      if (xhr.status >= 200 && xhr.status < 400) {
        var resp = xhr.responseText || '';
        if (!resp.includes('AliyunCaptcha') && !resp.includes('aliyunwaf')) {
          setTimeout(notifyParent, 500);
        }
      }
    });
    return origXHRSend.apply(this, arguments);
  };

  // Intercept fetch
  var origFetch = window.fetch;
  window.fetch = function() {
    return origFetch.apply(this, arguments).then(function(response) {
      if (response.ok) {
        response.clone().text().then(function(text) {
          if (!text.includes('AliyunCaptcha') && !text.includes('aliyunwaf')) {
            setTimeout(notifyParent, 500);
          }
        });
      }
      return response;
    });
  };

  // Fallback: after any successful captcha interaction, check after a delay
  document.addEventListener('click', function() {
    setTimeout(function() {
      // If the page hasn't been replaced with a new captcha, assume success
      if (!document.querySelector('.aliyun-captcha') && !document.querySelector('#AliyunCaptcha')) {
        notifyParent();
      }
    }, 3000);
  });
})();
</script>`;

  // Insert before </body> or </html>
  if (modified.includes("</body>")) {
    modified = modified.replace("</body>", injectedScript + "\n</body>");
  } else if (modified.includes("</html>")) {
    modified = modified.replace("</html>", injectedScript + "\n</html>");
  } else {
    modified += injectedScript;
  }

  return modified;
}
