import Image from "next/image";

export function Monogram() {
  return (
    <figure className="couple-illustration">
      <Image
        src="/media/couple-forest-illustration.png"
        width={1254}
        height={1254}
        sizes="(max-width: 900px) 100vw, 420px"
        alt="Illustration of Poojitha and Sunil together beneath a tree"
      />
    </figure>
  );
}

export function FloralDivider() {
  return (
    <div className="floral-divider" aria-hidden="true">
      <span>❧</span>
      <i />
      <span>❧</span>
    </div>
  );
}

export function TempleArch({ children }: { children: React.ReactNode }) {
  return (
    <div className="temple-arch">
      <div className="temple-arch__line" />
      {children}
    </div>
  );
}
