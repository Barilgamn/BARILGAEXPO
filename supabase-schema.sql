-- =============================================
-- Barilga Expo — Supabase Database Schema
-- Supabase Dashboard > SQL Editor дээр ажиллуулна
-- =============================================

-- 1. site_data table — сайтын бүх контент (нэг мөр)
create table if not exists site_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 2. registrations table — үзэгч/оролцогч бүртгэл
create table if not exists registrations (
  id text primary key,
  type text not null check (type in ('visitor', 'exhibitor')),
  name text not null,
  phone text not null,
  email text,
  org text,
  area text,
  req text,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
alter table site_data enable row level security;
alter table registrations enable row level security;

-- site_data: хэн ч унших боломжтой, хэн ч бичих боломжтой
create policy "public_read_site_data" on site_data for select using (true);
create policy "public_write_site_data" on site_data for all using (true);

-- registrations: хэн ч бүртгэл үүсгэх, унших боломжтой; устгах = хэн ч
create policy "public_insert_registrations" on registrations for insert with check (true);
create policy "public_read_registrations" on registrations for select using (true);
create policy "public_delete_registrations" on registrations for delete using (true);

-- =============================================
-- Realtime идэвхжүүлэх
-- =============================================
alter publication supabase_realtime add table site_data;
alter publication supabase_realtime add table registrations;
