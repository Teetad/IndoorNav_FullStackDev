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

หลังทดสอบให้เปลี่ยน Header กลับเป็น `Bearer {{sessionToken}}` และอย่า commit token

## API สำหรับ Frontend

| Method | Path | หน้าที่ |
| --- | --- | --- |
| `GET` | `/auth/login` | เริ่ม Login |
| `GET` | `/auth/callback` | รับผลจาก OAuth สร้าง session และกลับหน้า Frontend |
| `GET` | `/auth/me` | อ่านข้อมูลผู้ใช้ที่ Login |
| `POST` | `/auth/logout` | ออกจากระบบและลบ session cookie |
| `GET` | `/auth/admin-check` | ตรวจสิทธิ์ ADMIN |
| `GET` | `/auth/developer-check` | ตรวจสิทธิ์ DEVELOPER |

API ที่ต้อง Login ใช้ Header:

```http
Authorization: Bearer <token>
```

Frontend เริ่ม Login ได้ด้วย:

```ts
window.location.href = "http://localhost:3000/auth/login";
```

Frontend ต้องเรียก API โดยใส่ `credentials: "include"` เพื่อส่ง cookie มาด้วย

```ts
const response = await fetch("http://localhost:3000/auth/me", {
  credentials: "include",
});
const user = await response.json();
```

หน้า `/auth/callback` ของ Frontend ไม่ต้องอ่าน token ให้เรียก `/auth/me` แล้วพา User
กลับหน้าแรก ส่วน Logout ให้เรียก `POST http://localhost:3000/auth/logout` พร้อม
`credentials: "include"`

ตอนนี้มี `requireAuth` และ `requireRole` แล้ว แต่ยังใช้แค่ route สำหรับเทส role
API เพิ่ม แก้ และลบข้อมูลยังเป็น public อยู่ งานต่อไปคือต้องใส่สิทธิ์ให้ Admin
และ Developer ส่วน Guest ให้ดูและค้นหาข้อมูลได้เหมือนเดิม

## Role

| Role | ความหมาย |
| --- | --- |
| Guest | ยังไม่ได้ Login |
| `USER` | ผู้ใช้ทั่วไป |
| `ADMIN` | ผู้ดูแลระบบ |
| `DEVELOPER` | นักพัฒนาระบบ |

ห้ามนำ `OAUTH_CLIENT_SECRET`, `JWT_SECRET`, token หรือไฟล์ `.env` ไปใส่ใน Frontend หรือ Git
