import React, { useEffect, useState } from "react";

interface ShowAllRoomProps {
  selectedType: string | null;
  onClose: () => void;
  onSelectLocation: (location: any) => void;
}

const ShowAllRoom: React.FC<ShowAllRoomProps> = ({ selectedType, onClose, onSelectLocation }) => {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedType) return;

    const fetchPlacesAndImages = async () => {
      setLoading(true);
      try {
        // 1. ดึงข้อมูลสถานที่ทั้งหมดตามประเภท
        const res = await fetch(`http://localhost:3000/places?place_type=${encodeURIComponent(selectedType)}`);
        const data = await res.json();
        const roomList = Array.isArray(data) ? data : data.places || [];

        // 2. ดึงรูปภาพสำหรับแต่ละสถานที่ (เอาแค่รูปแรก)
        const placesWithImages = await Promise.all(
          roomList.map(async (place: any) => {
            try {
              const imgRes = await fetch(`http://localhost:3000/places/${place.place_id}/images`);
              if (imgRes.ok) {
                const imagesData = await imgRes.json();
                
                // ตรวจสอบว่ามีรูปภาพและเป็น Array หรือไม่
                if (Array.isArray(imagesData) && imagesData.length > 0) {
                  const firstImage = imagesData[0]; // เอารูปแรกรูปเดียว
                  const rawUrl = firstImage.image_url || firstImage.url || "";
                  
                  if (rawUrl) {
                    if (rawUrl.startsWith('http')) {
                      place.firstImage = encodeURI(rawUrl);
                    } else {
                      const cleanedPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
                      place.firstImage = encodeURI(`http://localhost:3000${cleanedPath}`);
                    }
                  }
                }
              }
            } catch (imgErr) {
              console.error(`Failed to fetch image for place ${place.place_id}:`, imgErr);
            }
            return place;
          })
        );

        setPlaces(placesWithImages);
      } catch (err) {
        console.error("Failed to fetch places by type:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacesAndImages();
  }, [selectedType]);

  if (!selectedType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-xs transition-opacity overscroll-none">
      
      {/* กล่อง Bottom Sheet */}
      <div className="w-full max-w-md bg-[#B6C4CF]/95 backdrop-blur-md rounded-t-[30px] p-6 shadow-2xl flex flex-col h-[90vh] max-h-[100vh] animate-slide-up overflow-hidden">
        
        {/* ขีดจับด้านบน (Grab bar) */}
        <div 
          onClick={onClose}
          className="w-12 h-1.5 bg-stone-500/50 rounded-full mx-auto mb-4 flex-shrink-0 cursor-pointer"
        ></div>

        {/* 📌 ส่วนหัว */}
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
                onClick={() => onSelectLocation(place)} 
                className="bg-white/40 p-4 rounded-2xl shadow-sm cursor-pointer hover:bg-white/60 transition-all flex flex-col gap-3"
              >
                {/* 📌 กล่องรูปภาพสถานที่ (แสดงรูปแรกที่ดึงมา) */}
                <div className="w-full h-36 bg-stone-300/60 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                  {place.firstImage ? (
                    <img 
                      src={place.firstImage} 
                      alt={place.place_name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'; // ซ่อนไอคอนรูปแตกถ้า URL พัง
                      }}
                    />
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