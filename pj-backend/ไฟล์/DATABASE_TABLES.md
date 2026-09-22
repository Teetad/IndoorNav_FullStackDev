# Database Table

อ้างอิงโค้ด `pj-backend/db/schema.ts` ณ วันที่ 14 กันยายน 2026

✅ มีใน schema ปัจจุบัน | ⏳ เป็นแผน ยังไม่ได้สร้าง

## Buildings ✅

ชื่อตารางจริง: `buildings`

- building_id (UUID) — Primary Key, สร้างอัตโนมัติเมื่อไม่ส่ง ID
- building_name (VARCHAR(120)) — NOT NULL, UNIQUE
- description (VARCHAR(500)) — NULL ได้

## Floors ✅

ชื่อตารางจริง: `floors`

- floor_id (UUID) — Primary Key, สร้างอัตโนมัติเมื่อไม่ส่ง ID
- building_id (UUID) — NOT NULL, Foreign Key → Buildings.building_id
- floor_number (INTEGER) — NOT NULL
- floor_plan_image (VARCHAR(500)) — NULL ได้

UNIQUE (building_id, floor_number): เลขชั้นห้ามซ้ำภายในอาคารเดียวกัน

## Places ✅

ชื่อตารางจริง: `places`

- place_id (UUID) — Primary Key, สร้างอัตโนมัติเมื่อไม่ส่ง ID
- floor_id (UUID) — NOT NULL, Foreign Key → Floors.floor_id
- place_name (VARCHAR(120)) — NOT NULL
- place_type (VARCHAR(40)) — NULL ได้เมื่อยังไม่ยืนยันประเภท; ค่าที่ API รับอยู่ใน `db/place-types.ts`
- room_number (VARCHAR(30)) — NULL ได้ เช่น 413A
- description (VARCHAR(500)) — NULL ได้
- image_url (VARCHAR(500)) — NULL ได้
- fav_count (INTEGER) — NOT NULL, DEFAULT 0

`favCount` เป็นชื่อที่ใช้ใน TypeScript และ JSON; `fav_count` เป็นชื่อคอลัมน์ในฐานข้อมูล
ยังไม่มี `keyword_id` และไม่มี UNIQUE บังคับชื่อสถานที่หรือเลขห้องห้ามซ้ำ
ยังไม่มีระบบ Favorites แม้จะมีคอลัมน์เก็บจำนวนแล้ว

## Relationship Summary — ปัจจุบัน ✅

```text
Buildings
└── Floors
    └── building_id → Buildings.building_id

Floors
└── Places
    └── floor_id → Floors.floor_id
```

อาคารหนึ่งมีหลายชั้น และชั้นหนึ่งมีหลายสถานที่
Foreign Key ทั้งสองกำหนด ON DELETE CASCADE:

- ลบอาคาร → ลบชั้นและสถานที่ภายใน
- ลบชั้น → ลบสถานที่ภายใน
- ลบสถานที่ → ไม่ลบชั้นหรืออาคาร

## Routes — ปัจจุบัน ✅

```text
src/routes/
└── building/
    ├── Buildings.route.ts
    ├── Floors.route.ts
    └── Places.route.ts
```

[src/index.ts](../src/index.ts) ลงทะเบียน `/buildings`, `/floors` และ `/places`
รายละเอียด endpoint อยู่ใน [API_SPECS.md](API_SPECS.md)
ยังไม่มี `/admin`, `/user`, `/row` หรือโฟลเดอร์ navigation, interaction และ search

## ตารางตามแผน — ยังไม่ได้สร้าง ⏳

| ตาราง | หน้าที่ตามร่างเดิม |
|---|---|
| Users | ข้อมูลผู้ใช้ CMU และบทบาท USER / ADMIN |
| Place_Keywords | คำค้นของสถานที่ |
| Reviews | รีวิวสถานที่ |
| Review_Likes | การกดถูกใจรีวิว |
| Favorites | สถานที่โปรดของผู้ใช้ |
| Reports | รายงานปัญหาและสถานะ |
| Navigation_Nodes | จุดและพิกัดสำหรับนำทาง |
| Navigation_Edges | ทางเชื่อมระหว่างจุด |

ตารางเหล่านี้ยังไม่มีใน [schema.ts](../db/schema.ts)
ฟิลด์จากร่างเดิม เช่น cmu_email, role, isReview, isFav, updated_at,
category (แยกจาก `place_type`) และ status ยังไม่ใช่โครงสร้างที่โค้ดประกาศไว้
จึงต้องกำหนดชนิดข้อมูล ค่า ENUM และข้อบังคับก่อนพัฒนา

## Relationship Summary — ตามแผนเท่านั้น ⏳

```text
Floors
└── Navigation_Nodes (floor_id)

Places
├── Reviews (place_id)
├── Favorites (place_id)
├── Reports (place_id)
└── Place_Keywords (place_id)

Users
├── Reviews (user_id)
├── Favorites (user_id)
├── Reports (user_id)
└── Review_Likes (user_id)

Reviews
└── Review_Likes (review_id)

Navigation_Nodes
└── Navigation_Edges
    ├── from_node_id → Navigation_Nodes.node_id
    └── to_node_id   → Navigation_Nodes.node_id
```

Node คือจุด ส่วน Edge คือทางเชื่อม โดย from_node_id เป็นจุดเริ่มและ to_node_id เป็นจุดปลาย
ทั้งสองอ้างอิงตาราง Nodes เดียวกัน ความสัมพันธ์ส่วนนี้ยังไม่ได้สร้างในโค้ด

เอกสารนี้อ้างอิง schema ในไฟล์ ไม่ได้ยืนยันสถานะ migration ของฐานข้อมูลที่กำลังรัน
