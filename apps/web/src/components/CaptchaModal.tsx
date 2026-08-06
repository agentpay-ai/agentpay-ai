"use client";

import { useEffect, useCallback, useRef } from "react";
import { ShieldAlert, X, RefreshCw, CheckCircle } from "lucide-react";
import { getApiUrl } from "@/lib/environment";

interface CaptchaModalProps {
  /** Whether the captcha modal should be shown */
  captchaHtml: string | null;
  /** Called when the user closes the modal (dismiss or after verification success) */
  onClose: () => void;
  /** Called after successful captcha verification — parent should retry the request */
  onVerified?: () => void;
}

export function CaptchaModal({ captchaHtml, onClose, onVerified }: CaptchaModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const apiUrl = getApiUrl();
  const verifiedRef = useRef(false);

  /**
   * The iframe loads the captcha challenge from the backend proxy endpoint.
   * The backend rewrites the captcha HTML to route all verification requests
   * through itself, so the WAF cookies are captured server-side.
   * After the user solves the captcha, the injected script sends a
   * `agentpay-captcha-verified` postMessage to the parent window.
   */
  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      if (event.data?.type !== "agentpay-captcha-verified") return;
      if (verifiedRef.current) return;
      verifiedRef.current = true;

      console.info("[agentpay] captcha verification signal received from iframe");

      // Confirm verification with the backend
      try {
        const res = await fetch(`${apiUrl}/api/captcha/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        console.info("[agentpay] captcha verify response:", data);

        if (data.verified) {
          onVerified?.();
        }
      } catch (err) {
        console.warn("[agentpay] captcha verify check failed:", err);
      }

      onClose();
    },
    [apiUrl, onClose, onVerified]
  );

  useEffect(() => {
    if (!captchaHtml) return;
    verifiedRef.current = false;
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [captchaHtml, handleMessage]);

  if (!captchaHtml) return null;

  // Point the iframe to the backend captcha proxy, NOT srcDoc.
  // This way all requests from the iframe flow through the backend's IP.
  const challengeUrl = `${apiUrl}/api/captcha/challenge`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm">Security Verification Required</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/50 rounded-lg transition"
            aria-label="Close verification modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="p-3 bg-amber-950/40 border-b border-amber-500/20 text-xs text-amber-200">
          Complete the slider verification below. This unlocks the AI gateway for your session —
          the verification is processed through the backend server.
        </div>

        {/* Captcha iframe — points to backend proxy, NOT srcDoc */}
        <div className="flex-1 bg-white min-h-[340px] overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Security Verification Challenge"
            src={challengeUrl}
            className="w-full h-full min-h-[330px] border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400">Completed verification?</span>
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Close & Retry Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
