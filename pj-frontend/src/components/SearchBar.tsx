import React from 'react';
import { FiUser } from 'react-icons/fi';

// กำหนด TypeScript Interface สำหรับ Props ของ SearchBar
interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  BackgroundColor?: string; // เช่น 'primary', 'map-background' หรือใช้คลาส Tailwind ทั่วไป
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  BackgroundColor = 'primary-light', // ค่าเริ่มต้นถ้าไม่ได้ส่งมา
  placeholder = 'Search here',
}) => {
  return (
    <div
      className={`flex items-center w-full px-4 py-3 rounded-full shadow-sm bg-${BackgroundColor}`}
    >
      {/* ช่องพิมพ์ข้อความ (Input) */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-base"
      />

      {/* ไอคอนรูปคนด้านขวา (อิงตามดีไซน์ใน Figma) */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400 text-white ml-2 flex-shrink-0 cursor-pointer">
        <FiUser size={18} />
      </div>
    </div>
  );
};

export default SearchBar;