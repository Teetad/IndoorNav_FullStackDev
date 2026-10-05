# คู่มืออ่านโค้ด Backend (เริ่มจากศูนย์)

ไฟล์ `.md` นี้เป็นเอกสาร Markdown สำหรับอ่าน ไม่ใช่ไฟล์ฐานข้อมูล PostgreSQL

ไฟล์นี้อธิบายโฟลเดอร์ `pj-backend` ตามโค้ดปัจจุบัน โดยเก็บไว้ในโฟลเดอร์ `ไฟล์/`
ไม่จำเป็นต้องจำทุกไฟล์ในครั้งเดียว เริ่มอ่านตามหัวข้อ
"ข้อมูลเดินทางอย่างไร" แล้วเปิดไฟล์ที่ลิงก์ไว้ทีละไฟล์

## คำที่เจอบ่อย

| คำ | ความหมายในโปรเจกต์นี้ |
|---|---|
| Backend | โปรแกรมที่รับ request จาก Bruno/เว็บ แล้วอ่านหรือเขียนฐานข้อมูล |
| API / route | ที่อยู่และวิธีเรียก เช่น `GET /places` เพื่อขอรายการสถานที่ |
| Database | PostgreSQL ที่เก็บผู้ใช้ อาคาร ชั้น สถานที่ และคำค้นจริง |
| Schema | แบบของตารางในโค้ด เช่น มีคอลัมน์อะไร ชนิดอะไร และเชื่อมกันอย่างไร |
| Migration | ไฟล์ SQL ที่เปลี่ยนโครงสร้างฐานข้อมูลให้ตรงกับ schema |
| Seed | สคริปต์ใส่ข้อมูลเริ่มต้นลงฐานข้อมูล |
| UUID / ID | รหัสของแถวข้อมูล เช่น `place_id`; ไม่ใช่เลขห้องที่ผู้ใช้เห็น |

`place_type` คือ **ประเภทที่ระบบกำหนดไว้** เช่น `classroom` หรือ `laboratory`
`place_keywords` คือ **คำค้นที่เพิ่มให้แต่ละสถานที่** เช่น ชื่อย่อหรือคำที่คนใช้เรียก
สถานที่หนึ่งแห่งมี `place_type` ได้หนึ่งค่า แต่มี keyword ได้หลายคำ

## ข้อมูลเดินทางอย่างไร

ตัวอย่างเมื่อ Bruno เรียก `GET http://localhost:3000/places?search=lab`:

```text
Bruno
  → src/index.ts                  รับ HTTP request
  → src/routes/building/Places.route.ts
                                  ตรวจ query และสร้างคำสั่งค้นหา
  → db/client.ts                  ส่งคำสั่งผ่าน Drizzle ไป PostgreSQL
  → db/schema.ts                  บอกชื่อตารางและคอลัมน์ที่ใช้
  → PostgreSQL                    คืนข้อมูลจริง
  → Places.route.ts               ส่ง JSON กลับให้ Bruno
```

`GET` อ่านข้อมูล, `POST` เพิ่ม, `PUT` แก้ และ `DELETE` ลบข้อมูล
ใน route จะเห็น `req` (ข้อมูลที่ผู้เรียกส่งมา) และ `res` (คำตอบที่ส่งกลับ)
เช่น `req.params.place_id` มาจาก URL และ `req.body.keyword` มาจาก JSON body

## ไฟล์ที่เป็นจุดเริ่มของ Backend

| ไฟล์ | ทำหน้าที่อะไร |
|---|---|
| [../package.json](../package.json) | รายชื่อไลบรารีและคำสั่ง `pnpm dev`, `build`, `db:migrate`, `seed:maps` |
| [../src/index.ts](../src/index.ts) | สร้าง Express app, เปิดพอร์ต และลงทะเบียน route หลักทั้งหมด |
| [../src/routes/auth/Auth.route.ts](../src/routes/auth/Auth.route.ts) | เริ่ม CPE OAuth, รับ callback, บันทึกผู้ใช้ และคืน session token |
| [../src/auth/middleware.ts](../src/auth/middleware.ts) | ตรวจ Bearer token และ role ก่อนเข้า route ที่กำหนด |
| [../src/auth/tokens.ts](../src/auth/tokens.ts) | สร้างและตรวจ OAuth state กับ session token |
| [../src/routes/building/Buildings.route.ts](../src/routes/building/Buildings.route.ts) | API อ่าน เพิ่ม และลบอาคาร |
| [../src/routes/building/Floors.route.ts](../src/routes/building/Floors.route.ts) | API อ่าน เพิ่ม แก้ และลบชั้นของอาคาร |
| [../src/routes/building/Places.route.ts](../src/routes/building/Places.route.ts) | API สถานที่ รวมการกรองประเภท การค้นชื่อ/เลขห้อง/keyword และ API เพิ่มหรือลบ keyword |
| [../src/routes/user/Favorites.route.ts](../src/routes/user/Favorites.route.ts) | API ให้ผู้ใช้เพิ่ม อ่าน และลบ Favorite ของตัวเอง |
| [../src/routes/user/Reviews.route.ts](../src/routes/user/Reviews.route.ts) | API รีวิวและการกด Like รีวิว |
| [../src/routes/user/Reports.route.ts](../src/routes/user/Reports.route.ts) | API แจ้งปัญหาและเปลี่ยนสถานะโดย Admin |
| [../src/utils/validation.ts](../src/utils/validation.ts) | ตรวจเลขชั้นว่าเป็นจำนวนเต็มในช่วงที่ PostgreSQL เก็บได้ |

`src/index.ts` ไม่ได้เขียนคำสั่งค้นหาสถานที่เอง แต่ส่งต่อให้ route ที่ตรงกับ URL
ตัวอย่าง `app.use("/places", placeRouter)` ทำให้ route `router.get("/")`
ใน `Places.route.ts` กลายเป็น `GET /places`

Role ที่เก็บใน `users` มี `USER`, `ADMIN`, `DEVELOPER` ส่วน Guest หมายถึงผู้ที่
ยังไม่ login จึงไม่มีข้อมูลในตาราง `users` Admin และ Developer กำหนดจากรายชื่อ email
ใน `.env` ตอน login โดย route ที่เพิ่ม แก้ และลบข้อมูลจะตรวจ role ก่อนทำงาน

- Guest และ USER อ่านหรือค้นหาข้อมูลได้
- ADMIN แก้ชื่อ รายละเอียด รูป และจัดการ keyword ได้
- DEVELOPER จัดการข้อมูลโครงสร้าง เช่น อาคาร ชั้น และสถานที่ได้

ของที่ยังไม่ได้ทำมีอัปโหลดไฟล์รูปและ Navigation
รูปหลายรูปเก็บใน `place_images` และรายการ Favorite ของแต่ละ User เก็บใน `favorites`

## ไฟล์ใน `db/`

| ไฟล์ | ทำหน้าที่อะไร |
|---|---|
| [schema.ts](../db/schema.ts) | ประกาศตารางทั้งหมด รวม `place_images`, คีย์หลัก และความสัมพันธ์ |
| [place-types.ts](../db/place-types.ts) | รายการประเภทสถานที่ที่ API ยอมรับ และ `isPlaceType()` สำหรับตรวจค่า |
| [utils.ts](../db/utils.ts) | อ่านค่า `POSTGRES_*` จาก `.env` แล้วสร้าง URL สำหรับต่อฐานข้อมูล |
| [client.ts](../db/client.ts) | สร้างการเชื่อมต่อ PostgreSQL (`dbConn`) และตัวเขียน query ของ Drizzle (`dbClient`) |
| [data/building30.ts](../db/data/building30.ts) | ข้อมูลอาคาร 30 ปี ชั้น 4–7 ที่ถอดจากแผนที่; ยังไม่ใช่ข้อมูลในฐานข้อมูลจนกว่าจะ seed |
| [data/README.md](../db/data/README.md) | บอกแหล่งข้อมูลแผนที่และส่วนที่ยังไม่ยืนยัน |
| [seed-maps.ts](../db/seed-maps.ts) | ดูตัวอย่างข้อมูล หรือใช้ `--apply` เพื่อนำอาคาร ชั้น และสถานที่ลงฐานข้อมูล |
| [prototype.ts](../db/prototype.ts) | สคริปต์อ่านข้อมูลจากฐานข้อมูลแล้วพิมพ์ใน Terminal เพื่อทดลอง query |
| [migration/](../db/migration/) | ไฟล์ SQL ที่สร้างหรือเปลี่ยนตาราง; `meta/_journal.json` เก็บลำดับ migration |

ความสัมพันธ์หลักคือ `Buildings → Floors → Places` และ Places เชื่อมกับ Keywords/Images:

- `floors.building_id` ชี้ไปยังอาคาร
- `places.floor_id` ชี้ไปยังชั้น
- `place_keywords.place_id` ชี้ไปยังสถานที่
- `place_images.place_id` ชี้ไปยังสถานที่
- `favorites.user_id` และ `favorites.place_id` เชื่อมผู้ใช้กับสถานที่ที่กด Favorite
- `reviews` เชื่อมผู้ใช้กับสถานที่ และ `review_likes` เชื่อมผู้ใช้กับรีวิว
- `reports` เชื่อมผู้แจ้งปัญหากับสถานที่
- หากลบอาคาร ชั้น/สถานที่/keyword ใต้ข้อมูลนั้นจะถูกลบตาม (`ON DELETE CASCADE`)

ตัวอย่าง `place_type` อยู่ในตาราง `places` โดยตรง ส่วน keyword อยู่ในตาราง
`place_keywords` แยกออกมา เพราะสถานที่หนึ่งแห่งมีคำค้นได้หลายคำ

### Migration แต่ละไฟล์

| ไฟล์ | เปลี่ยนอะไร |
|---|---|
| `0000_phase1_indoor_navigation.sql` | สร้างตารางอาคาร ชั้น และสถานที่ชุดแรก |
| `0001_align_phase1_design.sql` | ปรับคอลัมน์ให้ตรงกับแบบ Phase 1 |
| `0002_many_jamie_braddock.sql` | เพิ่ม `places.place_type` |
| `0003_gorgeous_azazel.sql` | สร้าง `place_keywords` และความสัมพันธ์กับ `places` |
| `0004_good_nico_minoru.sql` | สร้าง `users` สำหรับ OAuth และ role |
| `0005_woozy_risque.sql` | สร้าง `place_images` สำหรับเก็บ URL รูปหลายรูป |
| `0006_spicy_medusa.sql` | สร้าง `favorites` สำหรับเก็บสถานที่โปรดของแต่ละผู้ใช้ |
| `0007_optimal_krista_starr.sql` | สร้าง `reviews` และ `review_likes` |
| `0008_clumsy_longshot.sql` | สร้าง `reports` สำหรับแจ้งปัญหาสถานที่ |

อย่าแก้ SQL migration ที่เคยใช้แล้วเพื่อเปลี่ยนตารางใหม่ ให้แก้ `schema.ts`
แล้วสร้าง migration ลำดับถัดไปด้วย `pnpm db:generate`

## การค้นสถานที่และ keyword

`GET /places?search=lab` ตรวจสามจุด: `place_name`, `room_number` และ
`place_keywords.keyword` ใน [Places.route.ts](../src/routes/building/Places.route.ts)
คำสั่ง `ilike` ค้นแบบไม่แยกตัวพิมพ์ใหญ่เล็ก ส่วน `exists` ตรวจว่ามี keyword
ตรงหรือไม่โดยไม่ทำให้สถานที่เดียวกันปรากฏซ้ำหลายแถว

ตัวอย่างเพิ่มคำค้นให้ห้องหนึ่งแห่ง:

```http
POST /places/<place_id>/keywords
Content-Type: application/json

{"keyword":"AS Lab"}
```

API จะเก็บเป็น `as lab` และปฏิเสธคำซ้ำของสถานที่เดียวกันด้วย HTTP 409
หากยังไม่มี keyword ในฐานข้อมูล การค้นจาก keyword จะยังไม่พบอะไรเพิ่มเติม
สคริปต์นำเข้าแผนที่ไม่ได้เดาคำค้นให้ห้องโดยอัตโนมัติ

## การนำข้อมูลเข้า: `seed-maps.ts`

คำสั่ง `pnpm seed:maps` แสดงข้อมูลแผนที่ก่อน ยังไม่เขียนฐานข้อมูล
เมื่อเติม `--apply` จึงเริ่ม transaction: หาอาคาร → หา/เพิ่มชั้น → หา/เพิ่มสถานที่
ถ้าขั้นใดล้มเหลว transaction จะย้อนกลับทั้งชุด

ID ที่สคริปต์สร้างจาก `key` มีค่าเดิมเมื่อรันซ้ำ จึงตรวจได้ว่าแถวใดเคยนำเข้า
ถ้าแถวนั้นยังไม่มี `place_type` สคริปต์จะเติมให้ แต่ไม่เปลี่ยนประเภทของแถวที่
คนเพิ่มเอง ข้อมูลคำค้นไม่ได้อยู่ในชุด seed นี้

ข้อมูลตัวอย่างห้อง 601–603 และคำสั่ง `pnpm seed` ถูกลบแล้ว เพราะไม่ตรงกับ
แผนที่จริง ให้ใช้ `pnpm seed:maps --apply` สำหรับแผนที่อาคาร 30 ปี

## ไฟล์ตั้งค่าและเครื่องมือรอบนอก

| ไฟล์/โฟลเดอร์ | ทำหน้าที่อะไร |
|---|---|
| [../drizzle.config.ts](../drizzle.config.ts) | บอก Drizzle ว่า schema อยู่ที่ไหน migration อยู่ที่ไหน และต่อ DB ด้วยค่าใด |
| [../.env.example](../.env.example) | ตัวอย่างตัวแปรสภาพแวดล้อม; คัดลอกเป็น `.env` แล้วใส่ค่าของเครื่องตัวเอง |
| [../.gitignore](../.gitignore) | บอก Git ว่าไฟล์ใดไม่ต้องติดตาม เช่น `.env`, `node_modules/`, `dist/` |
| [../.dockerignore](../.dockerignore) | บอก Docker ว่าไฟล์ใดไม่ต้องคัดลอกเข้า image |
| [../tsconfig.json](../tsconfig.json) | ตั้งค่าการแปลง TypeScript เป็น JavaScript ใน `dist/` |
| [../nodemon.json](../nodemon.json) | ตั้งค่าสำหรับ nodemon; คำสั่ง `pnpm dev` ปัจจุบันใช้ `tsx watch` |
| [../pnpm-workspace.yaml](../pnpm-workspace.yaml) | ตั้งค่าขอบเขต workspace ของ pnpm |
| [../.vscode/](../.vscode/) | การตั้งค่า editor และการรัน/debug ใน VS Code; ไม่ใช่ API |
| [../Dockerfile](../Dockerfile) | วิธีสร้าง image ของ backend |
| [../docker-compose.yml](../docker-compose.yml) | ตั้งค่า backend และ PostgreSQL เมื่อใช้ Docker Compose |
| [../_entrypoint/init.sh](../_entrypoint/init.sh) | สร้างผู้ใช้ฐานข้อมูลและ schema สำหรับ Drizzle เมื่อ PostgreSQL เริ่มด้วยฐานข้อมูลใหม่ |
| [../bruno/](../bruno/) | ชุด request สำหรับลอง API; `environments/Local.bru` ตั้ง `baseUrl` เป็น `http://localhost:3000` |
| [../bruno/bruno.json](../bruno/bruno.json) | ตั้งค่าชุด request (collection) ของ Bruno |
| [API_SPECS.md](API_SPECS.md) | สรุป endpoint, body, query และ status code ที่ใช้จริง |
| [DATABASE_TABLES.md](DATABASE_TABLES.md) | สรุปตาราง migration และความสัมพันธ์ |
| [PROGRESS.md](PROGRESS.md) | สถานะงานและสิ่งที่ยังต้องตรวจ |
| `node_modules/`, `dist/` | ไฟล์ที่เครื่องสร้างจากการติดตั้งและ build; ปกติไม่แก้ด้วยมือ |
| `pnpm-lock.yaml` | ล็อกเวอร์ชันไลบรารีให้ติดตั้งซ้ำได้ตรงกัน |

ใน Bruno โฟลเดอร์ `Map Verification` ค้นหา ID ของอาคารและสถานที่ก่อน
จากนั้น `Place Keywords` ใช้ `mapPlaceId` ที่ได้จาก request 07 เพื่อเพิ่ม ค้น และ
ลบ keyword ทดสอบ ถ้าเห็น `{{mapPlaceId}}` ใน URL แปลว่ายังไม่ได้ค่า ID นี้
โฟลเดอร์ `Buildings`, `Floors` และ `Places` มี request สำหรับทดสอบ API แต่ละหมวด
บาง request เพิ่ม แก้ หรือลบข้อมูลจริง จึงควรเลือกฐานข้อมูลทดสอบก่อนกดส่ง

## คำสั่งที่ใช้บ่อย

รันจากโฟลเดอร์ `pj-backend`:

```bash
pnpm install                 # ติดตั้งไลบรารี
pnpm db:migrate              # ปรับตารางจริงตามไฟล์ migration
pnpm seed:maps               # ดูข้อมูลแผนที่ก่อนนำเข้า
pnpm seed:maps --apply       # นำเข้าข้อมูลแผนที่จริง
pnpm dev                     # เปิด API ที่ localhost:3000
pnpm build                   # ตรวจและแปลง TypeScript
./node_modules/.bin/tsc --noEmit # ตรวจ TypeScript โดยไม่สร้าง dist
```

ถ้า `relation "buildings" does not exist` แปลว่าฐานข้อมูลที่ต่ออยู่ไม่มีตาราง
`buildings` ให้ตรวจผลของ `pnpm db:migrate` และค่า `.env` ก่อนรัน seed
ข้อความ `Indoor Navigation Backend running...` บอกเพียงว่าเซิร์ฟเวอร์เปิดพอร์ต
ให้ตรวจ `/health/database` เพื่อยืนยันว่าฐานข้อมูลอ่านได้ด้วย

## ถ้าอยากแก้สิ่งหนึ่ง ควรเปิดไฟล์ไหน

| สิ่งที่อยากแก้ | เริ่มที่ไฟล์ |
|---|---|
| เพิ่มคอลัมน์ของสถานที่ | `db/schema.ts` แล้วสร้าง migration ใหม่ |
| เพิ่มประเภทสถานที่ที่ API ยอมรับ | `db/place-types.ts` |
| เปลี่ยนข้อมูลแผนที่อาคาร 30 ปี | `db/data/building30.ts` แล้วนำเข้าใหม่ตามกติกาของ `seed-maps.ts` |
| เปลี่ยนวิธีค้น/เพิ่ม/ลบสถานที่หรือ keyword | `src/routes/building/Places.route.ts` |
| เปลี่ยนการทำงานของ Favorite | `src/routes/user/Favorites.route.ts` |
| เปลี่ยน Review หรือ Like Review | `src/routes/user/Reviews.route.ts` |
| เปลี่ยน Report หรือสถานะ | `src/routes/user/Reports.route.ts` |
| เปลี่ยน API อาคารหรือชั้น | `Buildings.route.ts` หรือ `Floors.route.ts` |
| ตรวจผล API ด้วยมือ | `bruno/` และ `ไฟล์/API_SPECS.md` |

ถ้าต้องการเพิ่มระบบนำทาง ต้องออกแบบตารางพิกัด โหนด และเส้นเชื่อมก่อน
เพราะ `places` ปัจจุบันยังไม่มีตำแหน่ง `x`, `y`, ประตู กำแพง หรือทางเดิน

ก่อนแก้ข้อมูลจริง ควรดู `git diff` เพื่อเห็นว่าแก้ไฟล์ไหน และตรวจว่าใช้ฐานข้อมูล
ตัวไหนใน `.env` เพราะโค้ด, migration และข้อมูลในฐานข้อมูลเป็นคนละส่วนกัน
