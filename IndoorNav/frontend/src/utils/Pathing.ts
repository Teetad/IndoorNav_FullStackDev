import { WIDTH, HEIGHT, FLOORS } from "../Floor_Information";
import type { FloorId, Point, Wall, StairsByFloor, RoomsByFloor } from "../Floor_Information";
import type { Arrow } from "../Types";
import { API_URL } from "../Constants";

export const cellKey = (x: number, y: number) => `${x}-${y}`;

export const hasCell = (list: Wall[], x: number, y: number) =>
  list.some(([cx, cy]) => cx === x && cy === y);

// Returns the same array when the cell isn't present, so React can skip re-renders.
export const withoutCell = (list: Wall[], x: number, y: number) =>
  hasCell(list, x, y) ? list.filter(([cx, cy]) => !(cx === x && cy === y)) : list;

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Calls the backend for a single start -> goal path on one floor. */
export async function fetchPath(
  floorId: FloorId,
  walls: Wall[],
  start: Point,
  goal: Point
): Promise<Point[] | null> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ width: WIDTH, height: HEIGHT, start, goal, walls }),
    });
    const data = await res.json();
    return data.success ? (data.path as Point[]) : null;
  } catch (err) {
    console.error(`Backend fetch error on floor ${floorId}:`, err);
    return null;
  }
}

function arrowBetween(from: Point, to: Point): Arrow {
  if (to.x > from.x) return "→";
  if (to.x < from.x) return "←";
  if (to.y > from.y) return "↓";
  return "↑";
}

/** Maps "x-y" -> arrow pointing at the next cell in the path. */
export function getPathArrows(path: Point[]): Map<string, Arrow> {
  const arrows = new Map<string, Arrow>();
  for (let i = 0; i < path.length - 1; i++) {
    arrows.set(cellKey(path[i].x, path[i].y), arrowBetween(path[i], path[i + 1]));
  }
  // The goal has no next step, so reuse the previous direction.
  if (path.length > 1) {
    const last = path[path.length - 1];
    const prev = path[path.length - 2];
    const prevArrow = arrows.get(cellKey(prev.x, prev.y));
    if (prevArrow) arrows.set(cellKey(last.x, last.y), prevArrow);
  }
  return arrows;
}

/** Finds a room by number across every floor (case-insensitive, trimmed). */
export function findRoom(
  roomsByFloor: RoomsByFloor,
  number: string
): { floorId: FloorId; point: Point } | null {
  const target = number.trim().toLowerCase();
  if (!target) return null;
  for (const floor of FLOORS) {
    const match = roomsByFloor[floor.id].find((r) => r.number.trim().toLowerCase() === target);
    if (match) return { floorId: floor.id, point: { x: match.x, y: match.y } };
  }
  return null;
}

/** Stair cells (same x, y) present on both floors. */
function sharedStairs(stairsByFloor: StairsByFloor, a: FloorId, b: FloorId): Point[] {
  return stairsByFloor[a]
    .filter(([ax, ay]) => hasCell(stairsByFloor[b], ax, ay))
    .map(([x, y]) => ({ x, y }));
}

/** BFS over floors connected by shared stair cells. Returns the floor sequence or null. */
export function findFloorSequence(
  stairsByFloor: StairsByFloor,
  fromFloor: FloorId,
  toFloor: FloorId
): FloorId[] | null {
  if (fromFloor === toFloor) return [fromFloor];

  const queue: FloorId[][] = [[fromFloor]];
  const visited = new Set<FloorId>([fromFloor]);

  while (queue.length > 0) {
    const route = queue.shift()!;
    const last = route[route.length - 1];
    for (const floor of FLOORS) {
      if (visited.has(floor.id) || sharedStairs(stairsByFloor, last, floor.id).length === 0) continue;
      const next = [...route, floor.id];
      if (floor.id === toFloor) return next;
      visited.add(floor.id);
      queue.push(next);
    }
  }
  return null;
}

/** Of the stair cells shared between two floors, the one closest to `from`. */
export function nearestSharedStair(
  stairsByFloor: StairsByFloor,
  floorA: FloorId,
  floorB: FloorId,
  from: Point
): Point | null {
  const shared = sharedStairs(stairsByFloor, floorA, floorB);
  if (shared.length === 0) return null;
  return shared.reduce((best, p) => (distance(from, p) < distance(from, best) ? p : best));
}