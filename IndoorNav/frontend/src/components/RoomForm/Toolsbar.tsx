import { forwardRef } from "react";
import { TOOLS } from "../../Constants";
import type { Tool } from "../../Types";

type Props = {
  tool: Tool;
  hint: string;
  onToolChange: (tool: Tool) => void;
  onCopyWalls: () => void;
  onCopyRooms: () => void;
  onClearWalls: () => void;
  onClearRooms: () => void;
};

export const ToolsBar = forwardRef<HTMLElement, Props>(function ToolsBar(
  { tool, hint, onToolChange, onCopyWalls, onCopyRooms, onClearWalls, onClearRooms },
  ref
) {
  return (
    <section className="tools" aria-label="Path editing tools" ref={ref}>
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={t.id === tool ? "active" : ""}
          type="button"
          onClick={() => onToolChange(t.id)}
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