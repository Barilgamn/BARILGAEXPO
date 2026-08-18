-- =============================================
-- Barilga Expo — Real-time хандалт (presence)
-- Supabase Dashboard > SQL Editor дээр ажиллуулна
-- =============================================
-- site_visits нь session тус бүрт ӨДӨРТ нэг мөр бичдэг тул "сүүлийн 60 минут"-ыг
-- түүгээр тооцох боломжгүй. Иймд идэвхтэй байгаа session-ий сүүлийн үйл
-- хөдлөлийн мөчийг тусад нь хадгална.

create table if not exists site_presence (
  session_id text primary key,
  last_seen  timestamptz not null default now(),
  path       text
);

create index if not exists idx_site_presence_last_seen on site_presence (last_seen desc);

alter table site_presence enable row level security;

-- Зочин өөрийн мөрөө үүсгэх/шинэчлэх, админ уншина
drop policy if exists "public_insert_site_presence" on site_presence;
drop policy if exists "public_update_site_presence" on site_presence;
drop policy if exists "public_read_site_presence"   on site_presence;

create policy "public_insert_site_presence" on site_presence for insert with check (true);
create policy "public_update_site_presence" on site_presence for update using (true) with check (true);
create policy "public_read_site_presence"   on site_presence for select using (true);

-- 24 цагаас хуучирсан мөрийг цэвэрлэх (сонголтоор, гараар эсвэл cron-оор)
-- delete from site_presence where last_seen < now() - interval '24 hours';
