import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar"; 
import ShowRoom from "../components/ShowRoom"; // 📌 1. นำเข้า ShowRoom เข้ามาใช้งาน
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 📌 2. เพิ่ม State สำหรับเก็บ placeId ที่ผู้ใช้คลิกเลือกจากผลการค้นหา
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const navigate = useNavigate();

  // ยิง API ค้นหาอัตโนมัติเมื่อพิมพ์ข้อความ
  useEffect(() => {
    if (!searchText.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`http://localhost:3001/places?search=${encodeURIComponent(searchText)}`)
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data.places || [];
          setResults(list);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to search places:", err);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <div className="absolute inset-0 z-50 bg-[#F3EFEA] flex flex-col p-4 animate-fade-in">
      
      <button 
          onClick={() => navigate('/')}
          className="mt-3 text-xs font-semibold text-dark-accent hover:text-stone-900 cursor-pointer flex items-center gap-1"
        >
          &lt; Back to map
        </button>

      {/* ส่วน SearchBar ด้านบน */}
      <div className="w-full max-w-md mx-auto pt-2">
        <SearchBar
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search location here"
          BackgroundColor="bg-primary backdrop-blur-md shadow-md"
          onProfileClick={() => {}}
          onSearchClick={() => {}}
        />
      </div>

      {/* ส่วนแสดงผลรายชื่อสถานที่เรียงลงมา */}
      <div className="w-full max-w-md mx-auto mt-4 flex-1 overflow-y-auto px-2 scrollbar-none">
        {loading ? (
          <div className="text-center py-6 text-grey-500 text-xs">Searching...</div>
        ) : results.length > 0 ? (
          <div className="flex flex-col">
            {results.map((place, index) => (
              <div key={place.place_id || index}>
                <div
                  onClick={() => {
                    // 📌 3. เมื่อคลิกที่ชื่อสถานที่ ให้เซ็ตค่า placeId เพื่อเปิด ShowRoom ทันที
                    setSelectedPlaceId(place.place_id);
                  }}
                  className="py-4 px-2 text-grey-500 font-medium text-base hover:bg-stone-200/50 rounded-xl cursor-pointer transition-colors"
                >
                  {place.place_name}
                </div>
                {/* เส้นคั่นระหว่างรายการ */}
                <hr className="border-primary" />
              </div>
            ))}
          </div>
        ) : searchText.trim() !== "" ? (
          <div className="text-center py-6 text-stone-500 text-xs">No locations found.</div>
        ) : (
          <div className="text-center py-6 text-stone-400 text-xs">Type to search for rooms...</div>
        )}
      </div>

      {/* 📌 4. เรียกใช้งาน ShowRoom Component ในหน้า SearchPage */}
      <ShowRoom 
        placeId={selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)} // เคลียร์ค่าเมื่อปิด Popup เพื่อซ่อน ShowRoom
      />

    </div>
  );
};

export default SearchPage;