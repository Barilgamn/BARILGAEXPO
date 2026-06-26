import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAdmin } from '../context/AdminContext';
import { newsTranslations, NewsTranslationLang } from '../data/newsTranslations';
import ReactMarkdown from 'react-markdown';
import { ImageSlider } from './ImageSlider';

export const NewsSection: React.FC = () => {
  const { data } = useAdmin();
  const newsItems = data.news;
  const { t, lang } = useTranslation();
  const [selectedNews, setSelectedNews] = useState<typeof newsItems[0] | null>(null);

  // Сонгосон хэл дээр орчуулга байвал title/description-ийг түүгээр сольж харуулна.
  // Монгол хэл болон орчуулгагүй мэдээний хувьд эх хувилбараа харуулна.
  const stripAndTruncate = (text: string, max = 150) => {
    const stripped = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/&hellip;/g, '…')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
      .replace(/&#8216;|&#8217;|&lsquo;|&rsquo;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    return stripped.length > max ? stripped.slice(0, max) + '…' : stripped;
  };

  const getLocalizedNews = (news: typeof newsItems[0]) => {
    if (lang === 'mn') return news;
    const translation = newsTranslations[news.id]?.[lang as NewsTranslationLang];
    if (!translation) return news;
    return { ...news, title: translation.title, description: translation.description, content: translation.content || news.content };
  };

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
            <div
              key={news.id}
              onClick={() => setSelectedNews(news)}
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
            </div>
            );
          })}
        </div>

      </div>

      {/* Detail Modal */}
      {selectedNews && (() => {
        const localizedSelected = getLocalizedNews(selectedNews);
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
              {/* Мэдээний зураг — банер (гарчигтай давхцахгүй) */}
              {selectedNews.image && (
                <div className="w-full h-56 sm:h-72 md:h-80 bg-gray-100">
                  <img
                    src={selectedNews.image}
                    alt={localizedSelected.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 md:p-10 max-w-3xl mx-auto">
                {/* Огноо + гарчиг — зургийн доор тусдаа */}
                <div className="flex items-center gap-2 text-red-600 mb-3 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  {selectedNews.date}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 leading-tight break-words">
                  {localizedSelected.title}
                </h2>

                <div className="mt-6 border-t border-gray-100 pt-6 text-gray-700 overflow-x-hidden leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-blue-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-blue-900 [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-4 [&_a]:text-red-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-red-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-xl [&_img]:my-4 [&_strong]:font-bold">
                  {(() => {
                    // Хуучин агуулгад жирийн зайны оронд non-breaking space (U+00A0/&nbsp;)
                    // ашиглагдсанаас мөр таслахгүй байсныг хэвийн зай болгож засна.
                    const normalized = (localizedSelected.content || '')
                      .replace(/[\u00a0\u2007\u202f]/g, ' ')
                      .replace(/&nbsp;/gi, ' ');
                    const isHtml = /(^|\s)<[a-z!/]/i.test(normalized.trim().slice(0, 40));
                    return isHtml
                      ? <div dangerouslySetInnerHTML={{ __html: normalized }} />
                      : <ReactMarkdown>{normalized}</ReactMarkdown>;
                  })()}
                </div>

                {selectedNews.images && selectedNews.images.length > 0 && (
                  <div className="mt-8">
                    <ImageSlider images={selectedNews.images} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </section>
  );
};
