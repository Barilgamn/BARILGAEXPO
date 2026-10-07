import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAdmin } from '../context/AdminContext';
import { NewsArticleBody } from './NewsArticleBody';
import { localizeNews, newsPath, stripAndTruncate } from '../utils/news';

/** hideHeading — /news хуудсанд толгой хэсэг нь дээр нь тусад нь байдаг тул
 *  хэсгийн доторх гарчгийг давхардуулахгүй.
 *  limit — нүүр хуудсанд хамгийн сүүлийн хэдэн мэдээг харуулах. Тавьсан үед
 *  "Бүх мэдээг үзэх" товч гарч /news руу хөтөлнө. */
export const NewsSection: React.FC<{ hideHeading?: boolean; limit?: number }> = ({ hideHeading, limit }) => {
  const { data } = useAdmin();
  const allNews = data.news;
  // Шинэ мэдээ жагсаалтын эхэнд нэмэгддэг тул эхнийхийг нь авна.
  const newsItems = limit ? allNews.slice(0, limit) : allNews;
  const hasMore = !!limit && allNews.length > limit;
  const { t, lang } = useTranslation();
  const [selectedNews, setSelectedNews] = useState<typeof newsItems[0] | null>(null);

  // Сонгосон хэл дээр орчуулга байвал title/description-ийг түүгээр сольж харуулна.
  // Монгол хэл болон орчуулгагүй мэдээний хувьд эх хувилбараа харуулна.
  const getLocalizedNews = (news: typeof newsItems[0]) => localizeNews(news, lang);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedNews) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedNews]);

  return (
    <section id="news" className={`relative scene-light ${hideHeading ? 'py-12 md:py-16' : 'section-pad'}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        {!hideHeading && (
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="display text-4xl sm:text-5xl lg:text-6xl fg">
              {t('news_title')}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {newsItems.map((news) => {
            const localized = getLocalizedNews(news);
            return (
            // Карт нь /news/:id холбоос — товшиход дэлгэрэнгүй цонх нээгдэнэ, харин
            // хуулж авах/шинэ цонхонд нээхэд хуваалцах боломжтой хаяг үлдэнэ.
            <Link
              key={news.id}
              to={newsPath(news.id)}
              onClick={e => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                setSelectedNews(news);
              }}
              className="group flex flex-col h-full cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl sm:rounded-3xl bg-[var(--card)]">
                {news.image && (
                  <img
                    src={news.image}
                    alt={localized.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ objectPosition: news.imagePosition || '50% 50%' }}
                  />
                )}
              </div>
              <div className="pt-3 sm:pt-5 flex flex-col flex-grow">
                <div className="fg-3 text-xs sm:text-sm mb-1.5 sm:mb-2 tabular-nums">{news.date}</div>
                <h3 className="font-heading font-medium text-base sm:text-xl leading-snug fg mb-2 group-hover:text-red-600 transition-colors">
                  {localized.title}
                </h3>
                <p className="fg-2 text-sm leading-relaxed hidden sm:block line-clamp-2">
                  {stripAndTruncate(localized.description)}
                </p>
              </div>
            </Link>
            );
          })}
        </div>

        {hasMore && (
          <div className="mt-10 md:mt-14 flex justify-center">
            <Link
              to="/news"
              onClick={() => window.scrollTo({ top: 0 })}
              className="btn btn-ink btn-lg"
            >
              {t('news_all')} ({allNews.length})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>

      {/* Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedNews(null)}
          ></div>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="overflow-y-auto w-full flex-grow relative pb-10">
              <NewsArticleBody news={selectedNews} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
