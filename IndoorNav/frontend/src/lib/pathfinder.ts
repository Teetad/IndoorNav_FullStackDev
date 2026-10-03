import type { Point, Wall } from "../Floor_Information";

/**
 * Shortest path on a grid (breadth-first search, moves up/down/left/right).
 * Walls block movement. The start and goal cells are always walkable.
 * Returns the cells from start to goal (both included), or null if unreachable.
 */
export function findPathLocal(
  width: number,
  height: number,
  walls: Wall[],
  start: Point,
  goal: Point
): Point[] | null {
  const inside = (p: Point) => p.x >= 0 && p.y >= 0 && p.x < width && p.y < height;
  if (!inside(start) || !inside(goal)) return null;

  const idx = (x: number, y: number) => y * width + x;
  const blocked = new Uint8Array(width * height);
  for (const [x, y] of walls) {
    if (x >= 0 && y >= 0 && x < width && y < height) blocked[idx(x, y)] = 1;
  }
  blocked[idx(start.x, start.y)] = 0;
  blocked[idx(goal.x, goal.y)] = 0;

  const startI = idx(start.x, start.y);
  const goalI = idx(goal.x, goal.y);

  const parent = new Int32Array(width * height).fill(-2); // -2 = unvisited
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  queue[tail++] = startI;
  parent[startI] = -1;

  while (head < tail) {
    const cur = queue[head++];
    if (cur === goalI) break;

    const cx = cur % width;
    const cy = (cur - cx) / width;
    const neighbours = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];
    for (const [nx, ny] of neighbours) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const n = idx(nx, ny);
      if (blocked[n] || parent[n] !== -2) continue;
      parent[n] = cur;
      queue[tail++] = n;
    }
  }

  if (parent[goalI] === -2) return null;

  const path: Point[] = [];
  for (let i = goalI; i !== -1; i = parent[i]) {
    path.push({ x: i % width, y: Math.floor(i / width) });
  }
  return path.reverse();
}