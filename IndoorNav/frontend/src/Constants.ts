import { WIDTH, HEIGHT, IMAGE_WIDTH, IMAGE_HEIGHT } from "./Floor_Information";
import type { Tool } from "./Types";

export const API_URL = "http://localhost:3001/api/find-path";

export const CELL_WIDTH = IMAGE_WIDTH / WIDTH;
export const CELL_HEIGHT = IMAGE_HEIGHT / HEIGHT;

export const TOOLS: { id: Tool; label: string }[] = [
  { id: "view", label: "View" },
  { id: "wall", label: "Edit Walls" },
  { id: "start", label: "Set Start" },
  { id: "goal", label: "Set Goal" },
  { id: "room", label: "Tag Room" },
  { id: "stairs", label: "Tag Stairs" },
];

export const TOOL_HINTS: Partial<Record<Tool, string>> = {
  start: "Click a cell to place the start.",
  goal: "Click a cell to place the goal.",
  room: "Click a cell to tag it with a room number.",
  stairs: "Click a cell to toggle a stairs cell (mark the same x, y on connecting floors).",
};