import { useState, useEffect, useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./App.css";
import fourthFloorPlan from "./assets/4th_floor.png";
import fifthFloorPlan from "./assets/5th_floor.png";
import sixthFloorPlan from "./assets/6th_floor.png";

const WIDTH = 27;
const HEIGHT = 27;
const IMAGE_WIDTH = 1260;
const IMAGE_HEIGHT = 1260;
const FLOORS = [
  { id: "4", label: "4th Floor", image: fourthFloorPlan },
  { id: "5", label: "5th Floor", image: fifthFloorPlan },
  { id: "6", label: "6th Floor", image: sixthFloorPlan },
] as const;

type FloorId = (typeof FLOORS)[number]["id"];
type Point = { x: number; y: number };
type Wall = [number, number];
type WallsByFloor = Record<FloorId, Wall[]>;
type StairsByFloor = Record<FloorId, Wall[]>;
type Endpoints = { start: Point; goal: Point };
type EndpointsByFloor = Record<FloorId, Endpoints>;
type Room = { number: string; x: number; y: number };
type RoomsByFloor = Record<FloorId, Room[]>;
type Tool = "view" | "wall" | "start" | "goal" | "room" | "stairs";

const DEFAULT_ENDPOINTS: Endpoints = {
  start: { x: 0, y: 0 },
  goal: { x: 9, y: 0 },
};

const INITIAL_ENDPOINTS_BY_FLOOR: EndpointsByFloor = {
  "4": DEFAULT_ENDPOINTS,
  "5": DEFAULT_ENDPOINTS,
  "6": DEFAULT_ENDPOINTS,
};

const INITIAL_WALLS: Wall[] = [
  [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [6, 0], [6, 1],
  [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7]
];

const INITIAL_WALLS_BY_FLOOR: WallsByFloor = {
  "4": INITIAL_WALLS,
  "5": [],
  "6": [],
};

const INITIAL_STAIRS_BY_FLOOR: StairsByFloor = {
  "4": [],
  "5": [],
  "6": [],
};

const INITIAL_ROOMS_BY_FLOOR: RoomsByFloor = {
  "4": [],
  "5": [],
  "6": [],
};

const TOOLS: { id: Tool; label: string }[] = [
  { id: "view", label: "View" },
  { id: "wall", label: "Edit Walls" },
  { id: "start", label: "Set Start" },
  { id: "goal", label: "Set Goal" },
  { id: "room", label: "Tag Room" },
  { id: "stairs", label: "Tag Stairs" },
];

const cellWidth = IMAGE_WIDTH / WIDTH;
const cellHeight = IMAGE_HEIGHT / HEIGHT;

// Calls the backend once for a single start->goal path on one floor.
async function fetchPath(
  floorId: FloorId,
  walls: Wall[],
  start: Point,
  goal: Point
): Promise<Point[] | null> {
  try {
    const res = await fetch("http://localhost:3001/api/find-path", {
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

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Finds a room by number across every floor (case-insensitive, trimmed).
function findRoom(roomsByFloor: RoomsByFloor, number: string): { floorId: FloorId; point: Point } | null {
  const target = number.trim().toLowerCase();
  if (!target) return null;
  for (const floor of FLOORS) {
    const match = roomsByFloor[floor.id].find((r) => r.number.trim().toLowerCase() === target);
    if (match) return { floorId: floor.id, point: { x: match.x, y: match.y } };
  }
  return null;
}

// Breadth-first search over floors, connected when two floors share a stairs cell
// at the exact same (x, y). Returns the floor sequence, or null if no route exists.
function findFloorSequence(
  stairsByFloor: StairsByFloor,
  fromFloor: FloorId,
  toFloor: FloorId
): FloorId[] | null {
  if (fromFloor === toFloor) return [fromFloor];

  const sharesStair = (a: FloorId, b: FloorId) =>
    stairsByFloor[a].some(([ax, ay]) => stairsByFloor[b].some(([bx, by]) => ax === bx && ay === by));

  const queue: FloorId[][] = [[fromFloor]];
  const visited = new Set<FloorId>([fromFloor]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    for (const floor of FLOORS) {
      if (visited.has(floor.id) || !sharesStair(last, floor.id)) continue;
      const nextPath = [...path, floor.id];
      if (floor.id === toFloor) return nextPath;
      visited.add(floor.id);
      queue.push(nextPath);
    }
  }
  return null;
}

// Of the stair cells shared between two floors, pick the one closest to `from`.
function nearestSharedStair(stairsByFloor: StairsByFloor, floorA: FloorId, floorB: FloorId, from: Point): Point | null {
  const shared = stairsByFloor[floorA].filter(([ax, ay]) =>
    stairsByFloor[floorB].some(([bx, by]) => ax === bx && ay === by)
  );
  if (shared.length === 0) return null;
  let best: Point = { x: shared[0][0], y: shared[0][1] };
  let bestDist = distance(from, best);
  for (const [x, y] of shared) {
    const d = distance(from, { x, y });
    if (d < bestDist) {
      bestDist = d;
      best = { x, y };
    }
  }
  return best;
}

type RouteSummary = {
  floors: FloorId[];
  totalSteps: number;
  startRoom: string;
  goalRoom: string;
};

export default function App() {
  const [selectedFloorId, setSelectedFloorId] = useState<FloorId>("4");
  const [wallsByFloor, setWallsByFloor] = useState<WallsByFloor>(INITIAL_WALLS_BY_FLOOR);
  const [stairsByFloor, setStairsByFloor] = useState<StairsByFloor>(INITIAL_STAIRS_BY_FLOOR);
  const [roomsByFloor, setRoomsByFloor] = useState<RoomsByFloor>(INITIAL_ROOMS_BY_FLOOR);
  const [endpointsByFloor, setEndpointsByFloor] = useState<EndpointsByFloor>(
    INITIAL_ENDPOINTS_BY_FLOOR
  );
  const [tool, setTool] = useState<Tool>("wall");
  const [path, setPath] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [startRoomInput, setStartRoomInput] = useState("");
  const [goalRoomInput, setGoalRoomInput] = useState("");
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [searching, setSearching] = useState(false);
  // Some preview/embedded environments block window.prompt/alert/confirm, so room
  // tagging, notices, and the clear-walls confirmation are all done with on-page UI instead.
  const [pendingRoomCell, setPendingRoomCell] = useState<Point | null>(null);
  const [pendingRoomValue, setPendingRoomValue] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingClearWalls, setConfirmingClearWalls] = useState(false);
  const toolbarRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const selectedFloor = FLOORS.find((floor) => floor.id === selectedFloorId) ?? FLOORS[0];
  const walls = wallsByFloor[selectedFloorId];
  const stairs = stairsByFloor[selectedFloorId];
  const rooms = roomsByFloor[selectedFloorId];
  const { start, goal } = endpointsByFloor[selectedFloorId];
  const allRoomNumbers = FLOORS.flatMap((floor) => roomsByFloor[floor.id].map((r) => r.number));

  const isOccupied = (x: number, y: number) =>
    (x === start.x && y === start.y) || (x === goal.x && y === goal.y);

  const toggleWall = (x: number, y: number) => {
    if (isOccupied(x, y)) return;

    setWallsByFloor((prevByFloor) => {
      const prev = prevByFloor[selectedFloorId];
      const exists = prev.some(([wx, wy]) => wx === x && wy === y);
      const nextWalls = exists
        ? prev.filter(([wx, wy]) => !(wx === x && wy === y))
        : [...prev, [x, y] as Wall];

      return {
        ...prevByFloor,
        [selectedFloorId]: nextWalls,
      };
    });
  };

  const toggleStairs = (x: number, y: number) => {
    if (isOccupied(x, y)) return;

    setStairsByFloor((prevByFloor) => {
      const prev = prevByFloor[selectedFloorId];
      const exists = prev.some(([sx, sy]) => sx === x && sy === y);
      const nextStairs = exists
        ? prev.filter(([sx, sy]) => !(sx === x && sy === y))
        : [...prev, [x, y] as Wall];
      return { ...prevByFloor, [selectedFloorId]: nextStairs };
    });

    // Stairs should be walkable, so clear any wall on that cell.
    setWallsByFloor((prevByFloor) => {
      const prev = prevByFloor[selectedFloorId];
      if (!prev.some(([wx, wy]) => wx === x && wy === y)) return prevByFloor;
      return { ...prevByFloor, [selectedFloorId]: prev.filter(([wx, wy]) => !(wx === x && wy === y)) };
    });
  };

  // Opens the inline "tag this cell" form instead of window.prompt (blocked in some
  // embedded/preview environments).
  const tagRoom = (x: number, y: number) => {
    if (isOccupied(x, y)) return;
    const existing = rooms.find((r) => r.x === x && r.y === y);
    setPendingRoomCell({ x, y });
    setPendingRoomValue(existing?.number ?? "");
  };

  const commitRoomTag = (overrideValue?: string) => {
    if (!pendingRoomCell) return;
    const { x, y } = pendingRoomCell;
    const number = (overrideValue ?? pendingRoomValue).trim();

    setRoomsByFloor((prevByFloor) => {
      const prev = prevByFloor[selectedFloorId];
      const withoutCell = prev.filter((r) => !(r.x === x && r.y === y));
      const nextRooms = number ? [...withoutCell, { number, x, y }] : withoutCell;
      return { ...prevByFloor, [selectedFloorId]: nextRooms };
    });

    // A tagged room should be walkable.
    setWallsByFloor((prevByFloor) => {
      const prev = prevByFloor[selectedFloorId];
      if (!prev.some(([wx, wy]) => wx === x && wy === y)) return prevByFloor;
      return { ...prevByFloor, [selectedFloorId]: prev.filter(([wx, wy]) => !(wx === x && wy === y)) };
    });

    setPendingRoomCell(null);
    setPendingRoomValue("");
  };

  const cancelRoomTag = () => {
    setPendingRoomCell(null);
    setPendingRoomValue("");
  };

  const placeEndpoint = (kind: "start" | "goal", x: number, y: number) => {
    const other = kind === "start" ? goal : start;
    if (other.x === x && other.y === y) return;

    setEndpointsByFloor((prev) => ({
      ...prev,
      [selectedFloorId]: {
        ...prev[selectedFloorId],
        [kind]: { x, y },
      },
    }));

    setWallsByFloor((prevByFloor) => {
      const prev = prevByFloor[selectedFloorId];
      if (!prev.some(([wx, wy]) => wx === x && wy === y)) return prevByFloor;
      return {
        ...prevByFloor,
        [selectedFloorId]: prev.filter(([wx, wy]) => !(wx === x && wy === y)),
      };
    });

    setTool("wall");
    setRouteSummary(null); // manual edit overrides any searched route
  };

  const switchFloor = (floorId: FloorId) => {
    if (floorId === selectedFloorId) return;
    setSelectedFloorId(floorId);
    setPendingRoomCell(null);
    setConfirmingClearWalls(false);
  };

  const handleCellClick = (x: number, y: number) => {
    if (tool === "wall") toggleWall(x, y);
    else if (tool === "start") placeEndpoint("start", x, y);
    else if (tool === "goal") placeEndpoint("goal", x, y);
    else if (tool === "room") tagRoom(x, y);
    else if (tool === "stairs") toggleStairs(x, y);
  };

  const copyWalls = () => {
    navigator.clipboard
      .writeText(JSON.stringify(walls))
      .then(() => setNotice(`${selectedFloor.label} walls copied to clipboard!`))
      .catch(() => setNotice("Couldn't copy to clipboard in this environment."));
  };

  const clearWalls = () => setConfirmingClearWalls(true);

  const confirmClearWalls = () => {
    setWallsByFloor((prev) => ({ ...prev, [selectedFloorId]: [] }));
    setConfirmingClearWalls(false);
  };

  // Looks up the two room numbers, then either paths within one floor or
  // hops floor to floor through matching stairs cells, calling the backend
  // once per leg of the trip.
  const findRoute = async () => {
    const startRoom = findRoom(roomsByFloor, startRoomInput);
    if (!startRoom) {
      setNotice(`Room "${startRoomInput}" not found. Tag it first with the Tag Room tool.`);
      return;
    }
    const goalRoom = findRoom(roomsByFloor, goalRoomInput);
    if (!goalRoom) {
      setNotice(`Room "${goalRoomInput}" not found. Tag it first with the Tag Room tool.`);
      return;
    }

    setSearching(true);
    setRouteSummary(null);
    setNotice(null);

    try {
      if (startRoom.floorId === goalRoom.floorId) {
        setEndpointsByFloor((prev) => ({
          ...prev,
          [startRoom.floorId]: { start: startRoom.point, goal: goalRoom.point },
        }));
        setSelectedFloorId(startRoom.floorId);
        setRouteSummary({
          floors: [startRoom.floorId],
          totalSteps: 0, // filled in by the normal per-floor effect
          startRoom: startRoomInput.trim(),
          goalRoom: goalRoomInput.trim(),
        });
        return;
      }

      const sequence = findFloorSequence(stairsByFloor, startRoom.floorId, goalRoom.floorId);
      if (!sequence) {
        setNotice(
          `No stairs connect floor ${startRoom.floorId} to floor ${goalRoom.floorId}. Tag matching stair cells (same x, y) on both floors with the Tag Stairs tool.`
        );
        return;
      }

      // Work out each floor's entry/exit point and fetch its segment.
      const newEndpoints: Partial<EndpointsByFloor> = {};
      let totalSteps = 0;
      let cursor = startRoom.point;

      for (let i = 0; i < sequence.length; i++) {
        const floorId = sequence[i];
        const isLastFloor = i === sequence.length - 1;
        const exitPoint = isLastFloor
          ? goalRoom.point
          : nearestSharedStair(stairsByFloor, floorId, sequence[i + 1], cursor);

        if (!exitPoint) {
          setNotice(`Couldn't find a shared stairs cell between floor ${floorId} and floor ${sequence[i + 1]}.`);
          return;
        }

        const segmentPath = await fetchPath(floorId, wallsByFloor[floorId], cursor, exitPoint);
        if (!segmentPath) {
          setNotice(
            `No walkable path on floor ${floorId} between (${cursor.x}, ${cursor.y}) and (${exitPoint.x}, ${exitPoint.y}). Check walls near there.`
          );
          return;
        }

        newEndpoints[floorId] = { start: cursor, goal: exitPoint };
        totalSteps += segmentPath.length;
        cursor = exitPoint;
      }

      setEndpointsByFloor((prev) => ({ ...prev, ...newEndpoints }));
      setSelectedFloorId(sequence[0]);
      setRouteSummary({
        floors: sequence,
        totalSteps,
        startRoom: startRoomInput.trim(),
        goalRoom: goalRoomInput.trim(),
      });
    } finally {
      setSearching(false);
    }
  };

  const mapStyle = {
    "--floor-plan": `url('${selectedFloor.image}')`,
    "--image-width": `${IMAGE_WIDTH}px`,
    "--image-height": `${IMAGE_HEIGHT}px`,
    gridTemplateColumns: `repeat(${WIDTH}, ${cellWidth}px)`,
    gridTemplateRows: `repeat(${HEIGHT}, ${cellHeight}px)`,
  } as CSSProperties;

  // Shrink the map so the whole floor plan fits on screen without scrolling.
  // On a big enough display the scale stays at 1 (full size).
  useLayoutEffect(() => {
    const shell = shellRef.current;
    const parent = shell?.parentElement;
    if (!shell || !parent) return;

    const num = (v: string) => parseFloat(v) || 0;

    const updateScale = () => {
      const shellStyle = getComputedStyle(shell);
      const parentStyle = getComputedStyle(parent);

      const shellPadX =
        num(shellStyle.paddingLeft) + num(shellStyle.paddingRight) +
        num(shellStyle.borderLeftWidth) + num(shellStyle.borderRightWidth);
      const shellPadY =
        num(shellStyle.paddingTop) + num(shellStyle.paddingBottom) +
        num(shellStyle.borderTopWidth) + num(shellStyle.borderBottomWidth);
      const parentPadX = num(parentStyle.paddingLeft) + num(parentStyle.paddingRight);
      const parentPadBottom = num(parentStyle.paddingBottom);

      const top = shell.getBoundingClientRect().top + window.scrollY;
      const availableWidth = parent.clientWidth - parentPadX - shellPadX;
      const availableHeight = window.innerHeight - top - shellPadY - parentPadBottom - 8;

      const next = Math.max(
        0.25,
        Math.min(1, availableWidth / IMAGE_WIDTH, availableHeight / IMAGE_HEIGHT)
      );
      setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    // The header/tools/search rows can change height, which moves the map.
    const observer = new ResizeObserver(updateScale);
    if (toolbarRef.current) observer.observe(toolbarRef.current);
    if (toolsRef.current) observer.observe(toolsRef.current);
    if (searchRef.current) observer.observe(searchRef.current);

    return () => {
      window.removeEventListener("resize", updateScale);
      observer.disconnect();
    };
  }, []);

  // Refetch path from backend whenever walls, start, or goal change on the current floor.
  // This also renders each leg of a searched multi-floor route once you switch to that floor,
  // since findRoute() already set that floor's start/goal.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("http://localhost:3001/api/find-path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ width: WIDTH, height: HEIGHT, start, goal, walls }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setPath(data.success ? data.path : []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Backend fetch error:", err);
        setPath([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedFloorId, walls, start, goal]);

  const pathSet = new Set(path.map((p) => `${p.x}-${p.y}`));

  const toolHint =
    tool === "start"
      ? "Click a cell to place the start."
      : tool === "goal"
      ? "Click a cell to place the goal."
      : tool === "room"
      ? "Click a cell to tag it with a room number."
      : tool === "stairs"
      ? "Click a cell to toggle a stairs cell (mark the same x, y on connecting floors)."
      : `${walls.length} wall cell(s), ${stairs.length} stairs cell(s), ${rooms.length} room(s)`;

  return (
    <main id="app" style={{ "--map-width": `${IMAGE_WIDTH * scale + 2}px` } as CSSProperties}>
      <section className="toolbar" aria-label="Map controls" ref={toolbarRef}>
        <div>
          <h1>Indoor Pathfinding</h1>
          <p className="status">
            {loading
              ? "Calculating path..."
              : path.length > 0
              ? `Path found: ${path.length} steps on ${selectedFloor.label}.`
              : `No path found on ${selectedFloor.label}.`}
          </p>
          {routeSummary && (
            <p className="status route-status">
              Route "{routeSummary.startRoom}" → "{routeSummary.goalRoom}":{" "}
              {routeSummary.floors.map((f) => `${f}F`).join(" → ")}
              {routeSummary.floors.length > 1 && routeSummary.totalSteps > 0
                ? ` (${routeSummary.totalSteps} steps total)`
                : ""}
            </p>
          )}
        </div>

        <div className="floor-switcher" aria-label="Switch floor">
          {FLOORS.map((floor) => (
            <button
              key={floor.id}
              className={
                (floor.id === selectedFloorId ? "active" : "") +
                (routeSummary?.floors.includes(floor.id) ? " on-route" : "")
              }
              type="button"
              onClick={() => switchFloor(floor.id)}
              aria-pressed={floor.id === selectedFloorId}
            >
              {floor.label}
            </button>
          ))}
        </div>
      </section>

      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}

      {pendingRoomCell && (
        <div className="room-form" role="dialog" aria-label="Tag room number">
          <span>
            Room number for cell ({pendingRoomCell.x}, {pendingRoomCell.y}):
          </span>
          <input
            type="text"
            autoFocus
            value={pendingRoomValue}
            onChange={(e) => setPendingRoomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRoomTag();
              if (e.key === "Escape") cancelRoomTag();
            }}
            placeholder="e.g. 401"
          />
          <button type="button" onClick={() => commitRoomTag()}>Save</button>
          {rooms.some((r) => r.x === pendingRoomCell.x && r.y === pendingRoomCell.y) && (
            <button type="button" onClick={() => commitRoomTag("")}>
              Remove tag
            </button>
          )}
          <button type="button" onClick={cancelRoomTag}>Cancel</button>
        </div>
      )}

      {confirmingClearWalls && (
        <div className="notice notice-confirm" role="alertdialog">
          <span>Clear all walls on {selectedFloor.label}?</span>
          <button type="button" onClick={confirmClearWalls}>Yes, clear</button>
          <button type="button" onClick={() => setConfirmingClearWalls(false)}>Cancel</button>
        </div>
      )}

      <section className="search" aria-label="Find route by room number" ref={searchRef}>
        <input
          type="text"
          placeholder="Start room number"
          value={startRoomInput}
          onChange={(e) => setStartRoomInput(e.target.value)}
          list="room-numbers"
        />
        <input
          type="text"
          placeholder="Finish room number"
          value={goalRoomInput}
          onChange={(e) => setGoalRoomInput(e.target.value)}
          list="room-numbers"
        />
        <datalist id="room-numbers">
          {allRoomNumbers.map((num) => (
            <option key={num} value={num} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={findRoute}
          disabled={searching || !startRoomInput.trim() || !goalRoomInput.trim()}
        >
          {searching ? "Searching..." : "Find Route"}
        </button>
      </section>

      <section className="tools" aria-label="Path editing tools" ref={toolsRef}>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={t.id === tool ? "active" : ""}
            type="button"
            onClick={() => setTool(t.id)}
            aria-pressed={t.id === tool}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={copyWalls}>Copy Walls JSON</button>
        <button type="button" onClick={clearWalls}>Clear Walls</button>
        <span>{toolHint}</span>
      </section>

      <div className="map-shell" ref={shellRef}>
        {/* Sized to the scaled map so the page never needs to scroll. */}
        <div
          style={{
            width: IMAGE_WIDTH * scale,
            height: IMAGE_HEIGHT * scale,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
        <div
          className="grid-container"
          style={{ ...mapStyle, transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {Array.from({ length: HEIGHT }).map((_, y) =>
            Array.from({ length: WIDTH }).map((_, x) => {
              let cellClass = "cell";
              let cellText = "";
              let title: string | undefined;

              const isStart = x === start.x && y === start.y;
              const isGoal = x === goal.x && y === goal.y;
              const isStairs = stairs.some(([sx, sy]) => sx === x && sy === y);
              const room = rooms.find((r) => r.x === x && r.y === y);
              const isWall = walls.some(([wx, wy]) => wx === x && wy === y);
              const isPath = pathSet.has(`${x}-${y}`);

              if (isStart) {
                cellClass += " start";
                cellText = "S";
              } else if (isGoal) {
                cellClass += " goal";
                cellText = "G";
              } else if (isStairs) {
                cellClass += " stairs";
                cellText = "St";
                title = "Stairs";
              } else if (room) {
                cellClass += " room";
                cellText = "•";
                title = `Room ${room.number}`;
              } else if (isWall) {
                cellClass += " wall";
              } else if (isPath) {
                cellClass += " path";
                cellText = ".";
              }

              if (tool !== "view") cellClass += " editable";

              return (
                <button
                  key={`${selectedFloorId}-${x}-${y}`}
                  className={cellClass}
                  type="button"
                  onClick={() => handleCellClick(x, y)}
                  aria-label={room ? `Room ${room.number}, cell ${x}, ${y}` : `Cell ${x}, ${y}`}
                  title={title}
                >
                  {cellText}
                </button>
              );
            })
          )}
        </div>
        </div>
      </div>
    </main>
  );
}