import type { RequestHandler } from "express";
import { type UserRole } from "./config.js";
import { verifySessionToken } from "./tokens.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
  // Bruno ใช้ Bearer token ส่วน Frontend ใช้ session cookie
  const authorization = req.header("authorization");
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const cookieToken = req.header("cookie")?.split(";")
    .map(value => value.trim())
    .find(value => value.startsWith("session_token="))
    ?.slice("session_token=".length);
  const token = bearerToken || (cookieToken ? decodeURIComponent(cookieToken) : null);
  if (!token) return res.status(401).json({ message: "Session token is required" });

  try {
    // ถ้า token ถูกต้อง เก็บข้อมูลผู้ใช้ไว้ให้ route ถัดไปใช้
    // res.locals ใช้ฝากข้อมูลผู้ใช้ให้ route ถัดไปใน request เดียวกัน
    res.locals.auth = await verifySessionToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Session token is invalid or expired" });
  }
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  // รับได้หลาย role เช่น requireRole("ADMIN", "DEVELOPER")
  return (_req, res, next) => {
    // ผู้ใช้ login แล้ว แต่ role ไม่ตรงกับที่ route อนุญาต ให้ตอบ 403
    if (!res.locals.auth || !roles.includes(res.locals.auth.role)) {
      return res.status(403).json({ message: "You do not have permission" });
    }
    next();
  };
}
