-- =============================================================
-- Хамтын маркетингийн логонууд
-- /poster хуудсаар оролцогч зурагт хуудсаа татаж авахад
-- тухайн логог нь энд хадгална. Админ "Оролцогчид" цэснээс харна.
-- Supabase Dashboard > SQL Editor дээр ажиллуулна.
-- =============================================================

create table if not exists marketing_logos (
  id bigserial primary key,
  logo_url text not null,
  booth text,
  file_name text,
  created_at timestamptz default now()
);

create index if not exists idx_marketing_logos_created_at
  on marketing_logos (created_at desc);

alter table marketing_logos enable row level security;

-- Зочин (оролцогч) шинэ мөр нэмнэ
drop policy if exists "public_insert_marketing_logos" on marketing_logos;
create policy "public_insert_marketing_logos"
  on marketing_logos for insert
  with check (true);

-- Хэн ч уншиж болно (админ жагсаалтаа харна)
drop policy if exists "public_read_marketing_logos" on marketing_logos;
create policy "public_read_marketing_logos"
  on marketing_logos for select
  using (true);

-- Зөвхөн админ устгана
drop policy if exists "admin_delete_marketing_logos" on marketing_logos;
create policy "admin_delete_marketing_logos"
  on marketing_logos for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn');

-- =============================================================
-- Storage — зочин зөвхөн marketing-logos/ хавтсанд байршуулна.
-- (media bucket-ийн бусад хавтас админд хаалттай хэвээр үлдэнэ.)
-- =============================================================
drop policy if exists "public_upload_marketing_logos" on storage.objects;
create policy "public_upload_marketing_logos"
  on storage.objects for insert
  with check (bucket_id = 'media' and name like 'marketing-logos/%');
