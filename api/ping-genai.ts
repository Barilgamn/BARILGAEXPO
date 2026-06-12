import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true, hasGenAI: typeof GoogleGenAI === 'function' });
}
