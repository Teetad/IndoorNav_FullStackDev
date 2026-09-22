// นำเข้าข้อมูลแผนที่: ใช้ --apply เพื่อบันทึกจริง
import { and, eq, or, sql } from "drizzle-orm";
import { v5 as uuidv5 } from "uuid";
import { building30, mapFloors } from "./data/building30.js";
import { Buildings, Floors, Places } from "./schema.js";

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
    const result = await dbClient.transaction(async tx => {
      // ให้การนำเข้าที่ใช้ล็อกเดียวกันรอคิว
      await tx.execute(sql`select pg_advisory_xact_lock(302028)`);
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
          const id = uuidv5(`place:${place.key}`, floor.floor_id);
          // ข้ามสถานที่ที่ตรง ID ชื่อ หรือเลขห้องเดิม
          const matched = existing.find(row => row.place_id === id || row.place_name === place.place_name ||
            (place.room_number !== null && row.room_number === place.room_number));
          if (matched) {
            // เติมประเภทให้ข้อมูลที่เคยนำเข้าไว้ โดยไม่เขียนทับประเภทที่แก้เอง
            if (matched.place_type === null && place.place_type !== null) {
              await tx.update(Places).set({ place_type: place.place_type })
                .where(eq(Places.place_id, matched.place_id));
            }
            skipped++; // ++ คือเพิ่มตัวนับอีก 1
            continue;
          }
          // เพิ่มสถานที่พร้อมชั้นและแหล่งอ้างอิง
          await tx.insert(Places).values({
            place_id: id, floor_id: floor.floor_id, place_name: place.place_name,
            place_type: place.place_type,
            room_number: place.room_number,
            description: `${place.description} | แหล่งอ้างอิง: ${source.source}`,
          });
          inserted++;
        }
      }
      return { building_id: building.building_id, inserted, skipped };
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
