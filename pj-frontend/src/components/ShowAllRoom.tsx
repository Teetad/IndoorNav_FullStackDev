import React, { useEffect, useState } from "react";

interface ShowAllRoomProps {
  selectedType: string | null;
  onClose: () => void;
  onSelectLocation: (location: any) => void;
}

const ShowAllRoom: React.FC<ShowAllRoomProps> = ({ selectedType, onClose, onSelectLocation }) => {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ยิง API ดึงข้อมูลสถานที่ตาม type ที่ถูกส่งเข้ามา
  useEffect(() => {
    if (!selectedType) return;

    setLoading(true);
    fetch(`http://localhost:3001/places?place_type=${encodeURIComponent(selectedType)}`)
      .then((res) => res.json())
      .then((data) => {
        // รองรับทั้งกรณีที่ API ส่งกลับมาเป็น Array ตรงๆ หรืออยู่ใน Object (เช่น { places: [...] })
        const roomList = Array.isArray(data) ? data : data.places || [];
        setPlaces(roomList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch places by type:", err);
        setLoading(false);
      });
  }, [selectedType]);

  if (!selectedType) return null;

  return (
    <div className="fixed inset-0 z-50 flex pt-8 justify-center bg-black/30 backdrop-blur-xs transition-opacity overscroll-none">
      
      {/* กล่อง Bottom Sheet สีฟ้า/เทา (ใช้โทนสี primary ของแอป เช่น bg-[#B6C4CF]) */}
      <div className="w-full max-w-md bg-[#B6C4CF]/95 backdrop-blur-md rounded-t-[30px] p-6 shadow-2xl flex flex-col h-[90vh] max-h-[100vh] animate-slide-up overflow-hidden">
        
        {/* ขีดจับด้านบน (Grab bar) สำหรับกดปิดได้ */}
        <div 
          onClick={onClose}
          className="w-12 h-1.5 bg-stone-500/50 rounded-full mx-auto mb-4 flex-shrink-0 cursor-pointer"
        ></div>

        {/* 📌 ส่วนหัว (แสดงชื่อ Type ที่เลือก) */}
        <div className="flex-shrink-0 mb-4 pb-2 border-b border-stone-400/40 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-stone-800 capitalize">{selectedType}</h2>
          <button 
            onClick={onClose} 
            className="text-stone-700 hover:text-stone-900 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 📌 ส่วนเนื้อหา รายการสถานที่ทั้งหมด */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4 scrollbar-none">
          {loading ? (
            <div className="text-center text-stone-700 py-10 text-sm">Loading places...</div>
          ) : places.length === 0 ? (
            <div className="text-center text-stone-700 py-10 text-sm">No places found for this category.</div>
          ) : (
            places.map((place, index) => (
              <div 
                key={index}
                onClick={() => onSelectLocation(place)} // กดเลือกสถานที่เพื่อเปิด ShowRoom รายละเอียดเดี่ยว
                className="bg-white/40 p-4 rounded-2xl shadow-sm cursor-pointer hover:bg-white/60 transition-all flex flex-col gap-3"
              >
                {/* กล่องรูปภาพสถานที่ */}
                <div className="w-full h-36 bg-stone-300/60 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                  {place.image ? (
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-stone-500">No Image</span>
                  )}
                </div>

                {/* ชื่อและคำอธิบาย */}
                <div>
                  <h3 className="font-bold text-stone-800 text-base">{place.place_name}</h3>
                  <p className="text-[10px] text-stone-600 mt-0.5 leading-relaxed">
                    {place.description || ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ShowAllRoom;