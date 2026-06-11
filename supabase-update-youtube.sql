-- Footer/холбоо барих хэсгийн YouTube линкийг шинэчлэх
update site_data
set data = jsonb_set(
  data,
  '{contact,youtubeUrl}',
  '"https://www.youtube.com/barilgamn"'::jsonb
)
where id = 'config';

-- Шалгах
select data->'contact'->>'youtubeUrl' as youtube from site_data where id = 'config';
