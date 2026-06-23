import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

interface DocumentFields {
  companyName?: string;
  registerNumber?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  bankAccount?: string;
  contactPerson?: string;
  boothIds?: string;
  boothArea?: string;
  totalPriceUsd?: string;
  totalPriceMnt?: string;
  contractNo?: string;
  contractDate?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  needsStandWall?: boolean;
  needsSignage?: boolean;
  needsStageProgram?: boolean;
  needsVipRoom?: boolean;
  signageName?: string;
  additionalFee?: string;
}

interface DocUrl {
  label: string;
  url: string;
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};

const fmtDate = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()} оны ${d.getMonth() + 1} сарын ${d.getDate()}`;
};

const row = (label: string, value: string) =>
  value
    ? `<tr><td style="padding:6px 12px;color:#555;width:45%;border-bottom:1px solid #f0f0f0">${label}</td><td style="padding:6px 12px;font-weight:600;border-bottom:1px solid #f0f0f0">${value}</td></tr>`
    : '';

function buildHtml(f: DocumentFields, docUrls: DocUrl[]): string {
  const services: string[] = [];
  if (f.needsStandWall) services.push('Стенд (хана) угсралт');
  if (f.needsSignage) services.push(`Нэрийн самбар${f.signageName ? ` — ${f.signageName}` : ''}`);
  if (f.needsStageProgram) services.push('Тайз / семинар');
  if (f.needsVipRoom) services.push('VIP өрөө');

  const totalDisplay = f.totalPriceMnt
    ? `${f.totalPriceMnt}₮${f.totalPriceUsd ? ` ($${f.totalPriceUsd})` : ''}`
    : f.totalPriceUsd ? `$${f.totalPriceUsd}` : '';

  const downloadButtons = docUrls.map(d =>
    `<a href="${d.url}" style="display:inline-block;margin:6px 8px 6px 0;padding:12px 24px;background:#1e3a8a;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px">${d.label} ↓</a>`
  ).join('');

  return `<!DOCTYPE html><html lang="mn"><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif">
<div style="max-width:640px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <div style="background:#1e3a8a;padding:28px 32px;text-align:center">
    <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:1px">BARILGA EXPO</div>
    <div style="color:#93c5fd;font-size:13px;margin-top:4px">40 дэх удаагийн Олон Улсын Барилгын Үзэсгэлэн</div>
  </div>

  <div style="padding:28px 32px 0">
    <p style="margin:0;font-size:15px;color:#222">Сайн байна уу${f.contactPerson ? `, <strong>${f.contactPerson}</strong>` : ''},</p>
    <p style="margin:12px 0 0;color:#444;line-height:1.6">
      40 дахь удаагийн <strong>BARILGA EXPO</strong> үзэсгэлэнгийн талбайн захиалгатай холбоотой гэрээ болон нэхэмжлэхийг доорх товчнуудаас татаж авна уу. Танилцаж, гарын үсэг зурсны дараа буцаан илгээнэ үү.
    </p>
  </div>

  ${docUrls.length > 0 ? `
  <div style="padding:24px 32px;text-align:center;background:#f0f7ff;margin:24px 32px 0;border-radius:10px">
    <p style="margin:0 0 12px;font-weight:700;color:#1e3a8a;font-size:14px">📄 БАРИМТ БИЧГҮҮД</p>
    ${downloadButtons}
    <p style="margin:12px 0 0;font-size:11px;color:#888">Линк 7 хоногийн хугацаанд хүчинтэй байна</p>
  </div>` : ''}

  <div style="padding:24px 32px 0">
    <div style="font-size:13px;font-weight:700;color:#1e3a8a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Гэрээний мэдээлэл</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:#fafafa;border-radius:8px;overflow:hidden">
      ${row('Байгууллагын нэр', f.companyName || '')}
      ${row('Регистрийн дугаар', f.registerNumber || '')}
      ${row('Гэрээний дугаар', f.contractNo || '')}
      ${row('Гэрээний огноо', fmtDate(f.contractDate || ''))}
      ${row('Холбогдох ажилтан', f.contactPerson || '')}
      ${row('Утас', f.phone || '')}
      ${row('И-мэйл', f.email || '')}
      ${row('Талбайн дугаар', f.boothIds || '')}
      ${row('Талбайн хэмжээ', f.boothArea ? `${f.boothArea} м²` : '')}
      ${totalDisplay ? row('Нийт төлбөр', totalDisplay) : ''}
    </table>
  </div>

  ${services.length > 0 ? `
  <div style="padding:20px 32px 0">
    <div style="font-size:13px;font-weight:700;color:#1e3a8a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Нэмэлт үйлчилгээ</div>
    <ul style="margin:0;padding:0 0 0 20px;font-size:14px;color:#333;line-height:1.8">${services.map(s => `<li>${s}</li>`).join('')}</ul>
  </div>` : ''}

  <div style="padding:20px 32px 0">
    <div style="font-size:13px;font-weight:700;color:#1e3a8a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Нэхэмжлэхийн дансны мэдээлэл</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:#fafafa;border-radius:8px;overflow:hidden">
      ${row('Нэхэмжлэхийн дугаар', f.invoiceNo || '')}
      ${row('Нэхэмжлэхийн огноо', fmtDate(f.invoiceDate || ''))}
      ${row('Банк', f.bankName || 'Хаан банк')}
      ${row('Дансны дугаар', f.bankAccount || '67000500')}
      ${row('Дансны нэр', '"БАРИЛГА МН" ХХК')}
    </table>
  </div>

  <div style="padding:24px 32px;margin-top:20px;background:#eff6ff;border-top:3px solid #1e3a8a">
    <p style="margin:0;font-size:13px;color:#555">📞 99907816, 77113333 &nbsp;|&nbsp; ✉️ info@barilga.mn</p>
    <p style="margin:6px 0 0;font-size:12px;color:#888">BARILGA EXPO — "БАРИЛГА МН" ХХК</p>
  </div>
</div>
</body></html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { to, subject, fields, docUrls, cc } = req.body as {
      to: string;
      subject?: string;
      fields?: DocumentFields;
      docUrls?: DocUrl[];
      cc?: string;
    };

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      res.status(400).json({ error: 'Хүлээн авагчийн и-мэйл хаяг буруу байна.' });
      return;
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;
    const from = process.env.MAIL_FROM || gmailUser || 'info@barilga.mn';

    if (!gmailUser || !gmailPass) {
      res.status(500).json({ error: 'Gmail тохиргоо хийгдээгүй байна. GMAIL_USER болон GMAIL_PASS оруулна уу.' });
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"BARILGA EXPO" <${from}>`,
      to,
      cc: cc || undefined,
      subject: subject || `BARILGA EXPO — Гэрээ ба нэхэмжлэх${fields?.companyName ? ' (' + fields.companyName + ')' : ''}`,
      html: buildHtml(fields || {}, docUrls || []),
      text: `BARILGA EXPO — Гэрээ ба нэхэмжлэх\nБайгууллага: ${fields?.companyName || ''}\n${(docUrls || []).map(d => d.label + ': ' + d.url).join('\n')}\ninfo@barilga.mn`,
    });

    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('send-document error', err);
    res.status(500).json({ error: 'И-мэйл илгээхэд алдаа гарлаа: ' + (err?.message || 'тодорхойгүй') });
  }
}
