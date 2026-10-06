import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { FloorId, EndpointsByFloor, RoomsByFloor, StairsByFloor, WallsByFloor } from "../Floor_Information";
import { fetchPath } from "../lib/api";
import { planRoute } from "../lib/planRoute";
import type { RouteDirections, RouteSummary } from "../types";

type Deps = {
  roomsByFloor: RoomsByFloor;
  stairsByFloor: StairsByFloor;
  wallsByFloor: WallsByFloor;
  setEndpointsByFloor: Dispatch<SetStateAction<EndpointsByFloor>>;
  setSelectedFloorId: (id: FloorId) => void;
  setNotice: (msg: string | null) => void;
  floorLabel?: (id: FloorId) => string;
};

/** Room-number search for the UI. The real work is in lib/planRoute. */
export function useRouteSearch(deps: Deps) {
  const { roomsByFloor, stairsByFloor, wallsByFloor, setEndpointsByFloor, setSelectedFloorId, setNotice, floorLabel } = deps;
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [directions, setDirections] = useState<RouteDirections | null>(null);
  const [searching, setSearching] = useState(false);

  const clearSummary = () => {
    setRouteSummary(null);
    setDirections(null);
  };

  const findRoute = async (startInput: string, goalInput: string) => {
    setSearching(true);
    clearSummary();
    setNotice(null);

    try {
      const result = await planRoute(
        { walls: wallsByFloor, stairs: stairsByFloor, rooms: roomsByFloor },
        startInput,
        goalInput,
        (walls, start, goal) => fetchPath(walls, start, goal),
        floorLabel
      );
      if (!result.ok) return setNotice(result.error);

      setEndpointsByFloor((prev) => ({ ...prev, ...result.endpoints }));
      setSelectedFloorId(result.summary.floors[0]);
      setRouteSummary(result.summary);
      setDirections(result.directions);
    } finally {
      setSearching(false);
    }
  };

  return { findRoute, routeSummary, directions, clearSummary, searching };
}