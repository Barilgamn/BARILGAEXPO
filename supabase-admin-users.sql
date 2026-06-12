-- =============================================
-- Barilga Expo — Admin users allowlist
-- Supabase Dashboard > SQL Editor дээр ажиллуулна
-- =============================================

create table if not exists admin_users (
  email text primary key,
  created_at timestamptz default now()
);

alter table admin_users enable row level security;

-- Admin panel дотроос шалгаж/удирдах тул унших, бичих, устгах боломжтой
create policy "public_read_admin_users" on admin_users for select using (true);
create policy "public_insert_admin_users" on admin_users for insert with check (true);
create policy "public_delete_admin_users" on admin_users for delete using (true);

-- Анхны (одоо байгаа) админыг бүртгэнэ
insert into admin_users (email) values ('info@barilga.mn')
on conflict (email) do nothing;

alter publication supabase_realtime add table admin_users;
