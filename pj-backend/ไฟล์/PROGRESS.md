# ความคืบหน้า Backend — 29 กันยายน 2026

ขอบเขตเอกสารนี้คือโฟลเดอร์ `pj-backend` เท่านั้น ไม่รวม Frontend หรือระบบ A*

## สถานะปัจจุบัน

| ส่วน | สถานะ |
|---|---|
| Express API | มี route ระบบ, Auth, Buildings, Floors, Places และ Place Keywords |
| Database schema | มี 5 ตาราง: `users`, `buildings`, `floors`, `places`, `place_keywords` |
| Places | อ่าน เพิ่ม แก้ ลบ ค้นชื่อ/เลขห้อง/keyword และกรองอาคาร ชั้น ประเภทได้ |
| Place Types | มีรายการค่าที่ API ยอมรับ 11 ประเภท; ใช้ `null` ได้เมื่อยังไม่ทราบ |
| Place Keywords | อ่าน เพิ่ม ลบ และใช้ค้นหาสถานที่ได้ |
| ข้อมูลแผนที่ | มีชุดข้อมูลอาคาร 30 ปี ชั้น 4–7 รวม 78 สถานที่ |
| Map import | preview ได้โดยไม่ต่อ DB และใช้ `--apply` เพื่อนำเข้าแบบ transaction |
| Bruno | มีคำขอสำหรับ Buildings, Floors, Places, Map Verification และ Place Keywords |
| Authentication | มี CPE OAuth login, callback, Bearer session และ `/auth/me` |
| Role | มี `USER`/`ADMIN`/`DEVELOPER` และ route ตรวจ role; Guest คือผู้ที่ไม่ login |
| Navigation / A* | ยังไม่ได้พัฒนาใน `pj-backend` และยังไม่มีพิกัดนำทางใน schema |

## งานที่มีอยู่ในโค้ดแล้ว

- `db/schema.ts` ประกาศตารางและความสัมพันธ์ปัจจุบัน
- `db/place-types.ts` กำหนดประเภทสถานที่ที่ API รับ
- migration `0002` เพิ่ม `places.place_type`
- migration `0003` เพิ่มตาราง `place_keywords`
- `Places.route.ts` รับ ส่ง และกรอง `place_type` รวมถึงค้นจาก keyword
- `db/data/building30.ts` เก็บข้อมูลสถานที่จากแผนที่อาคาร 30 ปี
- `db/seed-maps.ts` นำเข้าตามลำดับอาคาร → ชั้น → สถานที่โดยไม่ล้างข้อมูลเดิม
- Bruno มี Map Verification 9 คำขอ และ Place Keywords 4 คำขอ
- migration `0004` เพิ่มตาราง `users` สำหรับ CPE OAuth และ role
- `src/auth/` จัดการ config, OAuth state, session token และ middleware
- `src/routes/auth/Auth.route.ts` มี login, callback, me และ admin-check

## ชุดข้อมูลอาคาร 30 ปี

| ชั้น | แหล่งอ้างอิง | จำนวนรายการ |
|---:|---|---:|
| 4 | `2028-4th-floor.pdf` | 21 |
| 5 | `2028-5th-floor.pdf` | 23 |
| 6 | `2028-6th-floor-v2.pdf` | 22 |
| 7 | `IMG_5880.jpg` | 12 |
| **รวม** | | **78** |

จำนวนนี้รวมโถงลิฟต์ ห้องน้ำ และบันได ไม่ใช่จำนวนห้องทั้งหมดในอาคาร
ห้อง 712 เป็นรายการเดียวที่ `place_type` ยังเป็น `null`
ระบบยังไม่มีพิกัด ประตู กำแพง หรือเส้นทางเดิน
รายละเอียดข้อจำกัดอยู่ใน `db/data/README.md`

## ผลตรวจล่าสุด

- `./node_modules/.bin/tsc --noEmit` ผ่านเมื่อวันที่ 23 กันยายน 2026
- โค้ด route, schema, migration และเอกสารทั้ง 4 ไฟล์ถูกเทียบกันแล้ว
- การตรวจฐานข้อมูลจริงต้องให้ PostgreSQL ทำงานและใช้ `.env` ที่ถูกต้อง
- การทดสอบก่อนหน้าพบว่าสามารถ migrate, นำเข้า 1 อาคาร 4 ชั้น 78 สถานที่
  และเรียก `/health/database` ได้
- เคยทดสอบการเพิ่ม ค้น และลบ keyword ชั่วคราวสำเร็จ แต่ยังไม่ได้ยืนยันว่า
  Bruno ทุกคำขอผ่านพร้อมกันในฐานข้อมูลปัจจุบัน

## วิธีเปิดระบบและตรวจงาน

รันจากโฟลเดอร์ `pj-backend` ทีละคำสั่ง:

```bash
docker compose up -d postgres
docker compose ps
pnpm db:migrate
pnpm seed:maps --apply
pnpm dev
```

จากนั้นตรวจ:

```http
GET http://localhost:3000/
GET http://localhost:3000/health/database
GET http://localhost:3000/places?floor=7&search=701
GET http://localhost:3000/auth/login
```

ใน Bruno ให้เลือก collection `pj-backend/bruno` และ environment `Local`:

1. รัน Map Verification ตามลำดับ 01–09
2. รายการ 01–08 ควรได้ `200`; รายการ 09 ตั้งใจทดสอบข้อมูลผิดและควรได้ `400`
3. รัน Place Keywords 01–04 หลัง request 07 กำหนด `mapPlaceId` แล้ว
4. คำขอ Create, Update และ Delete เขียนข้อมูลจริง ควรใช้ฐานข้อมูลทดสอบ

`pnpm seed:maps` แสดง preview เท่านั้น ส่วน `pnpm seed` ล้างข้อมูลอาคาร ชั้น
และสถานที่ก่อนใส่ข้อมูลตัวอย่าง 601–603 จึงไม่ควรใช้กับฐานข้อมูลที่ต้องเก็บไว้

## งานถัดไป

- รัน Bruno ครบทุกคำขอกับฐานข้อมูลปัจจุบันและบันทึกผล
- ตรวจและลบข้อมูลตัวอย่าง 601–603 หากไม่ต้องการใช้
- ยืนยันพื้นที่ในแผนที่ที่ยังอ่านชื่อหรือประเภทไม่ได้
- ตกลง policy แล้วผูก `requireAuth`/`requireRole` กับ route ที่ต้องจำกัดสิทธิ์
- ออกแบบพิกัด โหนด และเส้นเชื่อมก่อนนำระบบนำทางหรือ A* เข้ามาใช้
