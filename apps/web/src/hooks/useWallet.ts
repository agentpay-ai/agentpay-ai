"use client";

import { useEffect, useState, useCallback } from "react";

export function isMiniPay(): boolean {
  return typeof window !== "undefined" && window.ethereum?.isMiniPay === true;
}

export function hasEVMWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [inMiniPay] = useState<boolean>(() => isMiniPay());
  const [evmAvailable] = useState<boolean>(() => hasEVMWallet());
  const [connecting, setConnecting] = useState<boolean>(false);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
  }, []);

  const switchOrAddBotChain = useCallback(async (isTestnet = true) => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const chainIdHex = isTestnet ? "0x3c8" : "0x2a5"; // 968 decimal / 677 decimal

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number; message?: string };
      if (err.code === 4902 || err.message?.includes("Unrecognized chain")) {
        const chainParams = isTestnet
          ? {
              chainId: "0x3c8",
              chainName: "BOT Chain Testnet",
              nativeCurrency: { name: "tBOT", symbol: "tBOT", decimals: 18 },
              rpcUrls: ["https://rpc.bohr.life"],
              blockExplorerUrls: ["https://scan.bohr.life"],
            }
          : {
              chainId: "0x2a5",
              chainName: "BOT Chain",
              nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
              rpcUrls: ["https://rpc.botchain.ai"],
              blockExplorerUrls: ["https://scan.botchain.ai"],
            };

        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [chainParams],
          });
        } catch (addError) {
          console.error("Failed to add BotChain network:", addError);
        }
      }
    }
  }, []);

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

      // Automatically prompt to switch/add BotChain network on connection
      await switchOrAddBotChain(true);

      return userAddress;
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      return null;
    } finally {
      setConnecting(false);
    }
  }, [switchOrAddBotChain]);

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

      const handleAccountsChanged = (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs && accs.length > 0) {
          setAddress(accs[0]);
        } else {
          setAddress(null);
        }
      };

      if (window.ethereum.on) {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
      }

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
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
    hasEVMWallet: evmAvailable,
    connecting,
    connectWallet,
    disconnectWallet,
    switchOrAddBotChain,
  };
}
