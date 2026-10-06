import { dbClient } from "@db/client.js";
import { Buildings, Floors } from "@db/schema.js";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import { validate as isUUID } from "uuid";
import { requireAuth, requireRole } from "../../auth/middleware.js";
import { parseFloorNumber } from "../../utils/validation.js";

const router = Router();

// ชั้นต้องอ้างถึงอาคารผ่าน building_id และเลขชั้นซ้ำในอาคารเดียวกันไม่ได้

router.get("/", async (req, res) => {
  try {
    const queryBuildingId = req.query.building_id;
    const buildingId = typeof queryBuildingId === "string" ? queryBuildingId : null;
    if (queryBuildingId !== undefined && (!buildingId || !isUUID(buildingId))) {
      return res.status(400).json({ message: "building_id must be a valid UUID" });
    }
    const query = dbClient.select().from(Floors);
    const floors = buildingId ? await query.where(eq(Floors.building_id, buildingId)) : await query;
    return res.status(200).json(floors);
  } catch (error) {
    console.error("GET /floors failed:", error);
    return res.status(500).json({ message: "Unable to get floors" });
  }
});

router.get("/:building_id/:floor_number", async (req, res) => {
  try {
    const { building_id } = req.params;
    const floorNumber = parseFloorNumber(req.params.floor_number);

    // ตรวจสอบรหัสอาคารและเลขชั้นก่อนค้นหา
    if (!isUUID(building_id) || floorNumber === null) {
      return res.status(400).json({ message: "building_id must be a UUID and floor_number an integer" });
    }
    // and() บังคับให้ตรงทั้งอาคารและเลขชั้น
    const [floor] = await dbClient.select().from(Floors).where(and(
      eq(Floors.building_id, building_id), eq(Floors.floor_number, floorNumber),
    ));
    if (!floor) return res.status(404).json({ message: "Floor not found" });
    return res.status(200).json(floor);
  } catch (error) {
    console.error("GET /floors/:building_id/:floor_number failed:", error);
    return res.status(500).json({ message: "Unable to get floor" });
  }
});

// ข้อมูลชั้นและ Floor Plan เป็นข้อมูลโครงสร้าง ให้ Developer จัดการ
router.post("/", requireAuth, requireRole("DEVELOPER"), async (req, res) => {
  try {
    const { building_id, floor_number, floor_plan_image } = req.body;
    const floorNumber = parseFloorNumber(floor_number);
    if (typeof building_id !== "string" || !isUUID(building_id) || floorNumber === null) {
      return res.status(400).json({ message: "building_id and integer floor_number are required" });
    }
    if (floor_plan_image !== undefined &&
        (typeof floor_plan_image !== "string" || floor_plan_image.trim().length > 500)) {
      return res.status(400).json({ message: "floor_plan_image must be a string up to 500 characters" });
    }
    // ตรวจสอบว่าอาคารที่ต้องการเพิ่มชั้นมีอยู่จริง
    const [building] = await dbClient.select({ id: Buildings.building_id }).from(Buildings)
      .where(eq(Buildings.building_id, building_id));
    if (!building) return res.status(404).json({ message: "Building not found" });
    // เพิ่มชั้นใหม่ลงฐานข้อมูล
    const [floor] = await dbClient.insert(Floors).values({
      building_id, floor_number: floorNumber,
      floor_plan_image: typeof floor_plan_image === "string" && floor_plan_image.trim()
        ? floor_plan_image.trim()
        : null,
    }).returning();
    return res.status(201).json(floor);
  } catch (error: any) {
    if (error?.code === "23505" || error?.cause?.code === "23505") {
      return res.status(409).json({ message: "Floor number already exists in this building" });
    }
    console.error("POST /floors failed:", error);
    return res.status(500).json({ message: "Unable to create floor" });
  }
});

router.put("/:floor_id", requireAuth, requireRole("DEVELOPER"), async (req, res) => {
  try {
    const floor_id = typeof req.params.floor_id === "string" ? req.params.floor_id : "";
    const { floor_number, floor_plan_image } = req.body;
    if (!isUUID(floor_id)) return res.status(400).json({ message: "floor_id must be a valid UUID" });
    const values: { floor_number?: number; floor_plan_image?: string | null } = {};
    if (floor_number !== undefined) {
      const parsed = parseFloorNumber(floor_number);
      if (parsed === null) return res.status(400).json({ message: "floor_number must be an integer" });
      values.floor_number = parsed;
    }
    if (floor_plan_image !== undefined) {
      if (typeof floor_plan_image !== "string" || floor_plan_image.trim().length > 500) {
        return res.status(400).json({ message: "floor_plan_image must be a string up to 500 characters" });
      }
      values.floor_plan_image = floor_plan_image.trim() || null;
    }
    if (floor_number === undefined && floor_plan_image === undefined) {
      return res.status(400).json({ message: "floor_number or floor_plan_image is required" });
    }
    const [floor] = await dbClient.update(Floors).set(values)
      .where(eq(Floors.floor_id, floor_id)).returning();
    if (!floor) return res.status(404).json({ message: "Floor not found" });
    return res.status(200).json(floor);
  } catch (error: any) {
    if (error?.code === "23505" || error?.cause?.code === "23505") {
      return res.status(409).json({ message: "Floor number already exists in this building" });
    }
    console.error("PUT /floors/:floor_id failed:", error);
    return res.status(500).json({ message: "Unable to update floor" });
  }
});

router.delete("/:floor_id", requireAuth, requireRole("DEVELOPER"), async (req, res) => {
  try {
    const floor_id = typeof req.params.floor_id === "string" ? req.params.floor_id : "";
    if (!isUUID(floor_id)) return res.status(400).json({ message: "floor_id must be a valid UUID" });
    const [floor] = await dbClient.delete(Floors).where(eq(Floors.floor_id, floor_id)).returning();
    if (!floor) return res.status(404).json({ message: "Floor not found" });
    return res.status(200).json({ message: "Floor deleted", data: floor });
  } catch (error) {
    console.error("DELETE /floors/:floor_id failed:", error);
    return res.status(500).json({ message: "Unable to delete floor" });
  }
});

export default router;
