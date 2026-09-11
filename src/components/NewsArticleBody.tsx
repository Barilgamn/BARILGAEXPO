import React, { useState } from 'react';
import { Calendar, Check, Facebook, Link2, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ImageSlider } from './ImageSlider';
import { useTranslation } from '../i18n';
import type { NewsItem } from '../context/AdminContext';
import { localizeNews, newsShareUrl } from '../utils/news';

/** Мэдээг Facebook болон бусад сүлжээнд хуваалцах товчнууд.
 *  Хуваалцах холбоос нь /news/:id бөгөөд сервер талаас og:image мета
 *  тавьдаг тул тухайн мэдээний нүүр зураг урьдчилсан харагдацад гарна. */
export const NewsShareBar: React.FC<{ news: NewsItem }> = ({ news }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const url = newsShareUrl(news.id);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API боломжгүй үед (http, хуучин хөтөч) сонгуулах замаар
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    try {
      await navigator.share({ title: news.title, url });
    } catch { /* хэрэглэгч цуцалсан */ }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <span className="text-sm font-semibold text-gray-500 mr-1">{t('news_share')}:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1877F2] hover:bg-[#1461c9] text-white text-sm font-semibold transition-colors"
      >
        <Facebook className="w-4 h-4" /> Facebook
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
        {copied ? t('news_copied') : t('news_copy')}
      </button>
      {typeof navigator !== 'undefined' && !!(navigator as any).share && (
        <button
          type="button"
          onClick={shareNative}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors sm:hidden"
        >
          <Share2 className="w-4 h-4" /> {t('news_share')}
        </button>
      )}
    </div>
  );
};

/** Мэдээний агуулга — дэлгэрэнгүй цонх (нүүр хуудас) болон /news/:id
 *  хуудас хоёулаа үүнийг ашигладаг тул засвар нэг газарт хийгдэнэ. */
export const NewsArticleBody: React.FC<{ news: NewsItem }> = ({ news }) => {
  const { lang } = useTranslation();
  const localized = localizeNews(news, lang);

  // Хуучин агуулгад жирийн зайны оронд non-breaking space (U+00A0/&nbsp;)
  // ашиглагдсанаас мөр таслахгүй байсныг хэвийн зай болгож засна.
  const normalized = (localized.content || '')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/&nbsp;/gi, ' ');
  const isHtml = /(^|\s)<[a-z!/]/i.test(normalized.trim().slice(0, 40));

  return (
    <>
      {/* Мэдээний зураг — банер (гарчигтай давхцахгүй) */}
      {news.image && (
        <div className="w-full h-56 sm:h-72 md:h-80 bg-gray-100">
          <img
            src={news.image}
            alt={localized.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            style={{ objectPosition: news.imagePosition || '50% 50%' }}
          />
        </div>
      )}

      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        {/* Огноо + гарчиг — зургийн доор тусдаа */}
        <div className="flex items-center gap-2 text-red-600 mb-3 text-sm font-medium">
          <Calendar className="w-4 h-4" />
          {news.date}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 leading-tight break-words">
          {localized.title}
        </h2>

        <div className="mt-6 border-t border-gray-100 pt-6 text-gray-700 overflow-x-hidden leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-blue-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-blue-900 [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-4 [&_a]:text-red-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-red-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-xl [&_img]:my-4 [&_strong]:font-bold">
          {isHtml
            ? <div dangerouslySetInnerHTML={{ __html: normalized }} />
            : <ReactMarkdown>{normalized}</ReactMarkdown>}
        </div>

        {news.images && news.images.length > 0 && (
          <div className="mt-8">
            <ImageSlider images={news.images} />
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <NewsShareBar news={news} />
        </div>
      </div>
    </>
  );
};
