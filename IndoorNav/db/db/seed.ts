import { dbClient, dbConn } from "@db/client.js";
import { Buildings, Floors, Places } from "@db/schema.js";

const buildingId = "11111111-1111-4111-8111-111111111111";
const floorId = "11111111-1111-4111-8111-111111111106";

async function seed() {
  try {
    await dbClient.delete(Places);
    await dbClient.delete(Floors);
    await dbClient.delete(Buildings);

    await dbClient.insert(Buildings).values({
      building_id: buildingId,
      building_name: "30-Year Building",
      description: "Faculty of Engineering, Chiang Mai University",
    });

    await dbClient.insert(Floors).values({
      floor_id: floorId,
      building_id: buildingId,
      floor_number: 6,
      floor_plan_image: null,
    });

    await dbClient.insert(Places).values([
      {
        place_id: "11111111-1111-4111-8111-111111110001",
        floor_id: floorId,
        place_name: "Multipurpose Classroom",
        room_number: "601",
        description: "Sample classroom on Floor 6",
        image_url: null,
      },
      {
        place_id: "11111111-1111-4111-8111-111111110002",
        floor_id: floorId,
        place_name: "Research Lab",
        room_number: "602",
        description: "Sample research laboratory on Floor 6",
        image_url: null,
      },
      {
        place_id: "11111111-1111-4111-8111-111111110003",
        floor_id: floorId,
        place_name: "Meeting Room",
        room_number: "603",
        description: "Sample meeting room on Floor 6",
        image_url: null,
      },
    ]);

    console.log("Seed completed");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await dbConn.end();
  }
}

seed();
