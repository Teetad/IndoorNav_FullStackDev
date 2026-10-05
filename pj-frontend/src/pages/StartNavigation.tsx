import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin } from "lucide-react"; // ใช้ไอคอนจาก lucide-react

const StartNavigation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 📌 รับค่าชื่อห้องปลายทางจาก query param (เช่น ?room=422) หรือกำหนดค่าเริ่มต้น
  const roomName = searchParams.get("room") || "422";

  const [startQuery, setStartQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 📌 ยิง API ค้นหาจุดเริ่มต้นอัตโนมัติเมื่อพิมพ์
  useEffect(() => {
    if (!startQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`http://localhost:3001/places?search=${encodeURIComponent(startQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data.places || [];
          setResults(list);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch search results:", err);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [startQuery]);

  return (
    <div className="absolute inset-0 z-50 bg-[#F3EFEA] flex flex-col p-6">
      
      {/* 📌 ส่วนหัว: ปุ่มย้อนกลับ และหัวข้อหน้า */}
      <div className="flex items-center relative mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-0 text-stone-600 font-bold text-lg p-2 cursor-pointer hover:bg-stone-200/50 rounded-full"
        >
          &lt;
        </button>
        <h1 className="w-full text-center text-xl font-bold text-stone-800">
          Start Navigation
        </h1>
      </div>

      {/* 📌 ส่วนฟอร์มกรอกเส้นทาง (จุดเริ่มต้น และ ปลายทาง) */}
      <div className="flex items-start gap-3 w-full max-w-md mx-auto">
        
        {/* ไอคอนเส้นเชื่อมจุด (วงกลมฟ้า จุดไข่ปลา หมุดแดง) */}
        <div className="flex flex-col items-center pt-3.5 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#628284]"></div>
          <div className="w-0.5 h-6 border-l-2 border-dotted border-stone-400 my-1"></div>
          <MapPin className="w-4 h-4 text-[#A85858]" />
        </div>

        {/* ช่อง input สำหรับพิมพ์ค้นหาจุดเริ่มต้น และ ช่องแสดงชื่อห้องปลายทาง */}
        <div className="flex flex-col gap-3 w-full">
          
          {/* ช่อง Start from? (ค้นหาได้) */}
          <div className="relative">
            <input
              type="text"
              value={startQuery}
              onChange={(e) => {
                setStartQuery(e.target.value);
                setIsSearching(true);
              }}
              onFocus={() => setIsSearching(true)}
              placeholder="Start from?"
              className="w-full px-4 py-3 bg-[#E2E8EC]/80 backdrop-blur-md rounded-2xl outline-none text-stone-700 text-sm shadow-sm placeholder-stone-400"
            />

            {/* แสดงผลรายการค้นหาแบบ Dropdown ทับลงมา */}
            {isSearching && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#F3EFEA] border border-stone-300 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50">
                {results.map((place) => (
                  <div
                    key={place.place_id}
                    onClick={() => {
                      setStartQuery(place.place_name);
                      setIsSearching(false);
                    }}
                    className="px-4 py-3 hover:bg-stone-200/60 cursor-pointer text-xs text-stone-700 border-b border-stone-200/50 last:border-none"
                  >
                    {place.place_name} <span className="text-[10px] text-stone-400">({place.building_name})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ช่องแสดงชื่อห้องปลายทาง (รับ prop มาแสดงผล) */}
          <div className="w-full px-4 py-3 bg-[#E2E8EC]/80 backdrop-blur-md rounded-2xl text-stone-700 text-sm shadow-sm font-medium flex items-center">
            {roomName}
          </div>

        </div>

      </div>

      {/* พื้นที่สำหรับแสดงผลการค้นหาเพิ่มเติม หรือปุ่มเริ่มนำทางด้านล่าง (ถ้ามี) */}
    </div>
  );
};

export default StartNavigation;