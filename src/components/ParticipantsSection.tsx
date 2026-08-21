import React, { useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useTranslation } from '../i18n';
import { optimizeImage } from '../utils/image';

/** Fisher-Yates — жагсаалтыг жигд санамсаргүйгээр холино (эх массивыг өөрчлөхгүй). */
const shuffle = (arr: string[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Оролцогч байгууллагуудын лого — зөвхөн зураг, нэр болон холбоосгүй.
 *  Том дэлгэцэн дээр нэг эгнээнд 8 лого харагдана. Лого байхгүй бол хэсэг нуугдана.
 *  Аль нэг байгууллага байнга эхэнд гарахгүйн тулд хуудас ачаалах бүрт дарааллыг холино. */
export const ParticipantsSection: React.FC = () => {
  const { data } = useAdmin();
  const { t } = useTranslation();
  // Хуудас ачаалах бүрт нэг л удаа холино — хажуугийн state өөрчлөгдөхөд
  // (жишээ нь хэл солиход) лого үсрэхгүй.
  const source = (data.participants || []).filter(Boolean);
  const logos = useMemo(() => shuffle(source), [source.join('|')]);

  if (!logos.length) return null;

  return (
    <section id="participants" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl sm:text-3xl md:text-4xl font-black text-blue-950 text-center mb-8 sm:mb-12">
          {t('part_title')}
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {logos.map((logo, i) => (
            <div
              key={`${logo}-${i}`}
              className="aspect-[4/3] rounded-xl border border-gray-200 bg-white p-2 sm:p-3
                         flex items-center justify-center shadow-sm hover:shadow-md hover:border-blue-200
                         transition-all duration-200"
            >
              <img
                src={optimizeImage(logo, 240)}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
