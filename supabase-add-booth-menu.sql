-- "Талбайн мэдээлэл" цэсийг сайтын үндсэн меню-нээс хасах
-- (энэ мэдээлэл одоо зөвхөн Admin Panel дотор харагдана)
update site_data
set data = jsonb_set(
  data,
  '{menus}',
  (
    select coalesce(jsonb_agg(m), '[]'::jsonb)
    from jsonb_array_elements(data->'menus') m
    where m->>'path' != '/booths'
  )
)
where id = 'config';

-- Шалгах
select jsonb_pretty(data->'menus') from site_data where id = 'config';
