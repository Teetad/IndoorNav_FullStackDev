import type { RequestHandler } from "express";
import { type UserRole } from "./config.js";
import { verifySessionToken } from "./tokens.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
  // อ่าน token จาก header รูปแบบ Authorization: Bearer <token>
  const authorization = req.header("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Bearer token is required" });

  try {
    // ถ้า token ถูกต้อง เก็บข้อมูลผู้ใช้ไว้ให้ route ถัดไปใช้
    res.locals.auth = await verifySessionToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Session token is invalid or expired" });
  }
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (_req, res, next) => {
    // ผู้ใช้ login แล้ว แต่ role ไม่ตรงกับที่ route อนุญาต ให้ตอบ 403
    if (!res.locals.auth || !roles.includes(res.locals.auth.role)) {
      return res.status(403).json({ message: "You do not have permission" });
    }
    next();
  };
}
