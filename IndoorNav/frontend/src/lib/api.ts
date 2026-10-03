import { WIDTH, HEIGHT } from "../Floor_Information";
import type { Point, Wall } from "../Floor_Information";
import { findPathLocal } from "./pathfinder";

/**
 * By default the path is computed in the browser (no server needed).
 * Set VITE_API_URL to use a backend instead, e.g. VITE_API_URL=https://api.example.com
 * (an empty value means "same origin", handy with a dev proxy).
 */
const API_URL: string | undefined = import.meta.env.VITE_API_URL;
const USE_SERVER = API_URL !== undefined;

/** One start -> goal path on one floor. Returns null when no path exists or the request fails. */
export async function fetchPath(
  walls: Wall[],
  start: Point,
  goal: Point,
  signal?: AbortSignal
): Promise<Point[] | null> {
  if (!USE_SERVER) {
    const path = findPathLocal(WIDTH, HEIGHT, walls, start, goal);
    if (!path) {
      console.warn(`[pathfinder] no path from (${start.x},${start.y}) to (${goal.x},${goal.y}). Check the walls between them.`);
    }
    return path;
  }

  const url = `${API_URL}/api/find-path`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ width: WIDTH, height: HEIGHT, start, goal, walls }),
      signal,
    });
    if (!res.ok) {
      console.error(`[find-path] ${url} answered HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (!data.success) {
      console.warn(`[find-path] server found no path from (${start.x},${start.y}) to (${goal.x},${goal.y})`, data);
      return null;
    }
    return data.path as Point[];
  } catch (err) {
    if ((err as Error).name === "AbortError") return null;
    console.error(
      `[find-path] could not reach ${url}. If the console also says "blocked by CORS policy", ` +
        `the server must allow this page's origin (${window.location.origin}).`,
      err
    );
    return null;
  }
}