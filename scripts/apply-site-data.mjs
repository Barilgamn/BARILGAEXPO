// Амьд site_data (Supabase) дээрх contact талбаруудыг шинэчлэх script.
// service_role key ашиглан RLS-ийг тойрно. Зөвхөн локал дээр ажиллана.
//
// Ажиллуулах:  node scripts/apply-site-data.mjs
//
// .env-д шаардлагатай:
//   VITE_SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (Supabase → Settings → API → service_role secret)

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// .env-г уншина
const env = {};
try {
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
let key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// Хуулах үед санамсаргүй давхардсан "eyJ" угтварыг засна (eyJeyJ... -> eyJ...)
if (key.startsWith('eyJeyJ')) {
  key = key.slice(3);
  console.log('ℹ️ Түлхүүрийн давхар "eyJ" угтварыг автоматаар арилгав.');
}

if (!url || !key) {
  console.error('❌ VITE_SUPABASE_URL эсвэл SUPABASE_SERVICE_ROLE_KEY дутуу байна (.env шалгана уу).');
  process.exit(1);
}

// 👇 Шинэчлэх утгууд (энд нэмж/өөрчилж болно)
const updates = {
  'contact.address': 'Улаанбаатар 13373, Баянзүрх дүүрэг, 6-р хороо, "BARILGA.MN" оффис',
  'contact.youtubeUrl': 'https://www.youtube.com/barilgamn',
};

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: row, error: readErr } = await supabase
  .from('site_data').select('data').eq('id', 'config').single();
if (readErr) { console.error('❌ Унших алдаа:', readErr.message); process.exit(1); }

const data = row.data || {};
for (const [path, value] of Object.entries(updates)) {
  const keys = path.split('.');
  let obj = data;
  for (let i = 0; i < keys.length - 1; i++) obj = (obj[keys[i]] ??= {});
  obj[keys[keys.length - 1]] = value;
  console.log(`• ${path} = ${value}`);
}

const { error: writeErr } = await supabase
  .from('site_data').update({ data, updated_at: new Date().toISOString() }).eq('id', 'config');
if (writeErr) { console.error('❌ Бичих алдаа:', writeErr.message); process.exit(1); }

console.log('✅ Амжилттай шинэчиллээ.');
