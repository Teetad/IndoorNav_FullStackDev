import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./App.css";
import { FLOORS, IMAGE_WIDTH } from "./Floor_Information";
import type { FloorId, Point } from "./Floor_Information";
import { TOOL_HINTS } from "./Constants";
import type { PendingClear, Tool } from "./Types";
import { useFloorData } from "./components/hooks/Usefloordata";
import { usePath } from "./components/hooks/Usepath";
import { useMapScale } from "./components/hooks/Usemapscale";
import { useRouteSearch } from "./components/hooks/Useroutesearch";
import { Toolbar } from "./components/RoomForm/Toolbar";
import { Notice, ConfirmBar, RoomForm } from "./components/Banners";
import { SearchBar } from "./components/RoomForm/Searchbar.tsx";
import { ToolsBar } from "./components/RoomForm/Toolsbar.tsx";
import { MapGrid } from "./components/RoomForm/Mapgrid.tsx";

export default function App() {
  const [selectedFloorId, setSelectedFloorId] = useState<FloorId>("4");
  const [tool, setTool] = useState<Tool>("wall");
  const [startRoomInput, setStartRoomInput] = useState("");
  const [goalRoomInput, setGoalRoomInput] = useState("");
  // Some preview/embedded environments block window.prompt/alert/confirm, so tagging,
  // notices and clear-confirmations all use on-page UI instead.
  const [pendingRoomCell, setPendingRoomCell] = useState<Point | null>(null);
  const [pendingRoomValue, setPendingRoomValue] = useState("");
  const [pendingClear, setPendingClear] = useState<PendingClear>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const toolbarRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLElement>(null);

  const floorData = useFloorData(selectedFloorId);
  const { walls, stairs, rooms, start, goal } = floorData;
  const { path, loading } = usePath(selectedFloorId, walls, start, goal);
  const { scale, shellRef } = useMapScale([toolbarRef, toolsRef, searchRef]);
  const { findRoute, routeSummary, searching, clearRoute } = useRouteSearch({
    roomsByFloor: floorData.roomsByFloor,
    stairsByFloor: floorData.stairsByFloor,
    wallsByFloor: floorData.wallsByFloor,
    setEndpointsByFloor: floorData.setEndpointsByFloor,
    setSelectedFloorId,
    setNotice,
  });

  const selectedFloor = FLOORS.find((f) => f.id === selectedFloorId) ?? FLOORS[0];
  const allRoomNumbers = FLOORS.flatMap((f) => floorData.roomsByFloor[f.id].map((r) => r.number));

  const closeRoomForm = () => {
    setPendingRoomCell(null);
    setPendingRoomValue("");
  };

  const switchFloor = (floorId: FloorId) => {
    if (floorId === selectedFloorId) return;
    setSelectedFloorId(floorId);
    closeRoomForm();
    setPendingClear(null);
  };

  const openRoomForm = (x: number, y: number) => {
    if (floorData.isOccupied(x, y)) return;
    setPendingRoomCell({ x, y });
    setPendingRoomValue(rooms.find((r) => r.x === x && r.y === y)?.number ?? "");
  };

  const commitRoomTag = (override?: string) => {
    if (!pendingRoomCell) return;
    floorData.saveRoomTag(pendingRoomCell.x, pendingRoomCell.y, (override ?? pendingRoomValue).trim());
    closeRoomForm();
  };

  const placeEndpoint = (kind: "start" | "goal", x: number, y: number) => {
    if (!floorData.placeEndpoint(kind, x, y)) return;
    setTool("wall");
    clearRoute(); // a manual edit overrides any searched route
  };

  const handleCellClick = (x: number, y: number) => {
    switch (tool) {
      case "wall": return floorData.toggleWall(x, y);
      case "start": return placeEndpoint("start", x, y);
      case "goal": return placeEndpoint("goal", x, y);
      case "room": return openRoomForm(x, y);
      case "stairs": return floorData.toggleStairs(x, y);
    }
  };

  const copyToClipboard = (data: unknown, successMessage: string) =>
    navigator.clipboard
      .writeText(JSON.stringify(data))
      .then(() => setNotice(successMessage))
      .catch(() => setNotice("Couldn't copy to clipboard in this environment."));

  const confirmClear = () => {
    if (pendingClear === "walls") floorData.clearWalls();
    if (pendingClear === "rooms") floorData.clearRooms();
    setPendingClear(null);
  };

  const toolHint =
    TOOL_HINTS[tool] ??
    `${walls.length} wall cell(s), ${stairs.length} stairs cell(s), ${rooms.length} room(s)`;

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

      {pendingRoomCell && (
        <RoomForm
          cell={pendingRoomCell}
          value={pendingRoomValue}
          canRemove={rooms.some((r) => r.x === pendingRoomCell.x && r.y === pendingRoomCell.y)}
          onChange={setPendingRoomValue}
          onSave={commitRoomTag}
          onCancel={closeRoomForm}
        />
      )}

      {pendingClear && (
        <ConfirmBar
          message={`Clear all ${pendingClear === "walls" ? "walls" : "room tags"} on ${selectedFloor.label}?`}
          confirmLabel="Yes, clear"
          onConfirm={confirmClear}
          onCancel={() => setPendingClear(null)}
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

      <ToolsBar
        ref={toolsRef}
        tool={tool}
        hint={toolHint}
        onToolChange={setTool}
        onCopyWalls={() => copyToClipboard(walls, `${selectedFloor.label} walls copied to clipboard!`)}
        // Rooms and stairs are bundled: both are points of interest, usually edited together.
        onCopyRooms={() =>
          copyToClipboard({ rooms, stairs }, `${selectedFloor.label} rooms + stairs copied to clipboard!`)
        }
        onClearWalls={() => setPendingClear("walls")}
        onClearRooms={() => setPendingClear("rooms")}
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