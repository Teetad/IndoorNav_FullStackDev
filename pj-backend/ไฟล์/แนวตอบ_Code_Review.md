# แนวตอบ Code Review ฝั่ง Backend

ไฟล์นี้ใช้ทบทวนก่อนอธิบายงานกับอาจารย์ ไม่จำเป็นต้องท่องโค้ดทุกบรรทัด
ให้จำว่า request เริ่มที่ไหน ผ่านอะไร และจบที่ตารางใด

## ภาพรวมสั้น ๆ

Backend ใช้ Express รับ HTTP request, ใช้ middleware ตรวจ token และ role,
ใช้ Drizzle สร้าง query และเก็บข้อมูลใน PostgreSQL

```text
Frontend หรือ Bruno
→ src/index.ts
→ middleware (ถ้า API ต้อง login)
→ route ที่ตรงกับ URL
→ db/client.ts
→ PostgreSQL
→ JSON response
```

ถ้าอาจารย์ถามว่าแบ่งไฟล์ทำไม ตอบได้ว่า:

> แยกตามหน้าที่เพื่อไม่ให้ `index.ts` ใหญ่เกินไป ตัว index ลงทะเบียน route,
> route ตรวจ request และสั่งฐานข้อมูล ส่วน schema บอกโครงสร้างตารางค่ะ

## ไฟล์ที่ควรเปิดให้อาจารย์ดู

| เรื่องที่ถาม | ไฟล์ที่เปิด |
|---|---|
| จุดเริ่ม Backend | `src/index.ts` |
| ตารางและความสัมพันธ์ | `db/schema.ts` |
| API อาคาร | `src/routes/building/Buildings.route.ts` |
| API ชั้น | `src/routes/building/Floors.route.ts` |
| API สถานที่ การค้น และรูป | `src/routes/building/Places.route.ts` |
| Login OAuth | `src/routes/auth/Auth.route.ts` |
| ตรวจ token และ role | `src/auth/middleware.ts` |
| Favorite | `src/routes/user/Favorites.route.ts` |
| Review และ Like | `src/routes/user/Reviews.route.ts` |
| Report | `src/routes/user/Reports.route.ts` |
| ข้อมูลเริ่มต้นของอาคาร | `db/data/building30.ts` |
| วิธีนำข้อมูลลง DB | `db/seed-maps.ts` |

## ระดับความยากหลังตรวจโค้ด

| กลุ่มไฟล์ | ระดับ | สิ่งที่ต้องเข้าใจ |
|---|---|---|
| `Buildings.route.ts`, `Floors.route.ts` | พื้นฐาน | CRUD, UUID และ validation |
| `Reports.route.ts` | พื้นฐาน–กลาง | role และ partial update |
| `Favorites.route.ts`, `Reviews.route.ts` | กลาง | transaction และตัวนับ |
| `Places.route.ts` | กลาง | JOIN, filter หลายค่า และ `exists` |
| `Auth.route.ts` | กลาง | OAuth หลายขั้นและ cookie |
| `schema.ts` | กลาง | foreign key, unique index และ cascade |
| `seed-maps.ts` | กลาง | transaction, UUID v5 และการรันซ้ำ |

ไม่มี algorithm ซับซ้อนหรือ pattern ที่เกินขอบเขต Backend ทั่วไป จุดที่ดูยากเกิดจาก
การป้องกันข้อมูลผิดและรักษาความสอดคล้องของฐานข้อมูล จึงเก็บไว้พร้อมคอมเมนต์อธิบาย

## วิธีอ่าน Route

Route ส่วนใหญ่ใช้ลำดับเดียวกัน:

1. อ่านค่าจาก URL, query หรือ body
2. ตรวจชนิดข้อมูล ความยาว UUID และค่าที่ระบบอนุญาต
3. ตรวจว่าข้อมูลที่อ้างถึงมีอยู่จริง
4. เรียก Drizzle เพื่ออ่านหรือเขียนฐานข้อมูล
5. ส่ง status code และ JSON กลับ
6. ถ้าเกิดข้อผิดพลาด ส่ง `500` และเขียน error ใน log

ตัวอย่าง:

```ts
router.get("/:place_id", async (req, res) => {
  // 1. อ่าน place_id
  // 2. ตรวจ UUID
  // 3-4. ค้นในฐานข้อมูล
  // 5. ส่ง 200 หรือ 404
});
```

## คำที่ดูยากแต่ใช้ทำอะไร

### `innerJoin`

ใช้รวมข้อมูลที่อยู่คนละตาราง เช่น Place เก็บ `floor_id` แต่หน้าแอปต้องการ
เลขชั้นและชื่ออาคาร จึง JOIN `places → floors → buildings` แล้วตอบครั้งเดียว

### `transaction`

ใช้เมื่อต้องทำหลายคำสั่งให้สำเร็จพร้อมกัน เช่น Favorite ต้องเพิ่มแถวใน
`favorites` และเพิ่ม `fav_count` ถ้าคำสั่งหนึ่งพัง transaction จะยกเลิกทั้งหมด
ทำให้ตัวนับไม่ผิดจากรายการจริง

### `sql\`...\``

ใช้คำนวณจากค่าเดิมใน PostgreSQL เช่น `fav_count + 1` จุดนี้ใช้ ORM เขียนแบบปกติ
ได้ไม่สะดวก จึงมี SQL สั้น ๆ เฉพาะส่วนคำนวณ

### `exists`

ใช้ค้น keyword โดยถามว่ามีคำค้นของสถานที่นี้ตรงหรือไม่ ผลลัพธ์ยังคงมีสถานที่
หนึ่งแถว แม้สถานที่นั้นจะมีหลาย keyword

### `res.locals.auth`

`requireAuth` ตรวจ token ก่อน แล้วฝาก `user_id`, email และ role ไว้ใน
`res.locals.auth` ให้ route เดียวกันใช้ต่อ ข้อมูลนี้อยู่แค่ request ปัจจุบัน

### UUID v5 ใน Seed

`seed-maps.ts` สร้าง ID จากชื่อ key เดิม ห้องเดิมจึงได้ ID เดิมทุกครั้ง
เมื่อรัน seed ซ้ำ ระบบข้ามหรือเติมข้อมูลเดิมได้โดยไม่สร้างห้องซ้ำ

## OAuth อธิบายทีละขั้น

1. Frontend เปิด `GET /auth/login`
2. Backend สร้าง `state` และเก็บใน cookie
3. Backend redirect ไป CPE OAuth
4. OAuth ส่ง `code` และ `state` กลับ `/auth/callback`
5. Backend เทียบ state เพื่อป้องกัน request ปลอม
6. Backend ใช้ code แลก access token โดยเก็บ client secret ไว้ฝั่ง Backend
7. Backendใช้ access token ขอข้อมูลผู้ใช้
8. Backendเพิ่มหรืออัปเดต User ใน PostgreSQL
9. Backendสร้าง session token ของระบบและเก็บใน HttpOnly cookie
10. Frontend เรียก `/auth/me` ด้วย `credentials: "include"`

ถ้าถามว่าทำไมใช้ HttpOnly cookie:

> JavaScript ฝั่งหน้าเว็บอ่าน token โดยตรงไม่ได้ จึงลดความเสี่ยงที่ script อื่น
> จะขโมย token แต่ Frontend ต้องส่ง `credentials: "include"` ค่ะ

## Role ของระบบ

| Role | ทำอะไรได้ |
|---|---|
| Guest | อ่านอาคาร ชั้น สถานที่ รูป และรีวิว |
| USER | ทำเหมือน Guest และเพิ่ม Favorite, Review, Like, Report |
| ADMIN | ดูแลรายละเอียดสถานที่ รูป keyword รีวิว และ Report |
| DEVELOPER | เพิ่มหรือลบโครงสร้างอาคาร ชั้น และสถานที่ |

การซ่อนปุ่มใน Frontend ช่วยเรื่องหน้าจอ แต่ Backend ยังต้องตรวจ role เพราะผู้ใช้
สามารถเรียก API โดยตรงผ่าน Bruno หรือโปรแกรมอื่นได้

## Validation ที่มี

- ID ตรวจว่าเป็น UUID
- ชื่อและข้อความตรวจค่าว่างกับความยาวสูงสุด
- เลขชั้นตรวจว่าเป็น integer ของ PostgreSQL
- `place_type`, `room_status` และสถานะ Report รับเฉพาะค่าที่กำหนด
- `capacity` ต้องเป็นจำนวนเต็มตั้งแต่ 0
- เวลาใช้รูปแบบ `HH:MM` และตรวจชั่วโมง 00–23 นาที 00–59
- rating ต้องเป็นจำนวนเต็ม 1–5

ถ้าข้อมูลผิด API ตอบ `400` ก่อนสั่งฐานข้อมูล

## ความสัมพันธ์สำคัญ

```text
Buildings → Floors → Places
Places → PlaceImages / PlaceKeywords / Favorites / Reviews / Reports
Users → Favorites / Reviews / ReviewLikes / Reports
```

Foreign key ใช้ `ON DELETE CASCADE` เช่น ลบ Place แล้วรูป คำค้น Favorite รีวิว
และ Report ของสถานที่นั้นถูกลบตาม เพื่อไม่ให้มีข้อมูลลูกที่หาเจ้าของไม่เจอ

## ตัวอย่างคำถาม What-if

### ถ้าต้องเพิ่มประเภทห้องใหม่

แก้ `db/place-types.ts`, ตรวจ Places API และเพิ่ม Bruno test
ถ้าไม่ได้เพิ่มคอลัมน์ ไม่ต้องสร้าง migration

### ถ้าต้องเพิ่มข้อมูลใหม่ใน Place

แก้ `db/schema.ts` → `pnpm db:generate` → ตรวจ migration → `pnpm db:migrate`
จากนั้นแก้ Places API, seed, Bruno และเอกสาร

### ถ้าต้องให้ Admin แก้เลขห้อง

แก้ policy ใน `PUT /places/:place_id` และเพิ่ม test ว่า Admin ทำได้
ต้องคุยกับทีมก่อนเพราะเลขห้องเป็นข้อมูลโครงสร้างที่ตอนนี้ให้ Developer ดูแล

### ถ้าต้องอัปโหลดรูปจริง

เพิ่มบริการเก็บไฟล์ เช่น MinIO แล้วให้ Backend รับไฟล์ ตรวจชนิดและขนาด
จากนั้นเก็บ URL ใน `place_images` ปัจจุบัน API เก็บ URL และเสิร์ฟไฟล์ใน
`public/images` ได้ แต่ยังไม่มี endpoint รับไฟล์ upload

### ถ้าต้องเพิ่มตารางเรียน

ไม่ควรยัดทั้งหมดใน `description` ควรสร้างตาราง schedule ที่มี place, วัน,
เวลาเริ่ม เวลาเลิก รหัสวิชา และผู้สอน แล้วเพิ่ม API แยกสำหรับอ่านตาราง

## จุดที่ควรบอกตามตรง

- `Places.route.ts` ยาวเพราะรวม Place, Keyword และ Image ไว้ด้วยกัน ถ้าโตขึ้นควรแยก route
- เวลาเปิดปิดตอนนี้เป็นเวลาปกติหนึ่งคู่ ยังไม่รองรับเวลาแต่ละวัน
- `room_status` เป็นสถานะที่บันทึกไว้ ไม่ได้เปลี่ยนอัตโนมัติตามตารางเรียน
- ตารางเรียนและอุปกรณ์ประจำห้องยังไม่ได้สร้าง
- ระบบ Navigation ยังไม่มี Nodes, Edges และพิกัด
- รูปใน `public/` เหมาะกับงานทดลอง หาก deploy หลายเครื่องควรใช้ file storage

## Happy Path ที่สาธิตได้

1. เปิด `GET /places?floor=7&room_status=OPEN`
2. เปิดรายละเอียดห้องและ URL รูปใน `/images/places/floor-7/...`
3. Login ผ่าน OAuth แล้วเรียก `GET /auth/me`
4. User เพิ่ม Favorite หรือ Review
5. User ส่ง Report และ Admin เปลี่ยนสถานะ

ก่อนสาธิตให้รัน migration, seed และทดสอบ `/health/database` ก่อนเสมอ
