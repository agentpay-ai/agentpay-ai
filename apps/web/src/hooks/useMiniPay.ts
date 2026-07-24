"use client";

import { useEffect, useState } from "react";

export function isMiniPay(): boolean {
  return typeof window !== "undefined" && window.ethereum?.isMiniPay === true;
}

export function useMiniPay() {
  const [address, setAddress] = useState<string | null>(null);
  const [inMiniPay, setInMiniPay] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);

  async function connectWallet(): Promise<string | null> {
    if (typeof window === "undefined" || !window.ethereum) {
      return null;
    }
    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      });
      const userAddress = accounts[0] || null;
      setAddress(userAddress);
      return userAddress;
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      return null;
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => {
    const miniPayDetected = isMiniPay();
    setInMiniPay(miniPayDetected);
    if (miniPayDetected) {
      connectWallet();
    }
  }, []);

  return {
    address,
    inMiniPay,
    connecting,
    connectWallet,
  };
}
