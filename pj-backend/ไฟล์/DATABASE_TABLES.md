# Database Tables — สถานะปัจจุบัน

เอกสารนี้อ้างอิง `db/schema.ts` และ migration ล่าสุด
`db/migration/0004_good_nico_minoru.sql` ณ วันที่ 29 กันยายน 2026

> Schema ในโค้ดและ schema ในฐานข้อมูลจริงเป็นคนละส่วนกัน ต้องรัน
> `pnpm db:migrate` จึงจะนำ migration ไปใช้กับฐานข้อมูลที่ระบุใน `.env`

## `users`

| คอลัมน์ | ชนิด | ข้อบังคับ |
|---|---|---|
| `user_id` | UUID | Primary Key, สร้างอัตโนมัติ |
| `oauth_subject` | VARCHAR(255) | NOT NULL, UNIQUE; รหัสผู้ใช้จาก OAuth provider |
| `email` | VARCHAR(320) | NOT NULL, UNIQUE |
| `display_name` | VARCHAR(120) | NULL ได้ |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT `USER` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT เวลาปัจจุบัน |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT เวลาปัจจุบัน |

Backend ยอมรับ role `USER`, `ADMIN` และ `DEVELOPER` ปัจจุบันฐานข้อมูลยังไม่มี
CHECK constraint สำหรับ role โดยผู้ใช้ใหม่ได้ `USER`; environment ใช้กำหนด Admin
และ Developer ส่วน Guest ไม่ถูกเก็บในตารางเพราะยังไม่ได้ login

## `buildings`

| คอลัมน์ | ชนิด | ข้อบังคับ |
|---|---|---|
| `building_id` | UUID | Primary Key, สร้างอัตโนมัติด้วย `gen_random_uuid()` |
| `building_name` | VARCHAR(120) | NOT NULL, UNIQUE |
| `description` | VARCHAR(500) | NULL ได้ |

## `floors`

| คอลัมน์ | ชนิด | ข้อบังคับ |
|---|---|---|
| `floor_id` | UUID | Primary Key, สร้างอัตโนมัติ |
| `building_id` | UUID | NOT NULL, Foreign Key → `buildings.building_id` |
| `floor_number` | INTEGER | NOT NULL |
| `floor_plan_image` | VARCHAR(500) | NULL ได้ |

Unique index `floors_building_floor_number_unique` ครอบคลุม
`(building_id, floor_number)` จึงห้ามมีเลขชั้นซ้ำในอาคารเดียวกัน

## `places`

| คอลัมน์ | ชนิด | ข้อบังคับ |
|---|---|---|
| `place_id` | UUID | Primary Key, สร้างอัตโนมัติ |
| `floor_id` | UUID | NOT NULL, Foreign Key → `floors.floor_id` |
| `place_name` | VARCHAR(120) | NOT NULL |
| `place_type` | VARCHAR(40) | NULL ได้เมื่อยังไม่ทราบประเภท |
| `room_number` | VARCHAR(30) | NULL ได้ |
| `description` | VARCHAR(500) | NULL ได้ |
| `image_url` | VARCHAR(500) | NULL ได้ |
| `fav_count` | INTEGER | NOT NULL, DEFAULT 0 |

- `fav_count` ในฐานข้อมูลถูก map เป็น `favCount` ใน TypeScript และ JSON
- `place_type` เป็นข้อความในฐานข้อมูล ส่วน API จำกัดค่าด้วย `db/place-types.ts`
- ฐานข้อมูลยังไม่มี CHECK constraint สำหรับ `place_type`
- ไม่มี unique constraint บน `place_name` หรือ `room_number`
- ยังไม่มี API Favorites แม้มี `fav_count`

## `place_keywords`

| คอลัมน์ | ชนิด | ข้อบังคับ |
|---|---|---|
| `keyword_id` | UUID | Primary Key, สร้างอัตโนมัติ |
| `place_id` | UUID | NOT NULL, Foreign Key → `places.place_id` |
| `keyword` | VARCHAR(100) | NOT NULL |

Unique index `place_keywords_place_keyword_unique` ครอบคลุม
`(place_id, keyword)` คำค้นเดียวกันจึงซ้ำในสถานที่เดียวกันไม่ได้
API เป็นส่วนที่แปลง keyword เป็นตัวพิมพ์เล็กและตัดช่องว่างก่อนบันทึก

## ความสัมพันธ์และการลบตาม

```text
buildings
└── floors
    └── places
        └── place_keywords
```

Foreign key ทุกระดับใช้ `ON DELETE CASCADE`:

- ลบอาคาร → ลบชั้น สถานที่ และคำค้นภายใน
- ลบชั้น → ลบสถานที่และคำค้นภายใน
- ลบสถานที่ → ลบคำค้นของสถานที่
- ลบคำค้น → ไม่กระทบสถานที่ ชั้น หรืออาคาร

## ลำดับ Migration

| ไฟล์ | หน้าที่ |
|---|---|
| `0000_phase1_indoor_navigation.sql` | สร้าง `buildings`, `floors`, `places` รุ่นแรกและ foreign key |
| `0001_align_phase1_design.sql` | ตัดคอลัมน์เดิมบางส่วน เพิ่มรูปผัง รูปสถานที่ และ `fav_count` |
| `0002_many_jamie_braddock.sql` | เพิ่ม `places.place_type` กลับมาเป็น VARCHAR(40) |
| `0003_gorgeous_azazel.sql` | สร้าง `place_keywords`, foreign key และ unique index |
| `0004_good_nico_minoru.sql` | สร้าง `users` สำหรับ CPE OAuth และ role |

ไม่ควรแก้ migration ที่เคยนำไปใช้แล้ว เมื่อต้องการเปลี่ยนตารางให้แก้
`db/schema.ts` แล้วสร้าง migration ลำดับใหม่ด้วย `pnpm db:generate`

## ตารางที่ยังไม่มี

Schema ปัจจุบันยังไม่มีตารางต่อไปนี้:

- Reviews และ Review Likes
- Favorites
- Reports
- Place Images สำหรับเก็บหลายรูปต่อห้อง
- Navigation Nodes และ Navigation Edges

ตอนนี้จึงยังไม่มีข้อมูล Review, Favorite ของแต่ละ User, Report, รูปหลายรูป
และพิกัดสำหรับ A*

ใน `places` มีแค่ `image_url` หนึ่งช่อง ถ้าจะใส่ 2–3 รูปต่อห้องต้องเพิ่ม
ตาราง `place_images` ส่วน `fav_count` เป็นของเดิมและยังบอกไม่ได้ว่าใคร Favorite ห้องไหน
ตอนทำ Favorite ควรเพิ่มตารางเชื่อม User กับ Place และไม่ต้องส่งจำนวน Favorite ให้หน้าแอป

เวลาเปิด สถานะห้อง และขนาดห้องก็ยังไม่มีใน schema
