import { motion } from "framer-motion";
import { Sparkles, ExternalLink, Download } from "lucide-react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { explorerTxUrl, shortAddr } from "@/lib/web3";
import { Button } from "@/components/ui/button";

export type FortuneCardProps = {
  fortune: string;
  openedAt: number;
  user: string | null;
  chainId?: number;
  txHash?: string;
};

export function FortuneCard({ fortune, openedAt, user, chainId, txHash }: FortuneCardProps) {
  const date = new Date(openedAt);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "transparent",
      });
      const link = document.createElement("a");
      link.download = `ritual-fortune-${date.getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.2, 0.9, 0.2, 1.05] }}
      className="relative w-full max-w-md mx-auto"
    >
      <div
        ref={cardRef}
        className="rounded-3xl p-[1.5px]"
        style={{ background: "var(--gradient-gold)" }}
      >
        <div
          className="rounded-3xl bg-card p-5 sm:p-8 relative overflow-hidden"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div
            className="absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-40 blur-3xl"
            style={{ background: "var(--gradient-gold)" }}
          />
          <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Ritual Fortune
            </span>
            <span className="text-right">
              {date.toLocaleDateString()} ·{" "}
              {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <p className="font-display italic text-xl sm:text-[26px] leading-snug text-foreground mt-5 break-words">
            &ldquo;{fortune}&rdquo;
          </p>

          <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground gap-2">
            <span>Holder</span>
            <span className="font-mono text-foreground truncate">{user ? shortAddr(user) : "—"}</span>
          </div>

          {txHash && chainId && (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground gap-2">
              <span>Transaction</span>
              <span className="font-mono text-foreground truncate">
                {txHash.slice(0, 8)}…{txHash.slice(-6)}
              </span>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-border/60 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            ritualfortune · on-chain
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          variant="gold"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Saving…" : "Download card"}
        </Button>
        {txHash && chainId && (
          <Button asChild variant="outline" className="gap-2">
            <a
              href={explorerTxUrl(chainId, txHash as `0x${string}`)}
              target="_blank"
              rel="noreferrer"
            >
              View tx <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
