import type { FloorId, Point } from "./Floor_Information";

export type Tool = "view" | "wall" | "start" | "goal" | "room" | "stairs";
export type Arrow = "→" | "←" | "↓" | "↑";

/** The path walked on one floor (start and end cells included). */
export type RouteLeg = { floorId: FloorId; path: Point[] };

export type RouteSummary = {
  floors: FloorId[];
  /** Moves between cells, summed over every floor. */
  totalSteps: number;
  /** The path on each floor, in walking order. */
  legs: RouteLeg[];
  startRoom: string;
  goalRoom: string;
};

export type InstructionKind =
  | "straight"
  | "left"
  | "right"
  | "uturn"
  | "stairs-up"
  | "stairs-down"
  | "arrive";

export type Instruction = {
  id: string;
  kind: InstructionKind;
  /** e.g. "Turn left", "Go up stairs", or the room name for the last step */
  title: string;
  /** e.g. "Walk 8 steps", "to 5F", "411A is on your left" */
  description: string;
  /** Cells to walk for this instruction (0 for stairs). */
  steps: number;
  /** Floor the instruction happens on. */
  floorId: FloorId;
};

export type DestinationSide = "left" | "right" | "ahead";

export type RouteDirections = {
  destination: string;
  /** Which side the destination room is on when you arrive. */
  destinationSide: DestinationSide;
  totalSteps: number;
  floors: FloorId[];
  instructions: Instruction[];
};

export type { Point };