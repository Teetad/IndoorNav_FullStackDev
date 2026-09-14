// ข้อมูลอาคาร 🏢
export const building30 = {
  name: "อาคาร 30 ปี",
  description: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่",
};

// รูปแบบข้อมูลสถานที่ 🌆
export interface MapPlace {
  key: string; // ชื่ออ้างอิงภายในชุดข้อมูล ใช้สร้าง ID ไม่ใช่เลขห้อง
  place_name: string; // ชื่อที่ต้องการให้ผู้ใช้เห็น
  room_number: string | null; // เลขห้องเป็นข้อความได้ เช่น 413A; null คือยังไม่ทราบเลข
  description: string; // รายละเอียดเพิ่มเติมของสถานที่
}

// ห้องที่ทราบเลขห้อง
const room = (number: string, label = "ห้องเรียน"): MapPlace => ({
  key: `room-${number}`,
  place_name: `${label} ${number}`,
  room_number: number,
  description: "อ้างอิงเลขห้องจากแผนที่ที่ผู้ใช้ให้มา",
});
// สถานที่ที่มีชื่อ แต่ไม่ทราบเลขห้อง
const named = (key: string, name: string): MapPlace => ({
  key, place_name: name, room_number: null,
  description: "แผนที่ระบุชื่อ แต่ไม่ได้ระบุเลขห้องที่ยืนยันได้",
});
// สร้างรายการห้องอาจารย์จากเลขห้อง
const offices = (numbers: string[]): MapPlace[] => numbers.map(number => room(number, "ห้องอาจารย์"));
// เลขจุดในแผนที่ ยังไม่ใช่เลขห้องจริง
const officeLabels = (count: number): MapPlace[] => Array.from({ length: count }, (_, i) => ({
  key: `office-label-${i + 1}`,
  place_name: `ห้องอาจารย์ จุด ${i + 1} ตามแผนที่`,
  room_number: null,
  description: `ป้ายกำกับ ${i + 1} ในพื้นที่สีส้ม ไม่ยืนยันว่าเป็นหมายเลขห้องจริง`,
}));
// ห้องน้ำ โถงลิฟต์ และบันได 🚻
const facilities = (): MapPlace[] => [
  named("toilet-women", "ห้องน้ำหญิง"),
  named("toilet-men", "ห้องน้ำชาย"),
  named("elevator-lobby", "โถงลิฟต์"),
  named("stairs", "บันได"),
].map(place => ({ ...place, description: "อ้างอิงสัญลักษณ์ในแผนที่ ไม่ได้กำหนดพิกัดหรือเส้นทางนำทาง" }));

// สถานที่แยกตามชั้น 4–7
export const mapFloors = [
  {
    floor_number: 4,
    source: "2028-4th-floor.pdf",
    places: [
      room("413A"), room("413B"), room("415A", "ห้องเรียน Network"),
      room("412"), room("411A"), room("411B", "ห้องเรียน Computer"),
      named("as-lab", "AS LAB"), named("administration", "ธุรการ"),
      ...officeLabels(9), ...facilities(),
    ],
  },
  {
    floor_number: 5,
    source: "2028-5th-floor.pdf",
    places: [
      ...["501", "502", "518", "521", "516"].map(n => room(n)),
      named("oasys-lab", "OASYS LAB"), named("network-admin", "Network Admin"),
      ...offices(["558", "559", "503", "504", "505", "508", "509", "510", "514", "515", "519", "520"]),
      ...facilities(),
    ],
  },
  {
    floor_number: 6,
    source: "2028-6th-floor-v2.pdf",
    places: [
      named("multipurpose-1", "ห้องอเนกประสงค์ 1"),
      named("multipurpose-2", "ห้องอเนกประสงค์ 2"),
      named("lab-1", "ห้องวิจัย 1 (Lab 1)"), named("lab-2", "ห้องวิจัย 2 (Lab 2)"),
      named("lab-3", "Lab 3"), named("lab-4", "Lab 4"),
      named("meeting", "ห้องประชุม"), named("graduate", "ห้องบัณฑิต"),
      ...officeLabels(10), ...facilities(),
    ],
  },
  {
    floor_number: 7,
    source: "IMG_5880.jpg",
    places: [
      ...["701", "702", "711", "713", "718", "719", "720"].map(n => room(n)),
      { ...room("712", "ห้อง"), description: "เห็นเลข 712 แต่ยังไม่ยืนยันประเภทห้องจากภาพนี้" },
      ...facilities(),
    ],
  },
];
