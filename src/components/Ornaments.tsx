export function Monogram({ small = false }: { small?: boolean }) {
  return <span className={`monogram ${small ? "monogram--small" : ""}`} aria-label="Sunil and Pooja monogram"><span>S</span><i>&</i><span>P</span></span>;
}

export function FloralDivider() {
  return <div className="floral-divider" aria-hidden="true"><span>❧</span><i /><span>❧</span></div>;
}

export function TempleArch({ children }: { children: React.ReactNode }) {
  return <div className="temple-arch"><div className="temple-arch__line" />{children}</div>;
}
