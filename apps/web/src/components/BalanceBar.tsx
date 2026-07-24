"use client";

import { Wallet, Coins, RefreshCw } from "lucide-react";

interface BalanceBarProps {
  address: string | null;
  usdmBalance: string;
  usdcBalance: string;
  loading: boolean;
  onRefresh: () => void;
}

export function BalanceBar({
  address,
  usdmBalance,
  usdcBalance,
  loading,
  onRefresh,
}: BalanceBarProps) {
  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : null;

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 text-white flex items-center justify-between text-sm">
      <div className="flex items-center space-x-2">
        <Wallet className="w-4 h-4 text-amber-400" />
        <span className="font-mono text-slate-300">
          {truncatedAddress || "Not Connected"}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-emerald-400">
            ${usdmBalance} USDm
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          <span className="font-semibold text-sky-400">
            ${usdcBalance} USDC
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-slate-400 hover:text-white transition disabled:opacity-50"
          title="Refresh balances"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
