"use client";

import { useEffect, useState, useCallback } from "react";

export function isMiniPay(): boolean {
  return typeof window !== "undefined" && window.ethereum?.isMiniPay === true;
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [inMiniPay] = useState<boolean>(() => isMiniPay());
  const [connecting, setConnecting] = useState<boolean>(false);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined" || !window.ethereum) {
      return null;
    }
    try {
      setConnecting(true);
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      })) as string[];
      const userAddress = accounts[0] || null;
      setAddress(userAddress);
      return userAddress;
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: unknown) => {
          const accs = accounts as string[];
          if (accs && accs.length > 0) {
            setAddress(accs[0]);
          }
        })
        .catch(() => {});
    }

    if (inMiniPay) {
      const timer = setTimeout(() => {
        connectWallet();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [inMiniPay, connectWallet]);

  return {
    address,
    inMiniPay,
    connecting,
    connectWallet,
  };
}
