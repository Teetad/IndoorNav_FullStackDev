import { dbClient } from "@db/client.js";
import { Users } from "@db/schema.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { getAssignedRole, getOAuthConfig, type UserRole } from "../../auth/config.js";
import { requireAuth, requireRole } from "../../auth/middleware.js";
import { createSessionToken } from "../../auth/tokens.js";

const router = Router();

type OAuthUserInfo = {
  sub?: unknown;
  email?: unknown;
  name?: unknown;
  preferred_username?: unknown;
};

// อ่านค่า cookie ตามชื่อ เช่น oauth_state หรือ oauth_mode
function readCookie(req: Request, name: string): string | null {
  const cookie = req.header("cookie")
    ?.split(";")
    .map(value => value.trim())
    .find(value => value.startsWith(`${name}=`));

  if (!cookie) return null;
  return decodeURIComponent(cookie.slice(name.length + 1));
}

// ส่งข้อความกลางเมื่อ OAuth หรือการตั้งค่ามีปัญหา โดยไม่ส่ง secret กลับไป
function oauthError(res: Response, error: unknown) {
  console.error("OAuth failed:", error);
  const message = error instanceof Error && error.message.includes("is not configured")
    ? "OAuth is not configured"
    : "Unable to complete OAuth login";
  return res.status(message === "OAuth is not configured" ? 503 : 502).json({ message });
}

router.get("/login", async (_req, res) => {
  try {
    // อ่าน OAuth config และสร้าง state แบบสุ่มสำหรับการ login ครั้งนี้
    const config = getOAuthConfig();
    const state = randomUUID();
    // ผูก state กับ browser ที่เริ่ม login เพื่อป้องกัน login CSRF
    res.cookie("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.OAUTH_COOKIE_SECURE === "true",
      maxAge: 10 * 60 * 1000,
      path: "/auth/callback",
    });
    // mode=json ใช้ตอนต้องการดู token เพื่อนำไปทดสอบใน Bruno
    res.cookie("oauth_mode", _req.query.mode === "json" ? "json" : "frontend", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.OAUTH_COOKIE_SECURE === "true",
      maxAge: 10 * 60 * 1000,
      path: "/auth/callback",
    });
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: config.scope,
      state,
    });
    // ส่ง browser ไปยังหน้า Login ของ CPE OAuth
    return res.redirect(`${config.authorizationUrl}?${params.toString()}`);
  } catch (error) {
    return oauthError(res, error);
  }
});

router.get("/callback", async (req, res) => {
  try {
    // OAuth ส่ง code และ state กลับมาทาง query string
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    if (!code || !state) return res.status(400).json({ message: "code and state are required" });

    // อ่าน state ที่เราเคยเก็บใน cookie ตอนเริ่ม login
    const stateCookie = readCookie(req, "oauth_state");
    const oauthMode = readCookie(req, "oauth_mode");
    if (stateCookie !== state) {
      return res.status(400).json({ message: "OAuth state does not match this browser" });
    }
    // state ใช้ครั้งเดียว หลังตรวจแล้วจึงลบ cookie
    res.clearCookie("oauth_state", { path: "/auth/callback" });
    res.clearCookie("oauth_mode", { path: "/auth/callback" });

    const config = getOAuthConfig();
    // ส่ง code ไปแลก access token โดย CLIENT_SECRET อยู่เฉพาะ Backend
    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
      }),
    });
    if (!tokenResponse.ok) throw new Error(`Token endpoint returned ${tokenResponse.status}`);
    const tokenData = await tokenResponse.json() as { access_token?: unknown };
    if (typeof tokenData.access_token !== "string") throw new Error("OAuth access_token is missing");

    // ใช้ access token ขอข้อมูลผู้ใช้ เช่น sub, email และชื่อ
    const userInfoResponse = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userInfoResponse.ok) throw new Error(`Userinfo endpoint returned ${userInfoResponse.status}`);
    const userInfo = await userInfoResponse.json() as OAuthUserInfo;
    if (typeof userInfo.sub !== "string" || typeof userInfo.email !== "string") {
      throw new Error("OAuth userinfo does not contain sub and email");
    }

    // ทำ email เป็นตัวพิมพ์เล็กเพื่อป้องกันข้อมูลคนเดียวกันซ้ำเพราะตัวพิมพ์
    const email = userInfo.email.trim().toLowerCase();
    let displayName: string | null = null;
    if (typeof userInfo.name === "string") {
      displayName = userInfo.name.trim();
    } else if (typeof userInfo.preferred_username === "string") {
      displayName = userInfo.preferred_username.trim();
    }
    // ค้นว่าผู้ใช้ OAuth คนนี้เคย login และมีข้อมูลในฐานข้อมูลหรือยัง
    const [existing] = await dbClient.select().from(Users)
      .where(eq(Users.oauth_subject, userInfo.sub));
    // รายชื่อใน .env มีสิทธิ์ก่อน ถ้าไม่กำหนดให้ใช้ role เดิมหรือ USER
    const savedRole = existing?.role as UserRole | undefined;
    const role = getAssignedRole(email) ?? savedRole ?? "USER";
    // เคย login แล้วให้อัปเดตข้อมูล ถ้ายังไม่เคยให้สร้าง User ใหม่
    let user;
    if (existing) {
      [user] = await dbClient.update(Users).set({
        oauth_subject: userInfo.sub,
        email,
        display_name: displayName || null,
        role,
        updated_at: new Date(),
      }).where(eq(Users.user_id, existing.user_id)).returning();
    } else {
      [user] = await dbClient.insert(Users).values({
        oauth_subject: userInfo.sub,
        email,
        display_name: displayName || null,
        role,
      }).returning();
    }
    if (!user || !["USER", "ADMIN", "DEVELOPER"].includes(user.role)) {
      throw new Error("Unable to resolve user role");
    }

    // สร้าง token ของระบบเรา ไม่ส่ง access token ของ CPE กลับไป
    const sessionToken = await createSessionToken({ ...user, role: user.role as UserRole });
    const userResponse = {
      user_id: user.user_id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
    };

    // Browser เก็บ token ใน HttpOnly cookie ทำให้ JavaScript อ่าน token โดยตรงไม่ได้
    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.OAUTH_COOKIE_SECURE === "true",
      maxAge: 8 * 60 * 60 * 1000,
      path: "/",
    });

    // ใช้ JSON เฉพาะตอนทดสอบ Backend; การ login ปกติกลับไปหน้า Frontend
    if (oauthMode !== "json") {
      const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
      return res.redirect(`${frontendUrl}/auth/callback`);
    }

    return res.status(200).json({
      token: sessionToken,
      token_type: "Bearer",
      expires_in: 28_800,
      user: userResponse,
    });
  } catch (error) {
    return oauthError(res, error);
  }
});

router.post("/logout", (_req, res) => {
  // ลบ session cookie ออกจาก browser
  res.clearCookie("session_token", { path: "/" });
  return res.status(200).json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (_req, res) => {
  try {
    // requireAuth ตรวจ token แล้ว และเก็บ user_id ไว้ใน res.locals.auth.sub
    const auth = res.locals.auth;
    const [user] = await dbClient.select({
      user_id: Users.user_id,
      email: Users.email,
      display_name: Users.display_name,
      role: Users.role,
    }).from(Users).where(eq(Users.user_id, auth.sub));
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.error("GET /auth/me failed:", error);
    return res.status(500).json({ message: "Unable to get current user" });
  }
});

// ใช้ตรวจว่า session ปัจจุบันมีสิทธิ์ ADMIN; route ข้อมูลเดิมยังไม่ได้บังคับ role
router.get("/admin-check", requireAuth, requireRole("ADMIN"), (_req, res) => {
  return res.status(200).json({ message: "Admin access granted" });
});

router.get("/developer-check", requireAuth, requireRole("DEVELOPER"), (_req, res) => {
  return res.status(200).json({ message: "Developer access granted" });
});

export default router;
