import type { PlaceType } from "../place-types.js";
import type { RoomStatus } from "../room-statuses.js";

// ข้อมูลอาคาร 🏢
export const building30 = {
  name: "อาคาร 30 ปี",
  description: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่",
};

// รูปแบบข้อมูลสถานที่ 🌆
export interface MapPlace {
  key: string; // ชื่ออ้างอิงภายในชุดข้อมูล ใช้สร้าง ID ไม่ใช่เลขห้อง
  place_name: string; // ชื่อที่ต้องการให้ผู้ใช้เห็น
  place_type: PlaceType | null; // null เมื่อยังยืนยันประเภทไม่ได้
  room_number: string | null; // เลขห้องเป็นข้อความได้ เช่น 413A; null คือยังไม่ทราบเลข
  room_status?: RoomStatus; // ไม่ใส่ค่าเมื่อยังไม่ได้ตรวจสอบสถานะจริง
  capacity?: number; // จำนวนที่นั่งหรือจำนวนคนที่ห้องรองรับ
  opening_time?: string; // เวลาเปิดแบบ HH:MM
  closing_time?: string; // เวลาปิดแบบ HH:MM
  image_urls?: string[]; // URL รูปที่ seed จะเพิ่มในตาราง place_images
  description: string; // รายละเอียดเพิ่มเติมของสถานที่
}

// ห้องที่ทราบเลขห้อง
const room = (number: string, label = "ห้องเรียน", place_type: PlaceType | null = "classroom"): MapPlace => ({
  key: `room-${number}`,
  place_name: `${label} ${number}`,
  place_type,
  room_number: number,
  description: "อ้างอิงจากแผนที่",
});
// สถานที่ที่มีชื่อ แต่ไม่ทราบเลขห้อง
const named = (key: string, name: string, place_type: PlaceType | null = null): MapPlace => ({
  key, place_name: name, place_type, room_number: null,
  description: "แผนที่ระบุชื่อ แต่ไม่ได้ระบุเลขห้องที่ยืนยันได้",
});
// ห้องอาจารย์ใช้เวลาทำการของภาควิชาเป็นเวลาอ้างอิง
const offices = (numbers: string[]): MapPlace[] => numbers.map(number => ({
  ...room(number, "ห้องอาจารย์", "faculty_office"),
  opening_time: "08:30",
  closing_time: "16:30",
  description: "ห้องอาจารย์ เวลาอ้างอิงตามเวลาทำการภาควิชา จันทร์-ศุกร์",
}));
// เลขจุดในแผนที่ ยังไม่ใช่เลขห้องจริง
const officeLabels = (count: number): MapPlace[] => Array.from({ length: count }, (_, i) => ({
  key: `office-label-${i + 1}`,
  place_name: `ห้องอาจารย์ จุด ${i + 1} `,
  place_type: "faculty_office",
  room_number: null,
  opening_time: "08:30",
  closing_time: "16:30",
  description: `ห้องอาจารย์จุด ${i + 1} เวลาอ้างอิงตามเวลาทำการภาควิชา จันทร์-ศุกร์; `,
}));
// ห้องน้ำ โถงลิฟต์ และบันได 🚻
const facilities = (): MapPlace[] => [
  named("toilet-women", "ห้องน้ำหญิง", "restroom"),
  named("toilet-men", "ห้องน้ำชาย", "restroom"),
  named("elevator-lobby", "โถงลิฟต์", "elevator_lobby"),
  named("stairs", "บันได", "stairs"),
].map(place => ({ ...place, description: "อ้างอิงสัญลักษณ์ในแผนที่ " }));

// ห้องเรียนชั้น 7 มีข้อมูลจากหน้าห้องและมีรูปจริงห้องละ 5 รูป
const floor7Classroom = (number: string, capacity: number): MapPlace => ({
  ...room(number),
  room_status: "OPEN",
  capacity,
  opening_time: "08:00",
  closing_time: "22:00",
  description: `ห้องเรียนชั้น 7 อาคาร 30 ปี ขนาด ${capacity} ที่นั่ง`,
  image_urls: Array.from(
    { length: 5 },
    (_, index) => `/images/places/floor-7/${number}/${number}-${index + 1}.jpg`,
  ),
});

// สถานที่แยกตามชั้น 4–7
export const mapFloors = [
  {
    floor_number: 4,
    source: "ที่มา/2028-4th-floor.pdf",
    places: [
      room("413A"), room("413B"), room("415A", "ห้องเรียน Network"),
      room("412"), room("411A"), room("411B", "ห้องเรียน Computer"),
      {
        ...room("422", "ร้านค้าสาขาวิศวกรรมคอมพิวเตอร์", "shop"),
        description: "ร้านค้าของสาขาวิศวกรรมคอมพิวเตอร์ มีขนมและสินค้า อยู่บริเวณฝั่ง ป.ตรี ชั้น 4",
      },
      named("as-lab", "AS LAB", "laboratory"), named("administration", "ธุรการ", "administrative_office"),
      ...officeLabels(9), ...facilities(),
    ],
  },
  {
    floor_number: 5,
    source: "ที่มา/2028-5th-floor.pdf",
    places: [
      ...["501", "502", "518", "521", "516"].map(n => room(n)),
      named("oasys-lab", "OASYS LAB", "laboratory"), named("network-admin", "Network Admin", "administrative_office"),
      ...offices(["558", "559", "503", "504", "505", "508", "509", "510", "514", "515", "519", "520"]),
      ...facilities(),
    ],
  },
  {
    floor_number: 6,
    source: "ที่มา/2028-6th-floor-v2.pdf",
    places: [
      named("multipurpose-1", "ห้องอเนกประสงค์ 1", "multipurpose_room"),
      named("multipurpose-2", "ห้องอเนกประสงค์ 2", "multipurpose_room"),
      named("lab-1", "ห้องวิจัย 1 (Lab 1)", "laboratory"), named("lab-2", "ห้องวิจัย 2 (Lab 2)", "laboratory"),
      named("lab-3", "Lab 3", "laboratory"), named("lab-4", "Lab 4", "laboratory"),
      named("meeting", "ห้องประชุม", "meeting_room"), named("graduate", "ห้องบัณฑิต", "graduate_room"),
      {
        ...named("cpe-administration", "ธุรการภาควิชาวิศวกรรมคอมพิวเตอร์", "administrative_office"),
        room_status: "OPEN",
        opening_time: "08:30",
        closing_time: "16:30",
        description: "ชั้น 6 อาคาร 30 ปี เปิดจันทร์-ศุกร์ 08:30-16:30 โทร 053-942072 ต่อ 101 (หลักสูตร/ลงทะเบียน), ต่อ 104 (ประชาสัมพันธ์), ต่อ 0 หรือ 053-942023; อีเมล cpe@eng.cmu.ac.th",
      },
      ...officeLabels(10), ...facilities(),
    ],
  },
  {
    floor_number: 7,
    source: "ที่มา/IMG_5880.jpg",
    places: [
      floor7Classroom("700", 40),
      floor7Classroom("701", 56),
      floor7Classroom("702", 56),
      floor7Classroom("711", 100),
      floor7Classroom("712", 24),
      floor7Classroom("713", 40),
      floor7Classroom("718", 80),
      floor7Classroom("719", 80),
      floor7Classroom("720", 80),
      ...facilities(),
    ],
  },
];
