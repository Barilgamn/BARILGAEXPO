import React, { useMemo } from 'react';
import { Leaf } from 'lucide-react';

/** Намрын навч — дэлгэц дээгүүр аажуухан унана.
 *  Цэвэр CSS хөдөлгөөн (JS-ээр кадр бүрд тооцоолохгүй) тул хөнгөн.
 *  Байршил, хэмжээ, хурдыг тогтмол "random"-оор үүсгэсэн тул дахин зурагдахад
 *  навчнууд байраа сольж үсрэхгүй. prefers-reduced-motion үед нуугдана. */
const COLORS = ['#f59e0b', '#ea580c', '#c2410c', '#facc15', '#b45309', '#d97706', '#9a3412'];

const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

export const AutumnLeaves: React.FC<{ count?: number }> = ({ count = 18 }) => {
  const leaves = useMemo(() => {
    const rnd = seeded(2027);
    return Array.from({ length: count }, (_, i) => {
      const far = rnd() < 0.4; // зарим нь холын — жижиг, бүдэг
      const size = far ? 12 + rnd() * 8 : 20 + rnd() * 16;
      const dur = (far ? 24 : 15) + rnd() * 12;
      return {
        i,
        left: rnd() * 100,
        size,
        dur,
        delay: -rnd() * dur, // эхлэхэд аль хэдийн сарнисан байхаар сөрөг
        sway: (rnd() < 0.5 ? -1 : 1) * (40 + rnd() * 90),
        r0: Math.round(rnd() * 360),
        opacity: far ? 0.35 + rnd() * 0.2 : 0.6 + rnd() * 0.3,
        blur: far ? 1.6 : 0,
        color: COLORS[Math.floor(rnd() * COLORS.length)],
      };
    });
  }, [count]);

  return (
    <div className="autumn-leaves absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden>
      {leaves.map(l => (
        <span
          key={l.i}
          className="autumn-leaf absolute top-0"
          style={{
            left: `${l.left}%`,
            color: l.color,
            filter: l.blur ? `blur(${l.blur}px)` : undefined,
            animationDuration: `${l.dur}s`,
            animationDelay: `${l.delay}s`,
            ['--sway' as string]: `${l.sway}px`,
            ['--r0' as string]: `${l.r0}deg`,
            ['--o' as string]: l.opacity,
          }}
        >
          <Leaf width={l.size} height={l.size} fill="currentColor" strokeWidth={1.2} />
        </span>
      ))}
    </div>
  );
};
