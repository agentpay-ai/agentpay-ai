"use client";

import { useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

interface EthereumProvider {
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMiniPay?: boolean;
}

function getEthereum(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return window.ethereum as unknown as EthereumProvider | undefined;
}

export function isMiniPay(): boolean {
  return getEthereum()?.isMiniPay === true;
}

export function hasEVMWallet(): boolean {
  return Boolean(getEthereum());
}

export function useWallet() {
  const { login, logout, authenticated, ready, user } = usePrivy();
  const { wallets } = useWallets();

  const primaryWallet = wallets[0];
  // Only expose wallet address when Privy session is authenticated
  const address = authenticated ? (primaryWallet?.address || user?.wallet?.address || null) : null;

  const disconnectWallet = useCallback(async () => {
    try {
      // Disconnect active connected wallets from Privy state
      for (const wallet of wallets) {
        if (typeof wallet.disconnect === "function") {
          await wallet.disconnect();
        }
      }
      // Logout from Privy session if authenticated
      if (authenticated) {
        await logout();
      }
    } catch (err) {
      console.error("Wallet disconnect error:", err);
    }
  }, [authenticated, logout, wallets]);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    try {
      login();
      return address;
    } catch (err) {
      console.error("Privy login error:", err);
      return null;
    }
  }, [login, address]);

  const switchOrAddBotChain = useCallback(
    async (isTestnet = true) => {
      const chainIdHex = isTestnet ? "0x3c8" : "0x2a5"; // 968 decimal / 677 decimal
      const chainIdDec = isTestnet ? 968 : 677;

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

      // 1. Try Privy primaryWallet switchChain
      if (primaryWallet) {
        try {
          await primaryWallet.switchChain(chainIdDec);
          return;
        } catch {
          // If switchChain fails (e.g. chain not added in wallet), get primaryWallet's provider
          try {
            const provider = (await primaryWallet.getEthereumProvider()) as EthereumProvider;
            if (provider?.request) {
              try {
                await provider.request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: chainIdHex }],
                });
                return;
              } catch (switchErr: unknown) {
                const err = switchErr as { code?: number; message?: string };
                if (
                  err.code === 4902 ||
                  err.message?.includes("Unrecognized chain") ||
                  err.message?.includes("Could not find chain")
                ) {
                  await provider.request({
                    method: "wallet_addEthereumChain",
                    params: [chainParams],
                  });
                  return;
                }
              }
            }
          } catch (providerErr) {
            console.error("Provider switch error:", providerErr);
          }
        }
      }

      // 2. Direct fallback to window.ethereum
      const eth = getEthereum();
      if (eth?.request) {
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
          });
        } catch (switchError: unknown) {
          const err = switchError as { code?: number; message?: string };
          if (
            err.code === 4902 ||
            err.message?.includes("Unrecognized chain") ||
            err.message?.includes("Could not find chain")
          ) {
            try {
              await eth.request({
                method: "wallet_addEthereumChain",
                params: [chainParams],
              });
            } catch (addError) {
              console.error("Failed to add BotChain network:", addError);
            }
          }
        }
      }
    },
    [primaryWallet]
  );

  const chainIdRaw = primaryWallet?.chainId ? String(primaryWallet.chainId).replace("eip155:", "") : "968";
  const currentChainId = parseInt(chainIdRaw, 10) || 968;
  const isTestnet = currentChainId === 968;
  const currentChainName = currentChainId === 677 ? "BotChain Mainnet" : currentChainId === 968 ? "BotChain Testnet" : `Chain ${currentChainId}`;

  return {
    address,
    authenticated,
    ready,
    user,
    wallets,
    currentChainId,
    isTestnet,
    currentChainName,
    inMiniPay: isMiniPay(),
    hasEVMWallet: hasEVMWallet(),
    connecting: !ready,
    connectWallet,
    disconnectWallet,
    switchOrAddBotChain,
  };
}
