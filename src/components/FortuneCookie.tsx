import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Props = {
  isOpening: boolean;
  isOpen: boolean;
  fortune: string | null;
  onClick: () => void;
  disabled?: boolean;
};

export function FortuneCookie({ isOpening, isOpen, fortune, onClick, disabled }: Props) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowParticles(true);
      const t = setTimeout(() => setShowParticles(false), 1700);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        left: 50 + (Math.random() - 0.5) * 30,
        top: 55 + (Math.random() - 0.5) * 10,
        tx: (Math.random() - 0.5) * 140,
        delay: Math.random() * 0.4,
        size: 4 + Math.random() * 8,
        key: i,
      })),
    [isOpen]
  );

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <button
        type="button"
        aria-label="Open fortune cookie"
        onClick={onClick}
        disabled={disabled}
        className="relative h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] cursor-pointer disabled:cursor-wait outline-none"
      >
        <div className={`relative h-full w-full cookie-glow ${isOpen ? "cookie-open" : ""}`}>
          <CookieSVG />

          {/* Particles */}
          {showParticles && (
            <div className="pointer-events-none absolute inset-0">
              {particles.map((p) => (
                <span
                  key={p.key}
                  className="particle"
                  style={
                    {
                      left: `${p.left}%`,
                      top: `${p.top}%`,
                      width: p.size,
                      height: p.size,
                      animationDelay: `${p.delay}s`,
                      ["--tx" as any]: `${p.tx}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Idle prompt */}
        <AnimatePresence>
          {!isOpen && !isOpening && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-2 left-0 right-0 text-center text-sm text-muted-foreground"
            >
              <span className="inline-block animate-pulse">Tap to crack open your fortune</span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Fortune text */}
      <div className="mt-10 min-h-[120px] max-w-xl px-6 text-center">
        <AnimatePresence mode="wait">
          {isOpen && fortune && (
            <motion.div
              key={fortune}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1.1] }}
              className="font-display text-2xl sm:text-3xl leading-snug text-foreground italic fortune-text"
            >
              <span className="text-primary mr-2">&ldquo;</span>
              {fortune}
              <span className="text-primary ml-2">&rdquo;</span>
            </motion.div>
          )}
          {isOpening && !fortune && (
            <motion.div
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground"
            >
              Consulting the spirits…
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CookieSVG() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        <radialGradient id="cookieFace" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="oklch(0.92 0.10 78)" />
          <stop offset="60%" stopColor="oklch(0.78 0.14 70)" />
          <stop offset="100%" stopColor="oklch(0.55 0.13 55)" />
        </radialGradient>
        <radialGradient id="cookieRim" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.65 0.13 55)" />
          <stop offset="100%" stopColor="oklch(0.42 0.10 45)" />
        </radialGradient>
        <linearGradient id="crease" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.50 0.10 45 / 0.0)" />
          <stop offset="50%" stopColor="oklch(0.40 0.10 45 / 0.5)" />
          <stop offset="100%" stopColor="oklch(0.50 0.10 45 / 0.0)" />
        </linearGradient>
      </defs>

      {/* Left half */}
      <g className="cookie-half cookie-half--left">
        <path
          d="M200 60 C 110 60, 60 150, 80 240 C 95 310, 150 350, 200 350 L 200 60 Z"
          fill="url(#cookieFace)"
          stroke="url(#cookieRim)"
          strokeWidth="6"
        />
        <path
          d="M200 70 C 130 80, 95 170, 110 240 C 125 300, 165 335, 200 340"
          fill="none"
          stroke="oklch(0.55 0.13 55 / 0.5)"
          strokeWidth="3"
        />
      </g>
      {/* Right half */}
      <g className="cookie-half cookie-half--right">
        <path
          d="M200 60 C 290 60, 340 150, 320 240 C 305 310, 250 350, 200 350 L 200 60 Z"
          fill="url(#cookieFace)"
          stroke="url(#cookieRim)"
          strokeWidth="6"
        />
        <path
          d="M200 70 C 270 80, 305 170, 290 240 C 275 300, 235 335, 200 340"
          fill="none"
          stroke="oklch(0.55 0.13 55 / 0.5)"
          strokeWidth="3"
        />
      </g>
      {/* Center crease */}
      <rect x="196" y="60" width="8" height="290" fill="url(#crease)" />
    </svg>
  );
}
