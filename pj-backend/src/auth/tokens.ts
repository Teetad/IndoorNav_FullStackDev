import { jwtVerify, SignJWT } from "jose";
import { getJwtSecret, type UserRole } from "./config.js";

const issuer = "indoor-navigation-backend";
const audience = "indoor-navigation-client";

// ข้อมูลผู้ใช้ที่เราใส่ไว้ภายใน session token
export type SessionPayload = {
  sub: string;
  email: string;
  name?: string;
  role: UserRole;
};

export async function createSessionToken(user: {
  user_id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
}): Promise<string> {
  // สร้าง token หลัง OAuth สำเร็จ เพื่อใช้เรียก API ที่ต้อง login
  return new SignJWT({
    email: user.email,
    name: user.display_name ?? undefined,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.user_id)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload> {
  // ตรวจลายเซ็น อายุ ผู้ออก token และผู้รับ token
  const { payload } = await jwtVerify(token, getJwtSecret(), { issuer, audience });
  // ตรวจว่าข้อมูลสำคัญใน token มีชนิดและค่าที่ระบบรู้จัก
  if (typeof payload.sub !== "string" || typeof payload.email !== "string" ||
      (payload.role !== "USER" && payload.role !== "ADMIN" && payload.role !== "DEVELOPER")) {
    throw new Error("Invalid session token payload");
  }
  return payload as SessionPayload;
}
