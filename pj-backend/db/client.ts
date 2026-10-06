import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@db/schema.js";
import postgres from "postgres";
import { connectionString } from "@db/utils.js";

// ไฟล์นี้สร้างตัวเชื่อมฐานข้อมูลเพียงครั้งเดียว แล้วให้ route ทุกไฟล์นำไปใช้ร่วมกัน
// dbConn คือ connection จริง ส่วน dbClient คือ ORM ที่ใช้ select/insert/update/delete
export const dbConn = postgres(connectionString);

export const dbClient = drizzle(dbConn, { schema: schema, logger: true });
