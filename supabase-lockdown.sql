-- =============================================================
-- Barilga Expo — RLS бүрэн хаалт (ЯАРАЛТАЙ)
-- Supabase Dashboard > SQL Editor дээр ажиллуулна.
--
-- ЯАГААД: anon key нь сайтын JavaScript дотор ил байдаг. Тиймээс
-- хүснэгт бүрийн RLS policy л жинхэнэ хамгаалалт болно.
-- Шалгахад дараах зүйл ил байсан:
--   * booth_requests — 43 мөр (компанийн регистр, БАНКНЫ ДАНС,
--     утас, и-мэйл, төлбөрийн мэдээлэл) хэн ч татах боломжтой
--   * admin_users    — админуудын и-мэйл ил, түүнчлэн хэн ч
--     өөрийгөө админаар НЭМЭХ, бусдыг УСТГАХ боломжтой
--
-- Өмнөх "security-fixes" скрипт policy-г нэрээр нь устгадаг байсан
-- тул өөр нэртэй хуучин policy үлдээд хамгаалалт ажиллаагүй байв.
-- Энд хүснэгт бүрийн БҮХ policy-г нэрээс үл хамааран устгана.
-- =============================================================

-- 1) Холбогдох хүснэгтүүдийн бүх policy-г устгах
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('site_data', 'registrations', 'booth_requests', 'admin_users')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 2) RLS-ийг заавал асаах (унтарсан бол policy огт үйлчлэхгүй)
alter table site_data      enable row level security;
alter table registrations  enable row level security;
alter table booth_requests enable row level security;
alter table admin_users    enable row level security;

-- Админ эсэхийг шалгах туслах
create or replace function public.is_expo_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.role() = 'authenticated'
     and (
       auth.jwt() ->> 'email' = 'info@barilga.mn'
       or exists (
         select 1 from admin_users
         where lower(email) = lower(auth.jwt() ->> 'email')
       )
     );
$$;

-- -------------------------------------------------------------
-- site_data — сайтын контент. Унших нээлттэй, бичих зөвхөн админ.
-- -------------------------------------------------------------
create policy "read_site_data"  on site_data for select using (true);
create policy "admin_ins_site_data" on site_data for insert with check (public.is_expo_admin());
create policy "admin_upd_site_data" on site_data for update using (public.is_expo_admin()) with check (public.is_expo_admin());
create policy "admin_del_site_data" on site_data for delete using (public.is_expo_admin());

-- -------------------------------------------------------------
-- registrations — зочдын бүртгэл (нэр, утас, и-мэйл).
-- Маягт бөглөх нээлттэй, харах зөвхөн админ.
-- -------------------------------------------------------------
create policy "public_ins_registrations" on registrations for insert with check (true);
create policy "admin_sel_registrations" on registrations for select using (public.is_expo_admin());
create policy "admin_upd_registrations" on registrations for update using (public.is_expo_admin()) with check (public.is_expo_admin());
create policy "admin_del_registrations" on registrations for delete using (public.is_expo_admin());

-- -------------------------------------------------------------
-- booth_requests — талбайн захиалга. БАНКНЫ ДАНС агуулдаг тул
-- унших эрхийг зөвхөн админд өгнө.
-- -------------------------------------------------------------
create policy "public_ins_booth_requests" on booth_requests for insert with check (true);
create policy "admin_sel_booth_requests" on booth_requests for select using (public.is_expo_admin());
create policy "admin_upd_booth_requests" on booth_requests for update using (public.is_expo_admin()) with check (public.is_expo_admin());
create policy "admin_del_booth_requests" on booth_requests for delete using (public.is_expo_admin());

-- -------------------------------------------------------------
-- admin_users — админуудын жагсаалт. Бүрэн хаана.
-- (Апп нь нэвтэрсний ДАРАА уншдаг болсон тул нээлттэй байх шаардлагагүй.)
-- -------------------------------------------------------------
create policy "admin_sel_admin_users" on admin_users for select using (public.is_expo_admin());
create policy "admin_ins_admin_users" on admin_users for insert with check (public.is_expo_admin());
create policy "admin_del_admin_users" on admin_users for delete using (public.is_expo_admin());

-- =============================================================
-- Шалгах: доорх query нэвтрээгүй үед 0 мөр буцаах ёстой
--   select count(*) from booth_requests;
--   select count(*) from admin_users;
-- =============================================================
