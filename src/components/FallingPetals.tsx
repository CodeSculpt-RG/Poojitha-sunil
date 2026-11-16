"use client";

import { useEffect, useState, type CSSProperties } from "react";

type PetalConfig = {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  sway: number;
  startRotation: number;
  spin: number;
  opacity: number;
  variant: 0 | 1 | 2;
  color: string;
};

const PETALS: readonly PetalConfig[] = [
  { left: 4, size: 13, duration: 15.4, delay: -3.2, drift: 72, sway: 23, startRotation: 18, spin: 390, opacity: 0.7, variant: 0, color: "#d97b92" },
  { left: 11, size: 20, duration: 12.8, delay: -10.1, drift: -84, sway: 34, startRotation: 92, spin: -330, opacity: 0.84, variant: 1, color: "#c95c7c" },
  { left: 18, size: 9, duration: 18.2, delay: -6.8, drift: 45, sway: 18, startRotation: 210, spin: 470, opacity: 0.58, variant: 2, color: "#e5a0ad" },
  { left: 25, size: 16, duration: 14.2, delay: -12.7, drift: -62, sway: 29, startRotation: 145, spin: -410, opacity: 0.76, variant: 0, color: "#d36b87" },
  { left: 32, size: 11, duration: 16.8, delay: -1.7, drift: 96, sway: 25, startRotation: 260, spin: 520, opacity: 0.64, variant: 2, color: "#e09aac" },
  { left: 39, size: 22, duration: 11.6, delay: -7.9, drift: 58, sway: 42, startRotation: 38, spin: 360, opacity: 0.88, variant: 1, color: "#bd496d" },
  { left: 47, size: 14, duration: 17.1, delay: -14.4, drift: -104, sway: 31, startRotation: 184, spin: -480, opacity: 0.67, variant: 0, color: "#dc8298" },
  { left: 54, size: 18, duration: 13.5, delay: -4.9, drift: 83, sway: 36, startRotation: 312, spin: 430, opacity: 0.8, variant: 2, color: "#cf607f" },
  { left: 61, size: 10, duration: 18.7, delay: -11.5, drift: -44, sway: 20, startRotation: 72, spin: -540, opacity: 0.56, variant: 1, color: "#e7a4b0" },
  { left: 67, size: 15, duration: 14.9, delay: -2.4, drift: 108, sway: 33, startRotation: 228, spin: 400, opacity: 0.73, variant: 0, color: "#d5748e" },
  { left: 73, size: 23, duration: 10.9, delay: -8.6, drift: -76, sway: 45, startRotation: 126, spin: -350, opacity: 0.9, variant: 2, color: "#bd4569" },
  { left: 79, size: 12, duration: 16.2, delay: -13.2, drift: 54, sway: 24, startRotation: 344, spin: 510, opacity: 0.62, variant: 1, color: "#df91a4" },
  { left: 85, size: 17, duration: 13.9, delay: -5.8, drift: -94, sway: 37, startRotation: 166, spin: -440, opacity: 0.78, variant: 0, color: "#cb5879" },
  { left: 90, size: 8, duration: 19, delay: -9.4, drift: 38, sway: 17, startRotation: 278, spin: 570, opacity: 0.55, variant: 2, color: "#e9acb6" },
  { left: 94, size: 19, duration: 12.3, delay: -15.1, drift: -68, sway: 39, startRotation: 54, spin: -380, opacity: 0.85, variant: 1, color: "#c65375" },
  { left: 98, size: 13, duration: 15.8, delay: -7.1, drift: -106, sway: 27, startRotation: 196, spin: 460, opacity: 0.68, variant: 0, color: "#da7e95" },
];

const PETAL_PATHS = [
  "M12 1C6 2 2 7 3 13c1 6 6 9 10 10 4-3 7-8 6-13-1-5-4-8-7-9Z",
  "M4 3c6-3 13 0 16 6 2 5-1 11-7 14-6-1-11-5-12-10C0 8 1 5 4 3Z",
  "M12 1c4 3 8 8 7 13-1 5-5 8-10 9-5-3-8-8-6-13 2-5 5-8 9-9Z",
] as const;

export function FallingPetals() {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const syncVisibility = () => setIsPaused(document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  return (
    <div
      className={`falling-petals-layer${isPaused ? " is-paused" : ""}`}
      aria-hidden="true"
    >
      {PETALS.map((petal, index) => {
        const style = {
          "--petal-left": `${petal.left}%`,
          "--petal-size": `${petal.size}px`,
          "--petal-duration": `${petal.duration}s`,
          "--petal-delay": `${petal.delay}s`,
          "--petal-drift": `${petal.drift}px`,
          "--petal-sway": `${petal.sway}px`,
          "--petal-start": `${petal.startRotation}deg`,
          "--petal-spin": `${petal.spin}deg`,
          "--petal-opacity": petal.opacity,
          "--petal-color": petal.color,
          "--petal-flutter": `${2.8 + (index % 5) * 0.45}s`,
        } as CSSProperties;

        return (
          <span className="falling-petal" style={style} key={index}>
            <i className="falling-petal__sway">
              <svg viewBox="0 0 24 24">
                <path d={PETAL_PATHS[petal.variant]} />
                <path className="falling-petal__vein" d="M12 3c0 7-2 12-7 17" />
              </svg>
            </i>
          </span>
        );
      })}
    </div>
  );
}
