// PostgreSQL integer columns accept signed 32-bit integers only.
export function parseFloorNumber(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !/^[+-]?\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= -2147483648 && parsed <= 2147483647
    ? parsed
    : null;
}

// ความจุต้องเป็นจำนวนเต็มตั้งแต่ 0 และไม่เกินขนาด INTEGER ของ PostgreSQL
export function isValidCapacity(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) &&
    value >= 0 && value <= 2147483647;
}

// รับเวลาแบบ 24 ชั่วโมง เช่น 08:00 หรือ 17:30
export function isValidTime(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(":").map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}
