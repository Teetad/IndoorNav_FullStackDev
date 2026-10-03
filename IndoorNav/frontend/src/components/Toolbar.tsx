import React from "react";
import { FLOORS } from "../Floor_Information";
import type { FloorId, Point } from "../Floor_Information";
import type { RouteSummary } from "../types";

type Props = {
  floorLabel: string;
  selectedFloorId: FloorId;
  loading: boolean;
  start?: Point | null;
  goal?: Point | null;
  pathLength: number;
  routeSummary: RouteSummary | null;
  /** When set, replaces the automatic status line. */
  statusText?: string;
  onSwitchFloor: (id: FloorId) => void;
};

export const Toolbar = React.forwardRef<HTMLElement, Props>(function Toolbar(
  { floorLabel, selectedFloorId, loading, start, goal, pathLength, routeSummary, statusText, onSwitchFloor },
  ref
) {
  const auto = loading
    ? "Calculating path..."
    : !start || !goal
    ? `Use "Set Start" / "Set Goal" to place points on ${floorLabel}.`
    : pathLength > 0
    ? `Path found: ${pathLength} steps on ${floorLabel}.`
    : `No path found on ${floorLabel}.`;

  return (
    <section className="toolbar" aria-label="Map controls" ref={ref}>
      <div>
        <h1>Indoor Pathfinding</h1>
        <p className="status">{loading ? "Calculating path..." : statusText ?? auto}</p>
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
            onClick={() => onSwitchFloor(floor.id)}
            aria-pressed={floor.id === selectedFloorId}
          >
            {floor.label}
          </button>
        ))}
      </div>
    </section>
  );
});