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

  const drawSparkle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.18, -size * 0.18, size * 0.18, -size * 0.18, size, 0);
    ctx.bezierCurveTo(size * 0.18, size * 0.18, size * 0.18, size * 0.18, 0, size);
    ctx.bezierCurveTo(-size * 0.18, size * 0.18, -size * 0.18, size * 0.18, -size, 0);
    ctx.bezierCurveTo(-size * 0.18, -size * 0.18, -size * 0.18, -size * 0.18, 0, -size);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      const triggerDownload = (href: string, cleanup?: () => void) => {
        const link = document.createElement("a");
        link.download = `ritual-fortune-${Date.now()}.png`;
        link.href = href;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
        cleanup?.();
      };

      // Mirror the on-screen FortuneCard (1:1 social-friendly portrait)
      const width = 1200;
      const height = 1500;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Page background — warm cream like --background
      const pageGrad = ctx.createLinearGradient(0, 0, 0, height);
      pageGrad.addColorStop(0, "#fbf6ec");
      pageGrad.addColorStop(1, "#f3ead8");
      ctx.fillStyle = pageGrad;
      ctx.fillRect(0, 0, width, height);

      // Card geometry — matches rounded-3xl with gold gradient border
      const cardX = 110;
      const cardY = 180;
      const cardW = width - cardX * 2;
      const cardH = height - cardY * 2;
      const radius = 48;
      const borderW = 4;

      // Drop shadow (var(--shadow-soft) feel)
      ctx.save();
      ctx.shadowColor = "rgba(60, 40, 80, 0.22)";
      ctx.shadowBlur = 70;
      ctx.shadowOffsetY = 28;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();

      // Gold gradient border ring
      const goldGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      goldGrad.addColorStop(0, "#e8c772");
      goldGrad.addColorStop(1, "#c9933a");
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = goldGrad;
      ctx.fill();

      // Inner card body (--card: near white cream)
      const innerInset = borderW;
      const innerX = cardX + innerInset;
      const innerY = cardY + innerInset;
      const innerW = cardW - innerInset * 2;
      const innerH = cardH - innerInset * 2;
      const innerR = radius - innerInset;

      ctx.save();
      drawRoundedRect(ctx, innerX, innerY, innerW, innerH, innerR);
      ctx.clip();
      ctx.fillStyle = "#fefdf8";
      ctx.fillRect(innerX, innerY, innerW, innerH);

      // Top-right gold glow (the blurred gradient orb)
      const glow = ctx.createRadialGradient(
        innerX + innerW - 40, innerY + 20, 10,
        innerX + innerW - 40, innerY + 20, 360,
      );
      glow.addColorStop(0, "rgba(232, 180, 80, 0.55)");
      glow.addColorStop(0.6, "rgba(232, 180, 80, 0.18)");
      glow.addColorStop(1, "rgba(232, 180, 80, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(innerX, innerY, innerW, innerH);

      // ===== Card content =====
      const padX = innerX + 80;
      const padR = innerX + innerW - 80;
      const contentW = padR - padX;
      const centerX = innerX + innerW / 2;

      // Header row — Sparkle + "RITUAL FORTUNE" left, date right
      const headerY = innerY + 90;
      ctx.fillStyle = "#a07a3a"; // muted gold/purple-ish
      ctx.font = "600 26px Georgia, 'Times New Roman', serif";
      ctx.textBaseline = "middle";

      // Sparkle icon
      drawSparkle(ctx, padX + 14, headerY, 14, "#c9933a");

      // Left label (uppercase, tracked)
      ctx.textAlign = "left";
      ctx.fillStyle = "#7a6a86";
      ctx.font = "600 24px Georgia, 'Times New Roman', serif";
      ctx.fillText("R I T U A L   F O R T U N E", padX + 40, headerY);

      // Right date
      ctx.textAlign = "right";
      ctx.fillStyle = "#7a6a86";
      ctx.font = "500 22px Georgia, 'Times New Roman', serif";
      const dateStr = `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      ctx.fillText(dateStr, padR, headerY);

      // Quote area
      const quoteTop = headerY + 80;
      const quoteBottom = innerY + innerH - 200;
      const maxBlockHeight = quoteBottom - quoteTop;
      const quote = fortune.trim() || "Your fortune is unfolding.";

      // Auto-fit italic display quote
      let fontSize = 96;
      let lineHeight = 122;
      let lines: string[] = [];
      const quoteFont = (size: number) =>
        `italic 500 ${size}px "Cormorant Garamond", Georgia, "Times New Roman", serif`;
      do {
        ctx.font = quoteFont(fontSize);
        lineHeight = Math.round(fontSize * 1.22);
        lines = wrapCanvasText(ctx, quote, contentW - 80);
        if (lines.length * lineHeight > maxBlockHeight) fontSize -= 3;
      } while (lines.length * lineHeight > maxBlockHeight && fontSize > 40);

      const blockH = lines.length * lineHeight;
      const startY = quoteTop + (maxBlockHeight - blockH) / 2 + lineHeight / 2;

      // Opening curly quote (gold/primary)
      ctx.textAlign = "center";
      ctx.fillStyle = "#c9933a";
      ctx.font = quoteFont(fontSize);
      const openMark = "\u201C";
      const closeMark = "\u201D";

      // Render each line, with quote marks wrapping the first/last line
      ctx.fillStyle = "#2d1f3d"; // --foreground deep plum
      lines.forEach((line, i) => {
        const y = startY + i * lineHeight;
        let text = line;
        if (i === 0) text = `${openMark} ${text}`;
        if (i === lines.length - 1) text = `${text} ${closeMark}`;
        ctx.fillText(text, centerX, y);
      });

      // Divider
      const dividerY = innerY + innerH - 130;
      ctx.strokeStyle = "rgba(120, 95, 55, 0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, dividerY);
      ctx.lineTo(padR, dividerY);
      ctx.stroke();

      // Footer — ✦ ritual fortune ✦
      ctx.fillStyle = "#7a6a86";
      ctx.font = "500 22px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("\u2726  R I T U A L   F O R T U N E  \u2726", centerX, dividerY + 56);

      ctx.restore();

      canvas.toBlob((blob) => {
        try {
          if (blob && blob.size > 10000) {
            const objectUrl = URL.createObjectURL(blob);
            triggerDownload(objectUrl, () => {
              window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
            });
            return;
          }

          const dataUrl = canvas.toDataURL("image/png");
          if (!dataUrl.startsWith("data:image/png") || dataUrl.length < 10000) {
            throw new Error("PNG export produced an invalid image");
          }
          triggerDownload(dataUrl);
        } catch (e) {
          console.error("Download failed", e);
        } finally {
          setDownloading(false);
        }
      }, "image/png");
    } catch (e) {
      console.error("Download failed", e);
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
