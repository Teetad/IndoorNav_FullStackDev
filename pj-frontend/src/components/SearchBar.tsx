import React from 'react';
import { User, Search } from 'lucide-react'; // 1. นำเข้า Search เพิ่มเข้ามา

// กำหนด TypeScript Interface สำหรับ Props ของ SearchBar
interface SearchBarProps {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  BackgroundColor?: string; // เช่น คลาส Tailwind สำหรับสีพื้นหลัง
  placeholder?: string;
  onProfileClick?: () => void; // ฟังก์ชันเมื่อคลิกที่ไอคอนโปรไฟล์ (ถ้ามี)
  onSearchClick?: () => void; // ฟังก์ชันเมื่อคลิกที่ไอคอนค้นหา (ถ้ามี)
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  BackgroundColor, 
  placeholder = 'Search here',
  onProfileClick,
  onSearchClick,
}) => {
  return (
    <div
      className={`flex items-center justify-between w-full px-4 py-2 rounded-full shadow-sm ${BackgroundColor}`}
    >
      {/* กลุ่มฝั่งซ้าย: ไอคอนค้นหา + ช่องพิมพ์ข้อความ */}
      <div 
      onClick={onSearchClick}
      className="flex items-center w-full gap-2">
        <Search className="w-5 h-5 text-stone-400 flex-shrink-0 ml-1" 
      />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-stone-600 placeholder-stone-400 text-base px-1 focus:ring-0"
        />
      </div>

      {/* ไอคอนรูปคนด้านขวา */}
      <div
        onClick={onProfileClick}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#8E796E] text-[#F3EFEA] flex-shrink-0 cursor-pointer p-1.5 transition-opacity hover:opacity-90 ml-2"
      >
        <User className="w-5 h-5" />
      </div>
    </div>
  );
};

export default SearchBar;