# ความคืบหน้า Backend — 5 ตุลาคม 2026

ขอบเขตเอกสารนี้คือโฟลเดอร์ `pj-backend` เท่านั้น ไม่รวม Frontend หรือระบบ A*

## สถานะปัจจุบัน

| ส่วน | สถานะ |
|---|---|
| Express API | มี route ระบบ, Auth, Places, Favorites, Reviews, Likes และ Reports |
| Database schema | มี 10 ตาราง รวม `reviews`, `review_likes` และ `reports` |
| Places | อ่าน เพิ่ม แก้ ลบ ค้นชื่อ/เลขห้อง/keyword และกรองอาคาร ชั้น ประเภทได้ |
| Place Types | มีรายการค่าที่ API ยอมรับ 11 ประเภท; ใช้ `null` ได้เมื่อยังไม่ทราบ |
| Place Keywords | อ่าน เพิ่ม ลบ และใช้ค้นหาสถานที่ได้ |
| Favorites | ผู้ใช้ที่ login เพิ่ม อ่าน และลบ Favorite ของตัวเองได้ |
| Reviews | อ่าน เพิ่ม แก้ ลบ และตรวจเจ้าของรีวิวได้ |
| Review Likes | กด Like และยกเลิก Like โดยป้องกันการกดซ้ำได้ |
| Reports | User แจ้งและดูปัญหาของตัวเอง ส่วน Admin ดูทั้งหมดและเปลี่ยนสถานะได้ |
| ข้อมูลแผนที่ | มีชุดข้อมูลอาคาร 30 ปี ชั้น 4–7 รวม 78 สถานที่ |
| Map import | preview ได้โดยไม่ต่อ DB และใช้ `--apply` เพื่อนำเข้าแบบ transaction |
| Bruno | มีคำขอสำหรับ Buildings, Floors, Places, Map Verification, Keywords, Images, Role และ Favorites |
| Authentication | มี CPE OAuth, HttpOnly session cookie, Bearer token, `/auth/me` และ logout |
| Role | route เพิ่ม แก้ และลบข้อมูลตรวจ `USER`/`ADMIN`/`DEVELOPER` แล้ว |
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
- route ที่แก้ข้อมูลใช้ `requireAuth` และ `requireRole` จำกัดสิทธิ์แล้ว
- Bruno มีชุด Role Permissions สำหรับเช็ก Guest และ USER
- OAuth callback เก็บ session cookie และกลับไปหน้า Frontend แล้ว
- ใช้ `/auth/login?mode=json` เมื่อต้องการ Bearer token สำหรับ Bruno
- migration `0005` เพิ่มตาราง `place_images` และมี API เพิ่ม อ่าน ลบ URL รูป
- migration `0006` เพิ่มตาราง `favorites` และมี API เพิ่ม อ่าน ลบ Favorite ของผู้ใช้
- migration `0007` เพิ่มตาราง `reviews` และ `review_likes`
- migration `0008` เพิ่มตาราง `reports`

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

- `pnpm build` ผ่านเมื่อวันที่ 5 ตุลาคม 2026
- โค้ด route, schema, migration และเอกสารทั้ง 4 ไฟล์ถูกเทียบกันแล้ว
- รัน Bruno ครบ 79 คำขอแล้ว ทั้ง Auth, Role, Buildings, Floors, Places,
  Map Verification และ Place Keywords
- ทดสอบ session cookie, logout และกรณีไม่มี session ผ่านครบ 3 คำขอ
- ทดสอบเพิ่ม อ่าน และลบ URL รูปสถานที่ผ่านครบ 3 คำขอ
- ทดสอบ Favorites ผ่านครบ 6 คำขอ รวมกรณีไม่ login, กดซ้ำ และไม่พบข้อมูล
- ทดสอบ Reviews และ Review Likes ผ่านครบ 10 คำขอ
- ทดสอบ Reports และสิทธิ์ USER/ADMIN ผ่านครบ 8 คำขอ
- หลังจบการทดสอบ `/health/database` ยังมี 2 อาคาร 4 ชั้น 78 สถานที่ และ 1 ผู้ใช้
- แก้ `seedFloorId` และ `seedPlaceId` ใน environment `Local` ให้ตรงกับข้อมูลแผนที่

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
5. ใช้ token ของ Developer กับ Buildings/Floors/Places และ token ของ Admin กับ Keywords

`pnpm seed:maps` แสดง preview เท่านั้น และ `pnpm seed:maps --apply` ใช้นำข้อมูลลงฐานข้อมูล
คำสั่ง `pnpm seed` และข้อมูลตัวอย่าง 601–603 ถูกลบแล้ว เพราะไม่ตรงกับแผนที่จริง

## งานถัดไป

### ทำต่อก่อน

- ทำหน้า `/auth/callback` ฝั่ง Frontendให้เรียก `/auth/me` และเก็บข้อมูล User ใน state

### ข้อมูลห้อง

- เช็กห้องที่ยังไม่รู้ชื่อหรือประเภท เช่น ห้อง 712 และห้องอาจารย์บางห้อง
- หารูปหรือถ่ายรูปห้องชั้น 4–7
- นำรูปจริงไปเก็บในที่ที่ Frontend เปิดได้ แล้วเพิ่ม URL ผ่าน Place Images API
- เพิ่มเวลาเปิด สถานะห้อง และขนาดห้อง

### Navigation ทำทีหลัง

- เก็บพิกัดและออกแบบ Nodes/Edges
- กำหนดจุดเริ่มที่ประตูหลักและหน้าลิฟต์
- ค่อยนำ A* มาใช้หลังข้อมูลแผนที่พร้อม
