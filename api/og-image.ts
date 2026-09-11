import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Мэдээний нүүр зургийг сошиал сүлжээнд тохирох хэлбэрээр дамжуулж өгнө.
 *
 * Шалтгаан: админаас байршуулсан зургууд WebP форматтай байдаг ба Facebook,
 * LinkedIn зэрэг сүлжээ WebP-г найдвартай уншдаггүй тул og:image хоосон
 * харагддаг. Энд Supabase-ийн зураг хөрвүүлэх (render/image) үйлчилгээгээр
 * ихдээ 1200px өргөнтэй JPEG болгон авч буцаана (харьцаа нь хэвээр).
 */
const ALLOWED_HOST = /(^|\.)(supabase\.co|barilgaexpo\.mn)$/i;

/** Сошиал картад хангалттай өргөн (үүнээс жижиг зургийг томруулахгүй) */
export const CARD_WIDTH = 1200;

/** Supabase Storage-ийн шууд холбоосыг хөрвүүлэлтийн холбоос болгоно. */
export const supabaseCardUrl = (src: string): string | null => {
  try {
    const u = new URL(src);
    if (!u.hostname.endsWith('supabase.co')) return null;
    if (!u.pathname.includes('/storage/v1/object/public/')) return null;
    u.pathname = u.pathname.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    u.searchParams.set('width', String(CARD_WIDTH));
    u.searchParams.set('resize', 'contain');
    u.searchParams.set('quality', '80');
    return u.toString();
  } catch {
    return null;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const src = String(req.query.url || '').trim();

  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    res.status(400).json({ error: 'Зөв холбоос шаардлагатай' });
    return;
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_HOST.test(parsed.hostname)) {
    res.status(400).json({ error: 'Зөвшөөрөгдөөгүй эх сурвалж' });
    return;
  }

  // WebP биш хувилбар авахын тулд Accept-д webp-г зориуд оруулахгүй
  const headers = { Accept: 'image/jpeg,image/png,image/gif;q=0.8,*/*;q=0.5' };
  const candidates = [supabaseCardUrl(src), src].filter(Boolean) as string[];

  for (const url of candidates) {
    try {
      const upstream = await fetch(url, { headers, redirect: 'follow' });
      if (!upstream.ok) continue;
      const type = upstream.headers.get('content-type') || 'image/jpeg';
      if (!type.startsWith('image/')) continue;
      const body = Buffer.from(await upstream.arrayBuffer());
      // Байршуулсан файлын нэр давтагддаггүй тул удаан хугацаагаар кэшлэнэ
      res.setHeader('Content-Type', type);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      res.status(200).send(body);
      return;
    } catch {
      // Дараагийн хувилбарыг оролдоно
    }
  }

  res.status(502).json({ error: 'Зураг авч чадсангүй' });
}
