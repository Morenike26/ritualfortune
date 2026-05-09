import { motion } from "framer-motion";
import type { FortuneEntry, MintedCard } from "@/lib/storage";
import { explorerTxUrl, shortAddr } from "@/lib/web3";
import { ExternalLink } from "lucide-react";

export function HistoryList({ items }: { items: FortuneEntry[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No fortunes yet — crack the cookie above to begin.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card/60 backdrop-blur">
      {items.slice(0, 5).map((f) => (
        <li key={f.id} className="p-4 flex items-start gap-3">
          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="font-display italic text-foreground">&ldquo;{f.text}&rdquo;</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(f.openedAt).toLocaleString()} · {shortAddr(f.user)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MintGallery({ items }: { items: MintedCard[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Your minted fortunes will appear here.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.35 }}
          className="rounded-2xl p-[1.5px]"
          style={{ background: "var(--gradient-gold)" }}
        >
          <div className="rounded-2xl bg-card p-5 h-full flex flex-col">
            <p className="font-display italic text-lg leading-snug flex-1">
              &ldquo;{m.text}&rdquo;
            </p>
            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{new Date(m.mintedAt).toLocaleDateString()}</span>
              {m.chainId && (
                <a
                  href={explorerTxUrl(m.chainId, m.mintTx as `0x${string}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary font-mono"
                >
                  {m.mintTx.slice(0, 6)}…{m.mintTx.slice(-4)} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
