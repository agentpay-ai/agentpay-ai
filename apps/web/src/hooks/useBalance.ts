"use client";

import { useEffect, useState, useCallback } from "react";
import { formatUnits } from "viem";
import { publicClientBotChainTestnet, publicClientCelo } from "@/lib/chains";
import { TOKENS, ERC20_ABI } from "@/lib/tokens";

export function useBalance(address: string | null) {
  const [botBalance, setBotBalance] = useState<string>("0.00");
  const [usdmBalance, setUsdmBalance] = useState<string>("0.00");
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [botRaw, usdmRaw, usdcRaw] = await Promise.all([
        publicClientBotChainTestnet.getBalance({ address: address as `0x${string}` }).catch(() => BigInt(0)),
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

      setBotBalance(Number(formatUnits(botRaw, 18)).toFixed(2));
      setUsdmBalance(Number(formatUnits(usdmRaw, 18)).toFixed(2));
      setUsdcBalance(Number(formatUnits(usdcRaw, 6)).toFixed(2));
    } catch (err) {
      console.error("Error reading balances:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (address) {
        fetchBalances();
      }
    }, 0);
    const interval = setInterval(() => {
      if (address) fetchBalances();
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [address, fetchBalances]);

  return {
    botBalance,
    usdmBalance,
    usdcBalance,
    loading,
    refetch: fetchBalances,
  };
}
