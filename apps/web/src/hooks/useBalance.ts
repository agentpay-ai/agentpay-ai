"use client";

import { useEffect, useState, useCallback } from "react";
import { formatUnits } from "viem";
import { publicClientCelo } from "@/lib/celo";
import { TOKENS, ERC20_ABI } from "@/lib/tokens";

export function useBalance(address: string | null) {
  const [usdmBalance, setUsdmBalance] = useState<string>("0.00");
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [usdmRaw, usdcRaw] = await Promise.all([
        publicClientCelo.readContract({
          address: TOKENS.mainnet.USDm,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }).catch(() => BigInt(0)),
        publicClientCelo.readContract({
          address: TOKENS.mainnet.USDC,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }).catch(() => BigInt(0)),
      ]);

      setUsdmBalance(Number(formatUnits(usdmRaw, 18)).toFixed(2));
      setUsdcBalance(Number(formatUnits(usdcRaw, 6)).toFixed(2));
    } catch (err) {
      console.error("Error reading balances:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 15000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  return {
    usdmBalance,
    usdcBalance,
    loading,
    refetch: fetchBalances,
  };
}
