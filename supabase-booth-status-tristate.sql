-- booth_status хүснэгтэд "status" багана нэмэх (available | occupied | reserved)
-- Энэ нь PDF бүртгэлээс ирсэн анхны төлөвийг админ гар аргаар өөрчлөх (override) боломж олгоно.
-- Хуучин is_reserved багана хэвээр үлдэнэ (нийцтэй байх үүднээс).

alter table booth_status add column if not exists status text;
alter table booth_status add column if not exists company text;

-- Хэрэв хуучин мөрүүдэд is_reserved=true байсан бол status='occupied' болгож шилжүүлэх
update booth_status set status = 'occupied' where status is null and is_reserved = true;
update booth_status set status = 'available' where status is null and (is_reserved is null or is_reserved = false);

-- Шалгах
select id, status, company, is_reserved, updated_at from booth_status order by id;
