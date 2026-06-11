import React, { useState } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAdmin } from '../context/AdminContext';

export const ProgramSection: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useAdmin();
  const [activeDay, setActiveDay] = useState(0);
  
  return (
    <section id="program" className="relative py-24 bg-gray-900 flex items-center justify-center overflow-hidden min-h-[500px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/program-bg.jpg"
          alt="Exhibition Stage"
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1e3a63]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-xl">
            <CalendarDays className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 drop-shadow-lg">
            {t('prog_title')}
          </h2>
          <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full mb-8" />
        </div>

        {data.program && data.program.length > 0 ? (
          <div className="w-full">
            {/* Days Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {data.program.map((day, idx) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(idx)}
                  className={`px-8 py-4 rounded-xl font-bold transition-all ${
                    activeDay === idx
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  <div className="text-sm uppercase tracking-wider mb-1 opacity-80">{day.date}</div>
                  <div className="text-xl">{day.day}</div>
                </button>
              ))}
            </div>

            {/* Events List */}
            <div className="max-w-4xl mx-auto space-y-6">
              {data.program[activeDay]?.events.map((ev, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-3 text-red-400 font-mono text-xl md:w-32 shrink-0">
                    <Clock size={20} />
                    {ev.time}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{ev.title}</h3>
                    {ev.desc && <p className="text-gray-300 mb-3 text-sm">{ev.desc}</p>}
                    {ev.loc && (
                      <div className="flex items-center gap-2 text-blue-300 text-sm">
                        <MapPin size={16} />
                        {ev.loc}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-block bg-black/40 px-8 py-4 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
              <p className="text-xl md:text-2xl text-red-400 font-medium tracking-wide">
                {t('prog_soon')}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
