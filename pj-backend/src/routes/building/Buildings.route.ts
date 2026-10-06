import { dbClient } from "@db/client.js";
import { Buildings } from "@db/schema.js";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { validate as isUUID } from "uuid";
import { requireAuth, requireRole } from "../../auth/middleware.js";

const router = Router();

// Route นี้ดูแลเฉพาะอาคาร: GET อ่านข้อมูล ส่วน POST/DELETE จำกัดให้ Developer

router.get("/", async (_req, res) => {
  try {
    return res.status(200).json(await dbClient.select().from(Buildings));
  } catch (error) {
    console.error("GET /buildings failed:", error);
    return res.status(500).json({ message: "Unable to get buildings" });
  }
});

router.get("/:building_id", async (req, res) => {
  try {
    const building_id = typeof req.params.building_id === "string" ? req.params.building_id : "";

    // ตรวจสอบว่า building_id เป็น UUID ที่ถูกต้อง
    if (!isUUID(building_id)) {
      return res.status(400).json({ message: "building_id must be a valid UUID" });
    }
    // Drizzle คืนผลเป็น array; [building] คือหยิบแถวแรกออกมา
    const [building] = await dbClient.select().from(Buildings)
      .where(eq(Buildings.building_id, building_id));
    if (!building) return res.status(404).json({ message: "Building not found" });
    return res.status(200).json(building);
  } catch (error) {
    console.error("GET /buildings/:building_id failed:", error);
    return res.status(500).json({ message: "Unable to get building" });
  }
});

// การเพิ่มและลบอาคารเป็นงานของ Developer
router.post("/", requireAuth, requireRole("DEVELOPER"), async (req, res) => {
  try {
    const { building_name, description } = req.body;

    // ชื่ออาคารเป็นข้อมูลที่จำเป็น
    if (typeof building_name !== "string" || !building_name.trim()) {
      return res.status(400).json({ message: "building_name is required" });
    }
    if (building_name.trim().length > 120) {
      return res.status(400).json({ message: "building_name must not exceed 120 characters" });
    }
    if (description !== undefined && (typeof description !== "string" || description.trim().length > 500)) {
      return res.status(400).json({ message: "One or more fields exceed their maximum length" });
    }
    // เพิ่มอาคารใหม่ลงฐานข้อมูล
    const [building] = await dbClient
      .insert(Buildings)
      .values({
        building_name: building_name.trim(),
        description: typeof description === "string" && description.trim() ? description.trim() : null,
      })
      .returning();
    return res.status(201).json(building);
  } catch (error: any) {
    if (error?.code === "23505" || error?.cause?.code === "23505") {
      return res.status(409).json({ message: "Building name already exists" });
    }
    console.error("POST /buildings failed:", error);
    return res.status(500).json({ message: "Unable to create building" });
  }
});

router.delete("/:building_id", requireAuth, requireRole("DEVELOPER"), async (req, res) => {
  try {
    const building_id = typeof req.params.building_id === "string" ? req.params.building_id : "";
    if (!isUUID(building_id)) {
      return res.status(400).json({ message: "building_id must be a valid UUID" });
    }
    const [deleted] = await dbClient.delete(Buildings)
      .where(eq(Buildings.building_id, building_id)).returning();
    if (!deleted) return res.status(404).json({ message: "Building not found" });
    return res.status(200).json({ message: "Building deleted", data: deleted });
  } catch (error) {
    console.error("DELETE /buildings/:building_id failed:", error);
    return res.status(500).json({ message: "Unable to delete building" });
  }
});

export default router;
