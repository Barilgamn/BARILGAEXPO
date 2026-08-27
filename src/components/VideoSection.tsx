import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useTranslation } from '../i18n';

const VIDEO_ID = 'z5FJoyiSUjQ';

/** Үзэсгэлэнгийн танилцуулга бичлэг.
 *  Хуудас ачаалахад YouTube-ийн скрипт татахгүйн тулд эхлээд зөвхөн нүүр зургийг
 *  харуулж, дарсан үед л жинхэнэ тоглуулагчийг ачаална (facade). */
export const VideoSection: React.FC = () => {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);

  return (
    <section id="video" className="bg-white pt-12 sm:pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl sm:text-3xl md:text-4xl font-black text-blue-950 text-center mb-6 sm:mb-10">
          {t('video_title')}
        </h2>

        <div className="relative w-full rounded-2xl overflow-hidden bg-blue-950 shadow-xl ring-1 ring-black/5"
             style={{ aspectRatio: '16 / 9' }}>
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
              title={t('video_title')}
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={t('video_play')}
              className="group absolute inset-0 w-full h-full cursor-pointer"
            >
              <img
                src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
                // maxresdefault зарим бичлэгт байхгүй байдаг тул нөөц хувилбар руу шилжинэ.
                onError={e => { (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`; }}
              />
              <span className="absolute inset-0 bg-blue-950/25 group-hover:bg-blue-950/10 transition-colors" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 group-hover:bg-red-500
                                 flex items-center justify-center shadow-2xl
                                 transition-transform duration-200 group-hover:scale-110">
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white fill-white ml-1" />
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
