import React from 'react';
import { CalendarX2, X } from 'lucide-react';
import { useTranslation } from '../i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  /** "Тийм" гэвэл талбай захиалгын хүсэлтийн хуудас руу аваачна. */
  onConfirm: () => void;
}

/** Явж байгаа үзэсгэлэнгийн талбайн захиалга хаагдсаныг мэдэгдээд,
 *  дараагийн үзэсгэлэнд захиалах эсэхийг асуух цонх. Текстийг i18n-ээс
 *  авдаг тул үзэсгэлэнгийн дугаарыг тэндээс солино (bcl_* түлхүүрүүд). */
export const BoothClosedNotice: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    // Мэдээний popup (z-120)-аас дээр байрлана — товчнууд нь халхлагдахгүй
    <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          aria-label={t('btn_close')}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5">
            <CalendarX2 className="h-8 w-8" />
          </div>

          <h3 className="font-heading text-xl sm:text-2xl font-bold text-blue-900 mb-3">
            {t('bcl_title')}
          </h3>
          <p className="text-gray-600 leading-relaxed">{t('bcl_desc')}</p>
          <p className="text-gray-900 font-semibold mt-4 leading-relaxed">{t('bcl_ask')}</p>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-7">
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-colors order-1 sm:order-2"
            >
              {t('bcl_yes')}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors order-2 sm:order-1"
            >
              {t('bcl_no')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
