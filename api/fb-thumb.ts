import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Facebook reel/video-ийн нүүр зургийг сервер талаас авч өгнө.
 *
 * Facebook нь зөвхөн crawler-д зориулсан хуудсандаа og:image тавьдаг ба
 * браузераас шууд татахад CORS хаагддаг. Иймд энэ функц дундаас нь татаж,
 * зураг руу 302 чиглүүлнэ. Зургийн хаяг хугацаа дуусдаг тул урт хугацаагаар
 * кэшлэхгүй.
 */
const ALLOWED = /^https:\/\/(www\.|web\.|m\.)?facebook\.com\//i;

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#x2F;/g, '/').replace(/&quot;/g, '"').replace(/&#039;/g, "'");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = String(req.query.url || '').trim();

  if (!url || !ALLOWED.test(url)) {
    res.status(400).json({ error: 'Facebook-ийн зөв холбоос шаардлагатай' });
    return;
  }

  try {
    const page = await fetch(url, {
      headers: {
        // Facebook зөвхөн crawler-д og мета өгдөг
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!page.ok) {
      res.status(502).json({ error: `Facebook ${page.status}` });
      return;
    }

    const html = await page.text();
    const m =
      html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ||
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);

    if (!m) {
      res.status(404).json({ error: 'Нүүр зураг олдсонгүй' });
      return;
    }

    // Зургийн хаяг ~6 цагийн дараа хүчингүй болдог тул богино кэш
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600');
    res.redirect(302, decode(m[1]));
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Нүүр зураг авахад алдаа гарлаа' });
  }
}
