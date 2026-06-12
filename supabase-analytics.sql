-- =============================================
-- Barilga Expo — Analytics (сайт хандалт, чат хэрэглэгч)
-- Supabase Dashboard > SQL Editor дээр ажиллуулна
-- =============================================

-- 1. site_visits — сайтад хандсан тоо (өдөр/сар тус бүрээр статистик гаргахад)
create table if not exists site_visits (
  id bigserial primary key,
  session_id text not null,
  path text,
  created_at timestamptz default now()
);

-- 2. chat_sessions — AI чатанд хандсан хэрэглэгчийн тоо
create table if not exists chat_sessions (
  id bigserial primary key,
  session_id text not null,
  created_at timestamptz default now()
);

create index if not exists idx_site_visits_created_at on site_visits (created_at);
create index if not exists idx_chat_sessions_created_at on chat_sessions (created_at);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
alter table site_visits enable row level security;
alter table chat_sessions enable row level security;

-- Хэн ч бичиж болно (зочин тоологдоно), хэн ч уншиж болно (админ статистик харна)
create policy "public_insert_site_visits" on site_visits for insert with check (true);
create policy "public_read_site_visits" on site_visits for select using (true);

create policy "public_insert_chat_sessions" on chat_sessions for insert with check (true);
create policy "public_read_chat_sessions" on chat_sessions for select using (true);

-- =============================================
-- Realtime (сонголтоор)
-- =============================================
alter publication supabase_realtime add table site_visits;
alter publication supabase_realtime add table chat_sessions;
