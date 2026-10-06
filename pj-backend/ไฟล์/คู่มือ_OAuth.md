# คู่มือ OAuth สำหรับ Frontend

## การทำงานปัจจุบัน

1. เปิด `GET http://localhost:3000/auth/login`
2. ระบบพาไป Login กับ CPE OAuth
3. OAuth ส่งกลับมาที่ `/auth/callback`
4. Backend บันทึกผู้ใช้ เก็บ session ใน cookie แล้วกลับไปหน้า Frontend
5. ผู้ใช้ทั่วไปจะมี role เป็น `USER`

ถ้าจะดู token เพื่อเทส Bruno ให้เปิด `http://localhost:3000/auth/login?mode=json`

## เปิด Backend

```bash
cd pj-backend
docker compose up -d postgres
pnpm dev
```

จากนั้นเปิด `http://localhost:3000/auth/login?mode=json` ใน Browser และ Login ด้วยบัญชี CMU

## ทดสอบใน Bruno

1. คัดลอกเฉพาะค่า `token` จากหน้า Browser
2. เปิด Collection ที่ `pj-backend/bruno`
3. เลือก Environment `Local`
4. ใส่ token ต่อจากคำว่า `Bearer ` ใน Headers
5. กด Send

| คำขอ | ผลที่ควรได้ |
| --- | --- |
| `01 Current User` | `200 OK` และ role `USER` |
| `02 User Cannot Access Admin` | `403 Forbidden` |
| `03 User Cannot Access Developer` | `403 Forbidden` |
| `04 Current User With Cookie` | `200 OK` และมีข้อมูล User |
| `05 Logout` | `200 OK` |
| `06 Missing Session` | `401 Unauthorized` |

ถ้าทดสอบ API ที่แก้ข้อมูล ให้ใส่ token ตามงานที่ทดสอบ:

- Developer: เพิ่มหรือลบอาคาร และเพิ่ม แก้ หรือลบชั้น/สถานที่
- Admin: แก้ชื่อ รายละเอียด รูปของสถานที่ และเพิ่มหรือลบ keyword

หลังทดสอบให้เปลี่ยน Header กลับเป็น `Bearer {{sessionToken}}` และอย่า commit token

ชุด `Permission Details` ใช้ token เพิ่มอีก 3 ค่าใน Environment `Local`:

- `otherUserToken` คือ token ของ User คนที่สอง ใช้ทดสอบการแก้ Review ของคนอื่น
- `adminToken` คือ token ที่มี role `ADMIN`
- `developerToken` คือ token ที่มี role `DEVELOPER`

ค่าเหล่านี้เป็น secret variable และต้องไม่ใส่ token จริงลง Git

## API สำหรับ Frontend

| Method | Path | หน้าที่ |
| --- | --- | --- |
| `GET` | `/auth/login` | เริ่ม Login |
| `GET` | `/auth/callback` | สร้าง session และกลับหน้า Frontend |
| `GET` | `/auth/me` | อ่านข้อมูลผู้ใช้ที่ Login |
| `POST` | `/auth/logout` | ออกจากระบบและลบ session cookie |
| `GET` | `/auth/admin-check` | ตรวจสิทธิ์ ADMIN |
| `GET` | `/auth/developer-check` | ตรวจสิทธิ์ DEVELOPER |
| `GET` | `/favorites` | อ่าน Favorite ของผู้ใช้ที่ Login |
| `POST` | `/favorites/:place_id` | เพิ่ม Favorite |
| `DELETE` | `/favorites/:place_id` | ลบ Favorite |
| `POST` | `/places/:place_id/reviews` | เพิ่ม Review |
| `PUT` | `/reviews/:review_id` | แก้ Review ของตัวเอง |
| `DELETE` | `/reviews/:review_id` | ลบ Review ของตัวเอง |
| `POST` | `/reviews/:review_id/likes` | กด Like Review |
| `DELETE` | `/reviews/:review_id/likes` | ยกเลิก Like Review |
| `POST` | `/places/:place_id/reports` | User แจ้งปัญหาสถานที่ |
| `GET` | `/reports/me` | User ดู Report ของตัวเอง |
| `GET` | `/reports` | Admin ดู Report ทั้งหมด |
| `PUT` | `/reports/:report_id/status` | Admin เปลี่ยนสถานะ |

API ที่ต้อง Login ใช้ Header:

```http
Authorization: Bearer <token>
```

Frontend เริ่ม Login ได้ด้วย:

```ts
window.location.href = "http://localhost:3000/auth/login";
```

Frontend เรียก API โดยใส่ `credentials: "include"` เพื่อส่ง cookie มาด้วย:

```ts
const response = await fetch("http://localhost:3000/auth/me", {
  credentials: "include",
});
```

หน้า `/auth/callback` ของ Frontend ให้เรียก `/auth/me` แล้วพาผู้ใช้กลับหน้าแรก

ตอนนี้ API ที่เพิ่ม แก้ และลบข้อมูลตรวจ `requireAuth` และ `requireRole` แล้ว
Guest และ USER ยังดูหรือค้นหาข้อมูลได้ ส่วน ADMIN จัดการข้อมูลที่แสดงและ keyword
และ DEVELOPER จัดการโครงสร้างอาคาร ชั้น และสถานที่

## Role

| Role | ความหมาย |
| --- | --- |
| Guest | ยังไม่ได้ Login |
| `USER` | ผู้ใช้ทั่วไป |
| `ADMIN` | ผู้ดูแลระบบ |
| `DEVELOPER` | นักพัฒนาระบบ |

ห้ามนำ `OAUTH_CLIENT_SECRET`, `JWT_SECRET`, token หรือไฟล์ `.env` ไปใส่ใน Frontend หรือ Git
