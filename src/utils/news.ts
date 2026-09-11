import type { NewsItem } from '../context/AdminContext';
import { newsTranslations, NewsTranslationLang } from '../data/newsTranslations';

/** Мэдээний бие даасан хуудасны зам (хуваалцахад ашиглана). */
export const newsPath = (id: number | string) => `/news/${id}`;

/** Хуваалцах бүтэн холбоос — https://www.barilgaexpo.mn/news/123
 *  Үндсэн домэйн дээр үргэлж www хувилбарыг ашиглана (Facebook нь хаягаар нь
 *  кэш хийдэг тул хоёр өөр хаяг үүсгэхгүйн тулд). */
export const newsShareUrl = (id: number | string) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const canonical = /(^|\.)barilgaexpo\.mn$/i.test(
    typeof window !== 'undefined' ? window.location.hostname : '',
  )
    ? 'https://www.barilgaexpo.mn'
    : origin || 'https://www.barilgaexpo.mn';
  return `${canonical}${newsPath(id)}`;
};

/** HTML/markdown тэмдэглэгээг цэвэрлэж, хэрэгтэй уртаар нь таслана. */
export const stripAndTruncate = (text: string, max = 150) => {
  const stripped = String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8216;|&#8217;|&lsquo;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > max ? stripped.slice(0, max) + '…' : stripped;
};

/** Сонгосон хэл дээр орчуулга байвал title/description/content-ийг түүгээр сольж өгнө.
 *  Монгол хэл болон орчуулгагүй мэдээний хувьд эх хувилбараа буцаана. */
export const localizeNews = <T extends NewsItem>(news: T, lang: string): T => {
  if (lang === 'mn') return news;
  // Админаас үүсгэсэн орчуулга эхний ээлжинд, дараа нь бэлэн (static) орчуулга
  const translation =
    news.i18n?.[lang as NewsTranslationLang] ||
    newsTranslations[news.id as number]?.[lang as NewsTranslationLang];
  if (!translation) return news;
  return {
    ...news,
    title: translation.title,
    description: translation.description,
    content: translation.content || news.content,
  };
};

/** Мэдээг id-гаар нь олно (id нь тоо эсвэл текст байж болно). */
export const findNews = (items: NewsItem[], id?: string | number) =>
  items.find(n => String(n.id) === String(id));
