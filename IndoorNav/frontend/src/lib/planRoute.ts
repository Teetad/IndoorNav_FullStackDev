import type {
  EndpointsByFloor,
  FloorId,
  Point,
  RoomsByFloor,
  StairsByFloor,
  Wall,
  WallsByFloor,
} from "../Floor_Information";
import type { RouteDirections, RouteLeg, RouteSummary } from "../types";
import { buildDirections } from "./directions";
import { findFloorSequence, findRoom, nearestSharedStair } from "./routing";

/** Everything the planner needs. No React, no browser. */
export type MapData = { walls: WallsByFloor; stairs: StairsByFloor; rooms: RoomsByFloor };

/** Finds one path on one floor. Can be sync (in-process) or async (calls a server). */
export type FindPath = (walls: Wall[], start: Point, goal: Point) => Point[] | null | Promise<Point[] | null>;

export type PlanError = "room_not_found" | "no_stairs" | "no_path";

export type PlanResult =
  | { ok: true; summary: RouteSummary; directions: RouteDirections; endpoints: Partial<EndpointsByFloor> }
  | { ok: false; code: PlanError; error: string };

const fail = (code: PlanError, error: string): PlanResult => ({ ok: false, code, error });

/** Room name in, route + turn-by-turn directions out. Works for one floor or many. */
export async function planRoute(
  data: MapData,
  fromName: string,
  toName: string,
  findPath: FindPath,
  floorLabel?: (id: FloorId) => string
): Promise<PlanResult> {
  const startRoom = findRoom(data.rooms, fromName);
  if (!startRoom) return fail("room_not_found", `Room "${fromName}" not found.`);
  const goalRoom = findRoom(data.rooms, toName);
  if (!goalRoom) return fail("room_not_found", `Room "${toName}" not found.`);

  // Same floor gives a one-floor sequence, so one code path handles both cases.
  const sequence = findFloorSequence(data.stairs, startRoom.floorId, goalRoom.floorId);
  if (!sequence) {
    return fail("no_stairs", `No stairs connect floor ${startRoom.floorId} to floor ${goalRoom.floorId}.`);
  }

  const endpoints: Partial<EndpointsByFloor> = {};
  const legs: RouteLeg[] = [];
  let totalSteps = 0;
  let cursor = startRoom.point;

  for (let i = 0; i < sequence.length; i++) {
    const floorId = sequence[i];
    const isLast = i === sequence.length - 1;
    const exit = isLast ? goalRoom.point : nearestSharedStair(data.stairs, floorId, sequence[i + 1], cursor);
    if (!exit) return fail("no_stairs", `No shared stairs between floor ${floorId} and floor ${sequence[i + 1]}.`);

    const path = await findPath(data.walls[floorId], cursor, exit);
    if (!path) return fail("no_path", `No walkable path on floor ${floorId}.`);

    endpoints[floorId] = { start: cursor, goal: exit };
    legs.push({ floorId, path });
    totalSteps += Math.max(0, path.length - 1);
    cursor = exit;
  }

  const summary: RouteSummary = {
    floors: sequence,
    totalSteps,
    legs,
    startRoom: fromName.trim(),
    goalRoom: toName.trim(),
  };
  return { ok: true, summary, endpoints, directions: buildDirections(summary, floorLabel) as RouteDirections };
}