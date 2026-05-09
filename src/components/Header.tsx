import { ExternalLink, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { explorerAddrUrl, shortAddr, RITUAL_FORTUNE_ADDRESS } from "@/lib/web3";

type Props = {
  address: string | null;
  chainId: number | null;
  totalFortunes: bigint | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
};

export function Header({ address, chainId, totalFortunes, isConnecting, onConnect, onDisconnect }: Props) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl text-primary-foreground font-display text-xl"
          style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow)" }}
        >
          ✦
        </div>
        <div>
          <h1 className="font-display text-2xl leading-none">Ritual Fortune</h1>
          <a
            href={chainId ? explorerAddrUrl(chainId, RITUAL_FORTUNE_ADDRESS) : "#"}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1 font-mono"
          >
            {shortAddr(RITUAL_FORTUNE_ADDRESS)} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Total fortunes</span>
          <span className="font-display text-xl text-foreground">
            {totalFortunes !== null ? totalFortunes.toString() : "—"}
          </span>
        </div>

        {address ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/70 backdrop-blur px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
            <span className="font-mono text-sm">{shortAddr(address)}</span>
            <button
              onClick={onDisconnect}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Disconnect"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button onClick={onConnect} variant="gold" disabled={isConnecting}>
            <Wallet className="h-4 w-4" />
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </Button>
        )}
      </div>
    </header>
  );
}
