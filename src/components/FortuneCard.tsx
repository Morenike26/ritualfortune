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

      // Match the reference card exactly (4:3-ish), card fills the canvas
      const width = 1600;
      const height = 1200;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // White page background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Card geometry
      const cardX = 40;
      const cardY = 40;
      const cardW = width - cardX * 2;
      const cardH = height - cardY * 2;
      const radius = 56;

      // Soft drop shadow
      ctx.save();
      ctx.shadowColor = "rgba(180, 130, 50, 0.18)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 16;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();

      // Card cream-to-gold gradient body
      ctx.save();
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.clip();
      const bodyGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      bodyGrad.addColorStop(0, "#fff8e3");
      bodyGrad.addColorStop(0.55, "#fbe7b4");
      bodyGrad.addColorStop(1, "#f1c878");
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(cardX, cardY, cardW, cardH);

      // Top-right warm glow
      const glow = ctx.createRadialGradient(
        cardX + cardW - 60, cardY + 40, 10,
        cardX + cardW - 60, cardY + 40, cardW * 0.75,
      );
      glow.addColorStop(0, "rgba(245, 190, 90, 0.45)");
      glow.addColorStop(1, "rgba(245, 190, 90, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cardX, cardY, cardW, cardH);

      // Faint diagonal sheen
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + cardW * 0.18, cardY + cardH);
      ctx.lineTo(cardX + cardW * 0.55, cardY);
      ctx.stroke();
      ctx.restore();

      // Gold border
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      borderGrad.addColorStop(0, "#f3c558");
      borderGrad.addColorStop(1, "#c98a2e");
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Padding inside card
      const padX = cardX + 90;
      const padR = cardX + cardW - 90;

      // Header row
      const headerY = cardY + 130;
      ctx.textBaseline = "middle";
      drawSparkle(ctx, padX + 16, headerY, 22, "#d39b39");
      ctx.fillStyle = "#7a6a86";
      ctx.font = "600 38px 'Helvetica Neue', Arial, sans-serif";
      ctx.textAlign = "left";
      // letter-spacing simulation by using normal text; visually similar
      ctx.fillText("RITUAL FORTUNE", padX + 56, headerY);

      ctx.textAlign = "right";
      const dateStr = `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      ctx.fillText(dateStr, padR, headerY);

      // Quote area
      const quoteTop = cardY + 230;
      const quoteBottom = cardY + cardH - 220;
      const maxTextWidth = cardW - 260;
      const quote = (fortune.trim() || "Your fortune is unfolding.");

      let fontSize = 110;
      let lineHeight = 138;
      let lines: string[] = [];
      const maxBlockHeight = quoteBottom - quoteTop;
      do {
        ctx.font = `400 italic ${fontSize}px Georgia, 'Times New Roman', serif`;
        lineHeight = Math.round(fontSize * 1.25);
        // include curly quotes around the quote like the reference
        lines = wrapCanvasText(ctx, `\u201C${quote}\u201D`, maxTextWidth);
        if (lines.length * lineHeight > maxBlockHeight) fontSize -= 3;
      } while (lines.length * lineHeight > maxBlockHeight && fontSize > 40);

      ctx.fillStyle = "#3a2a4a";
      ctx.textAlign = "left";
      ctx.font = `400 italic ${fontSize}px Georgia, 'Times New Roman', serif`;
      const blockH = lines.length * lineHeight;
      const startY = quoteTop + (maxBlockHeight - blockH) / 2 + lineHeight / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, padX, startY + i * lineHeight);
      });

      // Divider
      const dividerY = cardY + cardH - 150;
      ctx.strokeStyle = "rgba(120, 95, 55, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padX, dividerY);
      ctx.lineTo(padR, dividerY);
      ctx.stroke();

      // Footer
      ctx.fillStyle = "#7a6a86";
      ctx.font = "600 30px 'Helvetica Neue', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("RITUALFORTUNE  ·  ON-CHAIN", cardX + cardW / 2, cardY + cardH - 80);

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
