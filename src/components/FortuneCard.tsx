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
      if (ctx.measureText(word).width > maxWidth) {
        if (line) {
          lines.push(line);
          line = "";
        }
        let chunk = "";
        [...word].forEach((letter) => {
          const testChunk = `${chunk}${letter}`;
          if (ctx.measureText(testChunk).width > maxWidth && chunk) {
            lines.push(chunk);
            chunk = letter;
          } else {
            chunk = testChunk;
          }
        });
        if (chunk) line = chunk;
        return;
      }

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
      const width = 1440;
      const height = 1800;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const background = ctx.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "#fff7df");
      background.addColorStop(0.42, "#fbefd0");
      background.addColorStop(1, "#eecf93");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      const topGlow = ctx.createRadialGradient(1080, 270, 20, 1080, 270, 620);
      topGlow.addColorStop(0, "rgba(232, 176, 62, 0.45)");
      topGlow.addColorStop(1, "rgba(232, 176, 62, 0)");
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, width, height);

      const bottomGlow = ctx.createRadialGradient(260, 1520, 30, 260, 1520, 560);
      bottomGlow.addColorStop(0, "rgba(109, 41, 77, 0.16)");
      bottomGlow.addColorStop(1, "rgba(109, 41, 77, 0)");
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#b96d27";
      ctx.lineWidth = 2;
      for (let x = -height; x < width; x += 84) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(x + height, 0);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const border = ctx.createLinearGradient(132, 138, width - 132, height - 138);
      border.addColorStop(0, "#f4d979");
      border.addColorStop(0.48, "#d99b38");
      border.addColorStop(1, "#9f5a24");
      drawRoundedRect(ctx, 126, 138, width - 252, height - 276, 86);
      ctx.fillStyle = border;
      ctx.fill();

      drawRoundedRect(ctx, 146, 158, width - 292, height - 316, 68);
      ctx.fillStyle = "#fffaf0";
      ctx.fill();

      const innerGlow = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, 680);
      innerGlow.addColorStop(0, "rgba(244, 217, 121, 0.24)");
      innerGlow.addColorStop(1, "rgba(232, 176, 62, 0)");
      ctx.fillStyle = innerGlow;
      drawRoundedRect(ctx, 146, 158, width - 292, height - 316, 68);
      ctx.fill();

      ctx.fillStyle = "rgba(185, 109, 39, 0.22)";
      ctx.font = "64px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("✦", 286, 320);
      ctx.fillText("✦", width - 286, height - 320);
      ctx.fillText("✧", width - 300, 346);
      ctx.fillText("✧", 300, height - 352);

      ctx.fillStyle = "rgba(109, 41, 77, 0.55)";
      ctx.font = "28px Georgia, serif";
      ctx.letterSpacing = "7px";
      ctx.fillText("RITUAL FORTUNE", width / 2, 290);

      ctx.fillStyle = "#6d294d";
      ctx.font = "italic 92px Georgia, serif";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "0px";

      const maxWidth = 920;
      let fontSize = 92;
      let lineHeight = 118;
      let lines: string[] = [];
      const quote = `“${fortune.trim() || "Your fortune is unfolding."}”`;

      do {
        ctx.font = `italic ${fontSize}px Georgia, serif`;
        lineHeight = fontSize * 1.28;
        lines = wrapCanvasText(ctx, quote, maxWidth);
        if (lines.length * lineHeight > 900) fontSize -= 4;
      } while (lines.length * lineHeight > 900 && fontSize > 54);

      const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
      });

      ctx.fillStyle = "rgba(109, 41, 77, 0.5)";
      ctx.font = "32px Georgia, serif";
      ctx.fillText("✦ ritual fortune ✦", width / 2, height - 290);
      ctx.restore();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("PNG export failed"));
        }, "image/png");
      });

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `ritual-fortune-${date.getTime()}.png`;
      link.href = objectUrl;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
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
