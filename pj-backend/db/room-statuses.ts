// สถานะห้องที่ Backend ยอมรับ
export const roomStatuses = ["OPEN", "CLOSED", "MAINTENANCE", "UNKNOWN"] as const;

export type RoomStatus = typeof roomStatuses[number];

// ใช้ตรวจค่าจาก request ก่อนบันทึกลงฐานข้อมูล
export function isRoomStatus(value: unknown): value is RoomStatus {
  return typeof value === "string" && roomStatuses.some(status => status === value);
}
