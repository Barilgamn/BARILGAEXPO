import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Download, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';
import { CACHE_ONE_YEAR } from '../utils/image';
import { useTranslation } from '../i18n';

/* Загварын хэмжээ ба байрлалууд — эх PNG (1800x1641) дээр хэмжсэн утгууд. */
const W = 1800;
const H = 1641;

/** Лого байрлах цэвэр талбай (эргэн тойрны чимэглэлд хүрэхгүй). */
const LOGO_BOX = { x: 300, y: 520, w: 1200, h: 620 };

/** Текстийн байрлал — эх загварын үсгийн суурь шугамаас хэмжсэн. */
const TEXT = {
  centerX: 900,
  baseline1: 1262,
  baseline2: 1341,
  fontSize: 73,      // caps өндөр 51px / Montserrat-ийн cap ratio 0.70
  red: '#C4161C',
  blue: '#00337F',
};

const TEMPLATE_SRC = '/poster-template.png';

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    // crossOrigin-ийг зөвхөн гадаад URL-д хэрэглэнэ. blob:/data: дээр тавивал
    // зарим хөтөч дээр ачаалалт бүтэлгүйтдэг.
    if (/^https?:/i.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Зураг ачаалж чадсангүй'));
    img.src = src;
  });

/** Хөтөч дэмжихгүй байж болзошгүй форматууд (ялангуяа iPhone-ы HEIC). */
const isUnsupported = (file: File) =>
  /heic|heif|avif|tiff?$/i.test(file.type) || /\.(heic|heif|tif|tiff)$/i.test(file.name);

/** Файлыг зурган болгож уншина. createImageBitmap илүү олон форматыг
 *  тайлдаг тул эхэлж түүгээр, бүтэхгүй бол <img>-ээр оролдоно. */
const decodeLogo = async (file: File): Promise<CanvasImageSource & { width: number; height: number }> => {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file) as any;
    } catch { /* доорх аргаар оролдоно */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    // ImageBitmap-тай ижил интерфэйстэй болгоно
    return Object.assign(img, { width: img.naturalWidth, height: img.naturalHeight }) as any;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
};

export const PosterMaker: React.FC = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<HTMLImageElement | null>(null);
  const logoRef = useRef<(CanvasImageSource & { width: number; height: number }) | null>(null);
  const logoFileRef = useRef<File | null>(null);
  const savedRef = useRef(false);   // нэг лого нэг л удаа хадгалагдана

  const [booth, setBooth] = useState('A7');
  const [logoName, setLogoName] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  /** Загвар + фонтыг бэлдэнэ. Фонт ачаалагдаагүй үед зурвал буруу үсгээр гарна. */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [img] = await Promise.all([
          loadImage(TEMPLATE_SRC),
          (document as any).fonts?.load(`700 ${TEXT.fontSize}px Montserrat`),
          (document as any).fonts?.load(`500 ${TEXT.fontSize}px Montserrat`),
        ]);
        await (document as any).fonts?.ready;
        if (!alive) return;
        templateRef.current = img;
        setReady(true);
      } catch (e: any) {
        if (alive) setError(e?.message || 'Загвар ачаалахад алдаа гарлаа');
      }
    })();
    return () => { alive = false; };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const tpl = templateRef.current;
    if (!canvas || !tpl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(tpl, 0, 0, W, H);

    // --- Лого — хайрцагт багтаана, харьцаа нь хадгалагдана ---
    const logo = logoRef.current;
    if (logo && logo.width) {
      const scale = Math.min(LOGO_BOX.w / logo.width, LOGO_BOX.h / logo.height);
      const w = logo.width * scale;
      const h = logo.height * scale;
      ctx.drawImage(
        logo,
        LOGO_BOX.x + (LOGO_BOX.w - w) / 2,
        LOGO_BOX.y + (LOGO_BOX.h - h) / 2,
        w, h,
      );
    }

    // --- Текст ---
    const boothText = (booth.trim() || 'A7').toUpperCase();
    const boldFont = `700 ${TEXT.fontSize}px Montserrat, sans-serif`;
    const midFont = `500 ${TEXT.fontSize}px Montserrat, sans-serif`;

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // 1-р мөр: "<стенд> ПАВИЛЬОН" улаан + " дээр" хөх — хамтдаа голлоно
    const redPart = `${boothText} ПАВИЛЬОН`;
    const bluePart = ' дээр';
    ctx.font = boldFont;
    const redW = ctx.measureText(redPart).width;
    ctx.font = midFont;
    const blueW = ctx.measureText(bluePart).width;

    let x = TEXT.centerX - (redW + blueW) / 2;
    ctx.font = boldFont;
    ctx.fillStyle = TEXT.red;
    ctx.fillText(redPart, x, TEXT.baseline1);
    ctx.font = midFont;
    ctx.fillStyle = TEXT.blue;
    ctx.fillText(bluePart, x + redW, TEXT.baseline1);

    // 2-р мөр
    const line2 = 'оролцож байна.';
    ctx.font = midFont;
    ctx.fillStyle = TEXT.blue;
    ctx.textAlign = 'center';
    ctx.fillText(line2, TEXT.centerX, TEXT.baseline2);
  }, [booth]);

  useEffect(() => { if (ready) draw(); }, [ready, draw]);

  const onPickLogo = async (file: File) => {
    setError('');
    if (isUnsupported(file)) {
      setError(`${file.name.split('.').pop()?.toUpperCase()} — ${t('pm_err_fmt')}`);
      return;
    }
    if (file.type && !file.type.startsWith('image/')) {
      setError(`${t('pm_err_img')} (${file.type})`);
      return;
    }
    setBusy(true);
    try {
      const logo = await decodeLogo(file);
      if (!logo.width || !logo.height) throw new Error('хэмжээ тодорхойгүй');
      logoRef.current = logo;
      logoFileRef.current = file;
      savedRef.current = false;
      setLogoName(file.name);
      draw();
    } catch (e: any) {
      setError(`${t('pm_err_read')} (${file.name}). ${t('pm_err_fmt')} — ${e?.message || ''}`);
    } finally {
      setBusy(false);
    }
  };

  const removeLogo = () => {
    logoRef.current = null;
    logoFileRef.current = null;
    savedRef.current = false;
    setLogoName('');
    draw();
  };

  /** Татаж авсан логог "Хамтын маркетингийн логонууд" жагсаалтад нэмнэ.
   *  Амжилтгүй болсон ч татаж авахад саад болохгүй — чимээгүй өнгөрнө. */
  const saveLogoForMarketing = async () => {
    const file = logoFileRef.current;
    if (!file || savedRef.current) return;
    savedRef.current = true;   // давхар хадгалахаас сэргийлнэ
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase().slice(0, 5);
      const path = `marketing-logos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('media')
        .upload(path, file, { cacheControl: CACHE_ONE_YEAR, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('media').getPublicUrl(path);
      await supabase.from('marketing_logos').insert({
        logo_url: pub.publicUrl,
        booth: (booth.trim() || 'A7').toUpperCase(),
        file_name: file.name,
      });
    } catch (e) {
      savedRef.current = false;    // дараагийн татахад дахин оролдоно
      console.warn('marketing logo save failed', e);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveLogoForMarketing();
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barilga-expo-${(booth.trim() || 'A7').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, 'image/png');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl sm:text-4xl font-black text-blue-950 mb-2">
          {t('pm_title')}
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-2xl">
          {t('pm_intro')}
        </p>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Урьдчилсан харагдац */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4">
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="w-full h-auto rounded-lg"
              />
              {!ready && !error && (
                <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t('pm_loading')}
                </div>
              )}
            </div>
          </div>

          {/* Тохиргоо */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('pm_step1')}
                </label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed
                                  border-blue-300 bg-blue-50 text-blue-700 font-medium cursor-pointer
                                  hover:bg-blue-100 hover:border-blue-400 transition-colors">
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  {busy ? t('pm_reading') : logoName ? t('pm_change') : t('pm_upload')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={busy}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) onPickLogo(f);
                      e.target.value = '';
                    }}
                  />
                </label>
                {logoName && (
                  <div className="flex items-center justify-between gap-2 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 truncate">
                      <ImageIcon size={14} className="shrink-0" />
                      <span className="truncate">{logoName}</span>
                    </span>
                    <button onClick={removeLogo} className="flex items-center gap-1 text-red-500 hover:text-red-700 shrink-0">
                      <Trash2 size={14} /> {t('pm_remove')}
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-gray-400 mt-2">
                  {t('pm_png_hint')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('pm_step2')}
                </label>
                <input
                  type="text"
                  value={booth}
                  onChange={e => setBooth(e.target.value)}
                  placeholder="A7"
                  maxLength={12}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-bold tracking-wide
                             uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  {t('pm_booth_hint')}
                </p>
              </div>

              <button
                onClick={download}
                disabled={!ready}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl
                           bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                           text-white font-bold transition-colors shadow-sm"
              >
                <Download size={18} /> {t('pm_download')}
              </button>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
