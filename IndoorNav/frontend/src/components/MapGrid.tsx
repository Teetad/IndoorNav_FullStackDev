import { useMemo } from "react";
import type { CSSProperties, RefObject } from "react";
import { WIDTH, HEIGHT, IMAGE_WIDTH, IMAGE_HEIGHT } from "../Floor_Information";
import type { FloorId, Point, Room, Wall } from "../Floor_Information";
import { cellKey, getPathArrows } from "../lib/routing";

const CELL_W = IMAGE_WIDTH / WIDTH;
const CELL_H = IMAGE_HEIGHT / HEIGHT;

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
  shellRef: RefObject<HTMLDivElement | null>;
  onCellClick: (x: number, y: number) => void;
};

export function MapGrid({
  floorId, image, scale, editable, walls, stairs, rooms, path, start, goal, shellRef, onCellClick,
}: Props) {
  const wallSet = useMemo(() => new Set(walls.map(([x, y]) => cellKey(x, y))), [walls]);
  const stairSet = useMemo(() => new Set(stairs.map(([x, y]) => cellKey(x, y))), [stairs]);
  const roomMap = useMemo(() => new Map(rooms.map((r) => [cellKey(r.x, r.y), r])), [rooms]);
  const pathSet = useMemo(() => new Set(path.map((p) => cellKey(p.x, p.y))), [path]);
  const arrows = useMemo(() => getPathArrows(path), [path]);

  const gridStyle = {
    "--floor-plan": `url('${image}')`,
    "--image-width": `${IMAGE_WIDTH}px`,
    "--image-height": `${IMAGE_HEIGHT}px`,
    gridTemplateColumns: `repeat(${WIDTH}, ${CELL_W}px)`,
    gridTemplateRows: `repeat(${HEIGHT}, ${CELL_H}px)`,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  } as CSSProperties;

  const describe = (x: number, y: number) => {
    const key = cellKey(x, y);
    const room = roomMap.get(key);
    if (start && x === start.x && y === start.y) return { cls: "start", text: "S" };
    if (goal && x === goal.x && y === goal.y) return { cls: "goal", text: "G" };
    if (stairSet.has(key)) return { cls: "stairs", text: "St", title: "Stairs" };
    if (room) return { cls: "room", text: "", title: `Room ${room.number}`, room };
    if (wallSet.has(key)) return { cls: "wall", text: "" };
    if (pathSet.has(key)) return { cls: "path", text: arrows.get(key) ?? "." };
    return { cls: "", text: "" };
  };

  return (
    <div className="map-shell" ref={shellRef}>
      <div style={{ width: IMAGE_WIDTH * scale, height: IMAGE_HEIGHT * scale, flexShrink: 0, overflow: "hidden" }}>
        <div className="grid-container" style={gridStyle}>
          {Array.from({ length: HEIGHT }, (_, y) =>
            Array.from({ length: WIDTH }, (_, x) => {
              const { cls, text, title, room } = describe(x, y) as {
                cls: string; text: string; title?: string; room?: Room;
              };
              return (
                <button
                  key={`${floorId}-${x}-${y}`}
                  className={["cell", cls, editable && "editable"].filter(Boolean).join(" ")}
                  type="button"
                  onClick={() => onCellClick(x, y)}
                  aria-label={room ? `Room ${room.number}, cell ${x}, ${y}` : `Cell ${x}, ${y}`}
                  title={title}
                >
                  {text}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}