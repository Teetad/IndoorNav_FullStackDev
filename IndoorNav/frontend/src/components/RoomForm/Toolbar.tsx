import { forwardRef } from "react";
import { FLOORS } from "../../Floor_Information";
import type { FloorId, Point } from "../../Floor_Information";
import type { RouteSummary } from "../../Types";

type Props = {
  floorLabel: string;
  selectedFloorId: FloorId;
  loading: boolean;
  start?: Point | null;
  goal?: Point | null;
  pathLength: number;
  routeSummary: RouteSummary | null;
  onSwitchFloor: (id: FloorId) => void;
};

function statusText({ loading, start, goal, pathLength, floorLabel }: Props) {
  if (loading) return "Calculating path...";
  if (!start || !goal)
    return `Search a route above, or use "Set Start" / "Set Goal" to place points on ${floorLabel}.`;
  return pathLength > 0
    ? `Path found: ${pathLength} steps on ${floorLabel}.`
    : `No path found on ${floorLabel}.`;
}

export const Toolbar = forwardRef<HTMLElement, Props>(function Toolbar(props, ref) {
  const { selectedFloorId, routeSummary, onSwitchFloor } = props;

  return (
    <section className="toolbar" aria-label="Map controls" ref={ref}>
      <div>
        <h1>Indoor Pathfinding</h1>
        <p className="status">{statusText(props)}</p>
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