import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloorControlProps {
  currentFloor: number; // ชั้นปัจจุบัน เช่น 4, 5, 6, 7
  isHidden?: boolean;   // 📌 เพิ่ม prop นี้เพื่อรับค่าสั่งซ่อนปุ่มเมื่อ Popup เปิด
}

const Floor: React.FC<FloorControlProps> = ({ currentFloor, isHidden = false }) => {
  const navigate = useNavigate();
  const minFloor = 4;
  const maxFloor = 7;

  // 📌 ถ้า isHidden เป็นจริง ให้ซ่อนคอมโพเนนต์นี้ไปเลยทันที
  if (isHidden) return null;

  const handleIncrement = () => {
    if (currentFloor < maxFloor) {
      const nextFloor = currentFloor + 1;
      navigate(`/floor-${nextFloor}`);
    }
  };

  const handleDecrement = () => {
    if (currentFloor > minFloor) {
      const prevFloor = currentFloor - 1;
      navigate(`/floor-${prevFloor}`);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-center justify-between w-20 h-25 bg-[#8E796E] rounded-3xl shadow-lg select-none overflow-hidden animate-fade-in">
      {/* ปุ่มเลื่อนขึ้น */}
      <button
        onClick={handleIncrement}
        disabled={currentFloor >= maxFloor}
        className={`flex items-center justify-center w-full py-1 text-white transition-opacity ${
          currentFloor >= maxFloor ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
        }`}
        aria-label="Floor Up"
      >
        <ChevronUp className="w-6 h-6 stroke-[3]" />
      </button>

      {/* แถบแสดงสถานะชั้นตรงกลาง */}
      <div className="flex items-center justify-center w-full py-1 bg-[#D9CDBF] shadow-inner">
        <span className="text-xl font-bold text-stone-700 tracking-wide">
          F{currentFloor}
        </span>
      </div>

      {/* ปุ่มเลื่อนลง */}
      <button
        onClick={handleDecrement}
        disabled={currentFloor <= minFloor}
        className={`flex items-center justify-center w-full py-1 text-white transition-opacity ${
          currentFloor <= minFloor ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
        }`}
        aria-label="Floor Down"
      >
        <ChevronDown className="w-6 h-6 stroke-[3]" />
      </button>

    </div>
  );
};

export default Floor;