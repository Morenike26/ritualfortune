import { createPublicClient, createWalletClient, custom, http, defineChain, type Address, type Hex } from "viem";

export const RITUAL_FORTUNE_ADDRESS = "0x578949C19ec466965386B7eCAEb5fd341153c154" as Address;

export const RITUAL_CHAIN_ID = 1979;
export const RITUAL_RPC_URL = "https://rpc.ritualfoundation.org";
export const RITUAL_EXPLORER_URL = "https://explorer.ritualfoundation.org";

export const ritualChain = defineChain({
  id: RITUAL_CHAIN_ID,
  name: "Ritual Foundation Network",
  nativeCurrency: { name: "Ritual", symbol: "RITUAL", decimals: 18 },
  rpcUrls: {
    default: { http: [RITUAL_RPC_URL] },
    public: { http: [RITUAL_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Ritual Explorer", url: RITUAL_EXPLORER_URL },
  },
});

// ABI per RitualFortune contract
export const RITUAL_FORTUNE_ABI = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "openFortuneCookie",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
  },
  {
    type: "function",
    name: "getTotalFortunes",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
  },
  {
    type: "event",
    name: "FortuneOpened",
    anonymous: false,
    inputs: [
      { name: "user", type: "address", indexed: false, internalType: "address" },
      { name: "fortune", type: "string", indexed: false, internalType: "string" },
    ],
  },
] as const;

export function getEthereum(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum ?? null;
}

export function publicClientForChain(_chainId?: number) {
  return createPublicClient({
    chain: ritualChain,
    transport: http(RITUAL_RPC_URL),
  });
}

export function walletClientForChain(_chainId: number, account: Address) {
  const eth = getEthereum();
  if (!eth) throw new Error("No injected wallet found");
  return createWalletClient({
    chain: ritualChain,
    account,
    transport: custom(eth),
  });
}

export async function ensureRitualNetwork() {
  const eth = getEthereum();
  if (!eth) throw new Error("No injected wallet found");
  const hexId = "0x" + RITUAL_CHAIN_ID.toString(16);
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
  } catch (err: any) {
    if (err?.code === 4902 || /Unrecognized chain/i.test(err?.message ?? "")) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexId,
            chainName: "Ritual Foundation Network",
            nativeCurrency: { name: "Ritual", symbol: "RITUAL", decimals: 18 },
            rpcUrls: [RITUAL_RPC_URL],
            blockExplorerUrls: [RITUAL_EXPLORER_URL],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export function shortAddr(addr?: string | null) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function explorerTxUrl(_chainId: number | null | undefined, hash: Hex | string) {
  return `${RITUAL_EXPLORER_URL}/tx/${hash}`;
}

export function explorerAddrUrl(_chainId: number | null | undefined, address: Address | string) {
  return `${RITUAL_EXPLORER_URL}/address/${address}`;
}
