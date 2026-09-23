import { dbClient, dbConn } from "@db/client.js";

async function queryData() {
  const buildings = await dbClient.query.Buildings.findMany();
  const floors = await dbClient.query.Floors.findMany();
  const places = await dbClient.query.Places.findMany();

  console.log({
    buildings,
    floors,
    places,
  });

  await dbConn.end();
}

queryData();
