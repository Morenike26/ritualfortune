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
      Array.from({ length: 22 }).map((_, i) => ({
        left: 50 + (Math.random() - 0.5) * 30,
        top: 55 + (Math.random() - 0.5) * 10,
        tx: (Math.random() - 0.5) * 180,
        delay: Math.random() * 0.4,
        size: 4 + Math.random() * 9,
        key: i,
      })),
    [isOpen],
  );

  // Orbiting sparkle stars (deterministic positions to avoid SSR mismatch)
  const orbitStars = useMemo(
    () =>
      [
        { x: 8, y: 18, size: 10, delay: 0 },
        { x: 88, y: 22, size: 14, delay: 0.6 },
        { x: 14, y: 78, size: 8, delay: 1.2 },
        { x: 84, y: 80, size: 12, delay: 1.8 },
        { x: 50, y: 4, size: 9, delay: 2.4 },
        { x: 96, y: 50, size: 7, delay: 0.9 },
        { x: 4, y: 50, size: 7, delay: 1.5 },
      ],
    [],
  );

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <button
        type="button"
        aria-label="Open fortune cookie"
        onClick={onClick}
        disabled={disabled}
        className="relative h-[300px] w-[300px] sm:h-[420px] sm:w-[420px] cursor-pointer disabled:cursor-wait outline-none"
      >
        {/* Soft breathing halo */}
        <div className="cookie-halo" aria-hidden />

        {/* Orbiting sparkle stars */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {orbitStars.map((s, i) => (
            <span
              key={i}
              className="sparkle-star"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>

        <motion.div
          className={`relative h-full w-full cookie-glow ${isOpen ? "cookie-open" : ""}`}
          animate={
            isOpen
              ? { y: 0, rotate: 0 }
              : { y: [0, -10, 0], rotate: [-1.2, 1.2, -1.2] }
          }
          transition={{
            duration: 6,
            ease: "easeInOut",
            repeat: isOpen ? 0 : Infinity,
          }}
        >
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
        </motion.div>

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
        <radialGradient id="cookieFace" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="oklch(0.95 0.10 82)" />
          <stop offset="45%" stopColor="oklch(0.82 0.15 72)" />
          <stop offset="80%" stopColor="oklch(0.65 0.16 58)" />
          <stop offset="100%" stopColor="oklch(0.48 0.13 45)" />
        </radialGradient>
        <radialGradient id="cookieRim" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.62 0.14 52)" />
          <stop offset="100%" stopColor="oklch(0.38 0.10 42)" />
        </radialGradient>
        <linearGradient id="crease" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.45 0.10 45 / 0)" />
          <stop offset="50%" stopColor="oklch(0.34 0.10 45 / 0.6)" />
          <stop offset="100%" stopColor="oklch(0.45 0.10 45 / 0)" />
        </linearGradient>
        <linearGradient id="shine" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(1 0 0 / 0)" />
          <stop offset="50%" stopColor="oklch(1 0 0 / 0.55)" />
          <stop offset="100%" stopColor="oklch(1 0 0 / 0)" />
        </linearGradient>
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="200" cy="365" rx="120" ry="14" fill="oklch(0.32 0.08 315 / 0.25)" filter="url(#softShadow)" />

      {/* Left half */}
      <g className="cookie-half cookie-half--left">
        <path
          d="M200 60 C 110 60, 60 150, 80 240 C 95 310, 150 350, 200 350 L 200 60 Z"
          fill="url(#cookieFace)"
          stroke="url(#cookieRim)"
          strokeWidth="6"
        />
        {/* texture creases */}
        <path d="M200 70 C 130 80, 95 170, 110 240 C 125 300, 165 335, 200 340" fill="none" stroke="oklch(0.50 0.13 50 / 0.55)" strokeWidth="3" />
        <path d="M180 95 C 130 115, 105 180, 120 235" fill="none" stroke="oklch(0.55 0.12 55 / 0.35)" strokeWidth="2" />
        <path d="M170 130 C 130 155, 115 200, 130 250" fill="none" stroke="oklch(0.55 0.12 55 / 0.25)" strokeWidth="2" />
        {/* crystallized sugar dots */}
        <circle cx="120" cy="180" r="3" fill="oklch(0.95 0.05 82 / 0.85)" />
        <circle cx="145" cy="240" r="2.5" fill="oklch(0.95 0.05 82 / 0.7)" />
        <circle cx="100" cy="220" r="2" fill="oklch(0.95 0.05 82 / 0.6)" />
        <circle cx="170" cy="290" r="2.2" fill="oklch(0.95 0.05 82 / 0.6)" />
        {/* shine */}
        <path d="M150 90 C 120 110, 105 150, 100 190" fill="none" stroke="url(#shine)" strokeWidth="14" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Right half */}
      <g className="cookie-half cookie-half--right">
        <path
          d="M200 60 C 290 60, 340 150, 320 240 C 305 310, 250 350, 200 350 L 200 60 Z"
          fill="url(#cookieFace)"
          stroke="url(#cookieRim)"
          strokeWidth="6"
        />
        <path d="M200 70 C 270 80, 305 170, 290 240 C 275 300, 235 335, 200 340" fill="none" stroke="oklch(0.50 0.13 50 / 0.55)" strokeWidth="3" />
        <path d="M220 95 C 270 115, 295 180, 280 235" fill="none" stroke="oklch(0.55 0.12 55 / 0.35)" strokeWidth="2" />
        <path d="M230 130 C 270 155, 285 200, 270 250" fill="none" stroke="oklch(0.55 0.12 55 / 0.25)" strokeWidth="2" />
        <circle cx="280" cy="180" r="3" fill="oklch(0.95 0.05 82 / 0.85)" />
        <circle cx="255" cy="240" r="2.5" fill="oklch(0.95 0.05 82 / 0.7)" />
        <circle cx="300" cy="220" r="2" fill="oklch(0.95 0.05 82 / 0.6)" />
        <circle cx="230" cy="290" r="2.2" fill="oklch(0.95 0.05 82 / 0.6)" />
        <path d="M250 90 C 280 110, 295 150, 300 190" fill="none" stroke="url(#shine)" strokeWidth="14" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Center crease */}
      <rect x="196" y="60" width="8" height="290" fill="url(#crease)" />
    </svg>
  );
}
