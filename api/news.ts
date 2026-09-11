import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseCardUrl } from './og-image';

/**
 * /news/:id хуудсыг сервер талаас үйлчилнэ (vercel.json дахь rewrite).
 *
 * Сайт нь React SPA тул Facebook, Messenger, Twitter зэргийн crawler
 * JavaScript ажиллуулдаггүйгээс og мета уншиж чаддаггүй. Иймд энд үндсэн
 * index.html дээр тухайн мэдээний гарчиг, тайлбар, НҮҮР ЗУРГИЙГ og мета
 * болгож оруулаад буцаана. Хэрэглэгчид ижил HTML очих тул SPA хэвийн
 * ажиллаж, /news/:id хуудсыг үзүүлнэ.
 */
const SITE_ORIGIN = 'https://www.barilgaexpo.mn';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/social_share.png`;

const escapeHtml = (s: string) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** HTML/markdown тэмдэглэгээг цэвэрлэж, мета тайлбарт тохирох уртаар таслана. */
const plainText = (s: string, max = 200) => {
  const stripped = String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`]/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;|[\u00a0\u2007\u202f]/g, ' ')
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8216;|&#8217;|&lsquo;|&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > max ? stripped.slice(0, max - 1).trimEnd() + '…' : stripped;
};

/** "2026.09.08" маягийн огноог ISO хэлбэрт хөрвүүлнэ. */
const isoDate = (date: string) => {
  const m = String(date || '').match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (!m) return '';
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
};

const fetchNewsItem = async (id: string) => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const resp = await fetch(`${url}/rest/v1/site_data?id=eq.config&select=data`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!resp.ok) return null;

  const rows = (await resp.json()) as { data?: { news?: any[] } }[];
  const news = rows?.[0]?.data?.news;
  if (!Array.isArray(news)) return null;
  return news.find(n => String(n?.id) === id) || null;
};

/** Мэдээний нүүр зургийг сошиалд тохирох (JPEG) холбоос болгоно. */
const cardImage = (image: string) => {
  if (!image || !/^https:\/\//i.test(image)) return { url: DEFAULT_IMAGE, jpeg: false };
  if (supabaseCardUrl(image)) {
    // og-image функц WebP-г JPEG болгож өгдөг тул дамжуулж илгээнэ
    return { url: `${SITE_ORIGIN}/api/og-image?url=${encodeURIComponent(image)}`, jpeg: true };
  }
  return { url: image, jpeg: false };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'www.barilgaexpo.mn').split(',')[0];
  const origin = `${proto}://${host}`;

  let shell: string;
  try {
    // Vercel дээр /index.html нь статик файл тул rewrite-д баригдахгүй шууд ирнэ
    const resp = await fetch(`${origin}/index.html`);
    if (!resp.ok) throw new Error(`shell ${resp.status}`);
    shell = await resp.text();
  } catch {
    // Гол хуудсыг авч чадаагүй тохиолдолд хэрэглэгчийг нүүр рүү аваачина
    res.redirect(302, '/#news');
    return;
  }

  let item: any = null;
  try {
    item = await fetchNewsItem(id);
  } catch {
    // Мэдээг олж чадаагүй ч хуудас нээгдэх ёстой — SPA өөрөө дахин уншина
  }

  const canonical = `${SITE_ORIGIN}/news/${encodeURIComponent(id)}`;
  const title = item ? `${plainText(item.title, 90)} | BARILGA EXPO` : 'Мэдээ | BARILGA EXPO';
  const description = item
    ? plainText(item.description || item.content, 200)
    : 'BARILGA EXPO олон улсын барилгын үзэсгэлэн яармагийн мэдээ.';
  const image = cardImage(item?.image || '');
  const published = isoDate(item?.date || '');

  const meta = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="Barilga Expo" />`,
    `<meta property="og:locale" content="mn_MN" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image.url)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(image.url)}" />`,
    ...(image.jpeg ? [`<meta property="og:image:type" content="image/jpeg" />`] : []),
    `<meta property="og:image:alt" content="${escapeHtml(plainText(item?.title || 'BARILGA EXPO', 90))}" />`,
    ...(published ? [`<meta property="article:published_time" content="${published}" />`] : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image.url)}" />`,
    ...(item
      ? [
          `<script type="application/ld+json">${JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: plainText(item.title, 110),
            description,
            image: [image.url],
            datePublished: published || undefined,
            mainEntityOfPage: canonical,
            publisher: {
              '@type': 'Organization',
              name: 'Barilga Expo',
              logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/favicon.png` },
            },
          }).replace(/</g, '\\u003c')}</script>`,
        ]
      : []),
  ].join('\n    ');

  const html = shell
    // Нүүр хуудсанд зориулсан мета тагуудыг хасч, мэдээнийхээр солино
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta[^>]+(?:name|property)=["'](?:description|og:[^"']*|twitter:[^"']*)["'][^>]*>\s*/gi, '')
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace('</head>', `    ${meta}\n  </head>`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Админ мэдээ засахад 5 минутын дотор шинэчлэгдэнэ
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  res.status(item ? 200 : 404).send(html);
}
