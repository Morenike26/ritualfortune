import { motion } from "framer-motion";
import { Sparkles, ExternalLink, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { explorerTxUrl, shortAddr } from "@/lib/web3";

export type FortuneCardProps = {
  fortune: string;
  openedAt: number;
  user: string | null;
  chainId?: number;
  mintState: "idle" | "minting" | "minted";
  mintTx?: string;
  onMint: () => void;
};

export function FortuneCard({
  fortune,
  openedAt,
  user,
  chainId,
  mintState,
  mintTx,
  onMint,
}: FortuneCardProps) {
  const date = new Date(openedAt);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.2, 0.9, 0.2, 1.05] }}
      className="relative w-full max-w-md mx-auto rounded-3xl p-[1.5px]"
      style={{ background: "var(--gradient-gold)" }}
    >
      <div
        className="rounded-3xl bg-card p-6 sm:p-8 relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div
          className="absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Ritual Fortune
          </span>
          <span>{date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

        <p className="font-display italic text-2xl sm:text-[26px] leading-snug text-foreground mt-5">
          &ldquo;{fortune}&rdquo;
        </p>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Holder</span>
          <span className="font-mono text-foreground">{user ? shortAddr(user) : "—"}</span>
        </div>

        <div className="mt-6">
          {mintState === "idle" && (
            <Button onClick={onMint} variant="gold" size="lg" className="w-full">
              <Sparkles className="h-4 w-4" /> Mint as NFT
            </Button>
          )}
          {mintState === "minting" && (
            <Button disabled size="lg" className="w-full">
              <Loader2 className="h-4 w-4 animate-spin" /> Minting your fortune…
            </Button>
          )}
          {mintState === "minted" && mintTx && chainId && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary" /> Minted successfully
              </div>
              <a
                href={explorerTxUrl(chainId, mintTx as `0x${string}`)}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                {mintTx.slice(0, 10)}…{mintTx.slice(-6)} <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`https://opensea.io/assets/ethereum/${user ?? ""}`}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-primary hover:underline"
              >
                View on OpenSea →
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
