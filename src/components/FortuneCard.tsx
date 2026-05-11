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
  const exportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setDownloading(true);
    const node = exportRef.current;

    // Reveal the offscreen export node so it's painted at full size, then hide again.
    const prev = node.style.cssText;
    node.style.position = "fixed";
    node.style.left = "-10000px";
    node.style.top = "0";
    node.style.opacity = "1";
    node.style.pointerEvents = "none";

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 3,
        width: 1080,
        height: 1350,
        backgroundColor: "#fbf5e8",
      });
      const link = document.createElement("a");
      link.download = `ritual-fortune-${date.getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      node.style.cssText = prev;
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
      {/* Visible card */}
      <div
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

          <div className="mt-6 pt-4 border-t border-border/60 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            ritualfortune
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

      {/* Hidden high-res export node — fixed 1080x1350 for crisp social-share output */}
      <div
        ref={exportRef}
        aria-hidden
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: 1080,
          height: 1350,
          opacity: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 25% 15%, #f7e3a8 0%, transparent 55%), radial-gradient(ellipse at 80% 85%, #f4d3e0 0%, transparent 55%), linear-gradient(135deg, #fbf5e8 0%, #f5ead8 100%)",
          padding: 90,
          boxSizing: "border-box",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#3d2a4a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* top mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#7c6a5e",
          }}
        >
          <span>✦ Ritual Fortune</span>
          <span>{date.toLocaleDateString()}</span>
        </div>

        {/* card body */}
        <div
          style={{
            flex: 1,
            marginTop: 60,
            borderRadius: 36,
            padding: 6,
            background: "linear-gradient(135deg, #e8b84a 0%, #d4842a 100%)",
            boxShadow: "0 30px 80px -20px rgba(60,30,80,0.25)",
          }}
        >
          <div
            style={{
              borderRadius: 32,
              background: "#fffdf6",
              height: "100%",
              padding: "80px 70px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -120,
                right: -120,
                width: 360,
                height: 360,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(232,184,74,0.45) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            <div
              style={{
                fontSize: 22,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#b89a6b",
                textAlign: "center",
              }}
            >
              ✦ a fortune ✦
            </div>

            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: "italic",
                fontSize: 64,
                lineHeight: 1.18,
                color: "#2d1f3d",
                textAlign: "center",
                padding: "0 20px",
              }}
            >
              <span style={{ color: "#c9a84c", marginRight: 8 }}>“</span>
              {fortune}
              <span style={{ color: "#c9a84c", marginLeft: 8 }}>”</span>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: 18,
                color: "#7c6a5e",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                borderTop: "1px solid rgba(124,106,94,0.2)",
                paddingTop: 28,
              }}
            >
              ✦ ritual fortune ✦
            </div>
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            marginTop: 50,
            textAlign: "center",
            fontSize: 18,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "#9a8472",
          }}
        >
          ritualfortune · on-chain wisdom
        </div>
      </div>
    </motion.div>
  );
}
