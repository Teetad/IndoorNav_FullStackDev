// PostgreSQL integer columns accept signed 32-bit integers only.
export function parseFloorNumber(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !/^[+-]?\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= -2147483648 && parsed <= 2147483647
    ? parsed
    : null;
}
