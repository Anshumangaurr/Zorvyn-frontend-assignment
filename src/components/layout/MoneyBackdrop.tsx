function Coin({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="g" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="1" stopColor="#f472b6" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="40" fill="url(#g)" opacity="0.22" />
        <circle cx="60" cy="60" r="34" fill="none" stroke="rgba(99,102,241,0.65)" strokeWidth="2" />
        <circle cx="60" cy="60" r="23" fill="rgba(99,102,241,0.12)" stroke="rgba(244,114,182,0.35)" strokeWidth="1.5" />
        <path
          d="M48 58C48 51 53 46 60 46C67 46 72 51 72 58C72 65 67 70 60 70C53 70 48 65 48 58Z"
          fill="rgba(244,114,182,0.14)"
        />
        <path d="M44 72L76 44" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function MoneyBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-10 top-20 money-coin money-coin-glow money-coin--1 opacity-60">
        <Coin className="money-coin-glow" />
      </div>
      <div className="absolute right-0 top-32 money-coin money-coin--2 money-coin-glow opacity-60">
        <Coin />
      </div>
      <div className="absolute left-1/3 bottom-16 money-coin money-coin--3 money-coin-glow opacity-60">
        <Coin />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18),_transparent_50%),radial-gradient(ellipse_at_bottom,_rgba(244,114,182,0.14),_transparent_55%)]" />
    </div>
  )
}

