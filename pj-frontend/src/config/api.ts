// ตอนพัฒนา Vite และ Backend ทำงานคนละพอร์ต จึงเรียก Backend ที่พอร์ต 3000
// เมื่อ deploy Nginx จะรับคำขอผ่าน /api แล้วส่งต่อไปยัง Backend container
export const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "/api";
