import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useTranslation } from '../i18n';
import { newsTranslations, NewsTranslationLang } from '../data/newsTranslations';

const seenKey = (id: number | string) => `news_popup_seen_${id}`;

const strip = (text: string, max = 110) => {
  const s = (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[   ]/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > max ? s.slice(0, max) + '…' : s;
};

/**
 * Сайтад орж ирсэн хэрэглэгчид хамгийн сүүлийн мэдээг жижиг popup болгон
 * нэг удаа харуулна (localStorage-аар тухайн мэдээний id-гаар тэмдэглэнэ).
 */
export const NewsPopup: React.FC = () => {
  const { data } = useAdmin();
  const { t, lang } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const latest = data.news && data.news.length > 0 ? data.news[0] : null;

  useEffect(() => {
    if (!latest) return;
    let shown = false;
    try { shown = !!localStorage.getItem(seenKey(latest.id)); } catch { /* ignore */ }
    if (shown) return;
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [latest?.id]);

  if (!latest || !visible) return null;

  const localized = (() => {
    if (lang === 'mn') return latest;
    const tr = newsTranslations[latest.id]?.[lang as NewsTranslationLang];
    return tr ? { ...latest, title: tr.title, description: tr.description } : latest;
  })();

  const dismiss = () => {
    try { localStorage.setItem(seenKey(latest.id), '1'); } catch { /* ignore */ }
    setClosing(true);
    setTimeout(() => setVisible(false), 250);
  };

  const openNews = () => {
    dismiss();
    const el = document.querySelector('#news');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className={`fixed bottom-5 left-5 z-[120] w-[300px] max-w-[calc(100vw-2.5rem)] transition-all duration-300 ${closing ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}
      style={{ animation: closing ? undefined : 'newsPopIn .4s ease-out' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative">
        <button
          onClick={dismiss}
          aria-label="Хаах"
          className="absolute top-2 right-2 z-10 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <button onClick={openNews} className="block w-full text-left">
          <div className="p-5 pr-9">
            <h4 className="font-heading font-bold text-gray-900 text-[15px] leading-snug mb-2">
              {localized.title}
            </h4>
            <p className="text-gray-500 text-xs leading-relaxed mb-3">
              {strip(localized.description, 200)}
            </p>
            <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs hover:text-red-700">
              {t('news_more')} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>
      </div>

      <style>{`
        @keyframes newsPopIn {
          0% { opacity: 0; transform: translateY(16px) scale(.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
