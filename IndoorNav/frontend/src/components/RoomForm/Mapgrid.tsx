import { useMemo } from "react";
import type { CSSProperties } from "react";
import { WIDTH, HEIGHT, IMAGE_WIDTH, IMAGE_HEIGHT } from "../../Floor_Information";
import type { FloorId, Point, Room, Wall } from "../../Floor_Information";
import { CELL_WIDTH, CELL_HEIGHT } from "../../Constants";
import { cellKey, getPathArrows } from "../../utils/Pathing";

type Props = {
  floorId: FloorId;
  image: string;
  scale: number;
  editable: boolean;
  walls: Wall[];
  stairs: Wall[];
  rooms: Room[];
  path: Point[];
  start?: Point | null;
  goal?: Point | null;
  shellRef: React.RefObject<HTMLDivElement | null>;
  onCellClick: (x: number, y: number) => void;
};

export function MapGrid({
  floorId, image, scale, editable, walls, stairs, rooms, path, start, goal, shellRef, onCellClick,
}: Props) {
  // O(1) per-cell lookups instead of scanning every list for every cell.
  const lookups = useMemo(
    () => ({
      walls: new Set(walls.map(([x, y]) => cellKey(x, y))),
      stairs: new Set(stairs.map(([x, y]) => cellKey(x, y))),
      rooms: new Map(rooms.map((r) => [cellKey(r.x, r.y), r.number])),
      path: new Set(path.map((p) => cellKey(p.x, p.y))),
      arrows: getPathArrows(path),
    }),
    [walls, stairs, rooms, path]
  );

  const gridStyle = {
    "--floor-plan": `url('${image}')`,
    "--image-width": `${IMAGE_WIDTH}px`,
    "--image-height": `${IMAGE_HEIGHT}px`,
    gridTemplateColumns: `repeat(${WIDTH}, ${CELL_WIDTH}px)`,
    gridTemplateRows: `repeat(${HEIGHT}, ${CELL_HEIGHT}px)`,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  } as CSSProperties;

  const cells = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const key = cellKey(x, y);
      const roomNumber = lookups.rooms.get(key);

      let kind = "";
      let text = "";
      let title: string | undefined;

      if (start && x === start.x && y === start.y) {
        kind = "start"; text = "S";
      } else if (goal && x === goal.x && y === goal.y) {
        kind = "goal"; text = "G";
      } else if (lookups.stairs.has(key)) {
        kind = "stairs"; text = "St"; title = "Stairs";
      } else if (roomNumber !== undefined) {
        kind = "room"; text = "•"; title = `Room ${roomNumber}`;
      } else if (lookups.walls.has(key)) {
        kind = "wall";
      } else if (lookups.path.has(key)) {
        kind = "path"; text = lookups.arrows.get(key) ?? ".";
      }

      cells.push(
        <button
          key={`${floorId}-${key}`}
          className={["cell", kind, editable && "editable"].filter(Boolean).join(" ")}
          type="button"
          onClick={() => onCellClick(x, y)}
          aria-label={roomNumber !== undefined ? `Room ${roomNumber}, cell ${x}, ${y}` : `Cell ${x}, ${y}`}
          title={title}
        >
          {text}
        </button>
      );
    }
  }

  return (
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
        <div className="grid-container" style={gridStyle}>
          {cells}
        </div>
      </div>
    </div>
  );
}