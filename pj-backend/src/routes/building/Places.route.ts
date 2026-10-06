import { dbClient } from "@db/client.js";
import { Buildings, Floors, PlaceImages, PlaceKeywords, Places } from "@db/schema.js";
import { isPlaceType, type PlaceType } from "@db/place-types.js";
import { isRoomStatus, type RoomStatus } from "@db/room-statuses.js";
import { and, eq, exists, ilike, or } from "drizzle-orm";
import { Router } from "express";
import { validate as isUUID } from "uuid";
import { requireAuth, requireRole } from "../../auth/middleware.js";
import { isValidCapacity, isValidTime, parseFloorNumber } from "../../utils/validation.js";

const router = Router();
// ไฟล์นี้รวม API สถานที่ คำค้น และรูป เพราะทั้งหมดเริ่มจาก place_id เดียวกัน
// ฟิลด์ที่จะส่งกลับจาก GET /places และ GET /places/:place_id
const placeColumns = {
  place_id: Places.place_id,
  place_name: Places.place_name,
  place_type: Places.place_type,
  room_number: Places.room_number,
  room_status: Places.room_status,
  capacity: Places.capacity,
  opening_time: Places.opening_time,
  closing_time: Places.closing_time,
  description: Places.description,
  image_url: Places.image_url,
  favCount: Places.favCount,
  floor_id: Floors.floor_id,
  floor_number: Floors.floor_number,
  floor_plan_image: Floors.floor_plan_image,
  building_id: Buildings.building_id,
  building_name: Buildings.building_name,
};

// JOIN เชื่อม places → floors → buildings เพื่อให้ Frontend ไม่ต้องเรียก API สามรอบ
const selectPlaces = () => dbClient
  .select(placeColumns)
  .from(Places)
  .innerJoin(Floors, eq(Places.floor_id, Floors.floor_id))
  .innerJoin(Buildings, eq(Floors.building_id, Buildings.building_id));

router.get("/", async (req, res) => {
  try {
    const { floor, search, building_id, place_type, room_status } = req.query;

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
    if (room_status !== undefined && !isRoomStatus(room_status)) {
      return res.status(400).json({ message: "room_status is invalid" });
    }

    // ค้นหาสถานที่จากเลขชั้น ชื่อสถานที่ เลขห้อง หรือคำค้น
    // สร้างรายการเงื่อนไขเฉพาะ query ที่ผู้ใช้ส่งมา แล้วรวมด้วย AND ตอนท้าย
    const filters = [];
    if (floor !== undefined) filters.push(eq(Floors.floor_number, Number(floor)));
    if (search !== undefined) {
      filters.push(or(
        ilike(Places.place_name, `%${search.trim()}%`),
        ilike(Places.room_number, `%${search.trim()}%`),
        // EXISTS ตอบเพียงว่ามี keyword ตรงหรือไม่ จึงไม่ทำให้สถานที่ซ้ำหลายแถว
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
    if (room_status !== undefined) filters.push(eq(Places.room_status, room_status));

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
    const place_id = typeof req.params.place_id === "string" ? req.params.place_id : "";
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

// อ่านรูปทั้งหมดของสถานที่ โดยเรียงตาม display_order
router.get("/:place_id/images", async (req, res) => {
  try {
    const place_id = typeof req.params.place_id === "string" ? req.params.place_id : "";
    if (!isUUID(place_id)) return res.status(400).json({ message: "place_id must be a valid UUID" });

    const [place] = await dbClient.select({ id: Places.place_id }).from(Places)
      .where(eq(Places.place_id, place_id));
    if (!place) return res.status(404).json({ message: "Place not found" });

    const images = await dbClient.select().from(PlaceImages)
      .where(eq(PlaceImages.place_id, place_id))
      .orderBy(PlaceImages.display_order);
    return res.status(200).json(images);
  } catch (error) {
    console.error("GET /places/:place_id/images failed:", error);
    return res.status(500).json({ message: "Unable to get place images" });
  }
});

// Admin เพิ่ม URL รูปและกำหนดลำดับที่ Frontend จะแสดง
router.post("/:place_id/images", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const place_id = typeof req.params.place_id === "string" ? req.params.place_id : "";
    const { image_url, caption, display_order } = req.body ?? {};
    if (!isUUID(place_id)) return res.status(400).json({ message: "place_id must be a valid UUID" });
    if (typeof image_url !== "string" || !image_url.trim() || image_url.trim().length > 500) {
      return res.status(400).json({ message: "image_url must be 1-500 characters" });
    }
    if (caption !== undefined && caption !== null &&
        (typeof caption !== "string" || caption.trim().length > 200)) {
      return res.status(400).json({ message: "caption must not exceed 200 characters" });
    }
    if (display_order !== undefined && (!Number.isInteger(display_order) || display_order < 0)) {
      return res.status(400).json({ message: "display_order must be a non-negative integer" });
    }

    const [place] = await dbClient.select({ id: Places.place_id }).from(Places)
      .where(eq(Places.place_id, place_id));
    if (!place) return res.status(404).json({ message: "Place not found" });

    const [image] = await dbClient.insert(PlaceImages).values({
      place_id,
      image_url: image_url.trim(),
      caption: typeof caption === "string" ? caption.trim() || null : null,
      display_order: display_order ?? 0,
    }).returning();
    return res.status(201).json(image);
  } catch (error: any) {
    if (error?.code === "23505" || error?.cause?.code === "23505") {
      return res.status(409).json({ message: "This image already exists for the place" });
    }
    console.error("POST /places/:place_id/images failed:", error);
    return res.status(500).json({ message: "Unable to add place image" });
  }
});

router.delete("/:place_id/images/:image_id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const place_id = typeof req.params.place_id === "string" ? req.params.place_id : "";
    const image_id = typeof req.params.image_id === "string" ? req.params.image_id : "";
    if (!isUUID(place_id) || !isUUID(image_id)) {
      return res.status(400).json({ message: "place_id and image_id must be valid UUIDs" });
    }

    const [image] = await dbClient.delete(PlaceImages).where(and(
      eq(PlaceImages.place_id, place_id),
      eq(PlaceImages.image_id, image_id),
    )).returning();
    if (!image) return res.status(404).json({ message: "Place image not found" });
    return res.status(200).json({ message: "Place image deleted", data: image });
  } catch (error) {
    console.error("DELETE /places/:place_id/images/:image_id failed:", error);
    return res.status(500).json({ message: "Unable to delete place image" });
  }
});

// เพิ่มคำค้นหนึ่งคำ; ตัดช่องว่างและแปลงเป็นตัวพิมพ์เล็กก่อนบันทึก
router.post("/:place_id/keywords", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const place_id = typeof req.params.place_id === "string" ? req.params.place_id : "";
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
router.delete("/:place_id/keywords/:keyword_id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const place_id = typeof req.params.place_id === "string" ? req.params.place_id : "";
    const keyword_id = typeof req.params.keyword_id === "string" ? req.params.keyword_id : "";
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
    const place_id = typeof req.params.place_id === "string" ? req.params.place_id : "";

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

// Developer เป็นผู้เพิ่มข้อมูลสถานที่เริ่มต้น
router.post("/", requireAuth, requireRole("DEVELOPER"), async (req, res) => {
  try {
    const {
      floor_id, place_name, place_type, room_number, room_status,
      capacity, opening_time, closing_time, description, image_url,
    } = req.body;

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
    if (room_status !== undefined && !isRoomStatus(room_status)) {
      return res.status(400).json({ message: "room_status is invalid" });
    }
    if (capacity !== undefined && capacity !== null && !isValidCapacity(capacity)) {
      return res.status(400).json({ message: "capacity must be a non-negative integer or null" });
    }
    if (opening_time !== undefined && opening_time !== null && !isValidTime(opening_time)) {
      return res.status(400).json({ message: "opening_time must use HH:MM format or be null" });
    }
    if (closing_time !== undefined && closing_time !== null && !isValidTime(closing_time)) {
      return res.status(400).json({ message: "closing_time must use HH:MM format or be null" });
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
        room_status: room_status ?? "UNKNOWN",
        capacity: capacity ?? null,
        opening_time: opening_time ?? null,
        closing_time: closing_time ?? null,
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

router.put("/:place_id", requireAuth, requireRole("ADMIN", "DEVELOPER"), async (req, res) => {
  try {
    const place_id = typeof req.params.place_id === "string" ? req.params.place_id : "";
    const {
      floor_id, place_name, place_type, room_number, room_status,
      capacity, opening_time, closing_time, description, image_url,
    } = req.body;

    if (!isUUID(place_id)) {
      return res.status(400).json({ message: "place_id must be a valid UUID" });
    }
    // Admin แก้ข้อมูลที่ผู้ใช้เห็นได้ แต่ข้อมูลโครงสร้างให้ Developer แก้
    if (res.locals.auth.role === "ADMIN" &&
        (floor_id !== undefined || place_type !== undefined || room_number !== undefined)) {
      return res.status(403).json({
        message: "Admin cannot update floor_id, place_type, or room_number",
      });
    }
    if (floor_id === undefined && place_name === undefined && place_type === undefined && room_number === undefined &&
        room_status === undefined && capacity === undefined && opening_time === undefined &&
        closing_time === undefined && description === undefined && image_url === undefined) {
      return res.status(400).json({ message: "At least one editable field is required" });
    }

    const updateData: {
      floor_id?: string;
      place_name?: string;
      place_type?: PlaceType | null;
      room_number?: string | null;
      room_status?: RoomStatus;
      capacity?: number | null;
      opening_time?: string | null;
      closing_time?: string | null;
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

    if (room_status !== undefined) {
      if (!isRoomStatus(room_status)) {
        return res.status(400).json({ message: "room_status is invalid" });
      }
      updateData.room_status = room_status;
    }

    if (capacity !== undefined) {
      if (capacity !== null && !isValidCapacity(capacity)) {
        return res.status(400).json({ message: "capacity must be a non-negative integer or null" });
      }
      updateData.capacity = capacity;
    }

    if (opening_time !== undefined) {
      if (opening_time !== null && !isValidTime(opening_time)) {
        return res.status(400).json({ message: "opening_time must use HH:MM format or be null" });
      }
      updateData.opening_time = opening_time;
    }

    if (closing_time !== undefined) {
      if (closing_time !== null && !isValidTime(closing_time)) {
        return res.status(400).json({ message: "closing_time must use HH:MM format or be null" });
      }
      updateData.closing_time = closing_time;
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

router.delete("/:place_id", requireAuth, requireRole("DEVELOPER"), async (req, res) => {
  try {
    const place_id = typeof req.params.place_id === "string" ? req.params.place_id : "";
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
