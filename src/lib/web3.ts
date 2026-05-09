import { createPublicClient, createWalletClient, custom, http, type Address, type Hex } from "viem";
import { mainnet, base, polygon, sepolia, baseSepolia } from "viem/chains";

export const RITUAL_FORTUNE_ADDRESS = "0xD0ef52D7865D7A4f01A2620bb64BC6fc680954aC" as Address;

// Reasonable ABI inferred from feature list. openFortuneCookie returns a string fortune;
// also emits FortuneOpened(address indexed user, string fortune, uint256 indexed id).
export const RITUAL_FORTUNE_ABI = [
  {
    type: "function",
    name: "openFortuneCookie",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "fortune", type: "string" }],
  },
  {
    type: "function",
    name: "getTotalFortunes",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "FortuneOpened",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "fortune", type: "string", indexed: false },
      { name: "id", type: "uint256", indexed: true },
    ],
    anonymous: false,
  },
] as const;

const SUPPORTED_CHAINS = [mainnet, base, polygon, sepolia, baseSepolia];

export function chainById(id: number) {
  return SUPPORTED_CHAINS.find((c) => c.id === id) ?? mainnet;
}

export function getEthereum(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum ?? null;
}

export function publicClientForChain(chainId: number) {
  const chain = chainById(chainId);
  const eth = getEthereum();
  return createPublicClient({
    chain,
    transport: eth ? custom(eth) : http(),
  });
}

export function walletClientForChain(chainId: number, account: Address) {
  const eth = getEthereum();
  if (!eth) throw new Error("No injected wallet found");
  return createWalletClient({
    chain: chainById(chainId),
    account,
    transport: custom(eth),
  });
}

export function shortAddr(addr?: string | null) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function explorerTxUrl(chainId: number, hash: Hex) {
  const chain = chainById(chainId);
  const base = chain.blockExplorers?.default.url ?? "https://etherscan.io";
  return `${base}/tx/${hash}`;
}

export function explorerAddrUrl(chainId: number, address: Address) {
  const chain = chainById(chainId);
  const base = chain.blockExplorers?.default.url ?? "https://etherscan.io";
  return `${base}/address/${address}`;
}
