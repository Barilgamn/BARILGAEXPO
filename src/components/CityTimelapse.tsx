import React from 'react';

interface Props {
  src: string;
  className?: string;
  /** Машины гэрлийн урсгал ба анивчих давхаргыг харуулах эсэх.
   *  Замын замнал нь шөнийн зурагт тааруулж гараар зурсан тул өдрийн
   *  зураг тавихад унтраана (эс бөгөөс байшин дээгүүр гэрэл гүйнэ). */
  trails?: boolean;
  /** Төгсгөлд хүрэх зумын хэмжээ (анхдагч 1.38). Нягтрал багатай зурагт жижиг утга өгнө. */
  zoom?: number;
  /** Доошилж буй мэт дээш гулсах хэмжээ, % (анхдагч 7). */
  rise?: number;
  /** Нарийн/босоо дэлгэцэнд зургийн аль хэсгийг үлдээх (CSS object-position). */
  focus?: string;
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
 * Хөдөлгөөнгүй хотын зургийг "амьд" болгоно:
 *  1) Дрон дээрээс аажуухан доошилж буй мэт нэг чиглэлд дөхөх хөдөлгөөн.
 *  2) Гэрэл анивчих давхарга (screen blend).
 *  3) Гол замууд дагуу хөдлөх гэрлийн цацраг — машин явж буй мэт.
 *
 * Нэг чиглэлд дөхөх хөдөлгөөн төгсөхөд зураг эхлэл рүүгээ үсэрдэг. Үүнийг
 * нууж, хөдөлгөөнийг тасралтгүй мэт харагдуулахын тулд ижил давхарга хоёрыг
 * хагас мөчлөгөөр хойш нь эхлүүлж, ээлжлэн бүдгэрүүлж холино. Нэг нь
 * бүдгэрч байх үед нөгөө нь бүрэн харагдаж байдаг тул хар цоорхой гарахгүй.
 * Давхарга бүрд өөрийн цацраг, гэрэл багтсан тул зурагтайгаа цуг хөдөлнө.
 */
const Layer: React.FC<{ src: string; trails: boolean; uid: string; className: string; focus: string }> = ({ src, trails, uid, className, focus }) => (
  <div className={`ct-pan absolute inset-0 ${className}`}>
    {/* Үндсэн зураг */}
    <img src={src} alt="" aria-hidden className="ct-base absolute inset-0 w-full h-full object-cover" style={{ objectPosition: focus }} />
    {/* Машины гэрлийн урсгал */}
    {trails && (
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1600 1351"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <filter id={`ctBlur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          {ROADS.map((road, i) => (
            <path key={i} id={`ctRoad-${uid}-${i}`} d={road.d} fill="none" />
          ))}
        </defs>
        <g filter={`url(#ctBlur-${uid})`}>
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
                  <mpath href={`#ctRoad-${uid}-${i}`} />
                </animateMotion>
              </circle>
            ))
          )}
        </g>
      </svg>
    )}
    {/* Гэрэл анивчих давхарга */}
    {trails && (
      <img
        src={src}
        alt=""
        aria-hidden
        className="ct-glow absolute inset-0 w-full h-full object-cover"
        style={{ mixBlendMode: 'screen', objectPosition: focus }}
      />
    )}
  </div>
);

export const CityTimelapse: React.FC<Props> = ({ src, className = '', trails = true, zoom = 1.38, rise = 7, focus = '50% 50%' }) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ ['--ct-zoom' as string]: zoom, ['--ct-rise' as string]: `-${rise}%` }}
    >
      <Layer src={src} trails={trails} uid="a" className="ct-a" focus={focus} />
      <Layer src={src} trails={trails} uid="b" className="ct-b" focus={focus} />
      <style>{`
        .ct-pan {
          /* Дээд тал руу ойртсон цэг — камер хотын төв рүү доошилж байгаа мэт */
          transform-origin: 50% 42%;
          animation: ctDescend 44s linear infinite;
          will-change: transform, opacity;
        }
        /* Хоёр дахь давхарга яг хагас мөчлөгийн дараа эхэлнэ */
        .ct-b { animation-delay: -22s; }
        .ct-glow {
          filter: brightness(1.6) contrast(1.1) saturate(1.2);
          opacity: 0.12;
          animation: ctGlow 9s ease-in-out infinite;
          will-change: opacity;
        }
        /* Нэг чиглэлд доошилно: зураг аажмаар томорч (зум) дээш гулсана.
           Эхлэл, төгсгөлд 12% хугацаанд бүдгэрч, нөгөө давхаргатай холигдоно.
           Гулсалт (-7%) нь зумаас үүссэн хүрээний нөөцөөс (≥3%+16%·t) үргэлж бага
           тул булан хоосорхгүй. */
        @keyframes ctDescend {
          0%   { opacity: 0; transform: scale(1.06) translate3d(0, 0, 0); }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { opacity: 0; transform: scale(var(--ct-zoom, 1.38)) translate3d(0, var(--ct-rise, -7%), 0); }
        }
        @keyframes ctGlow {
          0%, 100% { opacity: 0.06; }
          50%      { opacity: 0.30; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ct-pan { animation: none; opacity: 1; transform: scale(1.08); }
          .ct-b { display: none; }
          .ct-glow { animation: none; opacity: 0.12; }
        }
      `}</style>
    </div>
  );
};
