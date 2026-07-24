export const TOKENS = {
  mainnet: {
    USDm: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
    USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`,
    USDT: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e" as `0x${string}`,
  },
  sepolia: {
    USDC: "0x01C5C0122039549AD1493B8220cABEdD739BC44E" as `0x${string}`,
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
