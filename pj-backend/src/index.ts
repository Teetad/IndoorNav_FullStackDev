import "dotenv/config";
import { dbClient } from "@db/client.js";
import { Buildings, Floors, Places } from "@db/schema.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import buildingRouter from "./routes/Buildings.route.js";
import floorRouter from "./routes/Floors.route.js";
import placeRouter from "./routes/Places.route.js";

const app = express();
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.status(200).json({ message: "Indoor Navigation Backend is running" }));

app.get("/health/database", async (_req, res) => {
  try {
    const [buildings, floors, places] = await Promise.all([
      dbClient.select().from(Buildings),
      dbClient.select().from(Floors),
      dbClient.select().from(Places),
    ]);
    return res.status(200).json({
      message: "Database connection is working",
      tableCounts: { buildings: buildings.length, floors: floors.length, places: places.length },
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/buildings", buildingRouter);
app.use("/floors", floorRouter);
app.use("/places", placeRouter);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Indoor Navigation Backend running at http://localhost:${PORT}`));
}

export default app;
