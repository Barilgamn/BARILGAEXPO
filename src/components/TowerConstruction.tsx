import React from 'react';

/**
 * Улаанбаатарын хотын зураг дээр баригдаж буй цамхаг (CGI blueprint).
 * Доороос дээш давтан "баригдах" гэрэлтсэн wireframe цамхаг + кран + барилгын шугам.
 * Зөвхөн CSS/SVG — гадны файл шаардахгүй, blur-тэй зурагтай зохицсон.
 */
export const TowerConstruction: React.FC = () => {
  // Цонхнуудыг автоматаар үүсгэх (зарим нь асаалттай)
  const floors = 11;
  const cols = 3;
  const windows: { x: number; y: number; lit: boolean; delay: number }[] = [];
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const lit = (f * 7 + c * 3) % 4 === 0;
      windows.push({
        x: 74 + c * 18,
        y: 96 + f * 18,
        lit,
        delay: (f * cols + c) * 0.13,
      });
    }
  }

  return (
    <div className="tc-wrap pointer-events-none absolute inset-0 overflow-hidden z-[12]">
      <div className="tc-stage">
        {/* Баригдаж буй цамхаг (reveal доороос дээш) */}
        <div className="tc-building">
          <svg viewBox="0 0 200 320" className="tc-svg" preserveAspectRatio="xMidYMax meet">
            {/* Газрын шугам */}
            <line x1="40" y1="318" x2="172" y2="318" className="tc-stroke" strokeWidth="1.5" />
            {/* Цамхгийн их бие */}
            <rect x="64" y="74" width="72" height="244" className="tc-stroke tc-fill" strokeWidth="1.4" />
            {/* Босоо хуваалт */}
            <line x1="88" y1="74" x2="88" y2="318" className="tc-stroke" strokeWidth="0.8" opacity="0.6" />
            <line x1="112" y1="74" x2="112" y2="318" className="tc-stroke" strokeWidth="0.8" opacity="0.6" />
            {/* Давхрын шугамууд */}
            {Array.from({ length: 13 }).map((_, i) => (
              <line key={i} x1="64" y1={92 + i * 18} x2="136" y2={92 + i * 18} className="tc-stroke" strokeWidth="0.7" opacity="0.55" />
            ))}
            {/* Цонхнууд */}
            {windows.map((w, i) => (
              <rect
                key={i}
                x={w.x} y={w.y} width="12" height="11" rx="1"
                className={w.lit ? 'tc-win tc-win-lit' : 'tc-win'}
                style={w.lit ? { animationDelay: `${w.delay}s` } : undefined}
              />
            ))}
            {/* Орой + антен + дохиолол */}
            <line x1="100" y1="74" x2="100" y2="48" className="tc-stroke" strokeWidth="1.2" />
            <circle cx="100" cy="46" r="2.4" className="tc-beacon" />

            {/* Кран — мачта ба сум */}
            <g className="tc-stroke" strokeWidth="1.3" fill="none">
              <line x1="150" y1="40" x2="150" y2="150" />
              <line x1="150" y1="40" x2="150" y2="150" />
              <line x1="60" y1="48" x2="186" y2="48" />
              <line x1="150" y1="40" x2="120" y2="48" />
              <line x1="150" y1="40" x2="178" y2="48" />
              {/* татлагын зэрэгцээ зураас */}
              <line x1="150" y1="40" x2="96" y2="48" opacity="0.7" />
              {/* дэгээ */}
              <line x1="96" y1="48" x2="96" y2="70" strokeWidth="0.9" />
              <path d="M93 70 q3 6 6 0" strokeWidth="0.9" />
            </g>
          </svg>
        </div>

        {/* Барилгын гэрэлтсэн шугам (reveal-тэй ижил хурдаар дээшилнэ) */}
        <div className="tc-line" />
        {/* Тоос/оч */}
        <span className="tc-spark tc-spark-1" />
        <span className="tc-spark tc-spark-2" />
      </div>

      <style>{`
        .tc-stage {
          position: absolute;
          bottom: 0;
          right: 3%;
          width: 230px;
          height: 320px;
        }
        @media (min-width: 640px) { .tc-stage { width: 300px; height: 360px; } }
        @media (min-width: 1024px) { .tc-stage { width: 360px; height: 420px; right: 5%; } }

        .tc-svg { width: 100%; height: 100%; filter: drop-shadow(0 0 3px rgba(125,211,252,0.85)); }
        .tc-stroke { stroke: #7dd3fc; }
        .tc-fill { fill: rgba(125,211,252,0.06); }
        .tc-win { fill: rgba(125,211,252,0.10); stroke: rgba(125,211,252,0.35); stroke-width: 0.5; }
        .tc-win-lit { fill: #fcd34d; animation: tcFlick 3.5s ease-in-out infinite; }
        .tc-beacon { fill: #f87171; animation: tcBeacon 1.4s ease-in-out infinite; }

        .tc-building {
          position: absolute; inset: 0;
          animation: tcReveal 9s linear infinite, tcFade 9s linear infinite;
        }
        .tc-line {
          position: absolute; left: 8%; right: 8%; height: 3px; top: 100%;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, #e0f2fe 20%, #7dd3fc 50%, #e0f2fe 80%, transparent);
          box-shadow: 0 0 10px 2px rgba(125,211,252,0.9);
          animation: tcLine 9s linear infinite;
        }
        .tc-spark { position: absolute; width: 4px; height: 4px; border-radius: 9999px; background: #fde68a; box-shadow: 0 0 6px 1px #fcd34d; top: 100%; opacity: 0; }
        .tc-spark-1 { left: 28%; animation: tcLine 9s linear infinite, tcSpark 9s linear infinite; }
        .tc-spark-2 { left: 64%; animation: tcLine 9s linear infinite, tcSpark 9s linear infinite; animation-delay: -0.6s; }

        @keyframes tcReveal {
          0%, 6%   { clip-path: inset(100% 0 0 0); }
          66%, 86% { clip-path: inset(0 0 0 0); }
          100%     { clip-path: inset(0 0 0 0); }
        }
        @keyframes tcFade {
          0%   { opacity: 0; }
          7%   { opacity: 0.9; }
          86%  { opacity: 0.9; }
          97%, 100% { opacity: 0; }
        }
        @keyframes tcLine {
          0%, 6%   { top: 100%; }
          66%      { top: 22%; }
          72%      { top: 22%; opacity: 0.9; }
          80%, 100% { top: 22%; opacity: 0; }
        }
        @keyframes tcSpark {
          0%, 6% { opacity: 0; }
          10% { opacity: 1; }
          30% { opacity: 0; }
          50% { opacity: 1; }
          66% { opacity: 0.6; }
          72%, 100% { opacity: 0; }
        }
        @keyframes tcFlick {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes tcBeacon {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tc-building, .tc-line, .tc-spark, .tc-win-lit, .tc-beacon { animation: none; }
          .tc-building { clip-path: inset(0 0 0 0); opacity: 0.85; }
          .tc-line { display: none; }
        }
      `}</style>
    </div>
  );
};
