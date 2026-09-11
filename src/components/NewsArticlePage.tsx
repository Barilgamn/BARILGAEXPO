import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useTranslation } from '../i18n';
import { NewsArticleBody } from './NewsArticleBody';
import { findNews, localizeNews, newsPath, stripAndTruncate } from '../utils/news';

/** Мэдээний бие даасан хуудас (/news/:id).
 *
 *  Энэ хуудсыг Facebook зэрэг сүлжээнд хуваалцахад api/news.ts сервер
 *  функц тухайн мэдээний гарчиг, тайлбар, нүүр зургийг og мета болгож
 *  өгдөг тул урьдчилсан харагдацад зөв зураг гарч ирнэ. */
export const NewsArticlePage: React.FC = () => {
  const { id } = useParams();
  const { data } = useAdmin();
  const { t, lang } = useTranslation();
  const news = findNews(data.news || [], id);

  // Supabase-аас өгөгдөл ачаалагдах хүртэл "олдсонгүй" гэж яаран хэлэхгүй
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Хөтчийн таб болон хуваалцахад (SPA доторх шилжилтэд) гарчиг таарч байхаар
  useEffect(() => {
    if (!news) return;
    const localized = localizeNews(news, lang);
    const prev = document.title;
    document.title = `${localized.title} | BARILGA EXPO`;
    return () => { document.title = prev; };
  }, [news, lang]);

  const others = (data.news || []).filter(n => String(n.id) !== String(id)).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative overflow-hidden bg-blue-950 pt-28 sm:pt-32 pb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900/60 to-gray-900" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold transition-colors"
          >
            <ChevronLeft size={16} /> {t('news_title')}
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-20">
        <article className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {news ? (
            <NewsArticleBody news={news} />
          ) : waited ? (
            <div className="p-10 sm:p-16 text-center">
              <p className="text-lg font-semibold text-gray-900">{t('news_notfound')}</p>
              <Link
                to="/news"
                className="inline-flex items-center gap-1.5 mt-4 text-red-600 font-semibold hover:text-red-700"
              >
                <ChevronLeft size={16} /> {t('news_title')}
              </Link>
            </div>
          ) : (
            <div className="p-10 sm:p-16 animate-pulse space-y-4">
              <div className="h-52 bg-gray-100 rounded-xl" />
              <div className="h-5 bg-gray-100 rounded w-1/3" />
              <div className="h-5 bg-gray-100 rounded w-2/3" />
            </div>
          )}
        </article>

        {others.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-xl font-bold text-blue-900 mb-5">{t('news_other')}</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {others.map(other => {
                const localized = localizeNews(other, lang);
                return (
                  <Link
                    key={other.id}
                    to={newsPath(other.id)}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-lg transition-all flex flex-col"
                  >
                    {other.image && (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={other.image}
                          alt={localized.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          style={{ objectPosition: other.imagePosition || '50% 50%' }}
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-center gap-1.5 text-red-600 mb-2 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5" /> {other.date}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        {stripAndTruncate(localized.title, 70)}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
