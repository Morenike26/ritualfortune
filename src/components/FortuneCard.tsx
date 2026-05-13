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
        link.download = `ritual-fortune-${date.getTime()}.png`;
        link.href = href;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
        cleanup?.();
      };

      // Social card 1440x1800 (4:5 - crisp Instagram-ready portrait)
      const width = 1440;
      const height = 1800;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // ---- Full social background (warm cream, like the app) ----
      const pageBg = ctx.createLinearGradient(0, 0, width, height);
      pageBg.addColorStop(0, "#fff8e7");
      pageBg.addColorStop(0.48, "#f8e8bd");
      pageBg.addColorStop(1, "#edcf98");
      ctx.fillStyle = pageBg;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(width - 110, 110, 20, width - 110, 110, 680);
      glow.addColorStop(0, "rgba(231, 183, 72, 0.62)");
      glow.addColorStop(1, "rgba(230, 178, 70, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.strokeStyle = "rgba(183, 133, 46, 0.12)";
      ctx.lineWidth = 2;
      for (let x = -height; x < width + height; x += 84) {
        ctx.beginPath();
        ctx.moveTo(x, height + 80);
        ctx.lineTo(x + height + 80, -80);
        ctx.stroke();
      }
      ctx.restore();

      // ---- Card geometry ----
      const margin = 124;
      const cardX = margin;
      const cardY = 154;
      const cardW = width - margin * 2;
      const cardH = height - cardY - 180;
      const radius = 66;

      // Outer gradient gold frame
      const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      borderGrad.addColorStop(0, "#f4d468");
      borderGrad.addColorStop(0.5, "#d99a34");
      borderGrad.addColorStop(1, "#aa5f1e");
      drawRoundedRect(ctx, cardX - 2, cardY - 2, cardW + 4, cardH + 4, radius + 2);
      ctx.fillStyle = borderGrad;
      ctx.fill();

      // Card body (cream)
      const frame = 24;
      drawRoundedRect(ctx, cardX + frame, cardY + frame, cardW - frame * 2, cardH - frame * 2, radius - 20);
      ctx.fillStyle = "#fffaf0";
      ctx.fill();

      // Soft inner glow and subtle vignette
      ctx.save();
      drawRoundedRect(ctx, cardX + frame, cardY + frame, cardW - frame * 2, cardH - frame * 2, radius - 20);
      ctx.clip();
      const innerGlow = ctx.createRadialGradient(
        cardX + cardW - 110, cardY + 110, 10,
        cardX + cardW - 110, cardY + 110, 460,
      );
      innerGlow.addColorStop(0, "rgba(232, 188, 86, 0.28)");
      innerGlow.addColorStop(1, "rgba(232, 178, 70, 0)");
      ctx.fillStyle = innerGlow;
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.restore();

      // ---- Header row: visible app-card identity ----
      const headerY = cardY + 94;
      ctx.fillStyle = "#8a6a3a"; // muted-foreground-ish
      ctx.font = "700 28px 'Helvetica Neue', Arial, sans-serif";
      ctx.textBaseline = "middle";

      ctx.textAlign = "left";
      drawSparkle(ctx, cardX + 88, headerY, 18, "#d39b39");
      ctx.fillStyle = "#8a6a3a";
      ctx.font = "700 28px 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText("RITUAL FORTUNE", cardX + 122, headerY);

      ctx.textAlign = "right";
      const dateStr = `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      ctx.fillText(dateStr, cardX + cardW - 86, headerY);

      drawSparkle(ctx, cardX + 160, cardY + 206, 26, "rgba(202, 139, 69, 0.18)");
      drawSparkle(ctx, cardX + cardW - 170, cardY + 238, 22, "rgba(202, 139, 69, 0.24)");
      drawSparkle(ctx, cardX + 176, cardY + cardH - 220, 24, "rgba(202, 139, 69, 0.24)");
      drawSparkle(ctx, cardX + cardW - 152, cardY + cardH - 180, 26, "rgba(202, 139, 69, 0.28)");

      // ---- Quote (centered, italic serif) ----
      ctx.textAlign = "center";
      ctx.fillStyle = "#3a2a4a"; // foreground
      const maxTextWidth = cardW - 160;
      const quote = (fortune.trim() || "Your fortune is unfolding.");

      let fontSize = 64;
      let lineHeight = 80;
      let lines: string[] = [];
      const maxBlockHeight = cardH - 260;
      do {
        ctx.font = `italic ${fontSize}px Georgia, 'Times New Roman', serif`;
        lineHeight = Math.round(fontSize * 1.28);
        lines = wrapCanvasText(ctx, quote, maxTextWidth);
        if (lines.length * lineHeight > maxBlockHeight) fontSize -= 3;
      } while (lines.length * lineHeight > maxBlockHeight && fontSize > 30);

      const blockH = lines.length * lineHeight;
      const centerY = cardY + cardH / 2;
      const firstLineY = centerY - blockH / 2 + lineHeight / 2;

      // Big gold quote marks
      ctx.fillStyle = "#c98a2e";
      ctx.font = `italic ${fontSize + 8}px Georgia, serif`;
      const firstLineWidth = ctx.measureText(lines[0] ?? "").width;
      ctx.textAlign = "right";
      ctx.fillText("“", width / 2 - firstLineWidth / 2 - 6, firstLineY);
      const lastLineWidth = ctx.measureText(lines[lines.length - 1] ?? "").width;
      ctx.textAlign = "left";
      ctx.fillText("”", width / 2 + lastLineWidth / 2 + 6, firstLineY + (lines.length - 1) * lineHeight);

      ctx.fillStyle = "#3a2a4a";
      ctx.textAlign = "center";
      ctx.font = `italic ${fontSize}px Georgia, 'Times New Roman', serif`;
      lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, firstLineY + i * lineHeight);
      });

      // ---- Divider + footer "✦ ritual fortune ✦" ----
      const footerY = cardY + cardH - 70;
      ctx.strokeStyle = "rgba(180, 140, 70, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cardX + 80, footerY - 28);
      ctx.lineTo(cardX + cardW - 80, footerY - 28);
      ctx.stroke();

      ctx.fillStyle = "#8a6a3a";
      ctx.font = "500 20px 'Helvetica Neue', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✦   RITUAL  FORTUNE   ✦", width / 2, footerY);

      // ---- Outside-card tagline ----
      ctx.fillStyle = "rgba(90, 70, 40, 0.6)";
      ctx.font = "500 20px 'Helvetica Neue', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("a small daily ritual · on-chain", width / 2, cardY + cardH + 80);

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
