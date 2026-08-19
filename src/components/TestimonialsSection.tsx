import React, { useEffect, useRef, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAdmin } from '../context/AdminContext';
import { defaultTestimonials } from '../data/testimonials';



/** Нэрний эхний үсгээр аватар үүсгэнэ (О. Нарангэрэл -> Н) */
const initial = (name: string) => {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[parts.length - 1] || name).charAt(0).toUpperCase();
};

export const TestimonialsSection: React.FC = () => {
  const { t, lang } = useTranslation();
  const { data } = useAdmin();

  /* Админ дээрх жагсаалт; хоосон бол анхны жагсаалтыг ашиглана.
     Хэл монгол биш бол тухайн сэтгэгдлийн орчуулгыг, байхгүй бол эхийг харуулна. */
  const source = data.testimonials?.length ? data.testimonials : defaultTestimonials;
  const items = source.map(x => (lang === 'mn' ? x : { ...x, ...(x.i18n?.[lang] ?? {}) }));
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = () => {
    const el = trackRef.current;
    if (!el) return;
    /* Зурвасын хажуугийн дотоод зайнаас болж эхлэлийн байрлал 0 биш байдаг
       тул тэвчээртэй харьцуулна. */
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 40);
    setAtEnd(el.scrollLeft >= max - 8);
  };

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  /** Нэг картын өргөнөөр гүйлгэнэ */
  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('article');
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const navBtn = 'w-11 h-11 rounded-full border flex items-center justify-center transition-colors';

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h3 className="text-red-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-red-500"></span>
              BARILGA EXPO
            </h3>
            <h2 className="font-heading text-3xl md:text-5xl font-black text-blue-950 tracking-tight">
              {t('testi_title')}
            </h2>
          </div>

          {/* Гүйлгэх товч — зөвхөн дэлгэц том үед */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scrollBy(-1)}
              disabled={atStart}
              aria-label={t('testi_prev')}
              className={`${navBtn} ${atStart ? 'border-gray-200 text-gray-300' : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              aria-label={t('testi_next')}
              className={`${navBtn} ${atEnd ? 'border-gray-200 text-gray-300' : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Хажуу тийш гүйлгэх зурвас */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4
                   px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto
                   [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <article
            key={i}
            className="snap-start shrink-0 w-[85vw] sm:w-[420px] bg-white rounded-2xl border border-gray-100
                       shadow-sm p-7 flex flex-col"
          >
            <Quote className="w-8 h-8 text-red-500/70 mb-4 shrink-0" />
            <p className="text-gray-600 leading-relaxed text-[15px] flex-1">{item.text}</p>
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
              <div className="w-11 h-11 rounded-full bg-blue-900 text-white flex items-center justify-center font-black shrink-0">
                {initial(item.name)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-blue-950 leading-tight">{item.name}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{item.role}</p>
                <p className="text-xs font-semibold text-red-600 leading-snug">{item.org}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
