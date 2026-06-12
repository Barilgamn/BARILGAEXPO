import type { VercelRequest, VercelResponse } from '@vercel/node';
import { booths } from '../src/data/booths';
import { newsItems } from '../src/data/newsItems';
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true, booths: booths.length, news: newsItems.length });
}
