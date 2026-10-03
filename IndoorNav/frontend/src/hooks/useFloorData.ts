import { useMemo, useState } from "react";
import {
  INITIAL_ENDPOINTS_BY_FLOOR,
  INITIAL_WALLS_BY_FLOOR,
  INITIAL_STAIRS_BY_FLOOR,
  INITIAL_ROOMS_BY_FLOOR,
} from "../Floor_Information";
import type {
  FloorId,
  Point,
  Wall,
  WallsByFloor,
  StairsByFloor,
  RoomsByFloor,
  EndpointsByFloor,
} from "../Floor_Information";
import { cellKey } from "../lib/routing";

/**
 * Owns all per-floor map data and the edit operations on it.
 * Every mutator targets `floorId`, so callers don't repeat the
 * "update one key of a ByFloor record" boilerplate.
 */
export function useFloorData(floorId: FloorId) {
  const [wallsByFloor, setWallsByFloor] = useState<WallsByFloor>(INITIAL_WALLS_BY_FLOOR);
  const [stairsByFloor, setStairsByFloor] = useState<StairsByFloor>(INITIAL_STAIRS_BY_FLOOR);
  const [roomsByFloor, setRoomsByFloor] = useState<RoomsByFloor>(INITIAL_ROOMS_BY_FLOOR);
  const [endpointsByFloor, setEndpointsByFloor] = useState<EndpointsByFloor>(INITIAL_ENDPOINTS_BY_FLOOR);

  const walls = wallsByFloor[floorId];
  const stairs = stairsByFloor[floorId];
  const rooms = roomsByFloor[floorId];
  const { start, goal } = endpointsByFloor[floorId];

  // O(1) lookups for the grid renderer instead of .some()/.find() per cell.
  const lookups = useMemo(
    () => ({
      walls: new Set(walls.map(([x, y]) => cellKey(x, y))),
      stairs: new Set(stairs.map(([x, y]) => cellKey(x, y))),
      rooms: new Map(rooms.map((r) => [cellKey(r.x, r.y), r])),
    }),
    [walls, stairs, rooms]
  );

  const isOccupied = (x: number, y: number) =>
    (!!start && start.x === x && start.y === y) || (!!goal && goal.x === x && goal.y === y);

  const removeWall = (x: number, y: number) =>
    setWallsByFloor((prev) => {
      if (!prev[floorId].some(([wx, wy]) => wx === x && wy === y)) return prev;
      return { ...prev, [floorId]: prev[floorId].filter(([wx, wy]) => !(wx === x && wy === y)) };
    });

  const toggleIn = (
    setter: typeof setWallsByFloor,
    x: number,
    y: number
  ) =>
    setter((prev) => {
      const list = prev[floorId];
      const exists = list.some(([cx, cy]) => cx === x && cy === y);
      const next = exists
        ? list.filter(([cx, cy]) => !(cx === x && cy === y))
        : [...list, [x, y] as Wall];
      return { ...prev, [floorId]: next };
    });

  const toggleWall = (x: number, y: number) => {
    if (!isOccupied(x, y)) toggleIn(setWallsByFloor, x, y);
  };

  const toggleStairs = (x: number, y: number) => {
    if (isOccupied(x, y)) return;
    toggleIn(setStairsByFloor, x, y);
    removeWall(x, y); // stairs must be walkable
  };

  /** Empty `number` removes the tag. */
  const setRoomTag = (x: number, y: number, number: string) => {
    setRoomsByFloor((prev) => {
      const rest = prev[floorId].filter((r) => !(r.x === x && r.y === y));
      return { ...prev, [floorId]: number ? [...rest, { number, x, y }] : rest };
    });
    removeWall(x, y); // rooms must be walkable
  };

  /** Returns false if the cell already holds the other endpoint. */
  const placeEndpoint = (kind: "start" | "goal", x: number, y: number): boolean => {
    const other = kind === "start" ? goal : start;
    if (other && other.x === x && other.y === y) return false;
    setEndpointsByFloor((prev) => ({
      ...prev,
      [floorId]: { ...prev[floorId], [kind]: { x, y } },
    }));
    removeWall(x, y);
    return true;
  };

  const setEndpoints = (updates: Partial<EndpointsByFloor>) =>
    setEndpointsByFloor((prev) => ({ ...prev, ...updates }));

  const clearWalls = () => setWallsByFloor((prev) => ({ ...prev, [floorId]: [] }));
  const clearRooms = () => setRoomsByFloor((prev) => ({ ...prev, [floorId]: [] }));

  return {
    // whole-building data (needed for cross-floor routing)
    wallsByFloor,
    stairsByFloor,
    roomsByFloor,
    // current floor
    walls,
    stairs,
    rooms,
    start: start as Point | null | undefined,
    goal: goal as Point | null | undefined,
    lookups,
    isOccupied,
    // actions
    toggleWall,
    toggleStairs,
    setRoomTag,
    placeEndpoint,
    setEndpoints,
    setEndpointsByFloor,
    clearWalls,
    clearRooms,
  };
}