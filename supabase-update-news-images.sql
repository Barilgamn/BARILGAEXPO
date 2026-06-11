-- =============================================================
-- Бүх мэдээний толгой зургийг шинэ /news-header.jpg-р солино
-- (Хуучин WordPress зургийн линкүүд эвдэрсэн тул)
-- =============================================================
update site_data
set data = jsonb_set(
  data,
  '{news}',
  (
    select jsonb_agg(
      jsonb_set(item, '{image}', '"https://www.barilgaexpo.mn/news-header.jpg"')
    )
    from jsonb_array_elements(data->'news') as item
  )
)
where id = 'config';

-- Шалгах
select jsonb_path_query(data, '$.news[*].image') from site_data where id = 'config';
