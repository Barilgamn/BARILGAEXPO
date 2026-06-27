import React from 'react';

interface Props {
  src: string;
  className?: string;
}

/** Зургийн координат (1600x1351) дахь гол замууд — гэрлийн цацраг эдгээрийг дагаж хөдөлнө. */
const ROADS: { d: string; color: string; r: number; count: number; dur: number; dir: 1 | -1 }[] = [
  // Талбайн зүүн доод диагональ зам
  { d: 'M 150 1120 C 350 980, 470 860, 560 720', color: '#fff2c8', r: 3.2, count: 5, dur: 7, dir: 1 },
  { d: 'M 150 1120 C 350 980, 470 860, 560 720', color: '#ff5238', r: 3.0, count: 4, dur: 7.5, dir: -1 },
  // Доод талаас талбай руу (босоо маягийн)
  { d: 'M 640 1351 C 660 1150, 690 980, 720 820', color: '#fff2c8', r: 3.4, count: 5, dur: 6.5, dir: -1 },
  { d: 'M 640 1351 C 660 1150, 690 980, 720 820', color: '#ff5238', r: 3.0, count: 4, dur: 7, dir: 1 },
  // Баруун тал руу диагональ
  { d: 'M 900 660 C 1120 620, 1320 590, 1520 560', color: '#fff2c8', r: 3.2, count: 5, dur: 8, dir: 1 },
  { d: 'M 900 660 C 1120 620, 1320 590, 1520 560', color: '#ff5238', r: 3.0, count: 4, dur: 8.5, dir: -1 },
  // Баруун доод булан руу
  { d: 'M 880 830 C 1020 960, 1140 1080, 1280 1210', color: '#fff2c8', r: 3.3, count: 5, dur: 7.5, dir: 1 },
  { d: 'M 880 830 C 1020 960, 1140 1080, 1280 1210', color: '#ff5238', r: 3.0, count: 4, dur: 8, dir: -1 },
  // Дээш гарах зам
  { d: 'M 720 540 C 730 400, 745 270, 770 140', color: '#fff2c8', r: 3.0, count: 4, dur: 7, dir: -1 },
];

/**
 * Хөдөлгөөнгүй хотын зургийг timelapse мэт "амьд" болгоно:
 *  1) Удаан зум/пан (Ken Burns).
 *  2) Гэрэл анивчих давхарга (screen blend).
 *  3) Гол замууд дагуу хөдлөх гэрлийн цацраг — машин явж буй мэт.
 * Бүх давхарга нэг pan дотор тул цацраг зурагтайгаа цуг хөдөлнө.
 */
export const CityTimelapse: React.FC<Props> = ({ src, className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="ct-pan absolute inset-0">
        {/* Үндсэн зураг */}
        <img src={src} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />

        {/* Машины гэрлийн урсгал */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1600 1351"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <filter id="ctBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
            {ROADS.map((road, i) => (
              <path key={i} id={`ctRoad${i}`} d={road.d} fill="none" />
            ))}
          </defs>
          <g filter="url(#ctBlur)">
            {ROADS.map((road, i) =>
              Array.from({ length: road.count }).map((_, k) => (
                <circle key={`${i}-${k}`} r={road.r} fill={road.color} opacity={0.9}>
                  <animateMotion
                    dur={`${road.dur}s`}
                    begin={`${(k * road.dur) / road.count}s`}
                    repeatCount="indefinite"
                    keyPoints={road.dir === 1 ? '0;1' : '1;0'}
                    keyTimes="0;1"
                    calcMode="linear"
                  >
                    <mpath href={`#ctRoad${i}`} />
                  </animateMotion>
                </circle>
              ))
            )}
          </g>
        </svg>

        {/* Гэрэл анивчих давхарга */}
        <img
          src={src}
          alt=""
          aria-hidden
          className="ct-glow absolute inset-0 w-full h-full object-cover"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      <style>{`
        .ct-pan {
          transform-origin: 55% 60%;
          animation: ctPan 40s ease-in-out infinite alternate;
          will-change: transform;
        }
        .ct-glow {
          filter: brightness(1.6) contrast(1.1) saturate(1.2);
          opacity: 0.12;
          animation: ctGlow 9s ease-in-out infinite;
          will-change: opacity;
        }
        @keyframes ctPan {
          0%   { transform: scale(1.06) translate3d(0, 0, 0); }
          100% { transform: scale(1.18) translate3d(-2%, -2%, 0); }
        }
        @keyframes ctGlow {
          0%, 100% { opacity: 0.06; }
          50%      { opacity: 0.30; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ct-pan { animation: none; transform: scale(1.08); }
          .ct-glow { animation: none; opacity: 0.12; }
        }
      `}</style>
    </div>
  );
};
