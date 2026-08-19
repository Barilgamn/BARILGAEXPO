import React, { useEffect, useRef, useState } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { Reel } from '../context/AdminContext';

/**
 * Facebook reel-ийг албан ёсны video plugin-аар тусгана. Картад мөн plugin-ийг
 * ашигладаг тул нүүр зургийг Facebook өөрөө өгнө — тусад нь зураг оруулах
 * шаардлагагүй. Картын iframe нь дарагдахгүй (pointer-events: none) тул
 * дарахад дэлгэц дүүрэн тоглуулагч нээгдэнэ.
 */
/** Хуучин өгөгдөлд үлдсэн Facebook холбоос мөн үү */
const isFacebook = (url: string) => /(^|\/\/)(www\.|web\.|m\.)?facebook\.com\//i.test(url.trim());

const embed = (url: string, opts: { autoplay: boolean; width: number; muted: boolean }) =>
  `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.trim())}` +
  `&show_text=false&width=${opts.width}&autoplay=${opts.autoplay}` +
  `&muted=${opts.muted ? 1 : 0}&allowfullscreen=true`;

const CARD_W = 212;   // картын өргөн (9:16 харьцаа)

export const ReelsSection: React.FC = () => {
  const { data } = useAdmin();
  const reels = (data.reels ?? []).filter(r => r.url.trim());
  /** Модалд харагдаж буй reel-ийн индекс (null бол хаалттай) */
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const active = activeIdx === null ? null : reels[activeIdx] ?? null;
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);

  const sync = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => { el.removeEventListener('scroll', sync); window.removeEventListener('resize', sync); };
  }, [reels.length]);

  /** Дараагийн / өмнөх reel рүү (жагсаалтын төгсгөлд эргэлдэнэ) */
  const step = (dir: 1 | -1) =>
    setActiveIdx(i => (i === null ? i : (i + dir + reels.length) % reels.length));

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIdx(null);
      else if (e.key === 'ArrowDown') step(1);
      else if (e.key === 'ArrowUp') step(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reels.length]);

  /* Босоо чиглэлд чирэхэд reel солино. Доош чирвэл дараагийнх. */
  const swipeRef = useRef<{ y: number; moved: boolean } | null>(null);
  const onSwipeDown: React.PointerEventHandler = (e) => {
    swipeRef.current = { y: e.clientY, moved: false };
  };
  const onSwipeMove: React.PointerEventHandler = (e) => {
    const sw = swipeRef.current;
    if (!sw || sw.moved) return;
    const dy = e.clientY - sw.y;
    if (Math.abs(dy) < 60) return;
    sw.moved = true;
    step(dy > 0 ? 1 : -1);
  };
  const onSwipeEnd = () => { swipeRef.current = null; };

  const scrollByCard = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * (CARD_W + 16) * 2, behavior: 'smooth' });
  };

  if (reels.length === 0) return null;

  const navBtn = 'w-9 h-9 rounded-full border flex items-center justify-center transition-colors';

  return (
    <section className="bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-sm tracking-wide uppercase">Reel бичлэгүүд</h2>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollByCard(-1)} disabled={atStart} aria-label="Өмнөх"
              className={`${navBtn} ${atStart ? 'border-white/15 text-white/25' : 'border-white/30 text-white hover:bg-white/15'}`}
            ><ChevronLeft size={18} /></button>
            <button
              onClick={() => scrollByCard(1)} disabled={atEnd} aria-label="Дараах"
              className={`${navBtn} ${atEnd ? 'border-white/15 text-white/25' : 'border-white/30 text-white hover:bg-white/15'}`}
            ><ChevronRight size={18} /></button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto pb-1 snap-x
                     [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {reels.map((reel, i) => (
            <button
              key={reel.id}
              onClick={() => setActiveIdx(i)}
              title={reel.title}
              className="snap-start shrink-0 relative rounded-xl overflow-hidden bg-black
                         ring-1 ring-white/10 hover:ring-white/40 transition-all group"
              style={{ width: CARD_W, aspectRatio: '9 / 16' }}
            >
              {/* Нүүр кадр: байршуулсан бичлэгээс, хуучин FB холбоос бол сервер талаас.
                  Ачаалалтыг браузерын өөрийн lazy / preload=metadata зохицуулна. */}
              {isFacebook(reel.url) ? (
                <img
                  src={`/api/fb-thumb?url=${encodeURIComponent(reel.url)}`}
                  alt={reel.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <video
                  src={`${reel.url}#t=0.1`}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}

              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 rounded-full bg-black/35 backdrop-blur-sm ring-1 ring-white/40
                                 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-white translate-x-[1px]" fill="currentColor" />
                </span>
              </span>
              {reel.title && (
                <span className="absolute left-2.5 right-2.5 bottom-2.5 text-white text-[11px] font-semibold
                                 leading-tight text-left line-clamp-2 drop-shadow">
                  {reel.title}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Томруулж үзэх */}
      {active && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveIdx(null)}
        >
          <button
            onClick={() => setActiveIdx(null)} aria-label="Хаах"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          ><X size={22} /></button>

          <div className="w-full max-w-[420px]" onClick={e => e.stopPropagation()}>
            <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl" style={{ aspectRatio: '9 / 16' }}>
              {isFacebook(active.url) ? (
                <iframe
                  key={active.id}
                  src={embed(active.url, { autoplay: true, width: 420, muted: false })}
                  title={active.title}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none' }}
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                /* Өөрийн тоглуулагч — картыг дарсан нь хэрэглэгчийн үйлдэл тул
                   дуутай автоматаар тоглоно. Дуусмагц дараагийн бичлэг рүү. */
                <video
                  key={active.id}
                  src={active.url}
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                  autoPlay
                  playsInline
                  controls
                  onEnded={() => reels.length > 1 && step(1)}
                />
              )}

              {/* Чирэх давхарга — доод 60px-ийг Facebook-ийн удирдлагад үлдээнэ */}
              <div
                className={`absolute inset-x-0 top-0 cursor-grab active:cursor-grabbing
                            ${isFacebook(active.url) ? 'bottom-[60px]' : 'bottom-[52px]'}`}
                style={{ touchAction: 'none' }}
                onPointerDown={onSwipeDown}
                onPointerMove={onSwipeMove}
                onPointerUp={onSwipeEnd}
                onPointerLeave={onSwipeEnd}
              />

              {reels.length > 1 && (
                <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold
                                 text-white/80 bg-black/40 px-2.5 py-1 rounded-full pointer-events-none">
                  {(activeIdx ?? 0) + 1} / {reels.length}
                </span>
              )}
            </div>

            {reels.length > 1 && (
              <p className="text-white/50 text-[11px] text-center mt-2">
                Доош чирж дараагийн бичлэг рүү шилжинэ
              </p>
            )}
            {active.title && <p className="text-white/90 text-sm font-semibold text-center mt-3">{active.title}</p>}
            <a href={active.url} target="_blank" rel="noopener noreferrer"
              className="block text-center text-white/60 hover:text-white text-xs mt-1 underline">
              Facebook дээр үзэх
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
