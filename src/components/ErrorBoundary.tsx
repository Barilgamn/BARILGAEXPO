import React from 'react';
import { LANG_KEY } from '../i18n';

/** Энэ бүрэлдэхүүн нь LanguageProvider-ээс ГАДНА байрладаг (тэр өөрөө унасан ч
 *  ажиллах ёстой) тул t()-г ашиглаж чадахгүй. Хадгалсан хэлийг шууд уншина. */
const MSG: Record<string, { title: string; text: string; btn: string }> = {
  mn: { title: 'Хуудас ачаалахад алдаа гарлаа', text: 'Сайт шинэчлэгдсэн байж магадгүй. Доорх товчийг дарж дахин оролдоно уу.', btn: 'Дахин ачаалах' },
  en: { title: 'Something went wrong', text: 'The site may have been updated. Please try again using the button below.', btn: 'Reload' },
  zh: { title: '页面加载出错', text: '网站可能已更新，请点击下方按钮重试。', btn: '重新加载' },
  ru: { title: 'Не удалось загрузить страницу', text: 'Возможно, сайт был обновлён. Нажмите кнопку ниже, чтобы повторить.', btn: 'Обновить' },
  ko: { title: '페이지를 불러오지 못했습니다', text: '사이트가 업데이트되었을 수 있습니다. 아래 버튼으로 다시 시도해 주세요.', btn: '새로고침' },
};

const msg = () => {
  try { return MSG[localStorage.getItem(LANG_KEY) || 'mn'] || MSG.mn; } catch { return MSG.mn; }
};

/**
 * Аппыг бүхэлд нь цагаан дэлгэц болохоос хамгаална.
 *
 * Гол тохиолдол: шинэ хувилбар deploy хийхэд JS файлуудын нэр өөрчлөгддөг.
 * Хуучин хуудсыг нээлттэй үлдээсэн хэрэглэгч холбоос дарахад аль хэдийн
 * байхгүй болсон файлыг хүсдэг. vercel.json-ы rewrite улмаас түүний оронд
 * index.html буцдаг тул модуль ачаалж чадалгүй React бүхэлдээ унаж,
 * хэрэглэгч цагаан дэлгэц хардаг. Ийм үед нэг удаа автоматаар шинэчилвэл
 * шинэ файлуудыг авч, юу ч болоогүй мэт үргэлжилнэ.
 */

const RELOAD_FLAG = 'barilga_chunk_reload';

const isChunkLoadError = (err: unknown) => {
  const msg = String((err as any)?.message || err || '');
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Unexpected token '<'/.test(msg) ||          // JS хүсэхэд HTML ирсэн
    /ChunkLoadError/i.test(msg)
  );
};

interface State { failed: boolean }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('App error', error);

    if (isChunkLoadError(error)) {
      // Дахин ачаалах гогцоонд орохоос сэргийлж нэг л удаа оролдоно.
      let already = false;
      try { already = sessionStorage.getItem(RELOAD_FLAG) === '1'; } catch {}
      if (!already) {
        try { sessionStorage.setItem(RELOAD_FLAG, '1'); } catch {}
        window.location.reload();
      }
    }
  }

  componentDidMount() {
    // Амжилттай ачаалсан тул тэмдэглэгээг цэвэрлэнэ.
    try { sessionStorage.removeItem(RELOAD_FLAG); } catch {}
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h1 className="font-heading text-xl font-black text-blue-950 mb-3">{msg().title}</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{msg().text}</p>
          <button
            onClick={() => {
              try { sessionStorage.removeItem(RELOAD_FLAG); } catch {}
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            {msg().btn}
          </button>
        </div>
      </div>
    );
  }
}
