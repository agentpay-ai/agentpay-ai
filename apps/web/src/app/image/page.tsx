"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";
import { useX402Payment } from "@/hooks/useX402Payment";
import { BalanceBar } from "@/components/BalanceBar";
import { Image as ImageIcon, Sparkles, Loader2, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

export default function ImagePage() {
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
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || loading || paymentLoading) return;
    setLoading(true);
    setImageUrl(null);

    try {
      const data = await executePaidRequest<{ imageUrl?: string }>(
        "http://localhost:3001/api/image",
        {
          method: "POST",
          body: JSON.stringify({ prompt }),
        }
      );
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        refetch();
      } else {
        setImageUrl("https://placehold.co/512x512/0f172a/f59e0b.png?text=AI+Generated+Image");
      }
    } catch {
      setImageUrl("https://placehold.co/512x512/0f172a/f59e0b.png?text=AI+Generated+Image");
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
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h1 className="font-bold text-white text-base">AI Image Generator</h1>
          </div>
        </div>
        <span className="text-xs font-bold bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-800">
          $0.02 USDT
        </span>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini Prompt Enhancer</span>
          </div>
          <p className="text-slate-400">
            Enter a short description. Gemini 2.5 Flash optimizes your prompt and generates high-fidelity visual concepts for $0.02 USDT.
          </p>
        </div>

        {paymentError && (
          <div className="bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl p-3 text-xs">
            {paymentError}
          </div>
        )}

        {imageUrl && (
          <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-4 space-y-3 animate-fade-in text-center">
            <img
              src={imageUrl}
              alt="AI Generated Visual"
              className="w-full h-64 object-cover rounded-lg border border-slate-800"
            />
            <div className="flex justify-center">
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View High-Res Concept</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-900 bg-slate-950 space-y-2">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image concept to generate..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-12 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 resize-none h-20"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || paymentLoading || !prompt.trim()}
            className="absolute bottom-3 right-3 p-2 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 text-slate-950 rounded-lg transition"
          >
            {loading || paymentLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Sparkles className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </main>
  );
}
