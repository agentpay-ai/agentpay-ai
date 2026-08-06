"use client";

import { ShieldAlert, X, RefreshCw } from "lucide-react";

interface CaptchaModalProps {
  captchaHtml: string | null;
  onClose: () => void;
}

export function CaptchaModal({ captchaHtml, onClose }: CaptchaModalProps) {
  if (!captchaHtml) return null;

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
          Please slide to complete the security verification below to proceed with your AI prompt.
        </div>

        {/* Captcha iframe container */}
        <div className="flex-1 bg-white min-h-[340px] overflow-hidden">
          <iframe
            title="Security Verification Challenge"
            srcDoc={captchaHtml}
            className="w-full h-full min-h-[330px] border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
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
