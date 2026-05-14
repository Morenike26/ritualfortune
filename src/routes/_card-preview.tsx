import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FortuneCard } from "@/components/FortuneCard";

// Internal: visual QA route for the downloadable PNG export.
export const Route = createFileRoute("/_card-preview")({
  component: CardPreview,
});

function CardPreview() {
  const [src, setSrc] = useState<string | null>(null);
  const fortune =
    "When the moon listens carefully, even silence becomes a small, golden prayer.";
  const openedAt = Date.now();

  useEffect(() => {
    // Reuse the same canvas drawing by triggering download patched to capture data URL.
    // Here we just import-render the on-screen card AND a generated preview side by side.
    // The real PNG render happens in FortuneCard.handleDownload via canvas.toBlob.
    // To preview without downloading, we re-run the same drawing inline:
    (async () => {
      const mod = await import("@/components/FortuneCard");
      void mod;
      // Render via a hidden anchor click would download. Instead, we patch document.createElement
      // to intercept the <a> the component creates, read the href, then cancel the click.
      const realCreate = document.createElement.bind(document);
      let captured: string | null = null;
      document.createElement = ((tag: string) => {
        const el = realCreate(tag) as HTMLElement;
        if (tag.toLowerCase() === "a") {
          (el as HTMLAnchorElement).click = () => {
            captured = (el as HTMLAnchorElement).href;
          };
        }
        return el;
      }) as typeof document.createElement;

      const btn = document.querySelector<HTMLButtonElement>("[data-qa='dl']");
      btn?.click();

      const start = Date.now();
      while (!captured && Date.now() - start < 4000) {
        await new Promise((r) => setTimeout(r, 100));
      }
      document.createElement = realCreate;
      if (captured) setSrc(captured);
    })();
  }, []);

  return (
    <div style={{ background: "#222", padding: 24, minHeight: "100vh" }}>
      <div style={{ display: "none" }}>
        <FortuneCard fortune={fortune} openedAt={openedAt} user={null} />
        <button data-qa="dl" onClick={() => {
          const real = document.querySelector<HTMLButtonElement>("button");
          real?.click();
        }} />
      </div>
      <h2 style={{ color: "#fff", fontFamily: "system-ui" }}>Exported PNG preview</h2>
      {src ? (
        <img src={src} style={{ maxWidth: "100%", border: "1px solid #444" }} />
      ) : (
        <p style={{ color: "#aaa" }}>Generating…</p>
      )}
    </div>
  );
}
