# ความคืบหน้า Backend — 5 ตุลาคม 2026

ขอบเขตเอกสารนี้คือโฟลเดอร์ `pj-backend` เท่านั้น ไม่รวม Frontend หรือระบบ A*

## สถานะปัจจุบัน

| ส่วน | สถานะ |
|---|---|
| Express API | มี route ระบบ, Auth, Places, Favorites, Reviews, Likes และ Reports |
| Database schema | มี 10 ตาราง รวม `reviews`, `review_likes` และ `reports` |
| Places | อ่าน เพิ่ม แก้ ลบ ค้น และกรองอาคาร ชั้น ประเภทหรือสถานะห้องได้ |
| ข้อมูลห้อง | มีสถานะ ความจุ และเวลาเปิดปิด; ใช้ `UNKNOWN`/`null` เมื่อยังไม่มีข้อมูลจริง |
| Place Types | มีรายการค่าที่ API ยอมรับ 12 ประเภท รวม `shop`; ใช้ `null` ได้เมื่อยังไม่ทราบ |
| Place Keywords | อ่าน เพิ่ม ลบ และใช้ค้นหาสถานที่ได้ |
| Favorites | ผู้ใช้ที่ login เพิ่ม อ่าน และลบ Favorite ของตัวเองได้ |
| Reviews | อ่าน เพิ่ม แก้ ลบ และตรวจเจ้าของรีวิวได้ |
| Review Likes | กด Like และยกเลิก Like โดยป้องกันการกดซ้ำได้ |
| Reports | User แจ้งและดูปัญหาของตัวเอง ส่วน Admin ดูทั้งหมดและเปลี่ยนสถานะได้ |
| ข้อมูลแผนที่ | มีชุดข้อมูลอาคาร 30 ปี ชั้น 4–7 รวม 81 สถานที่ |
| ร้านค้าห้อง 422 | ร้านค้าของสาขาวิศวกรรมคอมพิวเตอร์ อยู่บริเวณฝั่ง ป.ตรี ชั้น 4 |
| ธุรการ CPE | อยู่ชั้น 6 เปิดจันทร์–ศุกร์ 08:30–16:30 และมีข้อมูลติดต่อแล้ว |
| ห้องอาจารย์ | ใช้เวลา 08:30–16:30 เป็นเวลาอ้างอิงตามเวลาทำการภาควิชา |
| ห้อง 700 | ความจุ 40 ที่นั่ง เวลา 08:00–22:00 และมีรูปจริง 5 รูป |
| ห้อง 701 | ความจุ 56 ที่นั่ง เวลา 08:00–22:00 และมีรูปจริง 5 รูป |
| ห้อง 702 | ความจุ 56 ที่นั่ง เวลา 08:00–22:00 และมีรูปจริง 5 รูป |
| ห้อง 711 | ความจุ 100 ที่นั่ง เวลา 08:00–22:00 และมีรูปจริง 5 รูป |
| ห้อง 712 | ความจุ 24 ที่นั่ง เวลา 08:00–22:00 และมีรูปจริง 5 รูป |
| ห้อง 713 | ความจุ 40 ที่นั่ง เวลา 08:00–22:00 และมีรูปจริง 5 รูป |
| ห้อง 718 | ความจุ 80 ที่นั่ง เวลา 08:00–22:00 และมีรูปจริง 5 รูป |
| ห้อง 719 | ความจุ 80 ที่นั่ง เวลา 08:00–22:00 และมีรูปจริง 5 รูป |
| ห้อง 720 | ความจุ 80 ที่นั่ง เวลา 08:00–22:00 และมีรูปจริง 5 รูป |
| รูปห้องชั้น 7 | รูป 45 รูปถูกผูกกับ 9 ห้องใน `place_images` ผ่าน seed แล้ว |
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
- migration `0009` เพิ่ม `room_status`, `capacity`, `opening_time` และ `closing_time`
- `db/room-statuses.ts` เก็บรายการสถานะห้องที่ API ยอมรับ
- Places API รับ ส่ง แก้ และกรองสถานะห้อง พร้อมตรวจความจุและรูปแบบเวลา
- Backend เปิดรูปใน `public/images` ผ่าน URL `/images/...`
- รูปสถานที่แยกเป็นโฟลเดอร์ `floor-4` ถึง `floor-7` และเตรียมชื่อไฟล์จุดสังเกตไว้แล้ว
- `seed-maps.ts` เพิ่ม URL รูปห้องชั้น 7 ลง `place_images` และรันซ้ำโดยไม่สร้างรูปซ้ำ

## ชุดข้อมูลอาคาร 30 ปี

| ชั้น | แหล่งอ้างอิง | จำนวนรายการ |
|---:|---|---:|
| 4 | `ที่มา/2028-4th-floor.pdf` | 22 |
| 5 | `ที่มา/2028-5th-floor.pdf` | 23 |
| 6 | `ที่มา/2028-6th-floor-v2.pdf` | 23 |
| 7 | `ที่มา/IMG_5880.jpg` | 13 |
| **รวม** | | **81** |

จำนวนนี้รวมโถงลิฟต์ ห้องน้ำ และบันได ไม่ใช่จำนวนห้องทั้งหมดในอาคาร
ห้อง 712 ยืนยันแล้วว่าเป็นห้องเรียน
ระบบยังไม่มีพิกัด ประตู กำแพง หรือเส้นทางเดิน
รายละเอียดข้อจำกัดอยู่ใน `db/data/README.md`

## ผลตรวจล่าสุด

- `pnpm build` ผ่านเมื่อวันที่ 5 ตุลาคม 2026
- โค้ด route, schema, migration และเอกสารทั้ง 4 ไฟล์ถูกเทียบกันแล้ว
- รัน Bruno ครบ 98 คำขอและผ่านทั้งหมด ทั้ง Auth, Role, Buildings, Floors, Places,
  Map Verification และ Place Keywords
- ทดสอบ session cookie, logout และกรณีไม่มี session ผ่านครบ 3 คำขอ
- ทดสอบเพิ่ม อ่าน และลบ URL รูปสถานที่ผ่านครบ 3 คำขอ
- ทดสอบ Favorites ผ่านครบ 6 คำขอ รวมกรณีไม่ login, กดซ้ำ และไม่พบข้อมูล
- ทดสอบ Reviews และ Review Likes ผ่านครบ 10 คำขอ
- ทดสอบ Reports และสิทธิ์ USER/ADMIN ผ่านครบ 8 คำขอ
- ทดสอบสิทธิ์แบบละเอียดผ่านครบ 11 คำขอ รวมเจ้าของ Review, ADMIN,
  DEVELOPER, UUID/body ผิด และ token ไม่ถูกต้อง
- ทดสอบข้อมูลห้องผ่านครบ 8 คำขอ รวมเพิ่ม แก้ กรอง ตรวจค่าผิด รับ `null`
  และตรวจว่าห้อง 702 มีรูปจาก seed ครบ 5 รูป
- ทดสอบ seed รอบแรกเพิ่มรูป 45 แถว และรอบที่สองเพิ่ม 0 แถว จึงไม่มีรูปซ้ำ
- ฐานข้อมูลหลังรัน seed มีข้อมูลแผนที่ 4 ชั้น รวม 81 สถานที่
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

- เช็กชื่อจริงของห้องอาจารย์ที่ตอนนี้ยังใช้เลขจุดจากแผนที่
- หารูปหรือถ่ายรูปเฉพาะห้องและสถานที่สำคัญของชั้น 4–6
- ไม่ต้องถ่ายโถงลิฟต์ ห้องน้ำ และบันได เพราะใช้ Floor Plan ดูตำแหน่งได้
- สำรวจสถานะ ความจุ และเวลาเปิดปิดจริง แล้วนำมาแทนค่า `UNKNOWN`/`null`

### Navigation ทำทีหลัง

- เก็บพิกัดและออกแบบ Nodes/Edges
- กำหนดจุดเริ่มที่ประตูหลักและหน้าลิฟต์
- ค่อยนำ A* มาใช้หลังข้อมูลแผนที่พร้อม
