/**
 * Бичлэгээс нүүр кадр (poster) гаргаж авах.
 *
 * Яагаад хэрэгтэй вэ: нүүр хуудсанд <video>-г шууд тавьбал хөтөч нүүр
 * кадрыг харуулахын тулд бичлэг бүрээс өгөгдөл татдаг. 7 бичлэгтэй үед
 * энэ нь нэг зочинд ~20MB болж, Supabase-ийн egress-ийг дүүргэдэг.
 * Оронд нь ~30KB-ийн JPEG харуулна.
 */

const FRAME_AT = 0.1;      // секунд — эхний кадр
const MAX_EDGE = 720;      // урт талын дээд хэмжээ (9:16 карт үүнээс жижиг)
const QUALITY = 0.72;

export const capturePosterFrame = (src: string): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    let done = false;
    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };
    const fail = (msg: string) => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error(msg));
    };

    // Бичлэг эвдэрсэн эсвэл сүлжээ удаан бол мөнхөд хүлээхгүй
    const timer = setTimeout(() => fail('Нүүр кадр авахад хугацаа хэтэрлээ'), 30000);

    const grab = () => {
      if (done) return;
      try {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh) return fail('Бичлэгийн хэмжээ тодорхойгүй');

        const scale = Math.min(1, MAX_EDGE / Math.max(vw, vh));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(vw * scale);
        canvas.height = Math.round(vh * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return fail('Canvas үүсгэж чадсангүй');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          blob => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            cleanup();
            blob ? resolve(blob) : reject(new Error('Зураг үүсгэж чадсангүй'));
          },
          'image/jpeg',
          QUALITY,
        );
      } catch (e: any) {
        fail(e?.message || 'Нүүр кадр авч чадсангүй');
      }
    };

    video.onloadeddata = () => {
      // Эхний кадр руу шилжинэ; аль хэдийн тэнд байвал шууд авна.
      if (video.currentTime < FRAME_AT) video.currentTime = FRAME_AT;
      else grab();
    };
    video.onseeked = grab;
    video.onerror = () => fail('Бичлэгийг уншиж чадсангүй');

    video.src = src;
  });
