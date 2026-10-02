import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin,
  Bookmark,
  Flag
} from "lucide-react";

const BottomNav = () => {
  const location = useLocation();

  // ปรับฟังก์ชันให้รองรับการตรวจสอบหลาย Path หรือเช็คว่าอยู่ในหน้าแผนที่ชั้นต่างๆ
  const isActive = (paths: string[]) => {
    return paths.some((path) => location.pathname === path);
  };

  // เช็คพิเศษสำหรับหน้า Explore (ถ้าอยู่ชั้น 4, 5, 6, 7 ให้ถือว่าแอคทีฟทั้งหมด)
  const isExploreActive = ['/floor-4', '/floor-5', '/floor-6', '/floor-7', '/'].some(
    (path) => location.pathname === path
  );

  return (
    <div className="grid grid-cols-3 place-items-center gap-4 fixed bottom-0 left-0 w-full h-16 bg-secondary border-secondary shadow-md px-4 z-20">
      {/* ปุ่ม Explore */}
      <Link 
        to="/floor-4" 
        className="flex flex-col items-center justify-center w-full"
      >
        <div className={`flex items-center justify-center px-5 py-1 rounded-full transition-all ${
          isExploreActive ? 'bg-[#D9CDBF]' : 'bg-transparent'
        }`}>
          <MapPin className="h-6 w-6 text-black"/>
        </div>
        <p className="text-xs mt-0.5 text-black font-medium">Explore</p>
      </Link>

      {/* ปุ่ม You */}
      <Link 
        to="/login" 
        className="flex flex-col items-center justify-center w-full"
      >
        <div className={`flex items-center justify-center px-5 py-1 rounded-full transition-all ${
          isActive(['/login']) ? 'bg-[#D9CDBF]' : 'bg-transparent'
        }`}>
          <Bookmark className="h-6 w-6 text-black"/>
        </div>
        <p className="text-xs mt-0.5 text-black font-medium">You</p>
      </Link>

      {/* ปุ่ม Reports */}
      <Link 
        to="/report" 
        className="flex flex-col items-center justify-center w-full"
      >
        <div className={`flex items-center justify-center px-5 py-1 rounded-full transition-all ${
          isActive(['/report']) ? 'bg-[#D9CDBF]' : 'bg-transparent'
        }`}>
          <Flag className="h-6 w-6 text-black"/>
        </div>
        <p className="text-xs mt-0.5 text-black font-medium">Reports</p>
      </Link>
    </div>
  );
};

export default BottomNav;