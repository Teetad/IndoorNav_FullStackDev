# API Specs — สถานะโค้ดปัจจุบัน

✅ = มี route แล้ว (ไม่ได้หมายความว่าผ่านการทดสอบฐานข้อมูลทุกกรณี)

⏳ = ยังไม่ได้พัฒนา

ขณะนี้ทุก route ยังไม่มีการตรวจ login หรือสิทธิ์ Admin / Dev / Owner
ป้ายสิทธิ์เหล่านี้เป็นข้อกำหนดที่จะพัฒนาต่อ ไม่ใช่สิทธิ์ที่ระบบบังคับใช้แล้ว
Base URL ใน Bruno: `{{baseUrl}}` โดย environment `Local` ใช้ `http://localhost:3001`

## System ✅

- GET `/` — ตรวจว่า Backend ทำงาน
- GET `/health/database` — ตรวจการอ่านฐานข้อมูลและจำนวนข้อมูลทั้งสามตาราง

## Buildings ✅

- GET `/buildings` — อ่านอาคารทั้งหมด
- GET `/buildings/:building_id` — อ่านอาคารตาม UUID
- POST `/buildings` — เพิ่มอาคาร
- DELETE `/buildings/:building_id` — ลบอาคาร รวมชั้นและสถานที่ภายในตามความสัมพันธ์ฐานข้อมูล

ยังไม่มี PUT สำหรับแก้ไขอาคาร

## Places ✅

- GET `/places` — อ่านสถานที่ พร้อมข้อมูลชั้นและอาคาร
- GET `/places/:place_id` — อ่านสถานที่ตาม UUID
- PUT `/places/:place_id` — แก้ไขข้อมูลสถานที่บางฟิลด์ได้
- POST `/places` — เพิ่มสถานที่ โดยต้องมี `floor_id` และ `place_name`
- DELETE `/places/:place_id` — ลบสถานที่
- GET `/places/:place_id/keywords` — อ่านคำค้นของสถานที่
- POST `/places/:place_id/keywords` — เพิ่มคำค้น โดยส่ง `{ "keyword": "..." }`
- DELETE `/places/:place_id/keywords/:keyword_id` — ลบคำค้น

GET `/places` ใช้ query ร่วมกันได้:

| Query | ความหมาย |
|---|---|
| `search` | ค้นบางส่วนของชื่อ เลขห้อง หรือคำค้น ไม่แยกตัวพิมพ์ใหญ่–เล็ก |
| `floor` | เลขชั้น เช่น 7 ไม่ใช่ floor_id |
| `building_id` | UUID ของอาคาร |
| `place_type` | ประเภทสถานที่ตาม `db/place-types.ts` เช่น `classroom`, `laboratory` |

ตัวอย่างค้นหาห้อง 701 ในชั้น 7:

```http
GET {{baseUrl}}/places?floor=7&search=701
```

`POST /places` และ `PUT /places/:place_id` รับ `place_type` เป็นค่าจากรายการใน
`db/place-types.ts` หรือ `null` เมื่อยังไม่ทราบประเภท; `GET` คืนฟิลด์นี้ด้วย
คำค้นยาวได้ 1–100 ตัวอักษร ตัดช่องว่างหัวท้ายและเก็บเป็นตัวพิมพ์เล็ก
หากคำค้นซ้ำในสถานที่เดียวกัน API ตอบ 409

## Floors ✅

- GET `/floors` — อ่านชั้นทั้งหมด หรือกรองด้วย `?building_id=<UUID>`
- GET `/floors/:building_id/:floor_number` — อ่านชั้นตามอาคารและเลขชั้น
- PUT `/floors/:floor_id` — แก้เลขชั้นหรือภาพผังชั้น โดยใช้ UUID ของชั้น
- POST `/floors` — เพิ่มชั้น โดยต้องมี `building_id` และ `floor_number`
- DELETE `/floors/:floor_id` — ลบชั้นและสถานที่ภายใน โดยใช้ UUID ของชั้น

ปัจจุบันไม่มี GET / PUT / DELETE `/floors/:floor_number` ตามสเปกที่เสนอ
การอ่านต้องระบุอาคารด้วย เพราะหลายอาคารมีเลขชั้นเดียวกันได้

## ส่วนที่ยังไม่ได้พัฒนา ⏳

| ส่วน | Endpoint ที่วางแผนไว้ |
|---|---|
| Authentication | POST `/auth/login`, GET `/auth/me` |
| Reviews | GET / POST `/reviews/:place_id`, PUT / DELETE `/reviews/:review_id` |
| Review Likes | POST / DELETE `/reviews/:review_id/like` |
| Favorites | GET `/favorites`, POST / DELETE `/favorites/:place_id` |
| Reports | POST `/reports`, GET `/reports/me`, PUT / DELETE `/reports/:report_id`, GET `/reports`, PUT `/reports/:report_id/status` |
| Navigation | GET `/navigation/:place_id` |
| Navigation Nodes | POST `/navigation/nodes`, PUT / DELETE `/navigation/nodes/:node_id` |
| Navigation Edges | POST `/navigation/edges`, PUT / DELETE `/navigation/edges/:edge_id` |

รายการนี้เป็นแผน ยังเรียกใช้งานใน `pj-backend` ไม่ได้ และยังไม่ได้เชื่อม CMU Account
ตามแผนไม่มี API สร้าง แก้ไข หรือลบบัญชี CMU
ฟังก์ชันที่อ้างอิงบัญชี เช่น `/auth/me`, Favorites, Like และการตรวจ Owner ต้องยืนยันตัวตน
จึงไม่ควรระบุว่า Guest ใช้ได้เหมือนผู้ใช้ที่เข้าสู่ระบบแล้ว

## HTTP Status

- `200` — อ่าน แก้ไข หรือลบสำเร็จ
- `201` — เพิ่มสำเร็จ
- `400` — ข้อมูลหรือรูปแบบ UUID ไม่ถูกต้อง
- `404` — ไม่พบข้อมูลหรือ route
- `409` — ชื่ออาคารหรือเลขชั้นในอาคารเดียวกันซ้ำ
- `500` — เกิดข้อผิดพลาด เช่น เชื่อมฐานข้อมูลไม่ได้

ปัจจุบันยังไม่มีการตอบ 401 / 403 จากระบบตรวจสิทธิ์ เพราะยังไม่ได้พัฒนาส่วนนี้
