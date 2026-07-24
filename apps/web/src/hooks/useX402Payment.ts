"use client";

import { useState } from "react";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { createWalletClient, custom } from "viem";
import { celo, celoSepolia } from "viem/chains";

export function useX402Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function executePaidRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MiniPay / Celo wallet not available");
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0] as `0x${string}`;

      if (!account) {
        throw new Error("No wallet account connected");
      }

      const walletClient = createWalletClient({
        account,
        chain: celo,
        transport: custom(window.ethereum),
      });

      const signer = {
        address: account,
        signTypedData: async (params: any) => {
          return walletClient.signTypedData({
            account,
            domain: params.domain,
            types: params.types,
            primaryType: params.primaryType,
            message: params.message,
          });
        },
      };

      const client = new x402Client()
        .register("eip155:42220", new ExactEvmScheme(signer))
        .register("eip155:11142220", new ExactEvmScheme(signer));

      const x402Fetch = wrapFetchWithPayment(fetch, client);

      const response = await x402Fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      const errMsg = err.message || "Payment execution failed";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    executePaidRequest,
    loading,
    error,
    txHash,
  };
}
