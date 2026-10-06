import type { FloorId, Point, RoomsByFloor, StairsByFloor } from "../Floor_Information";
import type { Arrow } from "../types";

/** Floor ids in a ByFloor record (works without importing the floor list). */
const floorIdsOf = (record: Record<string, unknown>) => Object.keys(record) as FloorId[];

export const cellKey = (x: number, y: number) => `${x}-${y}`;

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Map of "x-y" -> arrow pointing to the next cell in the path. */
export function getPathArrows(path: Point[]): Map<string, Arrow> {
  const arrows = new Map<string, Arrow>();

  for (let i = 0; i < path.length - 1; i++) {
    const cur = path[i];
    const next = path[i + 1];
    const arrow: Arrow =
      next.x > cur.x ? "→" : next.x < cur.x ? "←" : next.y > cur.y ? "↓" : "↑";
    arrows.set(cellKey(cur.x, cur.y), arrow);
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
  for (const floorId of floorIdsOf(roomsByFloor)) {
    const match = roomsByFloor[floorId].find((r) => r.number.trim().toLowerCase() === target);
    if (match) return { floorId, point: { x: match.x, y: match.y } };
  }
  return null;
}

/** Stair cells that exist at the same (x, y) on both floors. */
function sharedStairs(stairsByFloor: StairsByFloor, a: FloorId, b: FloorId): Point[] {
  const bKeys = new Set(stairsByFloor[b].map(([x, y]) => cellKey(x, y)));
  return stairsByFloor[a]
    .filter(([x, y]) => bKeys.has(cellKey(x, y)))
    .map(([x, y]) => ({ x, y }));
}

/** BFS over floors; two floors connect when they share a stair cell. */
export function findFloorSequence(
  stairsByFloor: StairsByFloor,
  from: FloorId,
  to: FloorId
): FloorId[] | null {
  if (from === to) return [from];

  const queue: FloorId[][] = [[from]];
  const visited = new Set<FloorId>([from]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    for (const id of floorIdsOf(stairsByFloor)) {
      if (visited.has(id) || sharedStairs(stairsByFloor, last, id).length === 0) continue;
      const next = [...path, id];
      if (id === to) return next;
      visited.add(id);
      queue.push(next);
    }
  }
  return null;
}

/** Of the stair cells shared by two floors, the one closest to `from`. */
export function nearestSharedStair(
  stairsByFloor: StairsByFloor,
  a: FloorId,
  b: FloorId,
  from: Point
): Point | null {
  const shared = sharedStairs(stairsByFloor, a, b);
  if (shared.length === 0) return null;
  return shared.reduce((best, p) => (distance(from, p) < distance(from, best) ? p : best));
}