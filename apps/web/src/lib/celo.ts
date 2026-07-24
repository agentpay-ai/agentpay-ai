import { createPublicClient, http } from "viem";
import { celo, celoSepolia } from "viem/chains";

export const publicClientCelo = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

export const publicClientSepolia = createPublicClient({
  chain: celoSepolia,
  transport: http("https://forno.celo-sepolia.celo-testnet.org"),
});
