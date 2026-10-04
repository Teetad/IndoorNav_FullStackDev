import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { FLOORS, IMAGE_WIDTH } from "./Floor_Information";
import type { FloorId, Point } from "./Floor_Information";
import type { Tool } from "./types";

import { useFloorData } from "./hooks/useFloorData";
import { usePath } from "./hooks/usePath";
import { useMapScale } from "./hooks/useMapScale";
import { useRouteSearch } from "./hooks/useRouteSearch";

import { Toolbar } from "./components/Toolbar";
import { SearchBar } from "./components/SearchBar";
import { Tools } from "./components/Tools";
import { MapGrid } from "./components/MapGrid";
import { Notice, ConfirmBar, RoomForm } from "./components/Banners";

type PendingRoom = { cell: Point; value: string };
type Confirming = "walls" | "rooms" | null;

const TOOL_HINTS: Partial<Record<Tool, string>> = {
  start: "Click a cell to place the start.",
  goal: "Click a cell to place the goal.",
  room: "Click a cell to tag it with a room number.",
  stairs: "Click a cell to toggle a stairs cell (mark the same x, y on connecting floors).",
};

/** Full editor: walls, stairs, rooms, start/goal, plus room search. */
export default function App() {
  const [selectedFloorId, setSelectedFloorId] = useState<FloorId>(FLOORS[0].id);
  const [tool, setTool] = useState<Tool>("wall");
  const [startRoomInput, setStartRoomInput] = useState("");
  const [goalRoomInput, setGoalRoomInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingRoom, setPendingRoom] = useState<PendingRoom | null>(null);
  const [confirming, setConfirming] = useState<Confirming>(null);

  const toolbarRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLElement>(null);

  const data = useFloorData(selectedFloorId);
  const { walls, stairs, rooms, start, goal } = data;
  const { path, loading } = usePath(selectedFloorId, walls, start, goal);
  const { scale, shellRef } = useMapScale([toolbarRef, toolsRef, searchRef]);
  const { findRoute, routeSummary, clearSummary, searching } = useRouteSearch({
    roomsByFloor: data.roomsByFloor,
    stairsByFloor: data.stairsByFloor,
    wallsByFloor: data.wallsByFloor,
    setEndpointsByFloor: data.setEndpointsByFloor,
    setSelectedFloorId,
    setNotice,
  });

  const selectedFloor = FLOORS.find((f) => f.id === selectedFloorId) ?? FLOORS[0];
  const allRoomNumbers = FLOORS.flatMap((f) => data.roomsByFloor[f.id].map((r) => r.number));

  const switchFloor = (id: FloorId) => {
    if (id === selectedFloorId) return;
    setSelectedFloorId(id);
    setPendingRoom(null);
    setConfirming(null);
  };

  const handleCellClick = (x: number, y: number) => {
    switch (tool) {
      case "wall":
        return data.toggleWall(x, y);
      case "stairs":
        return data.toggleStairs(x, y);
      case "room": {
        if (data.isOccupied(x, y)) return;
        const existing = data.rooms.find((r) => r.x === x && r.y === y);
        return setPendingRoom({ cell: { x, y }, value: existing?.number ?? "" });
      }
      case "start":
      case "goal":
        if (data.placeEndpoint(tool, x, y)) {
          setTool("wall");
          clearSummary(); // manual edit overrides any searched route
        }
        return;
    }
  };

  const commitRoomTag = (override?: string) => {
    if (!pendingRoom) return;
    const { cell, value } = pendingRoom;
    data.setRoomTag(cell.x, cell.y, (override ?? value).trim());
    setPendingRoom(null);
  };

  const copyJson = (payload: unknown, label: string) =>
    navigator.clipboard
      .writeText(JSON.stringify(payload))
      .then(() => setNotice(`${selectedFloor.label} ${label} copied to clipboard!`))
      .catch(() => setNotice("Couldn't copy to clipboard in this environment."));

  const toolHint =
    TOOL_HINTS[tool] ?? `${walls.length} wall cell(s), ${stairs.length} stairs cell(s), ${rooms.length} room(s)`;

  return (
    <main id="app" style={{ "--map-width": `${IMAGE_WIDTH * scale + 2}px` } as CSSProperties}>
      <Toolbar
        ref={toolbarRef}
        floorLabel={selectedFloor.label}
        selectedFloorId={selectedFloorId}
        loading={loading}
        start={start}
        goal={goal}
        pathLength={path.length}
        routeSummary={routeSummary}
        onSwitchFloor={switchFloor}
      />

      {notice && <Notice message={notice} onDismiss={() => setNotice(null)} />}

      {pendingRoom && (
        <RoomForm
          cell={pendingRoom.cell}
          value={pendingRoom.value}
          hasExistingTag={rooms.some((r) => r.x === pendingRoom.cell.x && r.y === pendingRoom.cell.y)}
          onChange={(value) => setPendingRoom({ ...pendingRoom, value })}
          onSave={() => commitRoomTag()}
          onRemove={() => commitRoomTag("")}
          onCancel={() => setPendingRoom(null)}
        />
      )}

      {confirming && (
        <ConfirmBar
          message={`Clear all ${confirming === "walls" ? "walls" : "room tags"} on ${selectedFloor.label}?`}
          confirmLabel="Yes, clear"
          onConfirm={() => {
            if (confirming === "walls") data.clearWalls();
            else data.clearRooms();
            setConfirming(null);
          }}
          onCancel={() => setConfirming(null)}
        />
      )}

      <SearchBar
        ref={searchRef}
        startValue={startRoomInput}
        goalValue={goalRoomInput}
        roomNumbers={allRoomNumbers}
        searching={searching}
        onStartChange={setStartRoomInput}
        onGoalChange={setGoalRoomInput}
        onSearch={() => findRoute(startRoomInput, goalRoomInput)}
      />

      <Tools
        ref={toolsRef}
        tool={tool}
        hint={toolHint}
        onSelectTool={setTool}
        onCopyWalls={() => copyJson(walls, "walls")}
        onCopyRooms={() => copyJson({ rooms, stairs }, "rooms + stairs")}
        onClearWalls={() => setConfirming("walls")}
        onClearRooms={() => setConfirming("rooms")}
      />

      <MapGrid
        floorId={selectedFloorId}
        image={selectedFloor.image}
        scale={scale}
        editable={tool !== "view"}
        walls={walls}
        stairs={stairs}
        rooms={rooms}
        path={path}
        start={start}
        goal={goal}
        shellRef={shellRef}
        onCellClick={handleCellClick}
      />
    </main>
  );
}