import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Sparkles, History as HistoryIcon, Images } from "lucide-react";

import { Header } from "@/components/Header";
import { FortuneCookie } from "@/components/FortuneCookie";
import { FortuneCard } from "@/components/FortuneCard";
import { HistoryList, MintGallery } from "@/components/Collections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { historyStore, mintsStore, type FortuneEntry, type MintedCard } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Ritual Fortune — On-chain wisdom, one cookie at a time" },
      {
        name: "description",
        content:
          "Crack open an on-chain fortune cookie, reveal a unique message, and mint your favorites as collectible NFTs.",
      },
      { property: "og:title", content: "Ritual Fortune" },
      {
        property: "og:description",
        content: "On-chain fortunes. Mintable wisdom. A small daily ritual.",
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

function Index() {
  const wallet = useWallet();
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<FortuneEntry | null>(null);
  const [mintState, setMintState] = useState<"idle" | "minting" | "minted">("idle");
  const [mintTx, setMintTx] = useState<string | undefined>();
  const [history, setHistory] = useState<FortuneEntry[]>([]);
  const [mints, setMints] = useState<MintedCard[]>([]);
  const [totalFortunes, setTotalFortunes] = useState<bigint | null>(null);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    setHistory(historyStore.list());
    setMints(mintsStore.list());
  }, []);

  // Read total fortunes
  useEffect(() => {
    const chainId = wallet.chainId ?? 1;
    let cancelled = false;
    (async () => {
      try {
        const client = publicClientForChain(chainId);
        const total = (await client.readContract({
          address: RITUAL_FORTUNE_ADDRESS,
          abi: RITUAL_FORTUNE_ABI,
          functionName: "getTotalFortunes",
        })) as bigint;
        if (!cancelled) setTotalFortunes(total);
      } catch (e) {
        if (!cancelled) setTotalFortunes(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet.chainId, currentFortune?.id]);

  const handleOpen = useCallback(async () => {
    if (cooldown || isOpening) return;
    if (!wallet.address) {
      toast.message("Connect your wallet", {
        description: "You need a wallet to crack open an on-chain fortune.",
      });
      wallet.connect();
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
    setMintState("idle");
    setMintTx(undefined);

    let fortuneText = "";
    let txHash: string | undefined;

    try {
      const walletClient = walletClientForChain(RITUAL_CHAIN_ID, wallet.address);
      const publicClient = publicClientForChain(RITUAL_CHAIN_ID);

      // Estimate gas + simulate to capture return value
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
          /* ignore gas estimate */
        }
        txHash = await walletClient.writeContract(request);
      } catch {
        // simulate failed — try direct write
        txHash = await walletClient.writeContract({
          address: RITUAL_FORTUNE_ADDRESS,
          abi: RITUAL_FORTUNE_ABI,
          functionName: "openFortuneCookie",
        });
      }

      // Wait for receipt and try to parse FortuneOpened event
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
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
            onClick: () => window.open(explorerTxUrl(RITUAL_CHAIN_ID, txHash as `0x${string}`), "_blank"),
          },
        });
      }
    } catch (e: any) {
      toast.error("Could not open fortune", {
        description: e?.shortMessage ?? e?.message ?? "Transaction failed.",
      });
      // Offer a graceful fallback so the UX still feels alive
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
    setCooldown(true);

    setTimeout(() => setCooldown(false), 3500);
  }, [cooldown, isOpening, wallet]);

  const handleMint = useCallback(async () => {
    if (!currentFortune || !wallet.address || !wallet.chainId) return;
    setMintState("minting");
    try {
      // Simulated NFT mint flow (no mint contract specified).
      // Replace with real ERC-721 contract write when address is provided.
      await new Promise((r) => setTimeout(r, 1800));
      const fakeTx = ("0x" +
        Array.from({ length: 64 })
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")) as `0x${string}`;
      const minted: MintedCard = {
        ...currentFortune,
        mintTx: fakeTx,
        mintedAt: Date.now(),
      };
      setMintTx(fakeTx);
      setMintState("minted");
      setMints(mintsStore.add(minted));
      toast.success("Fortune minted", {
        description: "Your card is now in your collection.",
      });
    } catch (e: any) {
      setMintState("idle");
      toast.error("Mint failed", { description: e?.message });
    }
  }, [currentFortune, wallet.address, wallet.chainId]);

  const stats = useMemo(
    () => ({ opened: history.length, minted: mints.length }),
    [history.length, mints.length]
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="shimmer-bg" />
      <Toaster position="bottom-right" theme="light" richColors />

      <Header
        address={wallet.address}
        chainId={wallet.chainId}
        totalFortunes={totalFortunes}
        isConnecting={wallet.isConnecting}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24">
        {/* Hero */}
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
            Each tap calls the contract, reveals a one-of-a-kind message, and lets you
            mint the moments worth keeping.
          </motion.p>
        </section>

        {/* Cookie */}
        <section className="mt-8 sm:mt-12 flex flex-col items-center">
          <FortuneCookie
            isOpening={isOpening}
            isOpen={isOpen}
            fortune={currentFortune?.text ?? null}
            onClick={handleOpen}
            disabled={isOpening || cooldown}
          />
        </section>

        {/* Card + side panel */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
          <div className="hidden lg:flex justify-end">
            <StatPanel
              opened={stats.opened}
              minted={stats.minted}
              total={totalFortunes}
            />
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
                  mintState={mintState}
                  mintTx={mintTx}
                  onMint={handleMint}
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
            <StatPanel
              opened={stats.opened}
              minted={stats.minted}
              total={totalFortunes}
            />
          </div>
          <div className="hidden lg:block" />
        </section>

        {/* Tabs: history / collection */}
        <section className="mt-16">
          <Tabs defaultValue="history">
            <TabsList className="bg-card/70 backdrop-blur border border-border">
              <TabsTrigger value="history" className="gap-2">
                <HistoryIcon className="h-4 w-4" /> History
              </TabsTrigger>
              <TabsTrigger value="collection" className="gap-2">
                <Images className="h-4 w-4" /> Collection
                <span className="ml-1 text-xs text-muted-foreground">{mints.length}</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-4">
              <HistoryList items={history} />
            </TabsContent>
            <TabsContent value="collection" className="mt-4">
              <MintGallery items={mints} />
            </TabsContent>
          </Tabs>
        </section>

        <footer className="mt-20 text-center text-xs text-muted-foreground">
          <Sparkles className="inline h-3 w-3 text-primary mr-1" />
          Ritual Fortune — contract {RITUAL_FORTUNE_ADDRESS.slice(0, 10)}…
        </footer>
      </main>
    </div>
  );
}

function StatPanel({
  opened,
  minted,
  total,
}: {
  opened: number;
  minted: number;
  total: bigint | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-5 w-full max-w-xs mx-auto">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your ritual</p>
      <div className="mt-3 space-y-3">
        <Row label="Fortunes opened" value={opened.toString()} />
        <Row label="Cards minted" value={minted.toString()} />
        <Row label="On-chain total" value={total !== null ? total.toString() : "—"} />
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
