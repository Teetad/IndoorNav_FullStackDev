import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  FloorId,
  EndpointsByFloor,
  RoomsByFloor,
  StairsByFloor,
  WallsByFloor,
} from "../../Floor_Information";
import type { RouteSummary } from "../../Types";
import { fetchPath, findFloorSequence, findRoom, nearestSharedStair } from "../../utils/Pathing";

type Options = {
  roomsByFloor: RoomsByFloor;
  stairsByFloor: StairsByFloor;
  wallsByFloor: WallsByFloor;
  setEndpointsByFloor: Dispatch<SetStateAction<EndpointsByFloor>>;
  setSelectedFloorId: (id: FloorId) => void;
  setNotice: (msg: string | null) => void;
};

/**
 * Looks up two room numbers, then paths within one floor or hops floor to floor
 * through matching stairs cells, calling the backend once per leg.
 */
export function useRouteSearch({
  roomsByFloor,
  stairsByFloor,
  wallsByFloor,
  setEndpointsByFloor,
  setSelectedFloorId,
  setNotice,
}: Options) {
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [searching, setSearching] = useState(false);

  const findRoute = async (startInput: string, goalInput: string) => {
    const startRoom = findRoom(roomsByFloor, startInput);
    if (!startRoom) {
      setNotice(`Room "${startInput}" not found. Tag it first with the Tag Room tool.`);
      return;
    }
    const goalRoom = findRoom(roomsByFloor, goalInput);
    if (!goalRoom) {
      setNotice(`Room "${goalInput}" not found. Tag it first with the Tag Room tool.`);
      return;
    }

    const labels = { startRoom: startInput.trim(), goalRoom: goalInput.trim() };
    setSearching(true);
    setRouteSummary(null);
    setNotice(null);

    try {
      // Same floor: set endpoints and let the normal per-floor path effect do the work.
      if (startRoom.floorId === goalRoom.floorId) {
        setEndpointsByFloor((prev) => ({
          ...prev,
          [startRoom.floorId]: { start: startRoom.point, goal: goalRoom.point },
        }));
        setSelectedFloorId(startRoom.floorId);
        setRouteSummary({ floors: [startRoom.floorId], totalSteps: 0, ...labels });
        return;
      }

      const sequence = findFloorSequence(stairsByFloor, startRoom.floorId, goalRoom.floorId);
      if (!sequence) {
        setNotice(
          `No stairs connect floor ${startRoom.floorId} to floor ${goalRoom.floorId}. Tag matching stair cells (same x, y) on both floors with the Tag Stairs tool.`
        );
        return;
      }

      const newEndpoints: Partial<EndpointsByFloor> = {};
      let totalSteps = 0;
      let cursor = startRoom.point;

      for (let i = 0; i < sequence.length; i++) {
        const floorId = sequence[i];
        const isLast = i === sequence.length - 1;
        const exitPoint = isLast
          ? goalRoom.point
          : nearestSharedStair(stairsByFloor, floorId, sequence[i + 1], cursor);

        if (!exitPoint) {
          setNotice(`Couldn't find a shared stairs cell between floor ${floorId} and floor ${sequence[i + 1]}.`);
          return;
        }

        const segment = await fetchPath(floorId, wallsByFloor[floorId], cursor, exitPoint);
        if (!segment) {
          setNotice(
            `No walkable path on floor ${floorId} between (${cursor.x}, ${cursor.y}) and (${exitPoint.x}, ${exitPoint.y}). Check walls near there.`
          );
          return;
        }

        newEndpoints[floorId] = { start: cursor, goal: exitPoint };
        totalSteps += segment.length;
        cursor = exitPoint;
      }

      setEndpointsByFloor((prev) => ({ ...prev, ...newEndpoints }));
      setSelectedFloorId(sequence[0]);
      setRouteSummary({ floors: sequence, totalSteps, ...labels });
    } finally {
      setSearching(false);
    }
  };

  const clearRoute = () => setRouteSummary(null);

  return { findRoute, routeSummary, searching, clearRoute };
}