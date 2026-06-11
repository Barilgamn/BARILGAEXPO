import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// BARILGA EXPO вэбсайтын зочдод зориулсан туслах чатбот.
// Энэ нь Vercel serverless function бөгөөд Gemini API-г сервер талд
// дуудаж, түлхүүр (API key)-г клиент рүү ил гаргахгүй.

const SYSTEM_INFO = `
Чи бол "BARILGA EXPO" - Олон улсын барилгын үзэсгэлэн яармагийн вэбсайтын
зочдод туслах AI туслах. Зөвхөн Монгол хэлээр, эелдэг, товч бөгөөд тодорхой
хариулт өгнө (хэрэглэгч өөр хэлээр асуувал тухайн хэлээр хариул).

Тогтмол баримт мэдээлэл:
- Арга хэмжээний нэр: 40 дэх удаагийн "BARILGA EXPO" Олон улсын барилгын үзэсгэлэн яармаг.
- Огноо: 2026 оны 9 дүгээр сарын 11-13-ны өдрүүд.
- Байршил: "Буянт-Ухаа" спортын ордон, Улаанбаатар хот.
- Зохион байгуулагч: Хот байгуулалт, барилга, орон сууцжуулалтын яам (ерөнхий зохион байгуулагч),
  хамтран зохион байгуулагчид: Нийслэлийн Засаг даргын Тамгын газар, Барилгын хөгжлийн төв.
- Үзэсгэлэнгийн үндсэн чиглэлүүд: Шинэ орон сууц & үл хөдлөх хөрөнгө, Барилгын материал & дэвшилтэт
  технологи, Гадаа талбай (тоног төхөөрөмж, машин механизм гэх мэт).
- Холбоо барих:
  - Хаяг: Barilga.mn оффис, Манлайбаатар Дамдинсүрэн гудамж, Улаанбаатар хот, 13373.
  - Утас: +976 7711 3333, 9990 7816 (Англи хэлээр: 9990 7814).
  - И-мэйл: expo@barilga.mn
  - Ажиллах цаг: Даваа-Баасан, 8:30-17:30.
- Талбай захиалга: Сайтын "Талбай захиалах" товч/хуудсаар дамжуулан компанийн мэдээлэл, хүссэн
  талбайн хэмжээ, нэмэлт үйлчилгээ (стенд хийц, тайзны хөтөлбөр, VIP өрөө гэх мэт)-ээ зааж
  захиалгын хүсэлт илгээж болно. Хүсэлтийг хүлээн авмагц багийнхан холбогдож, гэрээ, нэхэмжлэх
  бэлтгэж өгнө.
- Сайтад: Нүүр, Мэдээ, Зургийн цомог, Хөтөч (удирдамж), Хөтөлбөр, Холбоо барих хэсгүүд байдаг.

Хэрэв чамд тодорхой хариулах мэдээлэл байхгүй бол яаралтай тусламж эсвэл
дэлгэрэнгүй мэдээллийн хувьд expo@barilga.mn эсвэл +976 7711 3333 / 9990 7816
дугаараар холбогдохыг санал болго. Хариулт болхи биш, найрсаг, 1-4 өгүүлбэрт багтаасан
байх.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages } = req.body as {
      messages: { role: 'user' | 'model'; text: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages талбар шаардлагатай' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'AI чат тохиргоо хийгдээгүй байна (GEMINI_API_KEY дутуу).' });
      return;
    }

    // Хөтөлбөрийн мэдээллийг Supabase-аас татаж нэмэлт контекст болгож өгнө
    let programInfo = '';
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase.from('site_data').select('data').eq('id', 'config').single();
        const program = (data?.data as any)?.program;
        if (Array.isArray(program) && program.length > 0) {
          programInfo = `\nХөтөлбөрийн мэдээлэл (JSON): ${JSON.stringify(program).slice(0, 4000)}`;
        }
      }
    } catch {
      // Хөтөлбөрийн мэдээлэл авч чадаагүй ч чат ажиллаж байх ёстой
    }

    const ai = new GoogleGenAI({ apiKey });

    const last = messages[messages.length - 1];
    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history,
      config: {
        systemInstruction: SYSTEM_INFO + programInfo,
        maxOutputTokens: 512,
        temperature: 0.4,
      },
    });

    const result = await chat.sendMessage({ message: last.text });
    const text = result.text || 'Уучлаарай, одоогоор хариулт өгөх боломжгүй байна.';

    res.status(200).json({ reply: text });
  } catch (err: any) {
    console.error('chat api error', err);
    res.status(500).json({ error: 'Серверийн алдаа гарлаа. Дахин оролдоно уу.' });
  }
}
