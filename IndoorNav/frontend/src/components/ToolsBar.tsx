import React from "react";
import type { Tool } from "../types";

const TOOLS: { id: Tool; label: string }[] = [
  { id: "view", label: "View" },
  { id: "wall", label: "Edit Walls" },
  { id: "start", label: "Set Start" },
  { id: "goal", label: "Set Goal" },
  { id: "room", label: "Tag Room" },
  { id: "stairs", label: "Tag Stairs" },
];

type Props = {
  tool: Tool;
  hint: string;
  onSelectTool: (t: Tool) => void;
  onCopyWalls: () => void;
  onCopyRooms: () => void;
  onClearWalls: () => void;
  onClearRooms: () => void;
};

export const Tools = React.forwardRef<HTMLElement, Props>(function Tools(
  { tool, hint, onSelectTool, onCopyWalls, onCopyRooms, onClearWalls, onClearRooms },
  ref
) {
  return (
    <section className="tools" aria-label="Path editing tools" ref={ref}>
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={t.id === tool ? "active" : ""}
          type="button"
          onClick={() => onSelectTool(t.id)}
          aria-pressed={t.id === tool}
        >
          {t.label}
        </button>
      ))}
      <button type="button" onClick={onCopyWalls}>Copy Walls JSON</button>
      <button type="button" onClick={onCopyRooms}>Copy Rooms + Stairs JSON</button>
      <button type="button" onClick={onClearWalls}>Clear Walls</button>
      <button type="button" onClick={onClearRooms}>Clear Rooms</button>
      <span>{hint}</span>
    </section>
  );
});