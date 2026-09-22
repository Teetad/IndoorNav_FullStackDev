import "dotenv/config";
import { dbClient, dbConn } from "./client.js";
import { Buildings, Floors, Places } from "./schema.js";

const buildingId = "11111111-1111-4111-8111-111111111111";
const floorId = "11111111-1111-4111-8111-111111111106";

const buildingData = {
  building_id: buildingId,
  building_name: "30-Year Building",
  description: "Faculty of Engineering, Chiang Mai University",
};

const floorData = {
  floor_id: floorId,
  building_id: buildingId,
  floor_number: 6,
  floor_plan_image: null,
};

const placesData = [
  {
    place_id: "11111111-1111-4111-8111-111111110001",
    floor_id: floorId,
    place_name: "Multipurpose Classroom",
    place_type: "classroom",
    room_number: "601",
    description: "Sample classroom on Floor 6",
    image_url: null,
  },
  {
    place_id: "11111111-1111-4111-8111-111111110002",
    floor_id: floorId,
    place_name: "Research Lab",
    place_type: "laboratory",
    room_number: "602",
    description: "Sample research laboratory on Floor 6",
    image_url: null,
  },
  {
    place_id: "11111111-1111-4111-8111-111111110003",
    floor_id: floorId,
    place_name: "Meeting Room",
    place_type: "meeting_room",
    room_number: "603",
    description: "Sample meeting room on Floor 6",
    image_url: null,
  },
];

async function seed() {
  try {
    // ล้างเฉพาะข้อมูล Phase 1 เพื่อให้ได้ sample data ชุดเดิมทุกครั้ง
    await dbClient.delete(Places);
    await dbClient.delete(Floors);
    await dbClient.delete(Buildings);

    await dbClient.insert(Buildings).values(buildingData);
    await dbClient.insert(Floors).values(floorData);
    await dbClient.insert(Places).values(placesData);

    console.log("Phase 1 seed completed");
  } catch (error) {
    console.error("Phase 1 seed failed:", error);
    process.exitCode = 1;
  } finally {
    await dbConn.end();
  }
}

seed();
