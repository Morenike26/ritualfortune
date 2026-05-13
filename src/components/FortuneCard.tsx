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

      // Social card 1080x1350 (4:5 - Instagram portrait)
      const width = 1080;
      const height = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // ---- Page background (warm cream, like app bg) ----
      const pageBg = ctx.createLinearGradient(0, 0, width, height);
      pageBg.addColorStop(0, "#fbf3dc");
      pageBg.addColorStop(1, "#f3e2b4");
      ctx.fillStyle = pageBg;
      ctx.fillRect(0, 0, width, height);

      // soft gold glow top-right (matches in-app blurred orb)
      const glow = ctx.createRadialGradient(width - 120, 120, 20, width - 120, 120, 520);
      glow.addColorStop(0, "rgba(230, 178, 70, 0.55)");
      glow.addColorStop(1, "rgba(230, 178, 70, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // ---- Card geometry ----
      const margin = 90;
      const cardX = margin;
      const cardY = 150;
      const cardW = width - margin * 2;
      const cardH = height - cardY - 180;
      const radius = 44;

      // Outer gradient gold border (1.5px-style ring scaled up)
      const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      borderGrad.addColorStop(0, "#f0c75a");
      borderGrad.addColorStop(1, "#c98a2e");
      drawRoundedRect(ctx, cardX - 6, cardY - 6, cardW + 12, cardH + 12, radius + 6);
      ctx.fillStyle = borderGrad;
      ctx.fill();

      // Card body (cream)
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = "#fdf7e4";
      ctx.fill();

      // Soft shadow inside (recreate boxShadow soft)
      ctx.save();
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.clip();
      const innerGlow = ctx.createRadialGradient(
        cardX + cardW - 80, cardY + 60, 10,
        cardX + cardW - 80, cardY + 60, 360,
      );
      innerGlow.addColorStop(0, "rgba(232, 178, 70, 0.35)");
      innerGlow.addColorStop(1, "rgba(232, 178, 70, 0)");
      ctx.fillStyle = innerGlow;
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.restore();

      // ---- Header row: ✦ RITUAL FORTUNE ........ DATE · TIME ----
      const headerY = cardY + 70;
      ctx.fillStyle = "#8a6a3a"; // muted-foreground-ish
      ctx.font = "600 22px 'Helvetica Neue', Arial, sans-serif";
      ctx.textBaseline = "middle";

      // left chip (sparkle + label)
      ctx.textAlign = "left";
      ctx.fillStyle = "#c08a2a";
      ctx.font = "26px Georgia, serif";
      ctx.fillText("✦", cardX + 60, headerY);
      ctx.fillStyle = "#8a6a3a";
      ctx.font = "600 22px 'Helvetica Neue', Arial, sans-serif";
      const label = "RITUAL  FORTUNE";
      ctx.fillText(label, cardX + 92, headerY);

      // right date
      ctx.textAlign = "right";
      const dateStr = `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      ctx.fillText(dateStr, cardX + cardW - 60, headerY);

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
