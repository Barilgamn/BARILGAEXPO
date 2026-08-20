import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Мэдээг Монгол хэлнээс бусад хэл рүү орчуулах serverless функц.
// Зөвхөн текстийг орчуулж, HTML тэг болон зургийн эх сурвалжийг хэвээр үлдээнэ.

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  zh: 'Simplified Chinese (简体中文)',
  ru: 'Russian (русский)',
  ko: 'Korean (한국어)',
};

// Зураг нь data:base64 хэлбэрээр агуулагдах тул орчуулга руу илгээхээс өмнө
// түр placeholder-оор солиод, хариу ирсний дараа буцааж тавина.
const stripDataUris = (html: string) => {
  const uris: string[] = [];
  const stripped = html.replace(/(["'])(data:[^"']{200,})\1/g, (_m, q, uri) => {
    uris.push(uri);
    return `${q}__DATAURI_${uris.length - 1}__${q}`;
  });
  return { stripped, uris };
};

const restoreDataUris = (html: string, uris: string[]) =>
  html.replace(/__DATAURI_(\d+)__/g, (m, i) => uris[Number(i)] ?? m);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY тохируулаагүй байна.' });
      return;
    }

    const { title = '', description = '', content = '', langs } = (req.body || {}) as {
      title?: string; description?: string; content?: string; langs?: string[];
    };

    const targets = (Array.isArray(langs) && langs.length ? langs : ['en', 'zh', 'ru', 'ko'])
      .filter(l => l in LANG_NAMES);

    if (!title && !description && !content) {
      res.status(400).json({ error: 'Орчуулах текст алга байна.' });
      return;
    }

    const { stripped, uris } = stripDataUris(String(content));
    // Хэт урт HTML-ийг таслах (Gemini-ийн хязгаарт багтаах)
    const contentForModel = stripped.slice(0, 60000);

    const ai = new GoogleGenAI({ apiKey });
    const result: Record<string, { title: string; description: string; content: string }> = {};

    for (const lang of targets) {
      const prompt = [
        `Translate the following Mongolian news article into ${LANG_NAMES[lang]}.`,
        'Rules:',
        '- Translate ONLY the human-readable text. Keep every HTML tag, attribute, class and URL exactly as-is.',
        '- Keep placeholders like __DATAURI_0__ untouched.',
        '- Keep proper nouns such as "BARILGA EXPO", "Buyant-Ukhaa", company names recognisable.',
        '- Return STRICT JSON only, no markdown fences, with exactly these keys: title, description, content.',
        '',
        JSON.stringify({ title, description, content: contentForModel }),
      ].join('\n');

      const genPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.2, responseMimeType: 'application/json' },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 55000),
      );

      const out: any = await Promise.race([genPromise, timeoutPromise]);
      const raw = String(out?.text || '').trim().replace(/^```(?:json)?|```$/g, '').trim();

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error(`${lang}: орчуулгын хариуг уншиж чадсангүй.`);
      }

      result[lang] = {
        title: String(parsed.title || title),
        description: String(parsed.description || description),
        content: restoreDataUris(String(parsed.content || contentForModel), uris),
      };
    }

    res.status(200).json({ translations: result });
  } catch (err: any) {
    console.error('translate api error', err);
    res.status(500).json({ error: err?.message || 'Орчуулга хийхэд алдаа гарлаа.' });
  }
}
