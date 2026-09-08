import React, { useState } from 'react';
import { CalendarDays, Clock, MapPin, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAdmin, type ProgramEvent } from '../context/AdminContext';

/** Зурагт хуудсыг гарчгийн хажууд томоор харуулна. Зураг нь байхгүй/эвдэрсэн
 *  тохиолдолд (админаас өшөө оруулаагүй) картыг эвдэлгүй бүрэн нуугдана. */
const EventCard: React.FC<{ ev: ProgramEvent; onOpen?: (src: string) => void }> = ({ ev, onOpen }) => {
  const [noImg, setNoImg] = useState(false);
  return (
  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 md:items-center hover:bg-white/20 transition-colors">
    {ev.time && (
      /* Цагийн муж ("14:25-14:45") хоёр мөр болж тасрахгүйн тулд зураасны
         дараа зөөлөн таслалт (\u200b) тавьж, мөр бүрийг бүтнээр нь үлдээнэ. */
      <div className="shrink-0 md:w-44">
        <span className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 border border-red-400/25
                         px-3 py-1.5 text-red-300 font-heading font-bold tabular-nums leading-tight
                         text-base sm:text-lg">
          <Clock size={16} className="shrink-0 opacity-80" />
          <span className="whitespace-nowrap">
            {ev.time.replace(/\s*[-–—]\s*/g, '–\u200b')}
          </span>
        </span>
      </div>
    )}
    {ev.img && !noImg && (
      <button
        type="button"
        onClick={() => onOpen?.(ev.img!)}
        className="shrink-0 w-full sm:w-72 md:w-64 lg:w-72 rounded-xl overflow-hidden border border-white/15
                   hover:border-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        <img src={ev.img} alt={ev.title} loading="lazy" onError={() => setNoImg(true)}
             className="w-full aspect-square object-cover" />
      </button>
    )}
    <div className="flex-1">
      <h3 className="text-xl font-bold mb-2">{ev.title}</h3>
      {ev.desc && <p className="text-gray-300 mb-3 text-sm">{ev.desc}</p>}
      {ev.loc && (
        <div className="flex items-center gap-2 text-blue-300 text-sm">
          <MapPin size={16} />
          {ev.loc}
        </div>
      )}
    </div>
    </div>
  );
};

/** hideHeading — /program хуудсанд толгой хэсэг нь дээр нь тусад нь
 *  байдаг тул хэсгийн доторх гарчгийг давхардуулахгүй. */
export const ProgramSection: React.FC<{ hideHeading?: boolean }> = ({ hideHeading }) => {
  const { t } = useTranslation();
  const { data } = useAdmin();
  const [activeDay, setActiveDay] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);

  const program = data.program || [];

  /** Админаас огноог "2026-09-11 / Төсөл хэрэгжүүлэгчдийн өдөр" гэж бичсэн
   *  байж болно. Товч дээр зөвхөн огноо нь, өдрийн тайлбар нь доор гарчиг
   *  болж харагдана — эсрэг тохиолдолд товчнууд хэт өргөн болж эвгүй. */
  const splitDate = (raw: string) => {
    const [date, ...rest] = (raw || '').split('/');
    return { date: date.trim(), theme: rest.join('/').trim() };
  };

  return (
    <section id="program" className={`relative bg-gray-900 ${hideHeading ? 'py-16' : 'py-24'} flex items-center justify-center overflow-hidden min-h-[500px]`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/program-bg.jpg"
          alt="Exhibition Stage"
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1e3a63]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
        {!hideHeading && (
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-xl">
              <CalendarDays className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 drop-shadow-lg">
              {t('prog_title')}
            </h2>
            <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full mb-8" />
          </div>
        )}

        {program.length > 0 ? (
          <div className="w-full">
            {/* Days Tabs */}
            {/* Утсан дээр 2+1 болж эмх замбараагүй эгнэхээс сэргийлж
                өдрүүдийг тэнцүү өргөнтэй багана болгоно. */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-4 mb-10 sm:mb-12">
              {program.map((day, idx) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(idx)}
                  className={`px-2 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-all ${
                    activeDay === idx
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  <div className="text-[11px] sm:text-sm uppercase tracking-wider mb-1 opacity-80 tabular-nums">
                    {splitDate(day.date).date}
                  </div>
                  <div className="text-sm sm:text-xl leading-tight">{day.day}</div>
                </button>
              ))}
            </div>

            {/* Events List */}
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Тухайн өдрийн сэдэв */}
              {(() => {
                const day = program[activeDay];
                const theme = day ? splitDate(day.date).theme : '';
                if (!theme) return null;
                return (
                  <div className="text-center pb-2">
                    <h3 className="font-heading text-lg sm:text-2xl lg:text-3xl font-bold uppercase leading-snug">
                      {theme}
                    </h3>
                    <div className="w-16 h-1 bg-red-500 mx-auto rounded-full mt-4" />
                  </div>
                );
              })()}

              {program[activeDay]?.events.map((ev, idx) => (
                <EventCard key={idx} ev={ev} onOpen={setZoom} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-block bg-black/40 px-8 py-4 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
              <p className="text-xl md:text-2xl text-red-400 font-medium tracking-wide">
                {t('prog_soon')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Зурагт хуудсыг томоор харах */}
      {zoom && (
        <div
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          <button
            type="button"
            aria-label="Хаах"
            onClick={() => setZoom(null)}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25
                       text-white flex items-center justify-center"
            style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
          >
            <X size={22} />
          </button>
          <img
            src={zoom}
            alt=""
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </section>
  );
};
