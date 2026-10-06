import "dotenv/config";
import { dbClient } from "@db/client.js";
import { Buildings, Favorites, Floors, Places, Reports, ReviewLikes, Reviews, Users } from "@db/schema.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth/Auth.route.js";
import buildingRouter from "./routes/building/Buildings.route.js";
import floorRouter from "./routes/building/Floors.route.js";
import placeRouter from "./routes/building/Places.route.js";
import favoriteRouter from "./routes/user/Favorites.route.js";
import reviewRouter from "./routes/user/Reviews.route.js";
import reportRouter from "./routes/user/Reports.route.js";

// ลำดับทำงานโดยย่อ: request → middleware → route → database → response
// app คือจุดรับ HTTP request ก่อนส่งต่อให้ route ของแต่ละหมวด
const app = express();
app.use(morgan("dev"));
app.use(helmet());
// อนุญาตให้ Frontend ส่ง session cookie มาหา Backend
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
// เปิดไฟล์รูปใน public/images ให้ Frontend เรียกผ่าน /images ได้
app.use("/images", express.static("public/images"));

app.get("/", (_req, res) => res.status(200).json({ message: "Indoor Navigation Backend is running" }));

app.get("/health/database", async (_req, res) => {
  try {
    // Promise.all เริ่มอ่านหลายตารางพร้อมกัน เพราะแต่ละ query ไม่ต้องรอผลของอีก query
    const [buildings, floors, places, users, favorites, reviews, reviewLikes, reports] = await Promise.all([
      dbClient.select().from(Buildings),
      dbClient.select().from(Floors),
      dbClient.select().from(Places),
      dbClient.select().from(Users),
      dbClient.select().from(Favorites),
      dbClient.select().from(Reviews),
      dbClient.select().from(ReviewLikes),
      dbClient.select().from(Reports),
    ]);
    return res.status(200).json({
      message: "Database connection is working",
      tableCounts: {
        buildings: buildings.length,
        floors: floors.length,
        places: places.length,
        users: users.length,
        favorites: favorites.length,
        reviews: reviews.length,
        reviewLikes: reviewLikes.length,
        reports: reports.length,
      },
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return res.status(500).json({ message: "Database connection failed" });
  }
});

// เช่น GET /places จะถูกส่งไปจัดการใน Places.route.ts
app.use("/buildings", buildingRouter);
app.use("/floors", floorRouter);
app.use("/places", placeRouter);
app.use("/favorites", favoriteRouter);
app.use(reviewRouter);
app.use(reportRouter);
// เช่น GET /auth/login และ GET /auth/me จะถูกส่งไป Auth.route.ts
app.use("/auth", authRouter);

// ต้องวางหลัง route ทั้งหมด ถ้า request หลุดมาถึงตรงนี้แปลว่าไม่มี endpoint ที่ตรงกัน
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Indoor Navigation Backend running at http://localhost:${PORT}`));
}

export default app;
