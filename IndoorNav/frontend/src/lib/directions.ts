import type { FloorId, Point } from "../Floor_Information";
import type { Instruction, InstructionKind, RouteDirections, RouteSummary } from "../types";

/** East, South, West, North. This order is clockwise on screen (y grows downward). */
const DIRS: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]];

type Seg = { dir: number; len: number };
type Turn = "straight" | "left" | "right" | "uturn";

const dirOf = (a: Point, b: Point) => DIRS.findIndex(([dx, dy]) => dx === b.x - a.x && dy === b.y - a.y);

/** Clockwise change of heading = right turn, counter-clockwise = left. */
const turnOf = (from: number, to: number): Turn => {
  switch ((to - from + 4) % 4) {
    case 0: return "straight";
    case 1: return "right";
    case 3: return "left";
    default: return "uturn";
  }
};

const TITLES: Record<Turn, string> = {
  straight: "Go straight",
  left: "Turn left",
  right: "Turn right",
  uturn: "Turn around",
};

const walk = (n: number) => `Walk ${n} step${n === 1 ? "" : "s"}`;

/** Consecutive cells in the same direction become one segment. */
function toSegments(path: Point[]): Seg[] {
  const segs: Seg[] = [];
  for (let i = 1; i < path.length; i++) {
    const d = dirOf(path[i - 1], path[i]);
    if (d < 0) continue; // not an adjacent step: ignore
    const last = segs[segs.length - 1];
    if (last && last.dir === d) last.len++;
    else segs.push({ dir: d, len: 1 });
  }
  return segs;
}

/**
 * A one-cell sidestep between two runs in the same direction (A, B, A) is grid
 * noise, not a real turn. Merge it so people aren't told "left, right, left, right".
 */
function removeJogs(segs: Seg[]): Seg[] {
  const out = segs.map((s) => ({ ...s }));
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 1; i < out.length - 1; i++) {
      if (out[i].len === 1 && out[i - 1].dir === out[i + 1].dir) {
        out.splice(i - 1, 3, { dir: out[i - 1].dir, len: out[i - 1].len + 1 + out[i + 1].len });
        changed = true;
        break;
      }
    }
  }
  return out;
}

/** Turns the per-floor paths of a route into a list of human instructions. */
export function buildDirections(
  summary: RouteSummary,
  floorLabel: (id: FloorId) => string = (id) => `${id}F`
): RouteDirections | null {
  const { legs, goalRoom } = summary;
  if (!legs?.length) return null;

  const list: Instruction[] = [];
  const push = (i: Omit<Instruction, "id">) => list.push({ id: String(list.length), ...i });

  let side: "left" | "right" | "ahead" = "ahead";
  let arriveSteps = 0;

  legs.forEach((leg, li) => {
    const isLast = li === legs.length - 1;
    let segs = removeJogs(toSegments(leg.path));

    // The last move is a sideways step into the room: say which side it is on.
    if (isLast && segs.length >= 2 && segs[segs.length - 1].len <= 1) {
      const t = turnOf(segs[segs.length - 2].dir, segs[segs.length - 1].dir);
      if (t === "left" || t === "right") {
        side = t;
        arriveSteps = segs[segs.length - 1].len;
        segs = segs.slice(0, -1);
      }
    }

    segs.forEach((seg, si) => {
      const t: Turn = si === 0 ? "straight" : turnOf(segs[si - 1].dir, seg.dir);
      push({ kind: t as InstructionKind, title: TITLES[t], description: walk(seg.len), steps: seg.len, floorId: leg.floorId });
    });

    if (!isLast) {
      const next = legs[li + 1].floorId;
      const a = parseFloat(String(leg.floorId));
      const b = parseFloat(String(next));
      const up = Number.isFinite(a) && Number.isFinite(b) ? b > a : true;
      push({
        kind: up ? "stairs-up" : "stairs-down",
        title: up ? "Go up stairs" : "Go down stairs",
        description: `to ${floorLabel(next)}`,
        steps: 0,
        floorId: leg.floorId,
      });
    }
  });

  push({
    kind: "arrive",
    title: goalRoom,
    description: side === "ahead" ? `${goalRoom} is straight ahead` : `${goalRoom} is on your ${side}`,
    steps: arriveSteps,
    floorId: legs[legs.length - 1].floorId,
  });

  return {
    destination: goalRoom,
    destinationSide: side,
    totalSteps: list.reduce((sum, i) => sum + i.steps, 0),
    floors: summary.floors,
    instructions: list,
  };
}