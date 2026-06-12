import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
// ⚠️ Vercel функц нь `../src/*` гадуурх TS файлыг bundle хийж чаддаггүй тул
// booth өгөгдлийг api/ дотор JSON хэлбэрээр өөрөө агуулна (self-contained).
import boothsJson from './booths.json';

type Booth = {
  id: string; section: string; area: number; pricePerM2: number;
  category: 'standard' | 'supporting' | 'sponsor' | 'b' | 'g'; status: string; company: string;
};
const booths = boothsJson as Booth[];

const CATEGORY_LABELS: Record<Booth['category'], string> = {
  standard: 'А павильон (энгийн)',
  supporting: 'А павильон (дунд)',
  sponsor: 'А павильон (онцгой)',
  b: 'B павильон',
  g: 'Гадаа талбай',
};
const getBoothPrice = (b: Booth) => (b.area > 0 ? b.area * b.pricePerM2 : b.pricePerM2);

// BARILGA EXPO вэбсайтын зочдод зориулсан туслах чатбот.
// Энэ нь Vercel serverless function бөгөөд Gemini API-г сервер талд
// дуудаж, түлхүүр (API key)-г клиент рүү ил гаргахгүй.

const SYSTEM_INFO = `
Чи бол "BARILGA EXPO" - Олон улсын барилгын үзэсгэлэн яармагийн вэбсайтын
зочдод туслах AI туслах. Зөвхөн Монгол хэлээр, эелдэг, дэлгэрэнгүй боловч
ойлгомжтой хариулт өгнө (хэрэглэгч өөр хэлээр асуувал тухайн хэлээр хариул).
Боломжтой бол доорх мэдээллээс ХОЛБООТОЙ бүх дэлгэрэнгүйг (тоо баримт, жагсаалт,
холбоо барих утас/имэйл гэх мэт) багтаан хариул - хэт хураангуйлж бүү алгасаарай.

== ЕРӨНХИЙ МЭДЭЭЛЭЛ ==
- Арга хэмжээний нэр: 40 дэх удаагийн "BARILGA EXPO" Олон улсын барилгын үзэсгэлэн яармаг.
- Огноо: 2026 оны 9 дүгээр сарын 11-13-ны өдрүүд.
- Байршил: "Буянт-Ухаа" спортын ордон, Улаанбаатар хот, Монгол улс.
- Энэ нь Монгол Улсад орчин цагийн барилгын салбар үүсэж хөгжсөний 100 жилийн ойн хүрээнд
  зохион байгуулагдаж буй томоохон арга хэмжээ.
- Зохион байгуулагч: Хот байгуулалт, барилга, орон сууцжуулалтын яам (ерөнхий зохион байгуулагч).
- Хамтран зохион байгуулагчид: Нийслэлийн Засаг даргын Тамгын газар, Барилгын хөгжлийн төв.

== ТОО БАРИМТ (өмнөх үзэсгэлэнгүүдийн дүн) ==
- 400+ оролцогч: дотоод, гадаадын тэргүүлэгч брэнд, аж ахуйн нэгжүүд.
- 30,000+ үзэгч: хөрөнгө оруулагчид, мэргэжилтнүүд, хэрэглэгчид.
- 100+ тэрбум төгрөгийн борлуулалт, гэрээ хэлцэл үзэсгэлэнгийн үеэр хийгддэг.
- 18 жилийн турш тогтмол, амжилттай зохион байгуулагдаж ирсэн (40 дэх удаа).

== ҮЗЭСГЭЛЭНГИЙН ЧИГЛЭЛҮҮД ==
1. Шинэ орон сууц, үл хөдлөх хөрөнгө: тансаг болон стандарт орон сууц, хаус дизайн,
   амины орон сууц, үл хөдлөх хөрөнгийн зуучлал, оффис/үйлчилгээний шийдлүүд.
2. Барилгын материал, дэвшилтэт технологи: барилгын материал, засал чимэглэл,
   цахилгаан эрчим хүч & холбоо дохиолол, сантехник & агааржуулалт, интерьер/экстерьер,
   ландшафт & зураг төслийн шийдлүүд.
3. Гадаа талбай: хүнд машин механизм, багаж тоног төхөөрөмж, угсралтын материал,
   зөөврийн сууц, амины орон сууцны жишиг загварууд.

== ТАЛБАЙ ЗАХИАЛГА (Оролцогч компаниудад) ==
- Сайтын "Талбай захиалах" товч/хуудас (booking хуудас)-аар дамжуулан онлайнаар
  захиалгын хүсэлт илгээнэ.
- Бөглөх мэдээлэл: байгууллагын нэр, улсын бүртгэлийн дугаар (РД), гэрчилгээний дугаар,
  хаяг, утас, и-мэйл, холбогдох ажилтан/албан тушаал, хүссэн талбайн хэмжээ/байршил
  (жишээ: 18м² (3x6), А блок), үзэсгэлэнд гаргах бүтээгдэхүүн/үйлчилгээний тайлбар.
- Нэмэлт үйлчилгээнүүд (сонголтоор): стенд хийц угсралт, тайзны хөтөлбөр/семинар,
  VIP өрөө.
- Хүсэлтийг хүлээн авмагц зохион байгуулах багийнхан холбогдож, тохирох талбай,
  гэрээ болон нэхэмжлэхийг бэлтгэн хүргэнэ.
- 1:1 / B2B уулзалт: оролцогч ба худалдан авагч талуудын хооронд бизнесийн хамтын
  ажиллагааг дэмжих зорилгоор урьдчилсан мэдээлэл, бүртгэлийн дагуу B2B уулзалт
  зохион байгуулдаг.

== ХОЛБОО БАРИХ ==
- Хаяг: Улаанбаатар 13373, Баянзүрх дүүрэг, 6-р хороо, "BARILGA.MN" оффис.
- Утас: +976 7711 3333, 9990 7816 (Англи хэлээр ярих бол: 9990 7814).
- И-мэйл: expo@barilga.mn
- Ажиллах цаг: Даваа-Баасан, 8:30-17:30.

== САЙТЫН БҮТЭЦ ==
- Нүүр (товч мэдээлэл, тоо баримт, countdown, талбай захиалах товч)
- Мэдээ (Арга хэмжээтэй холбоотой сүүлийн үеийн мэдээ)
- Зургийн цомог (Өмнөх үзэсгэлэнгийн зургууд)
- Хөтөч / Удирдамж (оролцогч, зочдод зориулсан дэлгэрэнгүй заавар)
- Хөтөлбөр (өдөр тус бүрийн арга хэмжээний цагийн хуваарь)
- Холбоо барих

Хэрэв чамд тодорхой хариулах мэдээлэл байхгүй бол яаралтай тусламж эсвэл
дэлгэрэнгүй мэдээллийн хувьд expo@barilga.mn эсвэл +976 7711 3333 / 9990 7816
дугаараар холбогдохыг санал болго. Хариултаа Markdown заголовок биш, энгийн текст
эсвэл шаардлагатай бол жагсаалт ("- " эсвэл "1.") хэлбэрээр бич.
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

    // Хөтөлбөр, мэдээ болон сул талбайн мэдээллийг Supabase-аас татаж нэмэлт контекст болгож өгнө
    let programInfo = '';
    let boothInfo = '';
    let newsInfo = '';
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

        // Мэдээний хэсэг — өмнөх үзэсгэлэн, шилдэг байгууллага, үр дүн г.м асуултад хариулахад ашиглана
        const news = (data?.data as any)?.news;
        if (Array.isArray(news) && news.length > 0) {
          const stripHtml = (s: string) =>
            String(s || '')
              .replace(/<[^>]*>/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/&hellip;/g, '…')
              .replace(/&#8220;|&#8221;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/\s+/g, ' ')
              .trim();
          const items = news.slice(0, 6).map((n: any) => {
            const body = stripHtml(n.content || n.description || '').slice(0, 900);
            return `• [${n.date || ''}] ${n.title || ''}${body ? ' — ' + body : ''}`;
          }).join('\n');
          newsInfo = `\n\n== САЙТЫН МЭДЭЭ / НИЙТЛЭЛҮҮД ==\nДоорх нь сайтын "Мэдээ" хэсгийн агуулга. Өмнөх үзэсгэлэнгийн үр дүн, шилдэг/онцлох оролцогч байгууллагууд, шагнал, ивээн тэтгэгчид, статистик, зохион байгуулалт зэрэг асуултад ЗӨВХӨН доорх мэдээнд тулгуурлан тодорхой, нэр дурдан хариул. Хэрэв тухайн асуултын хариу мэдээнд байхгүй бол таамаглахгүйгээр "Энэ талаар сайтын мэдээнд тодорхой мэдээлэл алга" гэж хэлээд холбоо барих мэдээллийг өг.\n${items}`.slice(0, 7000);
        }

        const { data: statusRows } = await supabase.from('booth_status').select('id, status, is_reserved');
        const ov: Record<string, string> = {};
        (statusRows || []).forEach((r: any) => {
          const st = r.status ?? (r.is_reserved ? 'occupied' : null);
          if (st) ov[r.id] = st;
        });
        const eff = (b: typeof booths[number]) => ov[b.id] ?? b.status;
        const available = booths.filter(b => eff(b) === 'available');
        const summary = available
          .slice(0, 70)
          .map(b => `${b.id} (${b.area}м², ${CATEGORY_LABELS[b.category]}, ${getBoothPrice(b).toLocaleString()}₮)`)
          .join('; ');
        boothInfo = `\n\nСул (захиалах боломжтой) талбайн жагсаалт (${available.length}/${booths.length}): ${summary || 'Одоогоор сул талбай алга'}.\nТэмдэглэл: "Нөөц" төлөвтэй талбайг зөвхөн зохион байгуулагч (админ) нөөцөөс гаргасны дараа л захиалах боломжтой тул хэрэглэгчид санал болгохгүй. Захиалагдсан талбайг бас санал болгохгүй.\nХэрэглэгч талбай захиалах талаар асуувал дээрх СУЛ байгаа талбайнуудаас түүний хэмжээ, төсөвт нь тохирохыг санал болгож, үнийг төгрөгөөр хэлж, сайтын "Талбай захиалах" товч/хуудас ("/booking")-аар дамжуулан захиалгын хүсэлт илгээхийг зөвлө.`;
      }
    } catch {
      // Мэдээлэл авч чадаагүй ч чат ажиллаж байх ёстой
    }

    const ai = new GoogleGenAI({ apiKey });

    // Сүүлийн ~10 мессежийг л авч, контентыг хэт томруулахгүй
    const contents = messages.slice(-10).map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text || '').slice(0, 2000) }],
    }));

    // Gemini хариу хэт удвал hang болохгүйн тулд 25 секундын хязгаар
    const genPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INFO + programInfo + newsInfo + boothInfo,
        maxOutputTokens: 900,
        temperature: 0.4,
      },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 25000),
    );
    const result: any = await Promise.race([genPromise, timeoutPromise]);
    const text = result?.text || 'Уучлаарай, одоогоор хариулт өгөх боломжгүй байна.';

    res.status(200).json({ reply: text });
  } catch (err: any) {
    console.error('chat api error', err);
    res.status(500).json({ error: 'Серверийн алдаа гарлаа. Дахин оролдоно уу.' });
  }
}
