import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import "../App.css";
import { FLOORS, IMAGE_WIDTH } from "../Floor_Information";
import type { FloorId } from "../Floor_Information";
import { useFloorData } from "../hooks/useFloorData";
import { usePath } from "../hooks/usePath";
import { useMapScale } from "../hooks/useMapScale";
import type { FitMode } from "../hooks/useMapScale";
import { useRouteSearch } from "../hooks/useRouteSearch";
import { MapGrid } from "./MapGrid";
import type { RouteDirections } from "../types";

/** "4", "4F", " 4f " -> matching floor, or undefined. */
const matchFloor = (input?: string) => {
  if (!input) return undefined;
  const q = input.trim().toLowerCase().replace(/f$/, "");
  return FLOORS.find((f) => f.id.toLowerCase() === q);
};

const noop = () => {};

export type MapViewProps = {
  /** Room number/name to start from, e.g. "411B". */
  startRoom: string;
  /** Room number/name to go to. Empty = no path drawn yet. */
  goalRoom?: string;
  /** Floor to display, e.g. "3". Omitted = the start room's floor. */
  floor?: string;
  /** Called with the floors the route passes through, e.g. ["4", "3"]. */
  onRouteReady?: (floors: FloorId[]) => void;
  /** Turn-by-turn instructions for the route (null when there is no route). */
  onDirections?: (directions: RouteDirections | null) => void;
  /** Called when something goes wrong (room not found, no stairs, no path). */
  onError?: (message: string) => void;
  /** Render inside someone else's layout (a div) instead of as a full page. */
  embedded?: boolean;
  /** Embedded only. "width" (default) or "container" (parent needs a fixed height). */
  fit?: Exclude<FitMode, "viewport">;
  className?: string;
  style?: CSSProperties;
  /** Show a small status box under the map (for troubleshooting). */
  debug?: boolean;
};

/** Plain map. No inputs, no buttons: everything is controlled by props. */
export default function MapView({
  startRoom, goalRoom, floor, onRouteReady, onDirections, onError,
  embedded = false, fit = "width", className, style, debug = false,
}: MapViewProps) {
  const [autoFloorId, setAutoFloorId] = useState<FloorId>(FLOORS[0].id);
  const [lastError, setLastError] = useState<string | null>(null);
  const selectedFloorId = matchFloor(floor)?.id ?? autoFloorId;

  const data = useFloorData(selectedFloorId);
  const { walls, stairs, rooms, start, goal } = data;
  const { path, loading } = usePath(selectedFloorId, walls, start, goal);
  const { scale, shellRef } = useMapScale([], embedded ? fit : "viewport");

  const { findRoute, routeSummary, directions } = useRouteSearch({
    roomsByFloor: data.roomsByFloor,
    stairsByFloor: data.stairsByFloor,
    wallsByFloor: data.wallsByFloor,
    setEndpointsByFloor: data.setEndpointsByFloor,
    setSelectedFloorId: setAutoFloorId,
    floorLabel: (id) => FLOORS.find((f) => f.id === id)?.label ?? `${id}F`,
    setNotice: (msg) => {
      if (!msg) return;
      setLastError(msg);
      console.error(`[MapView] ${msg}`);
      onError?.(msg);
    },
  });

  // Run the search whenever the requested rooms change.
  useEffect(() => {
    if (!startRoom || !goalRoom) return; // nothing entered yet: plain map
    findRoute(startRoom, goalRoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRoom, goalRoom]);

  useEffect(() => {
    if (routeSummary) onRouteReady?.(routeSummary.floors);
    onDirections?.(directions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSummary]);

  const selectedFloor = FLOORS.find((f) => f.id === selectedFloorId) ?? FLOORS[0];

  const debugBox = debug ? (
    <pre style={{ fontSize: 12, background: "#fff8dc", color: "#222", padding: 8, margin: "8px 0", whiteSpace: "pre-wrap" }}>
      {[
        `floor shown : ${selectedFloorId}`,
        `start/goal  : ${startRoom || "-"} → ${goalRoom || "-"}`,
        `start cell  : ${start ? `${start.x},${start.y}` : "NOT SET (room not found / search not run)"}`,
        `goal cell   : ${goal ? `${goal.x},${goal.y}` : "NOT SET"}`,
        `path        : ${loading ? "loading..." : `${path.length} steps`}`,
        `scale       : ${scale.toFixed(2)}`,
        `route floors: ${routeSummary ? routeSummary.floors.join(" → ") : "-"}`,
        `error       : ${lastError ?? "none"}`,
      ].join("\n")}
    </pre>
  ) : null;

  const grid = (
    <MapGrid
      floorId={selectedFloorId}
      image={selectedFloor.image}
      scale={scale}
      editable={false}
      walls={walls}
      stairs={stairs}
      rooms={rooms}
      path={path}
      start={start}
      goal={goal}
      shellRef={shellRef}
      onCellClick={noop}
    />
  );

  if (embedded) {
    return (
      <div
        className={className}
        style={{ width: "100%", ...(fit === "container" ? { height: "100%" } : null), ...style }}
      >
        {grid}
        {debugBox}
      </div>
    );
  }

  return (
    <main id="app" style={{ "--map-width": `${IMAGE_WIDTH * scale + 2}px` } as CSSProperties}>
      {grid}
      {debugBox}
    </main>
  );
}

/** Same map, ready to drop into any div or layout. */
export function MapEmbed(props: Omit<MapViewProps, "embedded">) {
  return <MapView {...props} embedded />;
}