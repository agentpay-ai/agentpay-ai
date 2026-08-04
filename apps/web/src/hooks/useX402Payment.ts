"use client";

import { useState } from "react";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { createWalletClient, custom } from "viem";
import { botChainTestnet } from "@/lib/chains";

type SignTypedDataParams = Parameters<
  ReturnType<typeof createWalletClient>["signTypedData"]
>[0];

export function useX402Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function executePaidRequest<T = unknown>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Web3 / BotChain wallet not available");
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const account = accounts[0] as `0x${string}`;

      if (!account) {
        throw new Error("No wallet account connected");
      }

      const walletClient = createWalletClient({
        account,
        chain: botChainTestnet,
        transport: custom(window.ethereum),
      });

      const signer = {
        address: account,
        signTypedData: async (params: {
          domain: Record<string, unknown>;
          types: Record<string, unknown>;
          primaryType: string;
          message: Record<string, unknown>;
        }) => {
          const typedParams = {
            account,
            domain: params.domain,
            types: params.types,
            primaryType: params.primaryType,
            message: params.message,
          } as unknown as SignTypedDataParams;

          return walletClient.signTypedData(typedParams);
        },
      };

      const client = new x402Client()
        .register("eip155:677", new ExactEvmScheme(signer))
        .register("eip155:968", new ExactEvmScheme(signer))
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

      const data = (await response.json()) as T;
      return data;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Payment execution failed";
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
