-- documents bucket-д upload/read зөвшөөрөх
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set public = true;

-- Нийтийн уншлага
create policy "public_read_documents"
  on storage.objects for select
  using (bucket_id = 'documents');

-- Аny user upload хийж болно (зөвхөн booth-docs/ хавтсанд)
create policy "public_upload_documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and name like 'booth-docs/%');
