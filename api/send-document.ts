import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Гэрээ / нэхэмжлэхийг тухайн байгууллагын и-мэйл рүү Gmail-ээс илгээх.
// Gmail App Password авах: Google Account → Security → 2-Step Verification → App passwords
// Vercel env хувьсагчид:
//   GMAIL_USER   (жишээ: info@barilga.mn)
//   GMAIL_PASS   (Gmail App Password — 16 тэмдэгт, хоосон зайгүй)
//   MAIL_FROM    (сонголтоор, default: GMAIL_USER)

interface Attachment {
  filename: string;
  contentBase64: string;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

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

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;
    const from = process.env.MAIL_FROM || gmailUser || 'info@barilga.mn';

    if (!gmailUser || !gmailPass) {
      res.status(500).json({
        error: 'Gmail тохиргоо хийгдээгүй байна. Vercel env-д GMAIL_USER болон GMAIL_PASS (App Password) оруулна уу.',
      });
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
      subject: subject || 'BARILGA EXPO — Гэрээ ба нэхэмжлэх',
      text:
        message ||
        'Сайн байна уу,\n\nBARILGA EXPO үзэсгэлэнгийн талбайн түрээсийн гэрээ болон нэхэмжлэхийг хавсаргав. Танилцаж, гарын үсэг зурсны дараа буцаан илгээнэ үү.\n\nХүндэтгэсэн,\nBARILGA EXPO багаас\ninfo@barilga.mn',
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
