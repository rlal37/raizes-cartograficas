type SvgColor = { color?: string };

export function Knot({ color = "var(--indigo)" }: SvgColor) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="4" fill="none" stroke={color} strokeWidth="1.6" />
      <circle cx="8" cy="8" r="1.6" fill={color} />
    </svg>
  );
}

export function Flower({ color = "var(--mata)" }: SvgColor) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <g fill={color}>
        <circle cx="8" cy="3.5" r="2" />
        <circle cx="8" cy="12.5" r="2" />
        <circle cx="3.5" cy="8" r="2" />
        <circle cx="12.5" cy="8" r="2" />
      </g>
      <circle cx="8" cy="8" r="2" fill="var(--ocre)" />
    </svg>
  );
}

export function Arrow({ color = "var(--terra)" }: SvgColor) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 16 C 5 9 11 6 17 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M13 4 L 18 6 L 16 11" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Vine({ color = "var(--terra)", i = 0 }: SvgColor & { i?: number }) {
  return (
    <svg
      className="vine-sm"
      width="64"
      height="32"
      viewBox="0 0 64 32"
      fill="none"
      style={{ "--i": i } as React.CSSProperties}
      aria-hidden="true"
    >
      <path d="M4 16 C 16 2 26 30 38 16 S 54 4 60 16" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="22" cy="9" rx="5" ry="3" fill={color} transform="rotate(-25 22 9)" />
      <ellipse cx="44" cy="23" rx="5" ry="3" fill={color} transform="rotate(-25 44 23)" />
      <circle cx="4" cy="16" r="3" fill={color} />
      <circle cx="60" cy="16" r="3" fill={color} />
    </svg>
  );
}

export function HeroVine() {
  return (
    <svg className="vine" viewBox="0 0 700 30" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 22 C 120 4, 200 30, 320 16 S 520 0, 700 18" stroke="var(--terra)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="180" cy="14" rx="7" ry="4" fill="var(--mata)" transform="rotate(-25 180 14)" />
      <ellipse cx="430" cy="9" rx="7" ry="4" fill="var(--mata)" transform="rotate(20 430 9)" />
      <circle cx="320" cy="16" r="3.5" fill="var(--ocre)" />
    </svg>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="divider">
      <span className="lbl">{label}</span>
      <span className="wave" />
    </div>
  );
}

export function Ribbon({ children }: { children: React.ReactNode }) {
  return (
    <div className="ribbon">
      <Flower color="var(--mata)" />
      {children}
    </div>
  );
}