import React, { useEffect, useState } from "react";

interface ShowRoomProps {
  placeId: string | null; // 📌 เปลี่ยนมารับเป็น place_id โดยตรง
  onClose: () => void; // ฟังก์ชันสำหรับปิด Popup (เซ็ตค่าเป็น null)
}

const ShowRoom: React.FC<ShowRoomProps> = ({ placeId, onClose }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const [roomDetail, setRoomDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (placeId) {
      document.body.classList.add("showroom-open");
    } else {
      document.body.classList.remove("showroom-open");
      setRoomDetail(null);
    }

    return () => {
      document.body.classList.remove("showroom-open");
    };
  }, [placeId]);

  // 📌 ยิง API ไปที่ http://localhost:3001/places/{placeId} ทันทีเมื่อมี placeId ส่งเข้ามา
  useEffect(() => {
    if (!placeId) return;

    setLoading(true);
    fetch(`http://localhost:3001/places/${placeId}`)
      .then((res) => res.json())
      .then((data) => {
        setRoomDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch place detail:", err);
        setLoading(false);
      });
  }, [placeId]);

  if (!placeId) return null;

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
      onClose(); // ปิด Popup เมื่อปัดลง
    }
  };

  return (
    <div 
    onTouchMove={(e) => e.preventDefault()}
    className="fixed inset-0 z-50 flex items-center justify-center pt-8 bg-black/30 backdrop-blur-xs transition-opacity overscroll-none">
      
      {/* กล่อง Bottom Sheet หลัก */}
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="w-full max-w-md bg-[#D9CDBF]/95 backdrop-blur-md rounded-t-[30px] p-6 shadow-2xl flex flex-col h-[90vh] max-h-[100vh] animate-slide-up overflow-hidden"
      >
        
        {/* ขีดจับด้านบน (Grab bar) */}
        <div className="w-12 h-1.5 bg-stone-400 rounded-full mx-auto mb-4 flex-shrink-0 cursor-grab"></div>

        {/* 📌 ส่วนหัว (แสดงชื่อสถานที่จาก place_name) */}
        <div className="flex-shrink-0 mb-4 pb-2 border-b border-stone-300/40">
          <h2 className="text-2xl font-bold text-stone-800">
            {loading ? "Loading..." : roomDetail?.place_name || "Unknown Location"}
          </h2>
          <p className="text-sm text-stone-600">{roomDetail?.place_type}</p>
        </div>

        {/* 📌 ส่วนเนื้อหา: แสดงเฉพาะรูปภาพและคำอธิบาย */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4 scrollbar-none">
          
          {loading ? (
            <div className="text-center py-8 text-stone-600 text-xs">Loading room details...</div>
          ) : (
            <>
              {/* ปุ่ม Action พื้นฐาน */}
              <div className="flex gap-2 flex-wrap">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8E796E] text-white rounded-full text-xs font-medium shadow-sm hover:opacity-95 cursor-pointer">
                  ℹ️ Information
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E6DFD5] text-stone-800 rounded-full text-xs font-medium shadow-sm hover:opacity-95 cursor-pointer">
                  🧭 Start
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E6DFD5] text-stone-800 rounded-full text-xs font-medium shadow-sm hover:opacity-95 cursor-pointer">
                  🔖 Save
                </button>
              </div>

              {/* กล่องรูปภาพ (ดึงจาก image_url ถ้าไม่มีให้แสดงกล่องจำลองแทน) */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {roomDetail?.image_url ? (
                  <img 
                    src={roomDetail.image_url} 
                    alt={roomDetail.place_name} 
                    className="w-full h-40 object-cover rounded-2xl shadow-inner" 
                  />
                ) : (
                  <div className="w-full h-32 bg-white/60 rounded-2xl flex items-center justify-center shadow-inner">
                    <span className="text-xs text-stone-400">No Image Available</span>
                  </div>
                )}
              </div>

              {/* คำอธิบาย (ดึงจาก description) */}
              <p className="text-xs text-stone-600 leading-relaxed pt-2">
                {roomDetail?.description || "No description available for this place."}
              </p>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default ShowRoom;