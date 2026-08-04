"use client";

import { useState } from "react";
import { Wallet, Coins, RefreshCw, Cpu, LogOut, ChevronDown, Copy, Check } from "lucide-react";

interface BalanceBarProps {
  address: string | null;
  botBalance: string;
  usdmBalance: string;
  usdcBalance: string;
  loading: boolean;
  onRefresh: () => void;
  onDisconnect?: () => void;
  currentChainId?: number;
  isTestnet?: boolean;
  onSwitchNetwork?: (isTestnet: boolean) => void;
}

export function BalanceBar({
  address,
  botBalance,
  usdmBalance,
  usdcBalance,
  loading,
  onRefresh,
  onDisconnect,
  isTestnet = true,
  onSwitchNetwork,
}: BalanceBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : null;

  async function handleCopyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  }

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 text-white flex flex-col space-y-2 text-sm relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Wallet className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-slate-300 text-xs">
            {truncatedAddress || "Not Connected"}
          </span>
          {address && (
            <button
              onClick={handleCopyAddress}
              className="text-slate-400 hover:text-purple-300 transition p-1 rounded hover:bg-slate-800"
              title={copied ? "Copied!" : "Copy Wallet Address"}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
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

        {/* Network Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-1.5 bg-purple-950/70 hover:bg-purple-900 px-2.5 py-1 rounded-full border border-purple-700/50 text-[11px] font-semibold text-purple-200 transition cursor-pointer shadow-sm"
            title="Switch BotChain Network (Testnet / Mainnet)"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isTestnet ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <Cpu className="w-3 h-3 text-purple-300" />
            <span>{isTestnet ? "BotChain Testnet (968)" : "BotChain Mainnet (677)"}</span>
            <ChevronDown className="w-3 h-3 text-purple-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-slate-900 border border-purple-800/60 rounded-xl shadow-xl z-50 p-1 space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                Select Network
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSwitchNetwork?.(true);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                  isTestnet
                    ? "bg-purple-900/60 text-purple-200 font-semibold"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>BotChain Testnet</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">968</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSwitchNetwork?.(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                  !isTestnet
                    ? "bg-purple-900/60 text-purple-200 font-semibold"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>BotChain Mainnet</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">677</span>
              </button>
            </div>
          )}
        </div>
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
