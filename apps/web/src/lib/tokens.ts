export const TOKENS = {
  // BotChain Mainnet (Chain ID: 677)
  botChainMainnet: {
    USDT: "0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C" as `0x${string}`,
    BOUSDT: "0x118f7B25a0907577041F1c10d7E0cBD153986f66" as `0x${string}`,
    USDm: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
    USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`,
  },
  // BotChain Testnet / Devnet (Chain ID: 968)
  botChainTestnet: {
    USDT: "0x75edC9335175Fc0552D51D48439F229c10420fe3" as `0x${string}`,
    USDm: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
    USDC: "0x01C5C0122039549AD1493B8220cABEdD739BC44E" as `0x${string}`,
  },
  // Celo Fallback Network (Chain ID: 42220)
  celoMainnet: {
    USDm: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
    USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`,
    USDT: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e" as `0x${string}`,
  },
};

export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
] as const;
