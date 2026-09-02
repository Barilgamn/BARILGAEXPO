-- =============================================================
-- B2B Бизнес Түншлэлийн Уулзалтын бүртгэл
-- Supabase Dashboard > SQL Editor дээр ажиллуулна.
-- =============================================================

create table if not exists b2b_registrations (
  id bigserial primary key,
  -- Хэсэг 1: байгууллага, харилцах ажилтан
  org_name text not null,
  org_field text,                 -- үйл ажиллагааны чиглэл
  org_field_other text,
  rep_name text not null,
  rep_position text,
  phone text not null,
  email text,
  -- Хэсэг 2: үзэсгэлэнгийн оролцоо
  has_booth boolean not null,
  booth_number text,
  -- Хэсэг 3: matchmaking
  goals text[] default '{}',      -- зорилго (олон сонголт)
  goal_other text,
  partner_wanted text,            -- хайж буй түншийн тодорхойлолт
  -- Дотоод
  status text default 'new',      -- new | confirmed | paid | cancelled
  admin_note text,
  created_at timestamptz default now()
);

create index if not exists idx_b2b_created_at on b2b_registrations (created_at desc);

alter table b2b_registrations enable row level security;

-- Хуучин policy үлдсэн бол бүгдийг нь эхлээд устгана
do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'b2b_registrations'
  loop
    execute format('drop policy if exists %I on public.b2b_registrations', r.policyname);
  end loop;
end $$;

-- Зочин маягт бөглөнө
create policy "public_ins_b2b" on b2b_registrations
  for insert with check (true);

-- Харах, засах, устгах зөвхөн админ.
-- (is_expo_admin() нь supabase-lockdown.sql дотор үүсдэг.)
create policy "admin_sel_b2b" on b2b_registrations
  for select using (public.is_expo_admin());
create policy "admin_upd_b2b" on b2b_registrations
  for update using (public.is_expo_admin()) with check (public.is_expo_admin());
create policy "admin_del_b2b" on b2b_registrations
  for delete using (public.is_expo_admin());
