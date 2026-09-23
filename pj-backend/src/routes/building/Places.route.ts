import { dbClient } from "@db/client.js";
import { Buildings, Floors, PlaceKeywords, Places } from "@db/schema.js";
import { isPlaceType, type PlaceType } from "@db/place-types.js";
import { and, eq, exists, ilike, or } from "drizzle-orm";
import { Router } from "express";
import { validate as isUUID } from "uuid";
import { parseFloorNumber } from "../../utils/validation.js";

const router = Router();
// ฟิลด์ที่จะส่งกลับจาก GET /places และ GET /places/:place_id
const placeColumns = {
  place_id: Places.place_id,
  place_name: Places.place_name,
  place_type: Places.place_type,
  room_number: Places.room_number,
  description: Places.description,
  image_url: Places.image_url,
  favCount: Places.favCount,
  floor_id: Floors.floor_id,
  floor_number: Floors.floor_number,
  floor_plan_image: Floors.floor_plan_image,
  building_id: Buildings.building_id,
  building_name: Buildings.building_name,
};

// JOIN เพื่อให้แต่ละสถานที่มีเลขชั้นและชื่ออาคารในผลลัพธ์เดียวกัน
const selectPlaces = () => dbClient
  .select(placeColumns)
  .from(Places)
  .innerJoin(Floors, eq(Places.floor_id, Floors.floor_id))
  .innerJoin(Buildings, eq(Floors.building_id, Buildings.building_id));

router.get("/", async (req, res) => {
  try {
    const { floor, search, building_id, place_type } = req.query;

    if (floor !== undefined && (typeof floor !== "string" || parseFloorNumber(floor) === null)) {
      return res.status(400).json({ message: "floor must be an integer" });
    }
    if (search !== undefined && (typeof search !== "string" || !search.trim())) {
      return res.status(400).json({ message: "search must be a non-empty string" });
    }
    if (building_id !== undefined && (typeof building_id !== "string" || !isUUID(building_id))) {
      return res.status(400).json({ message: "building_id must be a valid UUID" });
    }
    if (place_type !== undefined && !isPlaceType(place_type)) {
      return res.status(400).json({ message: "place_type is invalid" });
    }

    // ค้นหาสถานที่จากเลขชั้น ชื่อสถานที่ เลขห้อง หรือคำค้น
    const filters = [];
    if (floor !== undefined) filters.push(eq(Floors.floor_number, Number(floor)));
    if (search !== undefined) {
      filters.push(or(
        ilike(Places.place_name, `%${search.trim()}%`),
        ilike(Places.room_number, `%${search.trim()}%`),
        // EXISTS ตรวจว่ามีคำค้นตรงหรือไม่ โดยไม่ทำให้สถานที่ซ้ำหลายแถว
        exists(dbClient.select({ id: PlaceKeywords.keyword_id })
          .from(PlaceKeywords)
          .where(and(
            eq(PlaceKeywords.place_id, Places.place_id),
            ilike(PlaceKeywords.keyword, `%${search.trim()}%`),
          ))),
      ));
    }
    if (building_id !== undefined) filters.push(eq(Buildings.building_id, building_id));
    if (place_type !== undefined) filters.push(eq(Places.place_type, place_type));

    const query = selectPlaces();
    const places = filters.length > 0
      ? await query.where(and(...filters))
      : await query;

    return res.status(200).json(places);
  } catch (error) {
    console.error("GET /places failed:", error);
    return res.status(500).json({ message: "Unable to get places" });
  }
});

// อ่านคำค้นของสถานที่หนึ่งแห่ง
router.get("/:place_id/keywords", async (req, res) => {
  try {
    const { place_id } = req.params;
    if (!isUUID(place_id)) return res.status(400).json({ message: "place_id must be a valid UUID" });

    const [place] = await dbClient.select({ id: Places.place_id }).from(Places)
      .where(eq(Places.place_id, place_id));
    if (!place) return res.status(404).json({ message: "Place not found" });

    const keywords = await dbClient.select().from(PlaceKeywords)
      .where(eq(PlaceKeywords.place_id, place_id));
    return res.status(200).json(keywords);
  } catch (error) {
    console.error("GET /places/:place_id/keywords failed:", error);
    return res.status(500).json({ message: "Unable to get keywords" });
  }
});

// เพิ่มคำค้นหนึ่งคำ; ตัดช่องว่างและแปลงเป็นตัวพิมพ์เล็กก่อนบันทึก
router.post("/:place_id/keywords", async (req, res) => {
  try {
    const { place_id } = req.params;
    const { keyword } = req.body ?? {};
    if (!isUUID(place_id)) return res.status(400).json({ message: "place_id must be a valid UUID" });
    if (typeof keyword !== "string" || !keyword.trim() || keyword.trim().length > 100) {
      return res.status(400).json({ message: "keyword must be 1-100 characters" });
    }

    const [place] = await dbClient.select({ id: Places.place_id }).from(Places)
      .where(eq(Places.place_id, place_id));
    if (!place) return res.status(404).json({ message: "Place not found" });

    const [created] = await dbClient.insert(PlaceKeywords)
      .values({ place_id, keyword: keyword.trim().toLowerCase() }).returning();
    return res.status(201).json(created);
  } catch (error: any) {
    if (error?.code === "23505" || error?.cause?.code === "23505") {
      return res.status(409).json({ message: "Keyword already exists for this place" });
    }
    console.error("POST /places/:place_id/keywords failed:", error);
    return res.status(500).json({ message: "Unable to create keyword" });
  }
});

// ต้องตรงทั้ง place_id และ keyword_id จึงลบได้
router.delete("/:place_id/keywords/:keyword_id", async (req, res) => {
  try {
    const { place_id, keyword_id } = req.params;
    if (!isUUID(place_id) || !isUUID(keyword_id)) {
      return res.status(400).json({ message: "place_id and keyword_id must be valid UUIDs" });
    }

    const [deleted] = await dbClient.delete(PlaceKeywords)
      .where(and(eq(PlaceKeywords.place_id, place_id), eq(PlaceKeywords.keyword_id, keyword_id)))
      .returning();
    if (!deleted) return res.status(404).json({ message: "Keyword not found" });
    return res.status(200).json({ message: "Keyword deleted", data: deleted });
  } catch (error) {
    console.error("DELETE /places/:place_id/keywords/:keyword_id failed:", error);
    return res.status(500).json({ message: "Unable to delete keyword" });
  }
});

router.get("/:place_id", async (req, res) => {
  try {
    const { place_id } = req.params;

    // ตรวจสอบว่า place_id เป็น UUID ที่ถูกต้อง
    if (!isUUID(place_id)) {
      return res.status(400).json({ message: "place_id must be a valid UUID" });
    }

    const [place] = await selectPlaces().where(eq(Places.place_id, place_id));

    // ถ้าไม่พบสถานที่ให้ส่ง 404
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    return res.status(200).json(place);
  } catch (error) {
    console.error("GET /places/:place_id failed:", error);
    return res.status(500).json({ message: "Unable to get place" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { floor_id, place_name, place_type, room_number, description, image_url } = req.body;

    if (typeof floor_id !== "string" || !isUUID(floor_id)) {
      return res.status(400).json({ message: "floor_id is required and must be a valid UUID" });
    }
    if (typeof place_name !== "string" || !place_name.trim()) {
      return res.status(400).json({ message: "place_name is required" });
    }
    if (place_name.trim().length > 120) {
      return res.status(400).json({ message: "place_name must not exceed 120 characters" });
    }
    if (place_type !== undefined && place_type !== null && !isPlaceType(place_type)) {
      return res.status(400).json({ message: "place_type is invalid" });
    }
    if (description !== undefined && (typeof description !== "string" || description.trim().length > 500)) {
      return res.status(400).json({ message: "description must not exceed 500 characters" });
    }
    if (room_number !== undefined && (typeof room_number !== "string" || room_number.trim().length > 30)) {
      return res.status(400).json({ message: "room_number must not exceed 30 characters" });
    }
    if (image_url !== undefined && (typeof image_url !== "string" || image_url.trim().length > 500)) {
      return res.status(400).json({ message: "image_url must not exceed 500 characters" });
    }

    // ตรวจสอบว่าชั้นที่ระบุมีอยู่จริง
    const [floorData] = await dbClient
      .select()
      .from(Floors)
      .where(eq(Floors.floor_id, floor_id));

    if (!floorData) {
      return res.status(404).json({ message: "Floor not found" });
    }

    // เพิ่มข้อมูลสถานที่ใหม่ลงฐานข้อมูล
    const [place] = await dbClient
      .insert(Places)
      .values({
        floor_id,
        place_name: place_name.trim(),
        place_type: place_type ?? null,
        room_number: typeof room_number === "string" ? room_number.trim() || null : null,
        description: typeof description === "string" ? description.trim() || null : null,
        image_url: typeof image_url === "string" ? image_url.trim() || null : null,
      })
      .returning();

    return res.status(201).json(place);
  } catch (error) {
    console.error("POST /places failed:", error);
    return res.status(500).json({ message: "Unable to create place" });
  }
});

router.put("/:place_id", async (req, res) => {
  try {
    const { place_id } = req.params;
    const { floor_id, place_name, place_type, room_number, description, image_url } = req.body;

    if (!isUUID(place_id)) {
      return res.status(400).json({ message: "place_id must be a valid UUID" });
    }
    if (floor_id === undefined && place_name === undefined && place_type === undefined && room_number === undefined &&
        description === undefined && image_url === undefined) {
      return res.status(400).json({ message: "At least one editable field is required" });
    }

    const updateData: {
      floor_id?: string;
      place_name?: string;
      place_type?: PlaceType | null;
      room_number?: string | null;
      description?: string | null;
      image_url?: string | null;
    } = {};

    if (floor_id !== undefined) {
      if (typeof floor_id !== "string" || !isUUID(floor_id)) {
        return res.status(400).json({ message: "floor_id must be a valid UUID" });
      }

      const [floorData] = await dbClient.select().from(Floors)
        .where(eq(Floors.floor_id, floor_id));
      if (!floorData) {
        return res.status(404).json({ message: "Floor not found" });
      }
      updateData.floor_id = floor_id;
    }

    if (place_name !== undefined) {
      if (typeof place_name !== "string" || !place_name.trim() || place_name.trim().length > 120) {
        return res.status(400).json({ message: "place_name must be 1-120 characters" });
      }
      updateData.place_name = place_name.trim();
    }

    if (place_type !== undefined) {
      if (place_type !== null && !isPlaceType(place_type)) {
        return res.status(400).json({ message: "place_type is invalid" });
      }
      updateData.place_type = place_type;
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.trim().length > 500) {
        return res.status(400).json({ message: "description must not exceed 500 characters" });
      }
      updateData.description = description.trim() || null;
    }

    if (room_number !== undefined) {
      if (typeof room_number !== "string" || room_number.trim().length > 30) {
        return res.status(400).json({ message: "room_number must not exceed 30 characters" });
      }
      updateData.room_number = room_number.trim() || null;
    }

    if (image_url !== undefined) {
      if (typeof image_url !== "string" || image_url.trim().length > 500) {
        return res.status(400).json({ message: "image_url must not exceed 500 characters" });
      }
      updateData.image_url = image_url.trim() || null;
    }

    const [place] = await dbClient.update(Places).set(updateData)
      .where(eq(Places.place_id, place_id)).returning();

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    return res.status(200).json(place);
  } catch (error) {
    console.error("PUT /places/:place_id failed:", error);
    return res.status(500).json({ message: "Unable to update place" });
  }
});

router.delete("/:place_id", async (req, res) => {
  try {
    const { place_id } = req.params;
    if (!isUUID(place_id)) {
      return res.status(400).json({ message: "place_id must be a valid UUID" });
    }

    const [place] = await dbClient.delete(Places)
      .where(eq(Places.place_id, place_id)).returning();

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    return res.status(200).json({ message: "Place deleted", data: place });
  } catch (error) {
    console.error("DELETE /places/:place_id failed:", error);
    return res.status(500).json({ message: "Unable to delete place" });
  }
});

export default router;
