"use client";

import { Wallet, Coins, RefreshCw, Cpu, LogOut } from "lucide-react";

interface BalanceBarProps {
  address: string | null;
  botBalance: string;
  usdmBalance: string;
  usdcBalance: string;
  loading: boolean;
  onRefresh: () => void;
  onDisconnect?: () => void;
  onSwitchNetwork?: () => void;
}

export function BalanceBar({
  address,
  botBalance,
  usdmBalance,
  usdcBalance,
  loading,
  onRefresh,
  onDisconnect,
  onSwitchNetwork,
}: BalanceBarProps) {
  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : null;

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 text-white flex flex-col space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wallet className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-slate-300 text-xs">
            {truncatedAddress || "Not Connected"}
          </span>
          {address && onDisconnect && (
            <button
              onClick={onDisconnect}
              className="text-slate-500 hover:text-red-400 transition p-1 rounded hover:bg-slate-800"
              title="Disconnect Wallet"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onSwitchNetwork}
          className="flex items-center space-x-1.5 bg-purple-950/60 hover:bg-purple-900/80 px-2.5 py-0.5 rounded-full border border-purple-800/50 text-[11px] font-semibold text-purple-300 transition cursor-pointer"
          title="Click to Switch / Add BotChain Network"
        >
          <Cpu className="w-3 h-3 text-purple-400" />
          <span>BotChain EVM</span>
        </button>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-purple-900/40 px-2.5 py-1 rounded-full border border-purple-700/50">
            <Coins className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-purple-300 text-xs">
              {botBalance} BOT
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
            <span className="font-semibold text-emerald-400 text-xs">
              ${usdmBalance} USDm
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
            <span className="font-semibold text-sky-400 text-xs">
              ${usdcBalance} USDC
            </span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-slate-400 hover:text-white transition disabled:opacity-50 p-1"
          title="Refresh balances"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
