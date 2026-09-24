import React from 'react';
import { Trophy } from 'lucide-react';
import { useTranslation } from '../i18n';

/** 40 дэх удаагийн BARILGA EXPO-гийн шилдэг байгууллагууд.
 *  Ангиллын нэр орчуулагдана, байгууллага/брэндийн нэр нь өөрчлөгдөхгүй. */
const AWARDS: { key: string; winners: string[] }[] = [
  { key: 'win_cat_1', winners: ['Нью Прогресс Групп Вестернхолд ХХК – “Ховд Эко Цемент”'] },
  { key: 'win_cat_2', winners: ['Н Эй Би Трэйд ХХК – “HÖRMANN” брэнд'] },
  { key: 'win_cat_3', winners: ['Глобал Бридж Констракшн ХХК – “Global Mall”'] },
  { key: 'win_cat_4', winners: ['Эй Жи Жи Эс ХХК'] },
  { key: 'win_cat_5', winners: ['Энгүүн Технологи ХХК'] },
  { key: 'win_cat_5', winners: ['Глобал Браун Солюушн ХХК – IFE брэнд'] },
  { key: 'win_cat_6', winners: ['MMS LLC /MyMonSource LLC/'] },
  { key: 'win_cat_7', winners: ['Агуур Арт ХХК'] },
];

export const WinnersSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="winners" className="section-pad surface border-t hairline">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 eyebrow mb-4">
            <Trophy size={14} /> 40th BARILGA EXPO
          </div>
          <h2 className="display text-3xl sm:text-5xl md:text-6xl text-white">
            {t('win_title')}
          </h2>
          
        </div>

        <div>
          <div className="max-w-6xl mx-auto">
            {/* Сондгой тоотой болбол сүүлийн ганц картыг голлуулна */}
            <ul className="flex flex-wrap justify-center gap-5">
              {AWARDS.map(a => (
                <li key={a.key + a.winners[0]} className="w-full md:w-[calc(50%-0.625rem)] surface-card p-5 sm:p-6 flex items-center gap-5 sm:gap-6 hover:border-white/25 transition-colors">
                  {/* Шагналын цом — ил тод дэвсгэртэй */}
                  <img
                    src="/trophy.webp"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    width={320}
                    height={186}
                    className="w-24 sm:w-32 h-auto shrink-0 self-center drop-shadow-lg"
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-400 mb-1.5">
                      {t(a.key as any)}
                    </p>
                    {a.winners.map(w => (
                      <p key={w} className="font-bold text-white text-base sm:text-lg leading-snug">{w}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-white/50 text-sm sm:text-[15px] leading-relaxed mt-8 text-center max-w-3xl mx-auto">
              {t('win_note')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
