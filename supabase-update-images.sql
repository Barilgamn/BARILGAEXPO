-- Бүх зургийг тогтвортой, өөрийн домэйн дээр хадгалсан хувилбараар солих
-- (Photon CDN кэшээс хамаарахгүй болгох)

update site_data
set data = jsonb_set(
  jsonb_set(
    jsonb_set(
      data,
      '{logoUrl}',
      '"https://www.barilgaexpo.mn/expo-logo.png"'
    ),
    '{organizers}',
    '[
      {"id": "1", "name": "Хот Байгуулалт, Барилга, Орон Сууцжуулалтын Яам", "logo": "https://www.barilgaexpo.mn/organizer-1.jpg"},
      {"id": "2", "name": "Нийслэлийн Засаг Даргын Тамгын газар", "logo": "https://www.barilgaexpo.mn/organizer-2.png"},
      {"id": "3", "name": "Барилгын Хөгжлийн Төв", "logo": "https://www.barilgaexpo.mn/organizer-3.png"}
    ]'::jsonb
  ),
  '{gallery}',
  '[
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-2436.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-1983.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0371.jpg",
    "https://www.barilgaexpo.mn/gallery/10-1.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0383.jpg",
    "https://www.barilgaexpo.mn/gallery/2-2.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0421.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0360.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0555.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0523.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0627.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0569.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0411.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0612.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0798.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0709.jpg",
    "https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0687.jpg",
    "https://www.barilgaexpo.mn/gallery/677267349_1291051353159299_1013812053009267747_n.jpg",
    "https://www.barilgaexpo.mn/gallery/SJP_4965.jpg"
  ]'::jsonb
)
where id = 'config';

-- Шалгах
select data->'logoUrl', data->'organizers', jsonb_array_length(data->'gallery') from site_data where id = 'config';
