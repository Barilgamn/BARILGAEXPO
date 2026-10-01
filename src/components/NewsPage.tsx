import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Newspaper, CalendarDays } from 'lucide-react';
import { NewsSection } from './NewsSection';
import { useTranslation } from '../i18n';
import { useAdmin } from '../context/AdminContext';

/** Мэдээний бие даасан хуудас (/news).
 *
 *  Агуулга нь нүүр хуудасны мэдээний хэсэгтэй яг нэг эх сурвалжтай
 *  (AdminContext-ийн data.news) тул админаас засварлахад хоёр газарт
 *  зэрэг шинэчлэгдэнэ. Энд нэмэлтээр дээр нь толгой хэсэг байрлана. */
export const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useAdmin();

  const news = data.news || [];
  const latest = news[0]?.date;

  return (
    <div className="min-h-screen surface">
      {/* Толгой хэсэг — nav-ын өндрөөс доош эхэлнэ */}
      <header className="relative overflow-hidden surface-dark border-b hairline-dark pt-28 sm:pt-32 pb-14">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold mb-6 transition-colors"
          >
            <ChevronLeft size={16} /> {t('pgp_back')}
          </Link>

          <div className="flex items-start gap-5">
            <div className="w-16 h-16 shrink-0 bg-white/5 rounded-2xl hidden sm:flex items-center justify-center border border-white/10">
              <Newspaper className="w-8 h-8 text-red-400" />
            </div>
            <div className="min-w-0">
              <h1 className="display text-4xl sm:text-5xl lg:text-6xl">
                {t('news_title')}
              </h1>
              <p className="text-white/70 mt-2 text-sm sm:text-base">{t('news_pre')}</p>
            </div>
          </div>

          {/* Товч мэдээлэл */}
          {news.length > 0 && (
            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-8 text-sm">
              <span className="text-white/80">
                <b className="text-white text-lg font-heading">{news.length}</b> {t('news_count')}
              </span>
              {latest && (
                <span className="flex items-center gap-2 text-white/80">
                  <CalendarDays size={16} className="text-red-400 shrink-0" /> {t('news_last')}: {latest}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <NewsSection hideHeading />
    </div>
  );
};
