-- "Талбайн мэдээлэл" цэсийг сайтын үндсэн меню рүү нэмэх
update site_data
set data = jsonb_set(
  data,
  '{menus}',
  (data->'menus') || '[{"id": "6", "labelMn": "ТАЛБАЙН МЭДЭЭЛЭЛ", "labelEn": "BOOTH INFO", "path": "/booths"}]'::jsonb
)
where id = 'config'
  and not exists (
    select 1 from jsonb_array_elements(data->'menus') m where m->>'path' = '/booths'
  );

-- Шалгах
select jsonb_pretty(data->'menus') from site_data where id = 'config';
