import React, { useMemo } from 'react';

/**
 * Арын хотын зураг дээр гэрлүүд гэрэлтэж/анивчиж буй мэт зөөлөн анимэйшн.
 * Олон жижиг гэрэлтэх цэгүүд (warm/cool) санамсаргүй байрлал, хугацаатайгаар анивчина.
 * mix-blend-screen ашигласан тул зөвхөн гэрэл нэмэгдэж, харанхуй хэсэг хэвээр үлдэнэ.
 */
export const CityLights: React.FC = () => {
  const dots = useMemo(() => {
    const colors = ['#fde68a', '#fef3c7', '#ffffff', '#fdba74', '#bae6fd', '#fcd34d'];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    return Array.from({ length: 64 }).map(() => {
      const size = rnd(2, 6);
      return {
        left: rnd(2, 98),
        // Гэрлүүд голчлон хотын мөрийн зурвас (дунд-доод хэсэг)-т
        top: rnd(40, 86),
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        dur: rnd(2.2, 6).toFixed(2),
        delay: rnd(0, 5).toFixed(2),
        min: rnd(0.05, 0.25).toFixed(2),
        glow: (size * rnd(2.2, 4)).toFixed(1),
      };
    });
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-[11]"
      style={{ mixBlendMode: 'screen' }}
    >
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            borderRadius: '9999px',
            background: d.color,
            boxShadow: `0 0 ${d.glow}px ${Math.max(1, d.size / 2)}px ${d.color}`,
            // @ts-ignore — CSS custom property
            '--min': d.min,
            opacity: d.min,
            animation: `cityTwinkle ${d.dur}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes cityTwinkle {
          0%, 100% { opacity: var(--min); transform: scale(0.75); }
          50%      { opacity: 1;          transform: scale(1.25); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="cityTwinkle"] { animation: none !important; opacity: 0.6 !important; }
        }
      `}</style>
    </div>
  );
};
