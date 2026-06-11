import React from 'react';

/**
 * Улаанбаатарын хотын зураг дээр баригдаж буй цамхгууд (CGI blueprint).
 * Цамхгууд ЭЭЛЖЛЭН нэг нэгээр доороос дээш баригдаж, баригдсан хэвээрээ зогсоно
 * (1 → 2 → 3). Бүгд босч дуусаад түр зогсоод, дараа нь дахин эхэлнэ. Зөвхөн CSS/SVG.
 */
const TowerSvg: React.FC = () => {
  const floors = 11;
  const cols = 3;
  const windows: { x: number; y: number; lit: boolean; delay: number }[] = [];
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const lit = (f * 7 + c * 3) % 4 === 0;
      windows.push({ x: 74 + c * 18, y: 96 + f * 18, lit, delay: (f * cols + c) * 0.17 });
    }
  }
  return (
    <>
      <div className="tc-building">
        <svg viewBox="0 0 200 320" className="tc-svg" preserveAspectRatio="xMidYMax meet">
          <line x1="40" y1="318" x2="172" y2="318" className="tc-stroke" strokeWidth="1.5" />
          <rect x="64" y="74" width="72" height="244" className="tc-stroke tc-fill" strokeWidth="1.4" />
          <line x1="88" y1="74" x2="88" y2="318" className="tc-stroke" strokeWidth="0.8" opacity="0.6" />
          <line x1="112" y1="74" x2="112" y2="318" className="tc-stroke" strokeWidth="0.8" opacity="0.6" />
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={i} x1="64" y1={92 + i * 18} x2="136" y2={92 + i * 18} className="tc-stroke" strokeWidth="0.7" opacity="0.55" />
          ))}
          {windows.map((w, i) => (
            <rect
              key={i}
              x={w.x} y={w.y} width="12" height="11" rx="1"
              className={w.lit ? 'tc-win tc-win-lit' : 'tc-win'}
              style={w.lit ? { animationDelay: `${w.delay}s` } : undefined}
            />
          ))}
          <line x1="100" y1="74" x2="100" y2="48" className="tc-stroke" strokeWidth="1.2" />
          <circle cx="100" cy="46" r="2.4" className="tc-beacon" />
          <g className="tc-stroke" strokeWidth="1.3" fill="none">
            <line x1="150" y1="40" x2="150" y2="150" />
            <line x1="60" y1="48" x2="186" y2="48" />
            <line x1="150" y1="40" x2="120" y2="48" />
            <line x1="150" y1="40" x2="178" y2="48" />
            <line x1="150" y1="40" x2="96" y2="48" opacity="0.7" />
            <line x1="96" y1="48" x2="96" y2="70" strokeWidth="0.9" />
            <path d="M93 70 q3 6 6 0" strokeWidth="0.9" />
          </g>
        </svg>
      </div>
      <div className="tc-line" />
    </>
  );
};

export const TowerConstruction: React.FC = () => {
  return (
    <div className="tc-wrap pointer-events-none absolute inset-0 overflow-hidden z-[12]">
      <div className="tc-stage tc-a"><TowerSvg /></div>
      <div className="tc-stage tc-b"><TowerSvg /></div>
      <div className="tc-stage tc-c"><TowerSvg /></div>

      <style>{`
        .tc-stage { position: absolute; bottom: 0; --dur: 30s; }
        /* Давхцахгүй 3 байрлал: зүүн → төв → баруун */
        .tc-a { left: 2%;  width: 190px; height: 270px; --blur: 1.8px; opacity: 0.85; }
        .tc-b { left: 36%; width: 220px; height: 320px; --blur: 1.4px; opacity: 0.95; }
        .tc-c { right: 2%; width: 175px; height: 250px; --blur: 2.2px; opacity: 0.8; }
        @media (min-width: 640px) {
          .tc-a { width: 240px; height: 320px; left: 3%; }
          .tc-b { width: 280px; height: 380px; left: 38%; }
          .tc-c { width: 220px; height: 300px; right: 3%; }
        }
        @media (min-width: 1024px) {
          .tc-a { width: 280px; height: 360px; left: 4%; }
          .tc-b { width: 330px; height: 430px; left: 39%; }
          .tc-c { width: 250px; height: 340px; right: 4%; }
        }
        /* Жижиг дэлгэцэнд зөвхөн нэг цамхаг (давхцахгүйн тулд) */
        @media (max-width: 639px) { .tc-b, .tc-c { display: none; } .tc-a { left: 50%; transform: translateX(-50%); } }

        .tc-svg { width: 100%; height: 100%; filter: drop-shadow(0 0 3px rgba(125,211,252,0.8)) blur(var(--blur)); }
        .tc-stroke { stroke: #7dd3fc; }
        .tc-fill { fill: rgba(125,211,252,0.06); }
        .tc-win { fill: rgba(125,211,252,0.10); stroke: rgba(125,211,252,0.35); stroke-width: 0.5; }
        .tc-win-lit { fill: #fcd34d; animation: tcFlick 5s ease-in-out infinite; }
        .tc-beacon { fill: #f87171; animation: tcBeacon 2.2s ease-in-out infinite; }

        .tc-building { position: absolute; inset: 0; }
        .tc-line {
          position: absolute; left: 8%; right: 8%; height: 3px; top: 100%;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, #e0f2fe 20%, #7dd3fc 50%, #e0f2fe 80%, transparent);
          box-shadow: 0 0 10px 2px rgba(125,211,252,0.9);
          filter: blur(0.5px);
          opacity: 0;
        }

        /* Цамхаг бүр өөр өөр цагт босно (ээлжлэн), бүгд босоод хэвээрээ зогсоно,
           90%-д бүгд хамт цэвэрлэгдэж дахин эхэлнэ. */
        .tc-a .tc-building { animation: revealA var(--dur) linear infinite; }
        .tc-b .tc-building { animation: revealB var(--dur) linear infinite; }
        .tc-c .tc-building { animation: revealC var(--dur) linear infinite; }
        .tc-a .tc-line { animation: lineA var(--dur) linear infinite; }
        .tc-b .tc-line { animation: lineB var(--dur) linear infinite; }
        .tc-c .tc-line { animation: lineC var(--dur) linear infinite; }

        @keyframes revealA {
          0%, 3%   { clip-path: inset(100% 0 0 0); opacity: 0; }
          5%       { opacity: 1; }
          20%      { clip-path: inset(0 0 0 0); }
          90%      { clip-path: inset(0 0 0 0); opacity: 1; }
          96%, 100%{ clip-path: inset(0 0 0 0); opacity: 0; }
        }
        @keyframes revealB {
          0%, 28%  { clip-path: inset(100% 0 0 0); opacity: 0; }
          30%      { opacity: 1; }
          45%      { clip-path: inset(0 0 0 0); }
          90%      { clip-path: inset(0 0 0 0); opacity: 1; }
          96%, 100%{ clip-path: inset(0 0 0 0); opacity: 0; }
        }
        @keyframes revealC {
          0%, 53%  { clip-path: inset(100% 0 0 0); opacity: 0; }
          55%      { opacity: 1; }
          70%      { clip-path: inset(0 0 0 0); }
          90%      { clip-path: inset(0 0 0 0); opacity: 1; }
          96%, 100%{ clip-path: inset(0 0 0 0); opacity: 0; }
        }
        @keyframes lineA {
          0%, 3% { top: 100%; opacity: 0; }
          5% { opacity: 0.9; }
          20% { top: 22%; opacity: 0.9; }
          24%, 100% { top: 22%; opacity: 0; }
        }
        @keyframes lineB {
          0%, 28% { top: 100%; opacity: 0; }
          30% { opacity: 0.9; }
          45% { top: 22%; opacity: 0.9; }
          49%, 100% { top: 22%; opacity: 0; }
        }
        @keyframes lineC {
          0%, 53% { top: 100%; opacity: 0; }
          55% { opacity: 0.9; }
          70% { top: 22%; opacity: 0.9; }
          74%, 100% { top: 22%; opacity: 0; }
        }
        @keyframes tcFlick { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes tcBeacon { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .tc-building { animation: none !important; clip-path: inset(0 0 0 0); opacity: 0.85; }
          .tc-line, .tc-win-lit, .tc-beacon { animation: none; }
          .tc-line { display: none; }
        }
      `}</style>
    </div>
  );
};
