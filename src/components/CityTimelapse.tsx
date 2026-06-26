import React from 'react';

interface Props {
  src: string;
  className?: string;
}

/**
 * Хөдөлгөөнгүй хотын зургийг timelapse мэт "амьд" болгоно:
 *  1) Удаан зум/пан (Ken Burns) — камер аажуухан ойртож хөдөлнө.
 *  2) Гэрэл анивчих давхарга — ижил зургийг screen blend-ээр давхарлаж,
 *     тодролыг аажим нэмж/хасснаар хотын гэрлүүд timelapse мэт ялтгана.
 */
export const CityTimelapse: React.FC<Props> = ({ src, className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Үндсэн давхарга — Ken Burns зум/пан */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="ct-base absolute inset-0 w-full h-full object-cover"
      />
      {/* Гэрэл анивчих давхарга (screen blend) */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="ct-glow absolute inset-0 w-full h-full object-cover"
        style={{ mixBlendMode: 'screen' }}
      />

      <style>{`
        .ct-base {
          transform-origin: 55% 60%;
          animation: ctPan 40s ease-in-out infinite alternate;
          will-change: transform;
        }
        .ct-glow {
          transform-origin: 55% 60%;
          filter: brightness(1.6) contrast(1.1) saturate(1.2);
          opacity: 0.12;
          animation: ctPan 40s ease-in-out infinite alternate, ctGlow 9s ease-in-out infinite;
          will-change: transform, opacity;
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
          .ct-base, .ct-glow { animation: none; }
          .ct-base { transform: scale(1.08); }
          .ct-glow { opacity: 0.12; }
        }
      `}</style>
    </div>
  );
};
