import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Гэрээ / нэхэмжлэхийг тухайн байгууллагын и-мэйл рүү (order@barilgaexpo.mn-ээс) илгээх.
// SMTP тохиргоог орчны хувьсагчаар (Vercel env) дамжуулна:
//   SMTP_HOST      (жишээ: smtp.zoho.com)
//   SMTP_PORT      (465 эсвэл 587)
//   SMTP_USER      (order@barilgaexpo.mn)
//   SMTP_PASS      (мэйлийн нууц үг / app password)
//   MAIL_FROM      (сонголтоор, default: order@barilgaexpo.mn)

interface Attachment {
  filename: string;
  contentBase64: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { to, subject, message, attachments, cc } = req.body as {
      to: string;
      subject?: string;
      message?: string;
      cc?: string;
      attachments?: Attachment[];
    };

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      res.status(400).json({ error: 'Хүлээн авагчийн и-мэйл хаяг буруу байна.' });
      return;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM || 'order@barilgaexpo.mn';

    if (!host || !user || !pass) {
      res.status(500).json({
        error: 'И-мэйл тохиргоо хийгдээгүй байна (SMTP_HOST / SMTP_USER / SMTP_PASS дутуу).',
      });
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465=SSL, 587=STARTTLS
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"BARILGA EXPO" <${from}>`,
      to,
      cc: cc || undefined,
      subject: subject || 'BARILGA EXPO — Гэрээ ба нэхэмжлэх',
      text:
        message ||
        'Сайн байна уу,\n\nBARILGA EXPO үзэсгэлэнгийн талбайн түрээсийн гэрээ болон нэхэмжлэхийг хавсаргав. Танилцаж, гарын үсэг зурсны дараа буцаан илгээнэ үү.\n\nХүндэтгэсэн,\nBARILGA EXPO багаас\norder@barilgaexpo.mn',
      attachments: (attachments || []).map(a => ({
        filename: a.filename,
        content: a.contentBase64,
        encoding: 'base64',
        contentType: 'application/pdf',
      })),
    });

    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('send-document error', err);
    res.status(500).json({ error: 'И-мэйл илгээхэд алдаа гарлаа: ' + (err?.message || 'тодорхойгүй') });
  }
}
