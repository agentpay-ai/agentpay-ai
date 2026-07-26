"use client";

import { useState } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useBalance } from "@/hooks/useBalance";
import { BalanceBar } from "@/components/BalanceBar";
import { Image as ImageIcon, Sparkles, Loader2, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

export default function ImagePage() {
  const { address } = useMiniPay();
  const { usdmBalance, usdcBalance, loading: balanceLoading, refetch } = useBalance(address);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        setImageUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&auto=format&fit=crop");
      }
    } catch {
      setImageUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&auto=format&fit=crop");
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
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <h1 className="font-bold text-white text-base">AI Image Creator</h1>
          </div>
        </div>
        <span className="text-xs font-bold bg-slate-900 text-purple-400 px-2.5 py-1 rounded-lg border border-slate-800">
          $0.05 USDm
        </span>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Res 512×512 Image Generation</span>
          </div>
          <p className="text-slate-400">
            Describe your image concept. Each creation costs $0.05 USDm via x402 on Celo.
          </p>
        </div>

        {imageUrl && (
          <div className="bg-slate-900 border border-purple-500/20 rounded-xl p-3 space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-square bg-slate-950 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Generated AI" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">512×512 PNG</span>
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-xs font-semibold text-purple-400 hover:text-purple-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-900 bg-slate-950 space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe image concept (e.g., 'Cyberpunk mobile wallet app interface')..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400/50 resize-none h-20"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full bg-purple-500 hover:bg-purple-400 disabled:bg-slate-800 text-slate-950 font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Image...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Image ($0.05 USDm)</span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}
