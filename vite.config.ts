import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

/**
 * Хөгжүүлэлтийн үед `/api/fb-thumb`-ийг ажиллуулна. Vercel дээр `api/` доторх
 * функц өөрөө ажилладаг ч Vite dev сервер үүнийг мэдэхгүй тул SPA fallback
 * буцаадаг. Энэ plugin зөвхөн dev горимд ажиллана.
 */
const fbThumbDevPlugin = () => ({
  name: 'fb-thumb-dev',
  apply: 'serve' as const,
  configureServer(server: any) {
    server.middlewares.use('/api/fb-thumb', async (req: any, res: any) => {
      try {
        const url = new URL(req.url, 'http://localhost').searchParams.get('url') || '';
        if (!/^https:\/\/(www\.|web\.|m\.)?facebook\.com\//i.test(url)) {
          res.statusCode = 400; res.end('bad url'); return;
        }
        const page = await fetch(url, {
          headers: { 'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' },
          redirect: 'follow',
        });
        const html = await page.text();
        const m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
        if (!m) { res.statusCode = 404; res.end('no og:image'); return; }
        res.statusCode = 302;
        res.setHeader('Location', m[1].replace(/&amp;/g, '&'));
        res.end();
      } catch (e: any) {
        res.statusCode = 500; res.end(String(e?.message || e));
      }
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), fbThumbDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
