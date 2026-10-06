import { dbClient } from "@db/client.js";
import { Buildings, Favorites, Floors, Places } from "@db/schema.js";
import { and, eq, sql } from "drizzle-orm";
import { Router } from "express";
import { validate as isUUID } from "uuid";
import { requireAuth } from "../../auth/middleware.js";

const router = Router();

// Favorite เป็นตารางเชื่อม User กับ Place และใช้ user_id จาก token เสมอ

// อ่านรายการ Favorite ของผู้ใช้ที่ login อยู่
router.get("/", requireAuth, async (_req, res) => {
  try {
    const userId = res.locals.auth.sub;
    const favorites = await dbClient
      .select({
        favorite_id: Favorites.favorite_id,
        created_at: Favorites.created_at,
        place_id: Places.place_id,
        place_name: Places.place_name,
        place_type: Places.place_type,
        room_number: Places.room_number,
        description: Places.description,
        image_url: Places.image_url,
        favCount: Places.favCount,
        floor_id: Floors.floor_id,
        floor_number: Floors.floor_number,
        building_id: Buildings.building_id,
        building_name: Buildings.building_name,
      })
      .from(Favorites)
      .innerJoin(Places, eq(Favorites.place_id, Places.place_id))
      .innerJoin(Floors, eq(Places.floor_id, Floors.floor_id))
      .innerJoin(Buildings, eq(Floors.building_id, Buildings.building_id))
      .where(eq(Favorites.user_id, userId));
    return res.status(200).json(favorites);
  } catch (error) {
    console.error("GET /favorites failed:", error);
    return res.status(500).json({ message: "Unable to get favorites" });
  }
});

// เพิ่ม Favorite ถ้าเคยกดแล้วจะไม่เพิ่มซ้ำ
router.post("/:place_id", requireAuth, async (req, res) => {
  try {
    const placeId = typeof req.params.place_id === "string" ? req.params.place_id : "";
    const userId = res.locals.auth.sub;
    if (!isUUID(placeId)) return res.status(400).json({ message: "place_id must be a valid UUID" });

    const [place] = await dbClient.select({ id: Places.place_id }).from(Places)
      .where(eq(Places.place_id, placeId));
    if (!place) return res.status(404).json({ message: "Place not found" });

    // transaction ทำสองคำสั่งเป็นชุดเดียว: ถ้าขั้นหนึ่งพังจะย้อนกลับทั้งคู่
    const favorite = await dbClient.transaction(async tx => {
      const [favorite] = await tx.insert(Favorites)
        .values({ user_id: userId, place_id: placeId })
        .onConflictDoNothing()
        .returning();
      if (!favorite) return null;

      // sql`` ใช้ให้ PostgreSQL บวกจากค่าปัจจุบัน ป้องกันการอ่านแล้วเขียนทับกัน
      await tx.update(Places)
        .set({ favCount: sql`${Places.favCount} + 1` })
        .where(eq(Places.place_id, placeId));
      return favorite;
    });

    if (!favorite) return res.status(200).json({ message: "Place is already in favorites" });
    return res.status(201).json(favorite);
  } catch (error) {
    console.error("POST /favorites/:place_id failed:", error);
    return res.status(500).json({ message: "Unable to add favorite" });
  }
});

router.delete("/:place_id", requireAuth, async (req, res) => {
  try {
    const placeId = typeof req.params.place_id === "string" ? req.params.place_id : "";
    const userId = res.locals.auth.sub;
    if (!isUUID(placeId)) return res.status(400).json({ message: "place_id must be a valid UUID" });

    // ลบรายการและลดตัวนับพร้อมกัน
    const favorite = await dbClient.transaction(async tx => {
      const [favorite] = await tx.delete(Favorites).where(and(
        eq(Favorites.user_id, userId),
        eq(Favorites.place_id, placeId),
      )).returning();
      if (!favorite) return null;

      await tx.update(Places)
        .set({ favCount: sql`greatest(${Places.favCount} - 1, 0)` })
        .where(eq(Places.place_id, placeId));
      return favorite;
    });

    if (!favorite) return res.status(404).json({ message: "Favorite not found" });
    return res.status(200).json({ message: "Favorite removed", data: favorite });
  } catch (error) {
    console.error("DELETE /favorites/:place_id failed:", error);
    return res.status(500).json({ message: "Unable to remove favorite" });
  }
});

export default router;
