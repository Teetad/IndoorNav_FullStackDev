# API Specs — สถานะปัจจุบันของ `pj-backend`

เอกสารนี้อ้างอิง route ที่ลงทะเบียนใน `src/index.ts` และโค้ดใน
`src/routes/` ณ วันที่ 5 ตุลาคม 2026

- Base URL สำหรับพัฒนาในเครื่อง: `http://localhost:3000`
- Bruno ใช้ตัวแปร `{{baseUrl}}` จาก environment `Local`
- มี CPE OAuth login, session token และการตรวจ role ใน route ที่แก้ข้อมูล
- request และ response ใช้ JSON ยกเว้น endpoint ที่ไม่มี body

## System

| Method | Endpoint | ผลลัพธ์เมื่อสำเร็จ |
|---|---|---|
| GET | `/` | ข้อความยืนยันว่า Backend ทำงาน (`200`) |
| GET | `/health/database` | จำนวนข้อมูลใน `buildings`, `floors`, `places`, `users` (`200`) |

`/health/database` ตอบ `500` เมื่ออ่านฐานข้อมูลไม่ได้ และยังไม่นับ
`place_keywords` ใน `tableCounts`

## Authentication

| Method | Endpoint | รายละเอียด |
|---|---|---|
| GET | `/auth/login` | สร้าง OAuth state cookie แล้ว redirect ไปหน้า CPE OAuth |
| GET | `/auth/callback` | บันทึก User, สร้าง session cookie และกลับไปหน้า Frontend |
| GET | `/auth/me` | อ่านผู้ใช้ปัจจุบันจาก cookie หรือ Bearer token |
| POST | `/auth/logout` | ลบ session cookie |
| GET | `/auth/admin-check` | ตรวจ Bearer token และ role `ADMIN` |
| GET | `/auth/developer-check` | ตรวจ Bearer token และ role `DEVELOPER` |

Callback ที่ลงทะเบียนคือ `http://localhost:3000/auth/callback` Session token มีอายุ
8 ชั่วโมง ผู้ใช้ใหม่ได้ role `USER`; email ใน `ADMIN_EMAILS` ได้ `ADMIN` และ email ใน
`DEVELOPER_EMAILS` ได้ `DEVELOPER` ส่วน Guest คือผู้ที่ไม่ได้ login จึงไม่มีแถวในตาราง
ค่า OAuth secret และ `JWT_SECRET` ต้องอยู่ใน `.env` และห้าม commit

ตัวอย่างเรียก `/auth/me`:

```http
Authorization: Bearer <token จาก /auth/callback>
```

Frontend ให้เรียก API ด้วย `credentials: "include"` เพื่อส่ง session cookie
ส่วน Bruno ขอ Bearer token ได้จาก `/auth/login?mode=json`

## Buildings

| Method | Endpoint | รายละเอียด |
|---|---|---|
| GET | `/buildings` | อ่านอาคารทั้งหมด |
| GET | `/buildings/:building_id` | อ่านอาคารตาม UUID |
| POST | `/buildings` | Developer เพิ่มอาคาร |
| DELETE | `/buildings/:building_id` | Developer ลบอาคาร รวมข้อมูลด้านล่างตาม foreign key |

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
| POST | `/floors` | Developer เพิ่มชั้น |
| PUT | `/floors/:floor_id` | Developer แก้เลขชั้นหรือ URL รูปผังชั้น |
| DELETE | `/floors/:floor_id` | Developer ลบชั้น รวมสถานที่และคำค้นด้านล่าง |

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
| POST | `/places` | Developer เพิ่มสถานที่ |
| PUT | `/places/:place_id` | Admin หรือ Developer แก้ข้อมูลสถานที่ |
| DELETE | `/places/:place_id` | Developer ลบสถานที่และคำค้นของสถานที่ |

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
- Admin แก้ได้เฉพาะ `place_name`, `description`, `image_url`
- Developer แก้ข้อมูลสถานที่ได้ทุกฟิลด์ที่ API รองรับ
- `favCount` ส่งกลับใน JSON แต่ API ปัจจุบันยังไม่รับฟิลด์นี้ใน `POST` หรือ `PUT`

## Place Keywords

| Method | Endpoint | รายละเอียด |
|---|---|---|
| GET | `/places/:place_id/keywords` | อ่านคำค้นของสถานที่ |
| POST | `/places/:place_id/keywords` | Admin เพิ่มคำค้น |
| DELETE | `/places/:place_id/keywords/:keyword_id` | Admin ลบคำค้น |

Body สำหรับเพิ่มคำค้น:

```json
{ "keyword": "AS Lab" }
```

API ตัดช่องว่างหัวท้าย แปลงเป็นตัวพิมพ์เล็ก และรับความยาว 1–100 ตัวอักษร
คำค้นเดียวกันห้ามซ้ำภายในสถานที่เดียวกัน และจะตอบ `409` เมื่อซ้ำ

## Place Images

| Method | Endpoint | รายละเอียด |
|---|---|---|
| GET | `/places/:place_id/images` | อ่าน URL รูปทั้งหมด เรียงตาม `display_order` |
| POST | `/places/:place_id/images` | Admin เพิ่ม URL รูป |
| DELETE | `/places/:place_id/images/:image_id` | Admin ลบรูป |

Body สำหรับเพิ่มรูป:

```json
{
  "image_url": "https://example.com/room-701-1.jpg",
  "caption": "หน้าห้อง 701",
  "display_order": 1
}
```

API นี้เก็บ URL ของรูป ยังไม่ได้รับไฟล์รูปภาพโดยตรง

## HTTP Status ที่ใช้อยู่

| Status | ความหมายในโค้ดปัจจุบัน |
|---:|---|
| 200 | อ่าน แก้ไข หรือลบสำเร็จ |
| 201 | เพิ่มข้อมูลสำเร็จ |
| 400 | UUID, query, body หรือค่าประเภทไม่ถูกต้อง |
| 404 | ไม่พบข้อมูลหรือไม่พบ route |
| 409 | ชื่ออาคาร เลขชั้น หรือ keyword ซ้ำตาม unique constraint |
| 401 | ไม่มี session token หรือ token ไม่ถูกต้อง/หมดอายุ |
| 403 | login แล้วแต่ role ไม่มีสิทธิ์เรียก endpoint |
| 500 | เกิดข้อผิดพลาดภายในหรือเชื่อม/อ่านฐานข้อมูลไม่ได้ |
| 502 | แลก OAuth token หรืออ่าน userinfo ไม่สำเร็จ |
| 503 | ยังตั้งค่า OAuth environment ไม่ครบ |

## API ที่ยังไม่มี

- Reviews และ Review Likes
- Favorites ของแต่ละ User ตอนนี้มีแค่ `fav_count` ของเดิม
- Reports, My Reports และการแก้สถานะ Report
- Navigation, Navigation Nodes และ Navigation Edges
- API อัปโหลดไฟล์รูปภาพไปยังที่เก็บไฟล์
- API เวลาเปิด สถานะห้อง และขนาดห้อง

รายการพวกนี้ยังเรียกใช้ใน `pj-backend` ไม่ได้

การอ่านและค้นหาข้อมูลยังเป็น public ส่วนการเพิ่ม แก้ และลบจะตรวจ Bearer token
และ role ตามที่ระบุในตารางด้านบน

การ login ปกติจะกลับไป `${FRONTEND_URL}/auth/callback` ส่วน `mode=json`
ใช้สำหรับทดสอบ Backend และไม่ควรใช้เป็นขั้นตอน login ของ Frontend
