import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { getEthereum, ensureRitualNetwork, RITUAL_CHAIN_ID } from "@/lib/web3";

export type WalletState = {
  address: Address | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;
    try {
      const accounts: string[] = await eth.request({ method: "eth_accounts" });
      const chainHex: string = await eth.request({ method: "eth_chainId" });
      setState((s) => ({
        ...s,
        address: (accounts[0] as Address) ?? null,
        chainId: parseInt(chainHex, 16),
      }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();
    const eth = getEthereum();
    if (!eth?.on) return;
    const onAcc = (accounts: string[]) =>
      setState((s) => ({ ...s, address: (accounts[0] as Address) ?? null }));
    const onChain = (hex: string) =>
      setState((s) => ({ ...s, chainId: parseInt(hex, 16) }));
    eth.on("accountsChanged", onAcc);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAcc);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [refresh]);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      setState((s) => ({
        ...s,
        error: "No wallet detected. Install MetaMask or another web3 wallet.",
      }));
      return;
    }
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const chainHex: string = await eth.request({ method: "eth_chainId" });
      setState({
        address: (accounts[0] as Address) ?? null,
        chainId: parseInt(chainHex, 16),
        isConnecting: false,
        error: null,
      });
    } catch (e: any) {
      setState((s) => ({ ...s, isConnecting: false, error: e?.message ?? "Connection failed" }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, chainId: null, isConnecting: false, error: null });
  }, []);

  return { ...state, connect, disconnect, refresh };
}
