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
    const stripped = url.replace(/^https?:\/\//, '');
    return `https://i0.wp.com/${stripped}?w=${width}&quality=75&ssl=1`;
  } catch {
    return url;
  }
};
