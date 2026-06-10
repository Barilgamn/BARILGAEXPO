-- =============================================================
-- Barilga Expo — Supabase RLS Security Hardening
-- Supabase Dashboard > SQL Editor дээр ажиллуулна
--
-- Энэхүү скрипт нь одоогийн "хэн ч бичиж/устгаж болно" төрлийн
-- нээлттэй policy-уудыг сольж, зөвхөн админ (info@barilga.mn)
-- мэдээлэл бичих/засах/устгах эрхтэй болгоно.
-- Анхаар: domain холбохоос ӨМНӨ ажиллуулна уу.
-- =============================================================

-- -------------------------------------------------------------
-- 1) site_data — сайтын CMS контент
--    Урьд нь: "хэн ч бичиж болно" (anon key-тэй хэн ч сайтын
--    бүх контентыг дарж бичих/устгах боломжтой байсан!)
-- -------------------------------------------------------------
drop policy if exists "public_write_site_data" on site_data;
drop policy if exists "public_read_site_data" on site_data;

-- Хэн ч унших боломжтой (нийтэд харагдах сайтын контент)
create policy "public_read_site_data"
  on site_data for select
  using (true);

-- Зөвхөн нэвтэрсэн админ (info@barilga.mn) бичих/засах/устгах
create policy "admin_write_site_data"
  on site_data for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'info@barilga.mn');

create policy "admin_update_site_data"
  on site_data for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn')
  with check (auth.jwt() ->> 'email' = 'info@barilga.mn');

create policy "admin_delete_site_data"
  on site_data for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn');


-- -------------------------------------------------------------
-- 2) registrations — үзэгч/оролцогчдын бүртгэл (нэр, утас, и-мэйл)
--    Урьд нь: "хэн ч унших, устгах боломжтой" (хувийн мэдээлэл
--    задрах, бүртгэлийг устгах эрсдэлтэй байсан!)
-- -------------------------------------------------------------
drop policy if exists "public_read_registrations" on registrations;
drop policy if exists "public_delete_registrations" on registrations;
drop policy if exists "public_insert_registrations" on registrations;

-- Зочид/оролцогчид маягт бөглөхөд л шаардлагатай тул insert нээлттэй хэвээр
create policy "public_insert_registrations"
  on registrations for insert
  with check (true);

-- Зөвхөн админ жагсаалтыг харна, устгана
create policy "admin_read_registrations"
  on registrations for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn');

create policy "admin_delete_registrations"
  on registrations for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn');


-- -------------------------------------------------------------
-- 3) booth_requests — талбай захиалгын хүсэлтүүд
--    Урьд нь: select/update/delete нээлттэй байсан бол одоо
--    зөвхөн өргөдөл гаргах (insert) нийтэд нээлттэй,
--    үлдсэнийг зөвхөн админ хийнэ.
-- -------------------------------------------------------------
alter table if exists booth_requests enable row level security;

drop policy if exists "public_insert_booth_requests" on booth_requests;
drop policy if exists "public_select_booth_requests" on booth_requests;
drop policy if exists "public_update_booth_requests" on booth_requests;
drop policy if exists "public_delete_booth_requests" on booth_requests;
drop policy if exists "Enable insert for all users" on booth_requests;
drop policy if exists "Enable read access for all users" on booth_requests;
drop policy if exists "Enable update for all users" on booth_requests;
drop policy if exists "Enable delete for all users" on booth_requests;

-- Талбай захиалах хүсэлт хэн ч илгээж болно
create policy "public_insert_booth_requests"
  on booth_requests for insert
  with check (true);

-- Зөвхөн админ хүсэлтийн жагсаалтыг харна
create policy "admin_select_booth_requests"
  on booth_requests for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn');

-- Зөвхөн админ статус/төлбөр шинэчилнэ
create policy "admin_update_booth_requests"
  on booth_requests for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn')
  with check (auth.jwt() ->> 'email' = 'info@barilga.mn');

-- Зөвхөн админ устгана
create policy "admin_delete_booth_requests"
  on booth_requests for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn');


-- -------------------------------------------------------------
-- 4) booth_status — талбайн захиалгын төлөв (А1, B2 гэх мэт)
--    Нийтэд харуулах ёстой (захиалагдсан эсэхийг шалгах),
--    харин зөвхөн админ шинэчилнэ.
-- -------------------------------------------------------------
alter table if exists booth_status enable row level security;

drop policy if exists "public_select_booth_status" on booth_status;
drop policy if exists "public_write_booth_status" on booth_status;
drop policy if exists "public_upsert_booth_status" on booth_status;
drop policy if exists "Enable read access for all users" on booth_status;

create policy "public_select_booth_status"
  on booth_status for select
  using (true);

create policy "admin_insert_booth_status"
  on booth_status for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'info@barilga.mn');

create policy "admin_update_booth_status"
  on booth_status for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn')
  with check (auth.jwt() ->> 'email' = 'info@barilga.mn');

create policy "admin_delete_booth_status"
  on booth_status for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'info@barilga.mn');

-- =============================================================
-- ШАЛГАХ: ажиллуулсны дараа дараах query-г Logged out (anon)
-- session-оос турших:
--   update site_data set data = '{}' where id = 'config';
--   -> "new row violates row-level security policy" гэж буцах ёстой
-- =============================================================
