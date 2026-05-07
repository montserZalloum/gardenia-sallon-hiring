// Decorative petals that drift up across the hero.
// Deterministic seed values keep SSR and client output identical (no hydration mismatch).

const PETALS = [
  { x: 6,  size: 22, delay: 0,    duration: 18, drift: 40,  rot: -18, hue: "rose"  },
  { x: 14, size: 16, delay: 4.5,  duration: 22, drift: -28, rot: 22,  hue: "blush" },
  { x: 22, size: 26, delay: 1.2,  duration: 20, drift: 24,  rot: 8,   hue: "rose"  },
  { x: 31, size: 14, delay: 7,    duration: 26, drift: -36, rot: -28, hue: "clay"  },
  { x: 40, size: 19, delay: 2.8,  duration: 19, drift: 18,  rot: 14,  hue: "blush" },
  { x: 48, size: 22, delay: 9,    duration: 24, drift: -22, rot: -10, hue: "rose"  },
  { x: 57, size: 16, delay: 5.4,  duration: 21, drift: 32,  rot: 26,  hue: "clay"  },
  { x: 66, size: 21, delay: 0.8,  duration: 23, drift: -18, rot: -22, hue: "rose"  },
  { x: 74, size: 17, delay: 6.2,  duration: 17, drift: 28,  rot: 18,  hue: "blush" },
  { x: 82, size: 24, delay: 3.6,  duration: 25, drift: -34, rot: -6,  hue: "rose"  },
  { x: 90, size: 14, delay: 8.1,  duration: 20, drift: 22,  rot: 30,  hue: "clay"  },
  { x: 96, size: 19, delay: 1.9,  duration: 22, drift: -26, rot: -16, hue: "blush" },
];

const HUE_TO_COLOR: Record<string, string> = {
  rose: "var(--gd-rose)",
  blush: "var(--gd-blush)",
  clay: "var(--gd-clay)",
};

export function HeroPetals() {
  return (
    <div className="gd-petals" aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="gd-petal"
          style={
            {
              left: `${p.x}%`,
              width: `${p.size}px`,
              height: `${Math.round(p.size * 1.45)}px`,
              color: HUE_TO_COLOR[p.hue],
              animationDelay: `-${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--gd-petal-drift": `${p.drift}px`,
              "--gd-petal-rot": `${p.rot}deg`,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 14 20" fill="currentColor" aria-hidden="true">
            <path d="M7 0.5 C 11.8 5, 12.6 13, 7 19.5 C 1.4 13, 2.2 5, 7 0.5 Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
