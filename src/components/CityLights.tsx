import React from 'react';

const CITY_IMG = 'https://greatergo.org/uploads/article/63ab00ab-f707-4b23-b389-96b04b22552a.jpg';

/**
 * Арын хотын зураг дээрх ЖИНХЭНЭ барилгын цонхнуудын гэрлийг гэрэлтүүлэх анимэйшн.
 * Зургийг өөрийг нь `screen` blend-ээр давхарлавал зөвхөн тод цэгүүд (цонхны гэрэл)
 * нэмэгдэж гэрэлтэнэ. Хоёр давхарга:
 *   1) "Амьсгал" — бүх гэрлүүд зөөлөн анивчина.
 *   2) "Долгион" — гэрэлтэлтийн туяа зурвасаар нааш цааш гүйж, цонхнууд ээлжлэн ялтгана.
 */
export const CityLights: React.FC = () => {
  const base = 'absolute inset-0 w-full h-full object-cover scale-105 blur-[3px] select-none';
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[11]">
      {/* 1) Амьсгалт гэрэлтэлт */}
      <img
        src={CITY_IMG}
        alt=""
        aria-hidden
        referrerPolicy="no-referrer"
        className={`${base} cl-breathe`}
        style={{ mixBlendMode: 'screen', filter: 'brightness(1.7) contrast(1.15) saturate(1.25)' }}
      />
      {/* 2) Долгионт ялтгал (mask зурвас гүйнэ) */}
      <img
        src={CITY_IMG}
        alt=""
        aria-hidden
        referrerPolicy="no-referrer"
        className={`${base} cl-sweep`}
        style={{ mixBlendMode: 'screen', filter: 'brightness(2.1) saturate(1.35)' }}
      />
      <style>{`
        .cl-breathe { opacity: 0.22; animation: clBreathe 12s ease-in-out infinite; }
        @keyframes clBreathe {
          0%, 100% { opacity: 0.14; }
          50%      { opacity: 0.42; }
        }
        .cl-sweep {
          opacity: 0.5;
          -webkit-mask-image: linear-gradient(100deg, transparent 38%, #000 50%, transparent 62%);
          mask-image: linear-gradient(100deg, transparent 38%, #000 50%, transparent 62%);
          -webkit-mask-size: 260% 100%;
          mask-size: 260% 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          animation: clSweep 18s linear infinite;
        }
        @keyframes clSweep {
          0%   { -webkit-mask-position: 135% 0; mask-position: 135% 0; }
          100% { -webkit-mask-position: -35% 0; mask-position: -35% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cl-breathe { animation: none; opacity: 0.25; }
          .cl-sweep { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
