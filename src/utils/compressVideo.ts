/**
 * Бичлэгийг браузер дээр шахах.
 *
 * Файлыг <video>-д тоглуулж, кадр бүрийг canvas дээр буулгаад MediaRecorder-ээр
 * дахин кодлоно. Нягтралыг 720p хүртэл багасгаж, битрэйтийг пикселийн тоонд
 * тааруулснаар чанарыг мэдэгдэхүйц алдалгүй хэмжээг ихээхэн бууруулна.
 *
 * Дуу нь video.captureStream()-ээс шууд авагдана (элемент нь дуугүй байсан ч
 * дууны суваг хэвээр гарна).
 */

/** Нягтралын дээд хязгаар — урт талыг үүнээс хэтрүүлэхгүй */
const MAX_EDGE = 1280;
/** Үүнээс жижиг файлыг дахин кодлох нь ашиггүй */
const SKIP_UNDER_BYTES = 3 * 1024 * 1024;

export interface CompressProgress {
  /** 0 → 1 */
  ratio: number;
}

const pickMime = (): string | null => {
  // MP4/H.264 нь бүх төхөөрөмжид тоглодог тул эхэлж үүнийг сонгоно
  const candidates = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return null;
};

/** Хос тоо болгоно — кодлогчид сондгой хэмжээ таагүй */
const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

export const compressVideo = async (
  file: File,
  onProgress?: (p: CompressProgress) => void,
): Promise<File> => {
  const mime = pickMime();
  if (!mime || typeof MediaRecorder === 'undefined') return file;
  if (file.size < SKIP_UNDER_BYTES) return file;

  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;               // чанга яригчаар гаргахгүй
  video.playsInline = true;
  video.preload = 'auto';

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Бичлэгийг уншиж чадсангүй'));
    });

    const sw = video.videoWidth;
    const sh = video.videoHeight;
    if (!sw || !sh) return file;

    const scale = Math.min(1, MAX_EDGE / Math.max(sw, sh));
    const w = even(sw * scale);
    const h = even(sh * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    const fps = 30;
    const out = canvas.captureStream(fps);

    /* Дууны сувгийг эх бичлэгээс залгана */
    const src = (video as any).captureStream?.() as MediaStream | undefined;
    src?.getAudioTracks().forEach(t => out.addTrack(t));

    /* Битрэйт: пиксел/сек-ээс хамаарна (720x1280@30 ≈ 1.9 Mbps) */
    const videoBitsPerSecond = Math.round(
      Math.min(3_500_000, Math.max(800_000, w * h * fps * 0.07)),
    );

    const rec = new MediaRecorder(out, {
      mimeType: mime,
      videoBitsPerSecond,
      audioBitsPerSecond: 128_000,
    });

    const chunks: BlobPart[] = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const done = new Promise<Blob>(resolve => {
      rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
    });

    rec.start(1000);
    await video.play();

    /* Кадр бүрийг зурна. MediaRecorder-ээс гарсан WebM-д duration нь Infinity
       байж болох тул явцыг өнгөрсөн хугацаагаар тооцно. */
    const knownDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    let stop = false;
    let frames = 0;
    let lastFrameAt = Date.now();

    const draw = () => {
      if (stop) return;
      ctx.drawImage(video, 0, 0, w, h);
      frames++;
      lastFrameAt = Date.now();
      if (knownDuration) onProgress?.({ ratio: Math.min(1, video.currentTime / knownDuration) });
      if ((video as any).requestVideoFrameCallback) (video as any).requestVideoFrameCallback(draw);
      else requestAnimationFrame(draw);
    };
    draw();

    /* Дуусахыг хүлээнэ. Хэрэв таб далд болж кадр зогсвол (эсвэл ямар нэг
       шалтгаанаар гацвал) хүлээж дүүжлэхгүйгээр эх файлыг нь байршуулна. */
    const STALL_MS = 12_000;
    const ended = await new Promise<boolean>(resolve => {
      video.onended = () => resolve(true);
      const watchdog = window.setInterval(() => {
        if (Date.now() - lastFrameAt > STALL_MS) {
          window.clearInterval(watchdog);
          resolve(false);
        }
      }, 1000);
      video.addEventListener('ended', () => window.clearInterval(watchdog), { once: true });
    });

    stop = true;
    rec.stop();
    const blob = await done;

    if (!ended || frames < 2 || !blob.size) return file;   // бүрэн бус кодлолт
    onProgress?.({ ratio: 1 });

    /* Шахалт үр дүнгүй бол эхийг нь хэвээр үлдээнэ */
    if (blob.size >= file.size) return file;

    const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
    const base = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${base}.${ext}`, { type: mime });
  } catch {
    return file;   // ямар нэг алдаа гарвал эх файлыг нь байршуулна
  } finally {
    video.pause();
    video.removeAttribute('src');
    URL.revokeObjectURL(url);
  }
};
