import { motion } from "framer-motion";
import { Sparkles, ExternalLink, Download } from "lucide-react";
import { useState } from "react";
import { explorerTxUrl } from "@/lib/web3";
import { Button } from "@/components/ui/button";

export type FortuneCardProps = {
  fortune: string;
  openedAt: number;
  user: string | null;
  chainId?: number;
  txHash?: string;
};

export function FortuneCard({ fortune, openedAt, chainId, txHash }: FortuneCardProps) {
  const date = new Date(openedAt);
  const [downloading, setDownloading] = useState(false);

  const wrapCanvasText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ) => {
    const words = text.trim().split(/\s+/);
    const lines: string[] = [];
    let line = "";

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) lines.push(line);
    return lines;
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (document.fonts && (document.fonts as any).ready) {
        try { await (document.fonts as any).ready; } catch { /* ignore */ }
      }

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const background = ctx.createLinearGradient(0, 0, 1080, 1350);
      background.addColorStop(0, "#fff7df");
      background.addColorStop(0.52, "#fbefd0");
      background.addColorStop(1, "#f2d7a1");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, 1080, 1350);

      const glow = ctx.createRadialGradient(840, 250, 20, 840, 250, 430);
      glow.addColorStop(0, "rgba(232, 176, 62, 0.5)");
      glow.addColorStop(1, "rgba(232, 176, 62, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1080, 1350);

      const border = ctx.createLinearGradient(110, 110, 970, 1240);
      border.addColorStop(0, "#f1c964");
      border.addColorStop(1, "#b96d27");
      drawRoundedRect(ctx, 96, 110, 888, 1130, 64);
      ctx.fillStyle = border;
      ctx.fill();

      drawRoundedRect(ctx, 110, 124, 860, 1102, 54);
      ctx.fillStyle = "#fffaf0";
      ctx.fill();

      ctx.fillStyle = "rgba(185, 109, 39, 0.2)";
      ctx.font = "46px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("✦", 210, 230);
      ctx.fillText("✦", 870, 1120);
      ctx.fillText("✧", 860, 260);
      ctx.fillText("✧", 230, 1085);

      ctx.fillStyle = "#6d294d";
      ctx.font = "italic 72px Georgia, serif";
      ctx.textBaseline = "middle";

      const maxWidth = 700;
      let fontSize = 72;
      let lineHeight = 92;
      let lines: string[] = [];

      do {
        ctx.font = `italic ${fontSize}px Georgia, serif`;
        lineHeight = fontSize * 1.28;
        lines = wrapCanvasText(ctx, `“${fortune}”`, maxWidth);
        if (lines.length * lineHeight > 660) fontSize -= 4;
      } while (lines.length * lineHeight > 660 && fontSize > 42);

      const startY = 675 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, 540, startY + index * lineHeight);
      });

      const dataUrl = canvas.toDataURL("image/png");
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
      {/* Capture target — the visible card */}
      <div
        ref={captureRef}
        className="rounded-3xl p-[1.5px]"
        style={{ background: "var(--gradient-gold)" }}
      >
        <div
          className="rounded-3xl bg-card p-6 sm:p-10 relative overflow-hidden"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div
            className="absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-40 blur-3xl pointer-events-none"
            style={{ background: "var(--gradient-gold)" }}
          />
          <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground gap-2 relative">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Ritual Fortune
            </span>
            <span className="text-right">
              {date.toLocaleDateString()} ·{" "}
              {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <p className="font-display italic text-xl sm:text-[26px] leading-snug text-foreground mt-6 break-words text-center relative">
            <span className="text-primary mr-1">“</span>
            {fortune}
            <span className="text-primary ml-1">”</span>
          </p>

          <div className="mt-8 pt-4 border-t border-border/60 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground relative">
            ✦ ritual fortune ✦
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
