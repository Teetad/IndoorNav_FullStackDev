# API Specs — สถานะปัจจุบันของ `pj-backend`

เอกสารนี้อ้างอิง route ที่ลงทะเบียนใน `src/index.ts` และโค้ดใน
`src/routes/building/` ณ วันที่ 23 กันยายน 2026

- Base URL สำหรับพัฒนาในเครื่อง: `http://localhost:3001`
- Bruno ใช้ตัวแปร `{{baseUrl}}` จาก environment `Local`
- ทุก endpoint ยังไม่มีระบบ login หรือการตรวจสิทธิ์ Admin / User
- request และ response ใช้ JSON ยกเว้น endpoint ที่ไม่มี body

## System

| Method | Endpoint | ผลลัพธ์เมื่อสำเร็จ |
|---|---|---|
| GET | `/` | ข้อความยืนยันว่า Backend ทำงาน (`200`) |
| GET | `/health/database` | จำนวนข้อมูลใน `buildings`, `floors`, `places` (`200`) |

`/health/database` ตอบ `500` เมื่ออ่านฐานข้อมูลไม่ได้ และยังไม่นับ
`place_keywords` ใน `tableCounts`

## Buildings

| Method | Endpoint | รายละเอียด |
|---|---|---|
| GET | `/buildings` | อ่านอาคารทั้งหมด |
| GET | `/buildings/:building_id` | อ่านอาคารตาม UUID |
| POST | `/buildings` | เพิ่มอาคาร |
| DELETE | `/buildings/:building_id` | ลบอาคาร รวมชั้น สถานที่ และคำค้นด้านล่างตาม foreign key |

Body สำหรับ `POST /buildings`:

```json
{
  "building_name": "อาคาร 30 ปี",
  "description": "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่"
}
```

- `building_name` จำเป็น ความยาวไม่เกิน 120 ตัวอักษร และห้ามซ้ำ
- `description` ไม่จำเป็น ความยาวไม่เกิน 500 ตัวอักษร
- ยังไม่มี `PUT /buildings/:building_id`

## Floors

| Method | Endpoint | รายละเอียด |
|---|---|---|
| GET | `/floors` | อ่านชั้นทั้งหมด |
| GET | `/floors?building_id=<UUID>` | อ่านชั้นของอาคารหนึ่งแห่ง |
| GET | `/floors/:building_id/:floor_number` | อ่านชั้นจาก UUID อาคารและเลขชั้น |
| POST | `/floors` | เพิ่มชั้น |
| PUT | `/floors/:floor_id` | แก้เลขชั้นหรือ URL รูปผังชั้น |
| DELETE | `/floors/:floor_id` | ลบชั้น รวมสถานที่และคำค้นด้านล่าง |

Body สำหรับ `POST /floors`:

```json
{
  "building_id": "<UUID>",
  "floor_number": 7,
  "floor_plan_image": "https://example.com/floor-7.png"
}
```

- `building_id` และ `floor_number` จำเป็น
- `floor_number` ต้องเป็นจำนวนเต็มในช่วงที่ PostgreSQL `INTEGER` เก็บได้
- `floor_plan_image` ไม่จำเป็น เป็นข้อความยาวไม่เกิน 500 ตัวอักษร
- เลขชั้นห้ามซ้ำภายในอาคารเดียวกัน
- `PUT` เป็น partial update แต่ต้องส่งอย่างน้อยหนึ่งฟิลด์ระหว่าง
  `floor_number` และ `floor_plan_image`

## Places

| Method | Endpoint | รายละเอียด |
|---|---|---|
| GET | `/places` | อ่านสถานที่ พร้อมข้อมูลชั้นและอาคาร |
| GET | `/places/:place_id` | อ่านสถานที่ตาม UUID |
| POST | `/places` | เพิ่มสถานที่ |
| PUT | `/places/:place_id` | แก้ข้อมูลสถานที่แบบ partial update |
| DELETE | `/places/:place_id` | ลบสถานที่และคำค้นของสถานที่ |

Query ของ `GET /places` ใช้ร่วมกันได้:

| Query | ความหมาย |
|---|---|
| `search` | ค้นบางส่วนของชื่อ เลขห้อง หรือ keyword โดยไม่แยกตัวพิมพ์ใหญ่–เล็ก |
| `floor` | เลขชั้น เช่น `7` ไม่ใช่ `floor_id` |
| `building_id` | UUID ของอาคาร |
| `place_type` | ประเภทที่อยู่ใน `db/place-types.ts` |

ตัวอย่าง:

```http
GET {{baseUrl}}/places?building_id=<UUID>&floor=7&place_type=classroom&search=701
```

Body สำหรับ `POST /places`:

```json
{
  "floor_id": "<UUID>",
  "place_name": "ห้องเรียน 701",
  "place_type": "classroom",
  "room_number": "701",
  "description": "ห้องเรียนชั้น 7",
  "image_url": "https://example.com/room-701.jpg"
}
```

- `floor_id` และ `place_name` จำเป็น
- `place_type` ไม่จำเป็น ใช้ `null` ได้เมื่อยังไม่ทราบประเภท
- ค่าประเภทที่รับ: `classroom`, `coworking_space`, `administrative_office`,
  `laboratory`, `meeting_room`, `faculty_office`, `restroom`,
  `elevator_lobby`, `stairs`, `multipurpose_room`, `graduate_room`
- `room_number` ยาวไม่เกิน 30, `description` และ `image_url` ยาวไม่เกิน 500
- `PUT` รับฟิลด์เดียวกับ `POST` และต้องส่งอย่างน้อยหนึ่งฟิลด์ที่แก้ไขได้
- `favCount` ส่งกลับใน JSON แต่ API ปัจจุบันยังไม่รับฟิลด์นี้ใน `POST` หรือ `PUT`

## Place Keywords

| Method | Endpoint | รายละเอียด |
|---|---|---|
| GET | `/places/:place_id/keywords` | อ่านคำค้นของสถานที่ |
| POST | `/places/:place_id/keywords` | เพิ่มคำค้น |
| DELETE | `/places/:place_id/keywords/:keyword_id` | ลบคำค้นที่ตรงทั้งสถานที่และ keyword |

Body สำหรับเพิ่มคำค้น:

```json
{ "keyword": "AS Lab" }
```

API ตัดช่องว่างหัวท้าย แปลงเป็นตัวพิมพ์เล็ก และรับความยาว 1–100 ตัวอักษร
คำค้นเดียวกันห้ามซ้ำภายในสถานที่เดียวกัน และจะตอบ `409` เมื่อซ้ำ

## HTTP Status ที่ใช้อยู่

| Status | ความหมายในโค้ดปัจจุบัน |
|---:|---|
| 200 | อ่าน แก้ไข หรือลบสำเร็จ |
| 201 | เพิ่มข้อมูลสำเร็จ |
| 400 | UUID, query, body หรือค่าประเภทไม่ถูกต้อง |
| 404 | ไม่พบข้อมูลหรือไม่พบ route |
| 409 | ชื่ออาคาร เลขชั้น หรือ keyword ซ้ำตาม unique constraint |
| 500 | เกิดข้อผิดพลาดภายในหรือเชื่อม/อ่านฐานข้อมูลไม่ได้ |

ยังไม่มีการตอบ `401` หรือ `403` เพราะยังไม่มี authentication และ authorization

## API ที่ยังไม่มี

- Authentication และบัญชีผู้ใช้
- Reviews และ Review Likes
- Favorites แม้ `places` จะมีตัวนับ `fav_count`
- Reports
- Navigation, Navigation Nodes และ Navigation Edges
- API สำหรับอัปโหลดไฟล์รูปภาพ

รายการนี้เป็นงานในอนาคตและยังเรียกใช้ใน `pj-backend` ไม่ได้
