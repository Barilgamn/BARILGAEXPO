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
    <div className="min-h-screen bg-gray-900">
      {/* Толгой хэсэг — nav-ын өндрөөс доош эхэлнэ */}
      <header className="relative overflow-hidden bg-blue-950 pt-28 sm:pt-32 pb-14">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900/60 to-gray-900" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-600/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold mb-6 transition-colors"
          >
            <ChevronLeft size={16} /> {t('pgp_back')}
          </Link>

          <div className="flex items-start gap-5">
            <div className="w-16 h-16 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl hidden sm:flex items-center justify-center border border-white/20">
              <CalendarDays className="w-8 h-8 text-red-400" />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight">
                {t('link_program')}
              </h1>
              <p className="text-white/70 mt-2 text-sm sm:text-base">{t('prog_title')}</p>
            </div>
          </div>

          {/* Товч мэдээлэл */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-8 text-sm">
            {days.length > 0 && (
              <span className="text-white/80">
                <b className="text-white text-lg font-heading">{days.length}</b> {t('pgp_days')}
                <span className="text-white/40 mx-2">·</span>
                <b className="text-white text-lg font-heading">{eventCount}</b> {t('pgp_events')}
              </span>
            )}
            <span className="flex items-center gap-2 text-white/80">
              <Clock size={16} className="text-red-400 shrink-0" /> {t('venue_hours')}
            </span>
            {venue && (
              <span className="flex items-center gap-2 text-white/80">
                <MapPin size={16} className="text-red-400 shrink-0" /> {venue}
              </span>
            )}
          </div>
        </div>
      </header>

      <ProgramSection hideHeading />
    </div>
  );
};
