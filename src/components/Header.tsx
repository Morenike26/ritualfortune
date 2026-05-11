import { ExternalLink, Wallet, LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { explorerAddrUrl, shortAddr, RITUAL_FORTUNE_ADDRESS, RITUAL_CHAIN_ID } from "@/lib/web3";

type Props = {
  address: string | null;
  chainId: number | null;
  totalFortunes?: bigint | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork?: () => void;
};

export function Header({
  address,
  chainId,
  isConnecting,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}: Props) {
  const wrongNetwork = !!address && chainId !== RITUAL_CHAIN_ID;

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-6">
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
            href={explorerAddrUrl(chainId, RITUAL_FORTUNE_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1 font-mono"
          >
            {shortAddr(RITUAL_FORTUNE_ADDRESS)} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3">

        {wrongNetwork && (
          <Button
            onClick={onSwitchNetwork}
            variant="outline"
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <AlertTriangle className="h-4 w-4" />
            Switch to Ritual
          </Button>
        )}

        {address ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/70 backdrop-blur px-3 py-2">
            <span
              className={`h-2 w-2 rounded-full shadow-[0_0_10px_currentColor] ${
                wrongNetwork ? "bg-destructive" : "bg-primary"
              }`}
            />
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-sm">{shortAddr(address)}</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {wrongNetwork ? `Chain ${chainId}` : "Ritual · RITUAL"}
              </span>
            </div>
            <button
              onClick={onDisconnect}
              className="text-muted-foreground hover:text-destructive transition-colors ml-1"
              aria-label="Disconnect"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button onClick={onConnect} variant="gold" disabled={isConnecting} className="text-sm">
            <Wallet className="h-4 w-4" />
            {isConnecting ? "Connecting…" : "Connect"}
          </Button>
        )}
      </div>
    </header>
  );
}
