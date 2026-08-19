import React, { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { Reel } from '../context/AdminContext';

/**
 * Facebook reel-ийг албан ёсны video plugin-аар тусгана.
 * Reel-ийн холбоосыг шууд iframe-д тавьж болохгүй тул plugin руу дамжуулна.
 */
const embedSrc = (url: string) =>
  `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.trim())}` +
  '&show_text=false&autoplay=true&allowfullscreen=true';

export const ReelsSection: React.FC = () => {
  const { data } = useAdmin();
  const reels = (data.reels ?? []).filter(r => r.url.trim());
  const [active, setActive] = useState<Reel | null>(null);

  /* Модал нээлттэй үед хуудас гүйлгэгдэхгүй, Escape-ээр хаана */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [active]);

  if (reels.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className="flex gap-5 overflow-x-auto pb-1
                     [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {reels.map(reel => (
            <button
              key={reel.id}
              onClick={() => setActive(reel)}
              className="shrink-0 flex flex-col items-center gap-2 w-[76px] group"
              title={reel.title}
            >
              {/* Story маягийн градиент цагираг */}
              <span className="p-[3px] rounded-full bg-gradient-to-tr from-red-500 via-red-400 to-blue-600 group-hover:scale-105 transition-transform">
                <span className="block p-[2px] bg-white rounded-full">
                  <span className="relative block w-[62px] h-[62px] rounded-full overflow-hidden bg-blue-950">
                    {reel.cover ? (
                      <img src={reel.cover} alt={reel.title} loading="lazy"
                        className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                      </span>
                    )}
                  </span>
                </span>
              </span>
              <span className="text-[11px] text-gray-600 font-semibold leading-tight text-center line-clamp-2 w-full">
                {reel.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Томруулж үзэх модал */}
      {active && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            aria-label="Хаах"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            <X size={22} />
          </button>

          <div className="w-full max-w-[420px]" onClick={e => e.stopPropagation()}>
            {/* Reel босоо 9:16 харьцаатай */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl" style={{ aspectRatio: '9 / 16' }}>
              <iframe
                key={active.id}
                src={embedSrc(active.url)}
                title={active.title}
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
                scrolling="no"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <p className="text-white/90 text-sm font-semibold text-center mt-3">{active.title}</p>
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-white/60 hover:text-white text-xs mt-1 underline"
            >
              Facebook дээр үзэх
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
