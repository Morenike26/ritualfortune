import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Sparkles } from "lucide-react";

import { Header } from "@/components/Header";
import { FortuneCookie } from "@/components/FortuneCookie";
import { FortuneCard } from "@/components/FortuneCard";
import { HistoryList } from "@/components/Collections";
import { useWallet } from "@/hooks/useWallet";
import {
  RITUAL_FORTUNE_ABI,
  RITUAL_FORTUNE_ADDRESS,
  RITUAL_CHAIN_ID,
  publicClientForChain,
  walletClientForChain,
  ensureRitualNetwork,
  explorerTxUrl,
} from "@/lib/web3";
import { formatEther } from "viem";
import { historyStore, type FortuneEntry } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Ritual Fortune — On-chain wisdom, one cookie at a time" },
      {
        name: "description",
        content:
          "Crack open an on-chain fortune cookie and reveal a unique message from the Ritual Foundation Network.",
      },
      { property: "og:title", content: "Ritual Fortune" },
      {
        property: "og:description",
        content: "On-chain fortunes. A small daily ritual.",
      },
    ],
  }),
});

const FALLBACK_FORTUNES = [
  "A quiet door is opening — walk through it.",
  "Your next idea is closer than your last regret.",
  "What you tend to in silence will bloom in public.",
  "The signal is faint but real. Trust the small yes.",
  "A brief detour today rewrites a longer road tomorrow.",
];

function pickFallback() {
  return FALLBACK_FORTUNES[Math.floor(Math.random() * FALLBACK_FORTUNES.length)];
}

const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours
const COOLDOWN_KEY = "ritual:lastOpen:";

function getLastOpen(addr: string): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(COOLDOWN_KEY + addr.toLowerCase()) ?? 0);
}
function setLastOpen(addr: string, ts: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COOLDOWN_KEY + addr.toLowerCase(), String(ts));
}

function formatRemaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

function Index() {
  const wallet = useWallet();
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<FortuneEntry | null>(null);
  const [history, setHistory] = useState<FortuneEntry[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setHistory(historyStore.list());
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const lastOpen = wallet.address ? getLastOpen(wallet.address) : 0;
  const remaining = wallet.address ? Math.max(0, lastOpen + COOLDOWN_MS - now) : 0;
  const cooldown = remaining > 0;

  const handleOpen = useCallback(async () => {
    if (isOpening) return;
    if (!wallet.address) {
      toast.message("Connect your wallet", {
        description: "You need a wallet to crack open an on-chain fortune.",
      });
      wallet.connect();
      return;
    }
    const last = getLastOpen(wallet.address);
    const left = last + COOLDOWN_MS - Date.now();
    if (left > 0) {
      toast.error("Patience, traveler", {
        description: `Next fortune available in ${formatRemaining(left)}.`,
      });
      return;
    }
    if (wallet.chainId !== RITUAL_CHAIN_ID) {
      try {
        await ensureRitualNetwork();
      } catch {
        toast.error("Wrong network", {
          description: "Switch to Ritual Foundation Network (Chain ID 1979) to continue.",
        });
        return;
      }
    }

    setIsOpening(true);
    setIsOpen(false);
    setCurrentFortune(null);

    let fortuneText = "";
    let txHash: string | undefined;

    try {
      const walletClient = walletClientForChain(RITUAL_CHAIN_ID, wallet.address);
      const publicClient = publicClientForChain(RITUAL_CHAIN_ID);

      try {
        const { result, request } = await publicClient.simulateContract({
          address: RITUAL_FORTUNE_ADDRESS,
          abi: RITUAL_FORTUNE_ABI,
          functionName: "openFortuneCookie",
          account: wallet.address,
        });
        fortuneText = (result as string) ?? "";
        try {
          const gas = await publicClient.estimateContractGas({
            address: RITUAL_FORTUNE_ADDRESS,
            abi: RITUAL_FORTUNE_ABI,
            functionName: "openFortuneCookie",
            account: wallet.address,
          });
          const gasPrice = await publicClient.getGasPrice();
          const cost = formatEther(gas * gasPrice);
          toast.message("Confirm in wallet", {
            description: `Estimated cost ≈ ${Number(cost).toFixed(6)} RITUAL`,
          });
        } catch {
          /* ignore */
        }
        txHash = await walletClient.writeContract(request);
      } catch {
        txHash = await walletClient.writeContract({
          address: RITUAL_FORTUNE_ADDRESS,
          abi: RITUAL_FORTUNE_ABI,
          functionName: "openFortuneCookie",
        });
      }

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });
      try {
        for (const log of receipt.logs) {
          try {
            const parsed = (publicClient as any).parseEventLogs?.({
              abi: RITUAL_FORTUNE_ABI,
              logs: [log],
            });
            if (parsed?.[0]?.eventName === "FortuneOpened") {
              fortuneText = parsed[0].args.fortune as string;
              break;
            }
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }

      if (txHash) {
        toast.success("Fortune confirmed on-chain", {
          description: "View transaction",
          action: {
            label: "Explorer",
            onClick: () =>
              window.open(explorerTxUrl(RITUAL_CHAIN_ID, txHash as `0x${string}`), "_blank"),
          },
        });
      }
    } catch (e: any) {
      toast.error("Could not open fortune", {
        description: e?.shortMessage ?? e?.message ?? "Transaction failed.",
      });
      fortuneText = pickFallback();
    }

    if (!fortuneText) fortuneText = pickFallback();

    const entry: FortuneEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: fortuneText,
      openedAt: Date.now(),
      user: wallet.address,
      txHash,
      chainId: wallet.chainId ?? undefined,
    };

    setIsOpen(true);
    setCurrentFortune(entry);
    setHistory(historyStore.add(entry));
    setIsOpening(false);
    if (wallet.address) setLastOpen(wallet.address, Date.now());
    setNow(Date.now());
  }, [isOpening, wallet]);

  const stats = useMemo(() => ({ opened: history.length }), [history.length]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="shimmer-bg" />
      <Toaster position="bottom-right" theme="light" richColors />

      <Header
        address={wallet.address}
        chainId={wallet.chainId}
        totalFortunes={null}
        isConnecting={wallet.isConnecting}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        onSwitchNetwork={wallet.switchToRitual}
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24">
        <section className="text-center pt-6 sm:pt-12">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
          >
            A small daily ritual · on-chain
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-5xl sm:text-7xl mt-3 leading-[1.05]"
          >
            Crack open <span className="italic text-primary">today's</span> fortune.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-4 text-muted-foreground max-w-xl mx-auto"
          >
            One fortune every six hours. Each tap calls the contract and reveals a unique
            on-chain message — confirmed by transaction.
          </motion.p>
        </section>

        <section className="mt-8 sm:mt-12 flex flex-col items-center">
          <FortuneCookie
            isOpening={isOpening}
            isOpen={isOpen}
            fortune={currentFortune?.text ?? null}
            onClick={handleOpen}
            disabled={isOpening || cooldown}
          />
          {cooldown && (
            <p className="mt-4 text-sm text-muted-foreground">
              Next fortune in <span className="font-mono text-foreground">{formatRemaining(remaining)}</span>
            </p>
          )}
        </section>

        <section className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
          <div className="hidden lg:flex justify-end">
            <StatPanel opened={stats.opened} />
          </div>
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              {currentFortune ? (
                <FortuneCard
                  key={currentFortune.id}
                  fortune={currentFortune.text}
                  openedAt={currentFortune.openedAt}
                  user={currentFortune.user}
                  chainId={currentFortune.chainId}
                  txHash={currentFortune.txHash}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground max-w-md"
                >
                  Your latest fortune card will appear here.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="lg:hidden">
            <StatPanel opened={stats.opened} />
          </div>
          <div className="hidden lg:block" />
        </section>

        <section className="mt-16">
          <h3 className="font-display text-2xl mb-4">History</h3>
          <HistoryList items={history} />
        </section>

        <footer className="mt-20 text-center text-xs text-muted-foreground">
          <Sparkles className="inline h-3 w-3 text-primary mr-1" />
          Ritual Fortune — contract {RITUAL_FORTUNE_ADDRESS.slice(0, 10)}…
        </footer>
      </main>
    </div>
  );
}

function StatPanel({ opened }: { opened: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-5 w-full max-w-xs mx-auto">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your ritual</p>
      <div className="mt-3 space-y-3">
        <Row label="Fortunes opened" value={opened.toString()} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-end justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-display text-2xl text-foreground leading-none">{value}</span>
    </div>
  );
}
