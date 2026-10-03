import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { FloorId, EndpointsByFloor, RoomsByFloor, StairsByFloor, WallsByFloor } from "../Floor_Information";
import { fetchPath } from "../lib/api";
import { findFloorSequence, findRoom, nearestSharedStair } from "../lib/routing";
import type { RouteSummary } from "../types";

type Deps = {
  roomsByFloor: RoomsByFloor;
  stairsByFloor: StairsByFloor;
  wallsByFloor: WallsByFloor;
  setEndpointsByFloor: Dispatch<SetStateAction<EndpointsByFloor>>;
  setSelectedFloorId: (id: FloorId) => void;
  setNotice: (msg: string | null) => void;
};

/** Room-number search: single floor, or hop floor to floor through shared stairs. */
export function useRouteSearch(deps: Deps) {
  const { roomsByFloor, stairsByFloor, wallsByFloor, setEndpointsByFloor, setSelectedFloorId, setNotice } = deps;
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [searching, setSearching] = useState(false);

  const clearSummary = () => setRouteSummary(null);

  const findRoute = async (startInput: string, goalInput: string) => {
    const startRoom = findRoom(roomsByFloor, startInput);
    if (!startRoom) return setNotice(`Room "${startInput}" not found.`);
    const goalRoom = findRoom(roomsByFloor, goalInput);
    if (!goalRoom) return setNotice(`Room "${goalInput}" not found.`);

    const labels = { startRoom: startInput.trim(), goalRoom: goalInput.trim() };

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
        setRouteSummary({ floors: [startRoom.floorId], totalSteps: 0, ...labels });
        return;
      }

      const sequence = findFloorSequence(stairsByFloor, startRoom.floorId, goalRoom.floorId);
      if (!sequence) {
        return setNotice(`No stairs connect floor ${startRoom.floorId} to floor ${goalRoom.floorId}.`);
      }

      const updates: Partial<EndpointsByFloor> = {};
      let totalSteps = 0;
      let cursor = startRoom.point;

      for (let i = 0; i < sequence.length; i++) {
        const floorId = sequence[i];
        const isLast = i === sequence.length - 1;
        const exit = isLast
          ? goalRoom.point
          : nearestSharedStair(stairsByFloor, floorId, sequence[i + 1], cursor);
        if (!exit) return setNotice(`No shared stairs between floor ${floorId} and floor ${sequence[i + 1]}.`);

        const segment = await fetchPath(wallsByFloor[floorId], cursor, exit);
        if (!segment) return setNotice(`No walkable path on floor ${floorId}.`);

        updates[floorId] = { start: cursor, goal: exit };
        totalSteps += segment.length;
        cursor = exit;
      }

      setEndpointsByFloor((prev) => ({ ...prev, ...updates }));
      setSelectedFloorId(sequence[0]);
      setRouteSummary({ floors: sequence, totalSteps, ...labels });
    } finally {
      setSearching(false);
    }
  };

  return { findRoute, routeSummary, clearSummary, searching };
}