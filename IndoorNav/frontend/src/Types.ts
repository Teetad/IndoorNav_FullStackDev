import type { FloorId } from "./Floor_Information";

export type Tool = "view" | "wall" | "start" | "goal" | "room" | "stairs";
export type Arrow = "→" | "←" | "↓" | "↑";
export type PendingClear = "walls" | "rooms" | null;

export type RouteSummary = {
  floors: FloorId[];
  totalSteps: number;
  startRoom: string;
  goalRoom: string;
};