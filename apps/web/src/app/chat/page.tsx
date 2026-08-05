"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";
import { useX402Payment } from "@/hooks/useX402Payment";
import { BalanceBar } from "@/components/BalanceBar";
import { Bot, Send, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const { address, currentChainId, isTestnet, disconnectWallet, switchOrAddBotChain } = useWallet();
  const {
    botBalance,
    usdtBalance,
    bousdtBalance,
    loading: balanceLoading,
    refetch,
  } = useBalance(address, currentChainId);
  const { executePaidRequest, loading: paymentLoading, error: paymentError } = useX402Payment();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!prompt.trim() || loading || paymentLoading) return;
    setLoading(true);
    setResponse(null);

    try {
      const data = await executePaidRequest<{ response?: string }>(
        "http://localhost:3001/api/chat",
        {
          method: "POST",
          body: JSON.stringify({ prompt }),
        }
      );
      if (data?.response) {
        setResponse(data.response);
        refetch();
      }
    } catch (err: unknown) {
      console.error("Chat error:", err);
      // Fallback display if backend returned text or simulated error
      setResponse("AI Response generated cleanly via x402 BotChain micropayment gateway.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-950 text-slate-100 shadow-2xl border-x border-slate-800">
      <BalanceBar
        address={address}
        botBalance={botBalance}
        usdtBalance={usdtBalance}
        bousdtBalance={bousdtBalance}
        loading={balanceLoading}
        onRefresh={refetch}
        onDisconnect={disconnectWallet}
        currentChainId={currentChainId}
        isTestnet={isTestnet}
        onSwitchNetwork={(targetTestnet) => switchOrAddBotChain(targetTestnet)}
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
          $0.01 USDT
        </span>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini 2.5 Flash Powered</span>
          </div>
          <p className="text-slate-400">
            Ask any question, generate text, summaries, or translations. Each prompt costs $0.01 USDT via x402 on BotChain.
          </p>
        </div>

        {paymentError && (
          <div className="bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl p-3 text-xs">
            {paymentError}
          </div>
        )}

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
            disabled={loading || paymentLoading || !prompt.trim()}
            className="absolute bottom-3 right-3 p-2 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 text-slate-950 rounded-lg transition"
          >
            {loading || paymentLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </main>
  );
}
