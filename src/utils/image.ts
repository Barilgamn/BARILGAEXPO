// Жижиг хэмжээтэй (хурдан ачаалагддаг) хувилбар авахын тулд Jetpack Photon
// CDN-ээр дамжуулж зургийг шаардлагатай өргөнөөр нь шахаж/хэмжээг өөрчилнө.
export const optimizeImage = (url: string, width: number) => {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('wp.com')) {
      u.searchParams.set('w', String(width));
      u.searchParams.set('quality', '75');
      u.searchParams.set('ssl', '1');
      return u.toString();
    }
    // Манай өөрийн домэйн болон Supabase Storage-д хадгалсан зургийг шууд ашиглана
    if (u.hostname.endsWith('barilgaexpo.mn') || u.hostname.endsWith('supabase.co')) {
      return url;
    }
    const stripped = url.replace(/^https?:\/\//, '');
    return `https://i0.wp.com/${stripped}?w=${width}&quality=75&ssl=1`;
  } catch {
    return url;
  }
};

/** Байршуулсан файл хэзээ ч өөрчлөгддөггүй (нэр нь timestamp-тай) тул
 *  нэг жилээр кэшлэнэ. Өмнө 1 цаг байсан нь давтан зочид бүрт дахин
 *  татуулж, egress-ийг дэмий үрдэг байлаа. */
export const CACHE_ONE_YEAR = '31536000';

/** Зургийг өгөгдсөн өргөнд багасгаж WebP болгоно (ил тод байдал хадгалагдана).
 *  Логоны эх файл 100-300KB байдаг ч нүүр хуудсанд 140px-ээр л харагддаг тул
 *  эхээр нь дамжуулах нь egress-ийг дэмий үрдэг. */
export const shrinkImage = async (
  source: Blob | string,
  maxWidth = 400,
  quality = 0.82,
): Promise<Blob> => {
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      if (/^https?:/i.test(url)) el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Зураг уншиж чадсангүй'));
      el.src = url;
    });

    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) throw new Error('Зургийн хэмжээ тодорхойгүй');
    // Аль хэдийн жижиг бол дахин шахахгүй (чанар унана)
    if (w <= maxWidth && typeof source !== 'string') return source;

    const scale = Math.min(1, maxWidth / w);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas үүсгэж чадсангүй');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('Зураг шахаж чадсангүй'))),
        'image/webp',
        quality,
      );
    });
  } finally {
    if (typeof source !== 'string') setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
};
