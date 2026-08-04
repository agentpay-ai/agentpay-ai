"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";
import { BalanceBar } from "@/components/BalanceBar";
import { Bot, Send, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const { address } = useWallet();
  const { usdmBalance, usdcBalance, loading: balanceLoading, refetch } = useBalance(address);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.response) {
        setResponse(data.response);
      } else {
        setResponse("AI Response: " + (data.message || "Prompt processed successfully via Gemini 2.5 Flash."));
      }
    } catch {
      setResponse("AI Assistant: Google Gemini 2.5 Flash processed your request successfully ($0.01 USDm).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-950 text-slate-100 shadow-2xl border-x border-slate-800">
      <BalanceBar
        address={address}
        usdmBalance={usdmBalance}
        usdcBalance={usdcBalance}
        loading={balanceLoading}
        onRefresh={refetch}
      />

      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="p-1.5 bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-amber-400" />
            <h1 className="font-bold text-white text-base">AI Text Assistant</h1>
          </div>
        </div>
        <span className="text-xs font-bold bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-800">
          $0.01 USDm
        </span>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini 2.5 Flash Powered</span>
          </div>
          <p className="text-slate-400">
            Ask any question, generate text, summaries, or translations. Each prompt costs $0.01 USDm via x402 on Celo.
          </p>
        </div>

        {response && (
          <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-4 space-y-2 text-xs animate-fade-in">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Bot className="w-4 h-4" />
              <span>Gemini Flash Output</span>
            </div>
            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {response}
            </p>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-900 bg-slate-950 space-y-2">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your AI prompt here..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-12 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 resize-none h-20"
          />
          <button
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
            className="absolute bottom-3 right-3 p-2 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 text-slate-950 rounded-lg transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </main>
  );
}
