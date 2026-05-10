import { motion } from "framer-motion";
import { Sparkles, ExternalLink } from "lucide-react";
import { explorerTxUrl, shortAddr } from "@/lib/web3";

export type FortuneCardProps = {
  fortune: string;
  openedAt: number;
  user: string | null;
  chainId?: number;
  txHash?: string;
};

export function FortuneCard({ fortune, openedAt, user, chainId, txHash }: FortuneCardProps) {
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
          <span>
            {date.toLocaleDateString()} ·{" "}
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <p className="font-display italic text-2xl sm:text-[26px] leading-snug text-foreground mt-5">
          &ldquo;{fortune}&rdquo;
        </p>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Holder</span>
          <span className="font-mono text-foreground">{user ? shortAddr(user) : "—"}</span>
        </div>

        {txHash && chainId && (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Transaction</span>
            <a
              href={explorerTxUrl(chainId, txHash as `0x${string}`)}
              target="_blank"
              rel="noreferrer"
              className="font-mono inline-flex items-center gap-1 hover:text-primary"
            >
              {txHash.slice(0, 10)}…{txHash.slice(-6)} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
