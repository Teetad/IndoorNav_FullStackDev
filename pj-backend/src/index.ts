import "dotenv/config";
import { dbClient } from "@db/client.js";
import { Buildings, Favorites, Floors, Places, ReviewLikes, Reviews, Users } from "@db/schema.js";
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

app.get("/", (_req, res) => res.status(200).json({ message: "Indoor Navigation Backend is running" }));

app.get("/health/database", async (_req, res) => {
  try {
    const [buildings, floors, places, users, favorites, reviews, reviewLikes] = await Promise.all([
      dbClient.select().from(Buildings),
      dbClient.select().from(Floors),
      dbClient.select().from(Places),
      dbClient.select().from(Users),
      dbClient.select().from(Favorites),
      dbClient.select().from(Reviews),
      dbClient.select().from(ReviewLikes),
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
// เช่น GET /auth/login และ GET /auth/me จะถูกส่งไป Auth.route.ts
app.use("/auth", authRouter);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Indoor Navigation Backend running at http://localhost:${PORT}`));
}

export default app;
