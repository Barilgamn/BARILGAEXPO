-- =============================================================
-- Admin Panel-аас зураг (мэдээний толгой зураг гэх мэт) upload
-- хийх боломжтой болгох Supabase Storage bucket + policies
-- Supabase Dashboard > SQL Editor дээр ажиллуулна
-- =============================================================

-- "media" нэртэй public bucket үүсгэнэ (аль хэдийн байгаа бол алгасна)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Хэн ч (нийтэд) media bucket-ээс зураг унших боломжтой
drop policy if exists "public_read_media" on storage.objects;
create policy "public_read_media"
  on storage.objects for select
  using (bucket_id = 'media');

-- Зөвхөн админ (info@barilga.mn) media bucket-д файл байршуулна
drop policy if exists "admin_upload_media" on storage.objects;
create policy "admin_upload_media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and auth.jwt() ->> 'email' = 'info@barilga.mn');

-- Зөвхөн админ файл шинэчилнэ (upsert)
drop policy if exists "admin_update_media" on storage.objects;
create policy "admin_update_media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and auth.jwt() ->> 'email' = 'info@barilga.mn')
  with check (bucket_id = 'media' and auth.jwt() ->> 'email' = 'info@barilga.mn');

-- Зөвхөн админ файл устгана
drop policy if exists "admin_delete_media" on storage.objects;
create policy "admin_delete_media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and auth.jwt() ->> 'email' = 'info@barilga.mn');
