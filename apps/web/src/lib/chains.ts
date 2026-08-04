import { defineChain, createPublicClient, http } from "viem";
import { celo, celoSepolia } from "viem/chains";

export const botChain = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.botchain.ai"] },
  },
  blockExplorers: {
    default: { name: "BOTScan", url: "https://scan.botchain.ai" },
  },
});

export const botChainTestnet = defineChain({
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: { name: "tBOT", symbol: "tBOT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.bohr.life"] },
  },
  blockExplorers: {
    default: { name: "BOTScan Testnet", url: "https://scan.bohr.life" },
  },
  testnet: true,
});

export const publicClientBotChain = createPublicClient({
  chain: botChain,
  transport: http("https://rpc.botchain.ai"),
});

export const publicClientBotChainTestnet = createPublicClient({
  chain: botChainTestnet,
  transport: http("https://rpc.bohr.life"),
});

export const publicClientCelo = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

export const publicClientCeloSepolia = createPublicClient({
  chain: celoSepolia,
  transport: http("https://forno.celo-sepolia.celo-testnet.org"),
});

export { celo, celoSepolia };
