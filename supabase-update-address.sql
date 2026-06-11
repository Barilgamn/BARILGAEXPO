-- Сайтын footer/холбоо барих хэсэгт харагдах хаягийг шинэ хаягаар солих
-- (data.contact.address талбар)
update site_data
set data = jsonb_set(
  data,
  '{contact,address}',
  '"Улаанбаатар 13373, Баянзүрх дүүрэг, 6-р хороо, \"BARILGA.MN\" оффис"'::jsonb
)
where id = 'config';

-- Шалгах
select data->'contact'->>'address' as address from site_data where id = 'config';
