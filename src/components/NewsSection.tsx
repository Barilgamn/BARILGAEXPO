import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAdmin } from '../context/AdminContext';
import { NewsArticleBody } from './NewsArticleBody';
import { localizeNews, newsPath, stripAndTruncate } from '../utils/news';

export const NewsSection: React.FC = () => {
  const { data } = useAdmin();
  const newsItems = data.news;
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
    <section id="news" className="py-24 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-red-600 font-bold uppercase tracking-wider text-sm mb-3">{t('news_pre')}</h3>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-blue-900 mb-6">
            {t('news_title')}
          </h2>
          <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full"></div>
        </div>

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
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
            >
              <div className="relative h-36 sm:h-56 overflow-hidden">
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
              <div className="p-3 sm:p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-red-600 mb-3 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  {news.date}
                </div>
                <h3 className="text-sm sm:text-xl font-bold font-heading text-gray-900 mb-2 sm:mb-3 group-hover:text-red-600 transition-colors">
                  {localized.title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-6 flex-grow hidden sm:block">
                  {stripAndTruncate(localized.description)}
                </p>
                <div className="flex items-center text-red-600 font-semibold text-sm group-hover:text-red-700">
                  {t('news_more')} <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            );
          })}
        </div>

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
              className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
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
