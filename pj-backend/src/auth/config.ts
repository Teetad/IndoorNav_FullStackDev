// URL ของบริการ OAuth ที่อาจารย์ให้มา
const authorizationUrl = "https://oauth497.cpecmu.com/application/o/authorize/";
const tokenUrl = "https://oauth497.cpecmu.com/application/o/token/";
const userInfoUrl = "https://oauth497.cpecmu.com/application/o/userinfo/";

export type UserRole = "USER" | "ADMIN" | "DEVELOPER";

// ตรวจค่าจากฐานข้อมูลหรือ token ก่อนบอก TypeScript ว่าค่านี้เป็น role จริง
export function isUserRole(value: unknown): value is UserRole {
  return value === "USER" || value === "ADMIN" || value === "DEVELOPER";
}

// อ่านค่าที่จำเป็นจาก .env ถ้าไม่มีให้หยุดและแจ้งชื่อค่าที่ขาด
function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function getOAuthConfig() {
  // รวมค่าที่ route login และ callback ต้องใช้ไว้ในที่เดียว
  return {
    authorizationUrl,
    tokenUrl,
    userInfoUrl,
    clientId: required("OAUTH_CLIENT_ID"),
    clientSecret: required("OAUTH_CLIENT_SECRET"),
    redirectUri: required("OAUTH_REDIRECT_URI"),
    scope: process.env.OAUTH_SCOPE?.trim() || "openid profile email basic_info",
  };
}

export function getJwtSecret(): Uint8Array {
  // jose ต้องใช้ secret ในรูปแบบ bytes สำหรับเซ็นและตรวจ token
  return new TextEncoder().encode(required("JWT_SECRET"));
}

// แปลงรายชื่อ email ที่คั่นด้วย comma ใน .env ให้ค้นหาได้ง่าย
function getEmails(name: string): Set<string> {
  return new Set(
    (process.env[name] ?? "")
      .split(",")
      .map(email => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

// ค่าใน .env ใช้กำหนด role ครั้งแรก ส่วน role จริงถูกเก็บในตาราง users
export function getAssignedRole(email: string): UserRole | null {
  // ตรวจ Developer ก่อน แล้วจึงตรวจ Admin
  if (getEmails("DEVELOPER_EMAILS").has(email)) return "DEVELOPER";
  if (getEmails("ADMIN_EMAILS").has(email)) return "ADMIN";
  return null;
}
