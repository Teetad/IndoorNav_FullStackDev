export const placeTypes = [
  "classroom", "coworking_space", "administrative_office", "laboratory",
  "meeting_room", "faculty_office", "restroom", "elevator_lobby", "stairs",
  "multipurpose_room", "graduate_room",
] as const;

export type PlaceType = typeof placeTypes[number];

export function isPlaceType(value: unknown): value is PlaceType {
  return typeof value === "string" && placeTypes.some(type => type === value);
}
