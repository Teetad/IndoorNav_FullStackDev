import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  INITIAL_ENDPOINTS_BY_FLOOR,
  INITIAL_WALLS_BY_FLOOR,
  INITIAL_STAIRS_BY_FLOOR,
  INITIAL_ROOMS_BY_FLOOR,
} from "../../Floor_Information";
import type {
  Wall,
  FloorId,
  WallsByFloor,
  StairsByFloor,
  EndpointsByFloor,
  RoomsByFloor,
  Room,
} from "../../Floor_Information";
import { hasCell, withoutCell } from "../../utils/Pathing";

/** Updates one floor's slice of a by-floor record; no-ops if the slice is unchanged. */
function patchFloor<T>(
  set: Dispatch<SetStateAction<Record<FloorId, T>>>,
  floorId: FloorId,
  fn: (value: NoInfer<T>) => T
) {
  set((prev) => {
    const next = fn(prev[floorId]);
    return next === prev[floorId] ? prev : { ...prev, [floorId]: next };
  });
}

const toggleCell = (list: Wall[], x: number, y: number): Wall[] =>
  hasCell(list, x, y) ? withoutCell(list, x, y) : [...list, [x, y] as Wall];

/** Owns all per-floor map data (walls, stairs, rooms, endpoints) and the edits on it. */
export function useFloorData(floorId: FloorId) {
  const [wallsByFloor, setWallsByFloor] = useState<WallsByFloor>(INITIAL_WALLS_BY_FLOOR);
  const [stairsByFloor, setStairsByFloor] = useState<StairsByFloor>(INITIAL_STAIRS_BY_FLOOR);
  const [roomsByFloor, setRoomsByFloor] = useState<RoomsByFloor>(INITIAL_ROOMS_BY_FLOOR);
  const [endpointsByFloor, setEndpointsByFloor] =
    useState<EndpointsByFloor>(INITIAL_ENDPOINTS_BY_FLOOR);

  const walls = wallsByFloor[floorId];
  const stairs = stairsByFloor[floorId];
  const rooms = roomsByFloor[floorId];
  const { start, goal } = endpointsByFloor[floorId];

  const isOccupied = (x: number, y: number) =>
    (!!start && x === start.x && y === start.y) || (!!goal && x === goal.x && y === goal.y);

  // Stairs, rooms and endpoints are walkable, so they clear any wall underneath.
  const clearWallAt = (x: number, y: number) =>
    patchFloor(setWallsByFloor, floorId, (list) => withoutCell(list, x, y));

  const toggleWall = (x: number, y: number) => {
    if (isOccupied(x, y)) return;
    patchFloor(setWallsByFloor, floorId, (list) => toggleCell(list, x, y));
  };

  const toggleStairs = (x: number, y: number) => {
    if (isOccupied(x, y)) return;
    patchFloor(setStairsByFloor, floorId, (list) => toggleCell(list, x, y));
    clearWallAt(x, y);
  };

  /** Tags a cell with a room number; an empty number removes the tag. */
  const saveRoomTag = (x: number, y: number, number: string) => {
    patchFloor(setRoomsByFloor, floorId, (list) => {
      const others = list.filter((r) => !(r.x === x && r.y === y));
      return number ? [...others, { number, x, y }] : others;
    });
    clearWallAt(x, y);
  };

  /** Returns false if the cell is already taken by the other endpoint. */
  const placeEndpoint = (kind: "start" | "goal", x: number, y: number) => {
    const other = kind === "start" ? goal : start;
    if (other && other.x === x && other.y === y) return false;

    setEndpointsByFloor((prev) => ({
      ...prev,
      [floorId]: { ...prev[floorId], [kind]: { x, y } },
    }));
    clearWallAt(x, y);
    return true;
  };

  const clearWalls = () => patchFloor<Wall[]>(setWallsByFloor, floorId, () => []);
  const clearRooms = () => patchFloor<Room[]>(setRoomsByFloor, floorId, () => []);

  return {
    wallsByFloor,
    stairsByFloor,
    roomsByFloor,
    setEndpointsByFloor,
    walls,
    stairs,
    rooms,
    start,
    goal,
    isOccupied,
    toggleWall,
    toggleStairs,
    saveRoomTag,
    placeEndpoint,
    clearWalls,
    clearRooms,
  };
}