import React from 'react';
import { Trophy, Award } from 'lucide-react';
import { useTranslation } from '../i18n';

/** 40 дэх удаагийн BARILGA EXPO-гийн шилдэг байгууллагууд.
 *  Ангиллын нэр орчуулагдана, байгууллага/брэндийн нэр нь өөрчлөгдөхгүй. */
const AWARDS: { key: string; winners: string[] }[] = [
  { key: 'win_cat_1', winners: ['Нью Прогресс Групп Вестернхолд ХХК – “Ховд Эко Цемент”'] },
  { key: 'win_cat_2', winners: ['Н Эй Би Трэйд ХХК – “HÖRMANN” брэнд'] },
  { key: 'win_cat_3', winners: ['Глобал Бридж Констракшн ХХК – “Global Mall”'] },
  { key: 'win_cat_4', winners: ['Эй Жи Жи Эс ХХК'] },
  { key: 'win_cat_5', winners: ['Энгүүн Технологи ХХК', 'Глобал Браун Солюушн ХХК – IFE брэнд'] },
  { key: 'win_cat_6', winners: ['MMS LLC /MyMonSource LLC/'] },
  { key: 'win_cat_7', winners: ['Агуур Арт ХХК'] },
];

export const WinnersSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="winners" className="py-20 sm:py-24 bg-gradient-to-b from-white to-amber-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
            <Trophy size={14} /> 40th BARILGA EXPO
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-black text-blue-950">
            {t('win_title')}
          </h2>
          <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full mt-5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <figure className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 lg:sticky lg:top-28">
            <img
              src="/winners-2026.webp"
              alt={t('win_title')}
              loading="lazy"
              width={1600}
              height={1067}
              className="w-full h-auto block"
            />
          </figure>

          <div>
            <ul className="space-y-3">
              {AWARDS.map(a => (
                <li key={a.key} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex gap-4 shadow-sm">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                      {t(a.key as any)}
                    </p>
                    {a.winners.map(w => (
                      <p key={w} className="font-semibold text-gray-900 leading-snug">{w}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed mt-6">
              {t('win_note')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
