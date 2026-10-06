// นำเข้าข้อมูลแผนที่: ใช้ --apply เพื่อบันทึกจริง
import { and, eq, or } from "drizzle-orm";
import { v5 as uuidv5 } from "uuid";
import { building30, mapFloors } from "./data/building30.js";
import { Buildings, Floors, PlaceImages, Places } from "./schema.js";

// ID อาคารตัวอย่างเดิม
const namespace = "11111111-1111-4111-8111-111111111111";
// อ่านตัวเลือกท้ายคำสั่ง
const args = process.argv.slice(2);
if (args.some(arg => arg !== "--apply")) throw new Error("Usage: seed-maps.ts [--apply]");

// แสดงข้อมูลก่อนนำเข้า
console.log(JSON.stringify({ building: building30, floors: mapFloors }, null, 2));
if (args.includes("--apply")) {
  const { dbClient, dbConn } = await import("./client.js");
  try {
    // บันทึกทั้งชุด ถ้าผิดพลาดให้ยกเลิกทั้งหมด
    // transaction ช่วยไม่ให้เหลือข้อมูลครึ่งชุด หากเพิ่มชั้นหรือสถานที่บางรายการไม่สำเร็จ
    const result = await dbClient.transaction(async tx => {
      // ค้นหาอาคารเดิม 🏢
      const candidates = await tx.select().from(Buildings).where(or(
        eq(Buildings.building_name, building30.name),
        eq(Buildings.building_name, "30-Year Building"),
        eq(Buildings.building_id, namespace),
      ));
      if (candidates.length > 1) throw new Error("Multiple candidate buildings found; reconcile them before importing.");
      let building = candidates[0];
      if (building) {
        if (![building30.name, "30-Year Building"].includes(building.building_name)) {
          throw new Error("Reserved building ID belongs to another building.");
        }
        // ปรับชื่ออาคารเดิมเป็นภาษาไทย
        [building] = await tx.update(Buildings).set({ building_name: building30.name })
          .where(eq(Buildings.building_id, building.building_id)).returning();
      } else {
        // เพิ่มอาคารถ้ายังไม่มี
        [building] = await tx.insert(Buildings).values({
          building_id: namespace, building_name: building30.name, description: building30.description,
        }).returning();
      }
      if (!building) throw new Error("Unable to resolve building");
      // นับรายการที่เพิ่มและข้าม
      let inserted = 0;
      let skipped = 0;
      let imagesInserted = 0;
      // เพิ่มชั้นที่ยังไม่มี โดยสร้าง ID เดิมเมื่อใช้ข้อมูลเดิม
      for (const source of mapFloors) {
        await tx.insert(Floors).values({
          floor_id: uuidv5(`floor:${source.floor_number}`, building.building_id),
          building_id: building.building_id, floor_number: source.floor_number,
        }).onConflictDoNothing();
        // อ่าน ID ชั้นที่ใช้จริง
        const [floor] = await tx.select().from(Floors).where(and(
          eq(Floors.building_id, building.building_id), eq(Floors.floor_number, source.floor_number),
        ));
        if (!floor) throw new Error(`Unable to resolve floor ${source.floor_number}`);
        // อ่านสถานที่เดิมในชั้นนี้ 🌆
        const existing = await tx.select().from(Places).where(eq(Places.floor_id, floor.floor_id));
        for (const place of source.places) {
          // สร้าง ID จาก key และชั้น
          // UUID v5 สร้าง ID เดิมจากข้อความเดิม ทำให้รัน seed ซ้ำแล้วรู้ว่าเป็นรายการเดิม
          const id = uuidv5(`place:${place.key}`, floor.floor_id);
          // ข้ามสถานที่ที่ตรง ID ชื่อ หรือเลขห้องเดิม
          const imported = existing.find(row => row.place_id === id);
          if (imported) {
            // เติมข้อมูลที่ยืนยันแล้วให้รายการที่สคริปต์นี้เคยนำเข้า
            const details = {
              place_type: imported.place_type ?? place.place_type,
              room_status: imported.room_status === "UNKNOWN"
                ? place.room_status ?? imported.room_status
                : imported.room_status,
              capacity: imported.capacity ?? place.capacity ?? null,
              opening_time: imported.opening_time ?? place.opening_time ?? null,
              closing_time: imported.closing_time ?? place.closing_time ?? null,
              // รายการที่มีเวลายืนยันแล้ว ใช้รายละเอียดใหม่จากชุดข้อมูลด้วย
              description: place.opening_time !== undefined
                ? `${place.description} | แหล่งอ้างอิง: ${source.source}`
                : imported.description,
            };
            if (details.place_type !== imported.place_type ||
                details.room_status !== imported.room_status ||
                details.capacity !== imported.capacity ||
                details.opening_time !== imported.opening_time ||
                details.closing_time !== imported.closing_time ||
                details.description !== imported.description) {
              await tx.update(Places).set(details)
                .where(eq(Places.place_id, imported.place_id));
            }
            // เพิ่ม URL รูปที่ยังไม่มี โดย unique index ป้องกัน URL ซ้ำเมื่อรัน seed อีกครั้ง
            if (place.image_urls?.length) {
              const images = await tx.insert(PlaceImages).values(
                place.image_urls.map((image_url, index) => ({
                  place_id: imported.place_id,
                  image_url,
                  caption: `รูปที่ ${index + 1} ของ ${place.place_name}`,
                  display_order: index + 1,
                })),
              ).onConflictDoNothing().returning({ image_id: PlaceImages.image_id });
              imagesInserted += images.length;
            }
            skipped++;
            continue;
          }
          if (existing.some(row => row.place_name === place.place_name ||
            (place.room_number !== null && row.room_number === place.room_number))) {
            skipped++;
            continue;
          }
          // เพิ่มสถานที่พร้อมชั้นและแหล่งอ้างอิง
          await tx.insert(Places).values({
            place_id: id, floor_id: floor.floor_id, place_name: place.place_name,
            place_type: place.place_type,
            room_number: place.room_number,
            room_status: place.room_status ?? "UNKNOWN",
            capacity: place.capacity ?? null,
            opening_time: place.opening_time ?? null,
            closing_time: place.closing_time ?? null,
            description: `${place.description} | แหล่งอ้างอิง: ${source.source}`,
          });
          if (place.image_urls?.length) {
            const images = await tx.insert(PlaceImages).values(
              place.image_urls.map((image_url, index) => ({
                place_id: id,
                image_url,
                caption: `รูปที่ ${index + 1} ของ ${place.place_name}`,
                display_order: index + 1,
              })),
            ).onConflictDoNothing().returning({ image_id: PlaceImages.image_id });
            imagesInserted += images.length;
          }
          inserted++;
        }
      }
      return { building_id: building.building_id, inserted, skipped, imagesInserted };
    });
    // แสดงผลเมื่อบันทึกสำเร็จ
    console.log("Map import completed", result);
  } catch (error) {
    // แจ้งข้อผิดพลาด
    console.error("Map import failed; transaction rolled back:", error);
    process.exitCode = 1;
  } finally {
    // ปิดการเชื่อมต่อเสมอ
    await dbConn.end();
  }
} else {
  console.log("Preview only. Use --apply to import without deleting existing records.");
}
