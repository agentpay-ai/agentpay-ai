"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { botChain, botChainTestnet, celo, celoSepolia } from "@/lib/chains";

const wagmiConfig = createConfig({
  chains: [botChainTestnet, botChain, celo, celoSepolia],
  transports: {
    [botChainTestnet.id]: http("https://rpc.bohr.life"),
    [botChain.id]: http("https://rpc.botchain.ai"),
    [celo.id]: http("https://forno.celo.org"),
    [celoSepolia.id]: http("https://forno.celo-sepolia.celo-testnet.org"),
  },
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
