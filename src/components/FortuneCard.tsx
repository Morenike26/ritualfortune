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

      // Regal portrait canvas
      const width = 1200;
      const height = 1600;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Deep ink page background with subtle vignette
      const pageGrad = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.2,
        width / 2, height / 2, height * 0.85,
      );
      pageGrad.addColorStop(0, "#15131f");
      pageGrad.addColorStop(1, "#08070d");
      ctx.fillStyle = pageGrad;
      ctx.fillRect(0, 0, width, height);

      // Card geometry
      const cardX = 80;
      const cardY = 80;
      const cardW = width - cardX * 2;
      const cardH = height - cardY * 2;
      const radius = 6;

      // Card drop shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 24;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = "#f6efe0";
      ctx.fill();
      ctx.restore();

      // Ivory card body with subtle warm tone
      ctx.save();
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.clip();
      const bodyGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
      bodyGrad.addColorStop(0, "#faf3e3");
      bodyGrad.addColorStop(1, "#efe4cb");
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(cardX, cardY, cardW, cardH);

      // Corner radial warmth
      const warm = ctx.createRadialGradient(
        cardX + cardW / 2, cardY + cardH * 0.35, 40,
        cardX + cardW / 2, cardY + cardH * 0.35, cardH * 0.7,
      );
      warm.addColorStop(0, "rgba(220, 175, 90, 0.18)");
      warm.addColorStop(1, "rgba(220, 175, 90, 0)");
      ctx.fillStyle = warm;
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.restore();

      // Ornate double gold border
      const goldDark = "#8a6a2a";
      const goldLight = "#d4af5e";
      const drawBorder = (inset: number, lw: number) => {
        drawRoundedRect(
          ctx,
          cardX + inset,
          cardY + inset,
          cardW - inset * 2,
          cardH - inset * 2,
          Math.max(2, radius - inset / 4),
        );
        ctx.lineWidth = lw;
        ctx.stroke();
      };
      ctx.strokeStyle = goldDark;
      drawBorder(24, 2);
      ctx.strokeStyle = goldLight;
      drawBorder(34, 1);
      ctx.strokeStyle = goldDark;
      drawBorder(0, 3);

      // Corner ornaments (filigree dots + small sparkle)
      const corners: Array<[number, number]> = [
        [cardX + 60, cardY + 60],
        [cardX + cardW - 60, cardY + 60],
        [cardX + 60, cardY + cardH - 60],
        [cardX + cardW - 60, cardY + cardH - 60],
      ];
      corners.forEach(([cx, cy]) => {
        drawSparkle(ctx, cx, cy, 10, goldDark);
        ctx.fillStyle = goldLight;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Padding inside card
      const padX = cardX + 110;
      const padR = cardX + cardW - 110;
      const innerW = padR - padX;
      const centerX = cardX + cardW / 2;

      // Top monogram crest
      const crestY = cardY + 180;
      ctx.save();
      ctx.strokeStyle = goldDark;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(centerX - 140, crestY);
      ctx.lineTo(centerX - 28, crestY);
      ctx.moveTo(centerX + 28, crestY);
      ctx.lineTo(centerX + 140, crestY);
      ctx.stroke();
      drawSparkle(ctx, centerX, crestY, 14, goldDark);
      ctx.restore();

      // Eyebrow label
      ctx.fillStyle = "#6a5836";
      ctx.font = "500 22px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // letter-spacing simulation
      const eyebrow = "R I T U A L   F O R T U N E";
      ctx.fillText(eyebrow, centerX, crestY + 50);

      // Quote area
      const quoteTop = cardY + 320;
      const quoteBottom = cardY + cardH - 280;
      const maxBlockHeight = quoteBottom - quoteTop;
      const quote = (fortune.trim() || "Your fortune is unfolding.");

      let fontSize = 84;
      let lineHeight = 110;
      let lines: string[] = [];
      do {
        ctx.font = `400 italic ${fontSize}px "Apple Garamond", "Garamond", Georgia, "Times New Roman", serif`;
        lineHeight = Math.round(fontSize * 1.32);
        lines = wrapCanvasText(ctx, quote, innerW - 60);
        if (lines.length * lineHeight > maxBlockHeight) fontSize -= 3;
      } while (lines.length * lineHeight > maxBlockHeight && fontSize > 36);

      const blockH = lines.length * lineHeight;
      const startY = quoteTop + (maxBlockHeight - blockH) / 2 + lineHeight / 2;

      // Large opening quotation mark
      ctx.fillStyle = "rgba(138, 106, 42, 0.35)";
      ctx.font = `400 italic 220px Georgia, "Times New Roman", serif`;
      ctx.textAlign = "center";
      ctx.fillText("\u201C", centerX, quoteTop + 30);

      // Quote body
      ctx.fillStyle = "#1f1a2e";
      ctx.textAlign = "center";
      ctx.font = `400 italic ${fontSize}px Georgia, "Times New Roman", serif`;
      lines.forEach((line, i) => {
        ctx.fillText(line, centerX, startY + i * lineHeight);
      });

      // Closing ornament under quote
      const ornY = quoteTop + maxBlockHeight + 40;
      ctx.save();
      ctx.strokeStyle = goldDark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 90, ornY);
      ctx.lineTo(centerX - 16, ornY);
      ctx.moveTo(centerX + 16, ornY);
      ctx.lineTo(centerX + 90, ornY);
      ctx.stroke();
      drawSparkle(ctx, centerX, ornY, 7, goldDark);
      ctx.restore();

      // Footer wordmark + date
      ctx.fillStyle = "#6a5836";
      ctx.font = "500 24px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const footerY = cardY + cardH - 150;
      ctx.fillText("R I T U A L   F O R T U N E", centerX, footerY);

      ctx.fillStyle = "#8a7a55";
      ctx.font = "400 18px Georgia, 'Times New Roman', serif";
      const dateStr = `${date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`;
      ctx.fillText(dateStr, centerX, footerY + 38);

      ctx.fillStyle = "#a08a55";
      ctx.font = "italic 16px Georgia, 'Times New Roman', serif";
      ctx.fillText("a small daily ritual  ·  on-chain", centerX, footerY + 70);

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
