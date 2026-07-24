"use client";

import { ShieldCheck, Loader2, DollarSign, X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  priceFormatted: string;
  loading: boolean;
  onConfirm: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  toolName,
  priceFormatted,
  loading,
  onConfirm,
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">x402 Micropayment</h3>
            <p className="text-xs text-slate-400">Powered by Celo Facilitator</p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Selected Service</span>
            <span className="font-medium text-white">{toolName}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Network Fee</span>
            <span className="font-medium text-emerald-400">Sponsored (0 Gas)</span>
          </div>
          <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
            <span className="text-sm font-semibold text-white">Prompt Price</span>
            <span className="text-base font-bold text-amber-400">{priceFormatted}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>EIP-3009 transfer authorization signed directly in MiniPay.</span>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Settling...</span>
              </>
            ) : (
              <span>Confirm & Pay</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
