import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Clock, ChevronLeft } from 'lucide-react';
import { ProgramSection } from './ProgramSection';
import { useTranslation } from '../i18n';
import { useAdmin } from '../context/AdminContext';

/** Хөтөлбөрийн бие даасан хуудас (/program).
 *
 *  Агуулга нь нүүр хуудасны хөтөлбөрийн хэсэгтэй яг нэг эх сурвалжтай
 *  (AdminContext-ийн data.program) тул админаас засварлахад хоёр газарт
 *  зэрэг шинэчлэгдэнэ. Энд нэмэлтээр дээр нь толгой хэсэг байрлана. */
export const ProgramPage: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useAdmin();

  const days = data.program || [];
  const eventCount = days.reduce((n, d) => n + (d.events?.length || 0), 0);
  const venue = data.contact?.venueAddress;

  return (
    <div className="min-h-screen scene-dark">
      {/* Толгой хэсэг — nav-ын өндрөөс доош эхэлнэ */}
      <header className="relative overflow-hidden scene-dark border-b card-line pt-28 sm:pt-32 pb-14">
        
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 fg-2 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ChevronLeft size={16} /> {t('pgp_back')}
          </Link>

          <div className="flex items-start gap-5">
            <div className="w-16 h-16 shrink-0 bg-red-500/15 rounded-2xl hidden sm:flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-red-300" />
            </div>
            <div className="min-w-0">
              <h1 className="display text-4xl sm:text-5xl lg:text-6xl">
                {t('link_program')}
              </h1>
              <p className="fg-2 mt-2 text-sm sm:text-base">{t('prog_title')}</p>
            </div>
          </div>

          {/* Товч мэдээлэл */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-8 text-sm">
            {days.length > 0 && (
              <span className="fg-2">
                <b className="fg text-lg font-heading">{days.length}</b> {t('pgp_days')}
                <span className="fg-3 mx-2">·</span>
                <b className="fg text-lg font-heading">{eventCount}</b> {t('pgp_events')}
              </span>
            )}
            <span className="flex items-center gap-2 fg-2">
              <Clock size={16} className="text-red-300 shrink-0" /> {t('venue_hours')}
            </span>
            {venue && (
              <span className="flex items-center gap-2 fg-2">
                <MapPin size={16} className="text-red-300 shrink-0" /> {venue}
              </span>
            )}
          </div>
        </div>
      </header>

      <ProgramSection hideHeading />
    </div>
  );
};
