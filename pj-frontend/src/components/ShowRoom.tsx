import React, { useEffect, useState } from "react";

const ShowRoom = ({ selectedLocation, setSelectedLocation }: { selectedLocation: any, setSelectedLocation: (val: any) => void }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (selectedLocation) {
      document.body.classList.add("showroom-open"); // เติมคลาสเพื่อให้ CSS ซ่อน BottomNav
    } else {
      document.body.classList.remove("showroom-open"); // ลบคลาสออกเมื่อปิด Popup
    }

    // Cleanup function ตอนคอมโพเนนต์ถูกถอดออก
    return () => {
      document.body.classList.remove("showroom-open");
    };
  }, [selectedLocation]);

  // 📌 ย้ายการเช็คนี้มาไว้หลัง useEffect เสมอ เพื่อป้องกันปฏิกิริยาของ React Hook ผิดเพี้ยน
  if (!selectedLocation) return null;

  const minSwipeDistance = 100;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    
    if (distance > minSwipeDistance) {
      setSelectedLocation(null);
    }
  };

  return (
    // เพิ่ม overscroll-none และ fixed เต็มจอเพื่อกันฉากหลังเลื่อนตาม
    <div className={`absolute pt-30 inset-0 w-full h-[100dvh] bg-[#F3EFEA] flex flex-col ${selectedLocation ? 'overflow-hidden' : 'overflow-auto'}`}>
      
      {/* กล่อง Bottom Sheet หลัก */}
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="w-full max-w-md bg-[#D9CDBF]/95 backdrop-blur-md rounded-t-[30px] p-6 shadow-2xl flex flex-col h-[75vh] max-h-[85vh] animate-slide-up overflow-hidden"
      >
        
        {/* ขีดจับด้านบน (Grab bar) */}
        <div className="w-12 h-1.5 bg-stone-400 rounded-full mx-auto mb-4 flex-shrink-0 cursor-grab"></div>

        {/* 📌 ส่วนหัว (Fix ให้อยู่นิ่ง ไม่เลื่อนตาม) */}
        <div className="flex-shrink-0 mb-4 pb-2 border-b border-stone-300/40">
          <h2 className="text-2xl font-bold text-stone-800">{selectedLocation.name}</h2>
          <p className="text-sm text-stone-600">{selectedLocation.type}</p>
        </div>

        {/* 📌 ส่วนเนื้อหาที่จะเลื่อน (เพิ่ม min-h-0 เพื่อให้ flex-1 บังคับ Scroll ทำงานได้ถูกต้อง) */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4 scrollbar-none">
          
          {/* ปุ่ม Action (Information / Start / Save) */}
          <div className="flex gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8E796E] text-white rounded-full text-xs font-medium shadow-sm hover:opacity-90 cursor-pointer">
              ℹ️ Information
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E6DFD5] text-stone-800 rounded-full text-xs font-medium shadow-sm hover:opacity-90 cursor-pointer">
              🧭 Start
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E6DFD5] text-stone-800 rounded-full text-xs font-medium shadow-sm hover:opacity-90 cursor-pointer">
              🔖 Save
            </button>
          </div>

          {/* กล่องรูปภาพจำลอง */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <div className="w-24 h-32 bg-white/60 rounded-2xl flex-shrink-0 shadow-inner"></div>
            <div className="w-24 h-32 bg-white/60 rounded-2xl flex-shrink-0 shadow-inner"></div>
            <div className="w-24 h-32 bg-white/60 rounded-2xl flex-shrink-0 shadow-inner"></div>
          </div>

          {/* คำอธิบาย */}
          <p className="text-xs text-stone-600 leading-relaxed">
            Descriptions ... bla bla (รายละเอียดเพิ่มเติมของห้อง)
          </p>

          {/* ส่วน Reviews */}
          <div className="border-t border-stone-300/60 pt-4 pb-6">
            <h3 className="font-bold text-stone-800 mb-3 text-sm">Reviews</h3>
            
            <div className="space-y-3">
              <div className="bg-white/40 p-3 rounded-xl">
                <p className="text-xs font-semibold text-stone-700">yourName yourSurname</p>
                <p className="text-xs text-stone-500">write your review here...</p>
              </div>
              <div className="bg-white/40 p-3 rounded-xl">
                <p className="text-xs font-semibold text-stone-700">Name Surname</p>
                <p className="text-xs text-stone-600">This is my review na ja</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ShowRoom;