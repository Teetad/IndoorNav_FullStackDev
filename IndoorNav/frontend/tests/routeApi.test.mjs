import assert from "node:assert/strict";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { getRouteJsonResponse } = await jiti.import("../src/lib/routeApi.ts");

const map = {
  width: 5,
  height: 5,
  walls: {
    "4": [],
    "5": [],
  },
  stairs: {
    "4": [[2, 2]],
    "5": [[2, 2]],
  },
  rooms: {
    "4": [
      { number: "413A", x: 0, y: 0 },
      { number: "411A", x: 4, y: 0 },
    ],
    "5": [
      { number: "501", x: 4, y: 4 },
    ],
  },
};

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test("route API returns compact JSON for a GET request", async () => {
  const response = await getRouteJsonResponse(
    map,
    "http://localhost/api/route?from=413A&to=411A"
  );
  const json = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^application\/json/);
  assert.deepEqual(json, {
    from: "413A",
    to: "411A",
    floors: ["4"],
    destinationSide: "ahead",
    instructions: ["straight"],
  });
});

test("route API returns detailed JSON and path data for a POST request", async () => {
  const response = await getRouteJsonResponse(
    map,
    new Request("http://localhost/api/route", {
      method: "POST",
      body: JSON.stringify({
        from: "413A",
        to: "501",
        detailed: true,
        includePath: true,
      }),
    })
  );
  const json = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(json.floors, ["4", "5"]);
  assert.equal(typeof json.totalSteps, "number");
  assert.ok(json.instructions.some((item) => item.kind === "stairs-up"));
  assert.equal(json.legs.length, 2);
});

test("route API returns JSON errors", async () => {
  const response = await getRouteJsonResponse(map, "http://localhost/api/route?from=413A");
  const json = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(json, {
    code: "missing_params",
    error: 'Both "from" and "to" are required.',
  });
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}
console.log(`${passed}/${tests.length} route API tests passed`);
